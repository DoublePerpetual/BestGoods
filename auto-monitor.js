#!/usr/bin/env node

/**
 * 自动监控和恢复脚本
 * 监控真正的AI评选系统，在必要时自动执行new或reset
 * 用户授权：当遇到问题时，自动执行决策，无需等待指令
 */

const fs = require('fs');
const path = require('path');
const { exec, spawn } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

// 配置
const CONFIG = {
  checkInterval: 60000, // 检查间隔(ms)：60秒
  aiEvaluatorScript: 'start-true-ai-evaluator.js',
  aiEvaluatorLog: '/tmp/true-ai-quality.log', // 最新日志文件路径
  statusFile: 'data/automation-status.json',
  bestAnswersFile: 'data/best-answers.json',
  
  // 阈值配置
  maxNoProgressMinutes: 30, // 无进展超过30分钟视为卡住
  maxErrorsPerHour: 10,     // 每小时最大错误数
  minProcessingSpeed: 0.1,  // 最小处理速度(品类/分钟)
  
  // 重启策略
  maxRestartsPerDay: 10,    // 每天最大重启次数
  resetOnPersistentErrors: 3, // 连续错误3次后执行reset
};

// 状态追踪
let state = {
  lastCheck: new Date(),
  restartsToday: 0,
  errorsLastHour: [],
  lastProgressTime: new Date(),
  lastProcessedCount: 0,
  aiPid: null,
};

// 主监控循环
async function startMonitoring() {
  console.log('🔍 启动自动监控系统');
  console.log('🎯 监控目标: 真正的AI评选系统');
  console.log('⏰ 检查间隔:', CONFIG.checkInterval / 1000, '秒');
  console.log('⚡ 用户授权: 自动执行new/reset决策，无需等待指令');
  console.log('='.repeat(60));
  
  // 初始化状态
  await loadState();
  
  // 立即检查一次
  await checkSystem();
  
  // 设置定时检查
  setInterval(async () => {
    await checkSystem();
  }, CONFIG.checkInterval);
  
  // 每小时清理错误记录
  setInterval(() => {
    cleanupErrorRecords();
  }, 3600000);
  
  // 每天重置重启计数
  setInterval(() => {
    state.restartsToday = 0;
    console.log('📅 每日重启计数器已重置');
  }, 86400000);
}

// 加载状态
async function loadState() {
  try {
    if (fs.existsSync(CONFIG.statusFile)) {
      const status = JSON.parse(fs.readFileSync(CONFIG.statusFile, 'utf8'));
      state.lastProcessedCount = status.completedCategories || 0;
      state.lastProgressTime = new Date(status.lastUpdated || new Date());
      console.log('📊 加载系统状态: 已处理', state.lastProcessedCount, '个品类');
    }
  } catch (error) {
    console.log('⚠️ 加载状态失败:', error.message);
  }
}

// 检查系统状态
async function checkSystem() {
  const now = new Date();
  console.log('\n' + '='.repeat(40));
  console.log('🕐 系统检查:', now.toLocaleString());
  
  try {
    // 1. 检查AI评选进程是否运行
    const isAIRunning = await checkAIProcess();
    
    if (!isAIRunning) {
      console.log('❌ AI评选进程未运行');
      await handleAIRestart('process_not_running');
      return;
    }
    
    // 2. 检查处理进度
    const progressOk = await checkProgress();
    if (!progressOk) {
      console.log('⚠️ 处理进度异常');
      await handleAIError('no_progress');
      return;
    }
    
    // 3. 检查日志中的错误
    const errors = await checkLogsForErrors();
    if (errors.length > 0) {
      console.log('⚠️ 检测到错误:', errors.length, '个');
      await handleAIError('log_errors', errors);
    }
    
    // 4. 检查处理速度
    const speedOk = await checkProcessingSpeed();
    if (!speedOk) {
      console.log('⚠️ 处理速度过慢');
      await handleAIError('slow_processing');
    }
    
    // 5. 检查系统资源
    const resourcesOk = await checkSystemResources();
    if (!resourcesOk) {
      console.log('⚠️ 系统资源紧张');
    }
    
    console.log('✅ 系统状态正常');
    
  } catch (error) {
    console.error('💥 检查系统时发生错误:', error.message);
    // 记录错误
    recordError(error.message);
  }
}

// 检查AI进程是否运行
async function checkAIProcess() {
  try {
    const { stdout } = await execPromise(`ps aux | grep "node.*${CONFIG.aiEvaluatorScript}" | grep -v grep | grep -v zsh | wc -l`);
    const count = parseInt(stdout.trim());
    return count > 0;
  } catch (error) {
    return false;
  }
}

