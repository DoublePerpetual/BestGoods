
#!/usr/bin/env node
/**
 * 实时监控脚本
 * 每10分钟检查一次处理进度
 */

const fs = require('fs');
const path = require('path');
const http = require('http');

const LOG_FILE = path.join(__dirname, 'logs/processing-monitor.log');
const STATUS_FILE = path.join(__dirname, 'data/automation-status.json');

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + '\n');
}

function checkProgress() {
  log('🔍 检查处理进度...');
  
  try {
    if (fs.existsSync(STATUS_FILE)) {
      const status = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      const progress = (status.completedCategories / status.totalCategories * 100).toFixed(4);
      
      log(`📊 进度: ${status.completedCategories.toLocaleString()}/${status.totalCategories.toLocaleString()} (${progress}%)`);
      log(`📈 速度: ${status.automationProgress.processingSpeed.toFixed(2)} 品类/小时`);
      log(`⏰ 预计完成: ${status.automationProgress.estimatedCompletion}`);
      
      // 检查服务状态
      checkService('智能评价系统', 3080);
      checkService('首页', 3076);
      
    } else {
      log('⚠️ 状态文件不存在');
    }
  } catch (error) {
    log(`❌ 检查进度失败: ${error.message}`);
  }
}

function checkService(name, port) {
  const req = http.request({
    hostname: 'localhost',
    port: port,
    path: '/',
    method: 'HEAD',
    timeout: 5000
  }, (res) => {
    log(`✅ ${name}: 运行正常 (状态码 ${res.statusCode})`);
  });
  
  req.on('error', () => {
    log(`⚠️ ${name}: 服务异常`);
  });
  
  req.on('timeout', () => {
    log(`⏱️ ${name}: 响应超时`);
    req.destroy();
  });
  
  req.end();
}

// 主循环
function main() {
  log('='.repeat(60));
  log('🔄 最佳商品百科全书 - 实时监控系统启动');
  log('='.repeat(60));
  
  // 立即检查一次
  checkProgress();
  
  // 每10分钟检查一次
  setInterval(checkProgress, 10 * 60 * 1000);
  
  log('📡 监控系统运行中，每10分钟检查一次进度...');
}

if (require.main === module) {
  main();
}