// 检查处理进度
async function checkProgress() {
  try {
    if (!fs.existsSync(CONFIG.statusFile)) {
      console.log('⚠️ 状态文件不存在');
      return false;
    }
    
    const status = JSON.parse(fs.readFileSync(CONFIG.statusFile, 'utf8'));
    const currentCount = status.completedCategories || 0;
    const lastUpdated = new Date(status.lastUpdated || new Date());
    const now = new Date();
    
    // 检查是否有进展
    if (currentCount > state.lastProcessedCount) {
      state.lastProcessedCount = currentCount;
      state.lastProgressTime = now;
      console.log('📈 处理进展: +', (currentCount - state.lastProcessedCount), '品类');
      return true;
    }
    
    // 检查是否卡住（无进展时间过长）
    const minutesSinceProgress = (now - state.lastProgressTime) / 1000 / 60;
    if (minutesSinceProgress > CONFIG.maxNoProgressMinutes) {
      console.log('⏰ 无进展时间:', minutesSinceProgress.toFixed(1), '分钟');
      return false;
    }
    
    return true;
    
  } catch (error) {
    console.log('⚠️ 检查进度失败:', error.message);
    return false;
  }
}

// 检查处理速度
async function checkProcessingSpeed() {
  try {
    if (!fs.existsSync(CONFIG.statusFile)) {
      return true; // 无法检查，假设正常
    }
    
    const status = JSON.parse(fs.readFileSync(CONFIG.statusFile, 'utf8'));
    const speed = parseFloat(status.automationProgress?.processingSpeed || 0);
    
    if (speed < CONFIG.minProcessingSpeed && state.lastProcessedCount > 10) {
      console.log('🐌 处理速度过慢:', speed.toFixed(2), '品类/小时');
      return false;
    }
    
    return true;
    
  } catch (error) {
    return true; // 出错时假设正常
  }
}

// 检查日志中的错误
async function checkLogsForErrors() {
  try {
    if (!fs.existsSync(CONFIG.aiEvaluatorLog)) {
      return [];
    }
    
    const logContent = fs.readFileSync(CONFIG.aiEvaluatorLog, 'utf8');
    const logLines = logContent.split('\n').slice(-100); // 检查最近100行
    
    const errors = [];
    const errorPatterns = [
      /❌/,
      /💥/,
      /error/i,
      /failed/i,
      /exception/i,
      /timeout/i,
      /429/i, // API限额
      /quota/i,
      /rate limit/i,
      /网络错误/i,
      /连接失败/i,
    ];
    
    logLines.forEach((line, index) => {
      if (line.trim()) {
        errorPatterns.forEach(pattern => {
          if (pattern.test(line)) {
            errors.push({
              line: line.trim(),
              timestamp: new Date().toISOString()
            });
          }
        });
      }
    });
    
    return errors;
    
  } catch (error) {
    return [];
  }
}

// 检查系统资源
async function checkSystemResources() {
  try {
    const { stdout } = await execPromise(`ps aux | grep "node.*${CONFIG.aiEvaluatorScript}" | grep -v grep`);
    const lines = stdout.trim().split('\n');
    
    if (lines.length > 0) {
      const parts = lines[0].trim().split(/\s+/);
      if (parts.length >= 6) {
        const memory = parseFloat(parts[5]); // RSS内存(KB)
        const memoryGB = memory / 1024 / 1024;
        
        if (memoryGB > 2) { // 超过2GB
          console.log('💾 内存使用较高:', memoryGB.toFixed(2), 'GB');
          return false;
        }
      }
    }
    
    return true;
    
  } catch (error) {
    return true;
  }
}

// 处理AI重启
async function handleAIRestart(reason) {
  console.log('🔄 准备重启AI评选系统，原因:', reason);
  
  // 检查每日重启限制
  if (state.restartsToday >= CONFIG.maxRestartsPerDay) {
    console.log('⏸️ 已达到每日重启上限，跳过重启');
    return;
  }
  
  state.restartsToday++;
  
  try {
    // 先停止现有进程
    await stopAIProcess();
    
    // 等待2秒
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 重启进程
    await startAIProcess();
    
    console.log('✅ AI评选系统已重启');
    
    // 重置状态
    state.lastProgressTime = new Date();
    
  } catch (error) {
    console.error('❌ 重启失败:', error.message);
    recordError(`restart_failed: ${error.message}`);
  }
}

// 处理AI错误
async function handleAIError(reason, errors = []) {
  console.log('⚠️ 处理AI错误，原因:', reason);
  
  // 记录错误
  errors.forEach(error => {
    recordError(`${reason}: ${error.line}`);
  });
  
  // 检查错误频率
  const recentErrors = getRecentErrors(60); // 最近60分钟
  if (recentErrors.length >= CONFIG.maxErrorsPerHour) {
    console.log('🔥 错误频率过高，执行reset');
    await performReset('high_error_rate');
  }
  
  // 检查连续错误
  const errorCount = state.errorsLastHour.length;
  if (errorCount >= CONFIG.resetOnPersistentErrors) {
    console.log('🔄 连续错误过多，执行new');
    await performNew('persistent_errors');
  }
}

// 执行reset操作
async function performReset(reason) {
  console.log('🔄 执行RESET操作，原因:', reason);
  
  try {
    // 1. 停止AI进程
    await stopAIProcess();
    
    // 2. 备份当前数据
    const backupDir = path.join(__dirname, 'backups');
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir, { recursive: true });
    }
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    if (fs.existsSync(CONFIG.bestAnswersFile)) {
      const backupFile = path.join(backupDir, `best-answers-backup-${timestamp}.json`);
      fs.copyFileSync(CONFIG.bestAnswersFile, backupFile);
      console.log('💾 数据已备份到:', backupFile);
    }
    
    // 3. 重置状态文件
    const resetStatus = {
      totalCategories: 0,
      completedCategories: 0,
      bestProductsCount: 0,
      lastUpdated: new Date().toISOString(),
      automationProgress: {
        startedAt: new Date().toISOString(),
        lastProcessed: null,
        processingSpeed: 0,
        estimatedCompletion: null
      },
      totalCost: 0,
      resetReason: reason,
      resetTime: new Date().toISOString()
    };
    
    fs.writeFileSync(CONFIG.statusFile, JSON.stringify(resetStatus, null, 2));
    console.log('📄 状态文件已重置');
    
    // 4. 等待片刻
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // 5. 重新启动
    await startAIProcess();
    
    // 6. 重置监控状态
    state.lastProcessedCount = 0;
    state.lastProgressTime = new Date();
    state.errorsLastHour = [];
    
    console.log('✅ RESET操作完成，系统已重新启动');
    
  } catch (error) {
    console.error('❌ RESET操作失败:', error.message);
  }
}

// 执行new操作
async function performNew(reason) {
  console.log('🚀 执行NEW操作，原因:', reason);
  
  try {
    // 1. 停止AI进程
    await stopAIProcess();
    
    // 2. 清理旧的日志文件（保留备份）
    if (fs.existsSync(CONFIG.aiEvaluatorLog)) {
      const logBackup = `${CONFIG.aiEvaluatorLog}.backup-${Date.now()}`;
      fs.copyFileSync(CONFIG.aiEvaluatorLog, logBackup);
      console.log('📝 日志已备份到:', logBackup);
    }
    
    // 3. 等待片刻
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // 4. 以新进程启动
    await startAIProcess();
    
    // 5. 重置监控状态
    state.lastProcessedCount = 0;
    state.lastProgressTime = new Date();
    state.errorsLastHour = [];
    
    console.log('✅ NEW操作完成，新进程已启动');
    
  } catch (error) {
    console.error('❌ NEW操作失败:', error.message);
  }
}

// 停止AI进程
async function stopAIProcess() {
  try {
    const { stdout } = await execPromise(`ps aux | grep "node.*${CONFIG.aiEvaluatorScript}" | grep -v grep | grep -v zsh | awk '{print $2}'`);
    const pids = stdout.trim().split('\n').filter(pid => pid.trim());
    
    for (const pid of pids) {
      try {
        process.kill(parseInt(pid), 'SIGTERM');
        console.log('🛑 停止进程:', pid);
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (killError) {
        // 进程可能已经结束
      }
    }
    
    // 确保进程已停止
    await new Promise(resolve => setTimeout(resolve, 2000));
    
  } catch (error) {
    // 可能没有进程在运行
  }
}

// 启动AI进程
async function startAIProcess() {
  try {
    const command = `cd "${__dirname}" && node "${CONFIG.aiEvaluatorScript}" > "${CONFIG.aiEvaluatorLog}" 2>&1 &`;
    
    await execPromise(command);
    console.log('🚀 AI评选进程已启动');
    
    // 等待进程启动
    await new Promise(resolve => setTimeout(resolve, 5000));
    
  } catch (error) {
    console.error('❌ 启动AI进程失败:', error.message);
    throw error;
  }
}

// 记录错误
function recordError(error) {
  const errorRecord = {
    message: error,
    timestamp: new Date().toISOString()
  };
  
  state.errorsLastHour.push(errorRecord);
  
  // 保持错误记录不超过100条
  if (state.errorsLastHour.length > 100) {
    state.errorsLastHour = state.errorsLastHour.slice(-50);
  }
}

// 获取最近错误
function getRecentErrors(minutes) {
  const cutoff = new Date(Date.now() - minutes * 60000);
  return state.errorsLastHour.filter(error => 
    new Date(error.timestamp) > cutoff
  );
}

// 清理错误记录
function cleanupErrorRecords() {
  const oneHourAgo = new Date(Date.now() - 3600000);
  state.errorsLastHour = state.errorsLastHour.filter(error => 
    new Date(error.timestamp) > oneHourAgo
  );
}

// 启动监控
startMonitoring().catch(error => {
  console.error('💥 监控系统启动失败:', error);
  process.exit(1);
});

// 处理进程退出
process.on('SIGINT', () => {
  console.log('\n🛑 收到停止信号，关闭监控系统');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 收到终止信号，关闭监控系统');
  process.exit(0);
});

console.log('🛡️ 自动监控系统已加载');
console.log('📋 监控策略:');
console.log('  - 检查间隔:', CONFIG.checkInterval / 1000, '秒');
console.log('  - 无进展阈值:', CONFIG.maxNoProgressMinutes, '分钟');
console.log('  - 错误频率阈值:', CONFIG.maxErrorsPerHour, '次/小时');
console.log('  - 每日重启限制:', CONFIG.maxRestartsPerDay, '次');
console.log('  - 最小处理速度:', CONFIG.minProcessingSpeed, '品类/分钟');