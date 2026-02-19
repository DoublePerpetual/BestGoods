#!/usr/bin/env node

/**
 * 新方法评选进度监控脚本
 */

const fs = require('fs');
const path = require('path');

function getProgressStats() {
    try {
        const dataPath = path.join(__dirname, 'data', 'best-answers.json');
        const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
        
        const total = data.length;
        const pending = data.filter(c => c.evaluationStatus === 'pending' || !c.evaluationStatus).length;
        const completed = data.filter(c => c.evaluationStatus === 'completed').length;
        const processing = data.filter(c => c.evaluationStatus === 'processing').length;
        const failed = data.filter(c => c.evaluationStatus === 'failed').length;
        
        // 统计有商品数据的品类
        const hasProducts = data.filter(c => c.bestProducts && c.bestProducts.length > 0).length;
        
        // 统计商品总数
        const totalProducts = data.reduce((sum, cat) => sum + (cat.bestProducts?.length || 0), 0);
        
        // 检查日志文件
        const logsDir = path.join(__dirname, 'logs');
        const taskLogs = [];
        if (fs.existsSync(logsDir)) {
            const files = fs.readdirSync(logsDir).filter(f => f.startsWith('evaluation-') && f.endsWith('.json'));
            files.forEach(file => {
                try {
                    const log = JSON.parse(fs.readFileSync(path.join(logsDir, file), 'utf8'));
                    taskLogs.push(log);
                } catch (e) {
                    // 忽略解析错误的日志文件
                }
            });
        }
        
        // 统计任务
        const successfulTasks = taskLogs.filter(t => t.status === 'completed').length;
        const failedTasks = taskLogs.filter(t => t.status === 'failed').length;
        
        // 计算平均处理时间
        const completedTasks = taskLogs.filter(t => t.status === 'completed' && t.duration);
        const avgDuration = completedTasks.length > 0 
            ? completedTasks.reduce((sum, t) => sum + t.duration, 0) / completedTasks.length 
            : 0;
        
        // 估算剩余时间（基于平均处理时间）
        const estimatedRemainingHours = pending > 0 
            ? (avgDuration * pending / 3600).toFixed(1)
            : 0;
        
        return {
            timestamp: new Date().toISOString(),
            categories: {
                total: total,
                pending: pending,
                completed: completed,
                processing: processing,
                failed: failed,
                progress: total > 0 ? ((completed + hasProducts) / total * 100).toFixed(1) + '%' : '0%'
            },
            products: {
                categories_with_products: hasProducts,
                total_products: totalProducts,
                avg_products_per_category: hasProducts > 0 ? (totalProducts / hasProducts).toFixed(1) : 0
            },
            tasks: {
                total: taskLogs.length,
                successful: successfulTasks,
                failed: failedTasks,
                success_rate: taskLogs.length > 0 ? (successfulTasks / taskLogs.length * 100).toFixed(1) + '%' : '0%'
            },
            performance: {
                avg_duration_seconds: avgDuration.toFixed(2),
                estimated_remaining_hours: estimatedRemainingHours,
                categories_per_hour: avgDuration > 0 ? (3600 / avgDuration).toFixed(1) : 0
            },
            data_quality: {
                method: data[0]?.evaluationMethod || 'unknown',
                needs_real_data: data.filter(c => c.needsRealData === true).length,
                last_updated: data[0]?.lastEvaluated || 'never'
            }
        };
        
    } catch (error) {
        return {
            error: error.message,
            timestamp: new Date().toISOString()
        };
    }
}

function displayProgress(stats) {
    console.log('📊 BestGoods新方法评选进度监控');
    console.log('========================================');
    console.log(`🕒 时间: ${new Date(stats.timestamp).toLocaleString()}`);
    console.log('');
    
    if (stats.error) {
        console.log(`❌ 错误: ${stats.error}`);
        return;
    }
    
    // 品类进度
    console.log('📈 品类进度:');
    console.log(`   总计: ${stats.categories.total} 个品类`);
    console.log(`   ✅ 已完成: ${stats.categories.completed}`);
    console.log(`   ⏳ 待处理: ${stats.categories.pending}`);
    console.log(`   🔄 处理中: ${stats.categories.processing}`);
    console.log(`   ❌ 失败: ${stats.categories.failed}`);
    console.log(`   📊 进度: ${stats.categories.progress}`);
    console.log('');
    
    // 商品数据
    console.log('🛒 商品数据:');
    console.log(`   有商品数据的品类: ${stats.products.categories_with_products}`);
    console.log(`   商品总数: ${stats.products.total_products}`);
    console.log(`   平均每品类商品数: ${stats.products.avg_products_per_category}`);
    console.log('');
    
    // 任务统计
    console.log('📋 任务统计:');
    console.log(`   总任务数: ${stats.tasks.total}`);
    console.log(`   成功任务: ${stats.tasks.successful}`);
    console.log(`   失败任务: ${stats.tasks.failed}`);
    console.log(`   成功率: ${stats.tasks.success_rate}`);
    console.log('');
    
    // 性能指标
    console.log('⚡ 性能指标:');
    console.log(`   平均处理时间: ${stats.performance.avg_duration_seconds} 秒/品类`);
    console.log(`   预估处理速度: ${stats.performance.categories_per_hour} 品类/小时`);
    if (stats.categories.pending > 0) {
        console.log(`   预估剩余时间: ${stats.performance.estimated_remaining_hours} 小时`);
    }
    console.log('');
    
    // 数据质量
    console.log('🎯 数据质量:');
    console.log(`   评选方法: ${stats.data_quality.method}`);
    console.log(`   需要真实数据的品类: ${stats.data_quality.needs_real_data}`);
    console.log(`   最后更新时间: ${stats.data_quality.last_updated === 'never' ? '从未更新' : new Date(stats.data_quality.last_updated).toLocaleString()}`);
    console.log('');
    
    // 建议
    console.log('💡 建议:');
    if (stats.categories.pending > 0) {
        console.log(`   1. 继续处理剩余 ${stats.categories.pending} 个品类`);
    } else {
        console.log('   1. 🎉 所有品类已处理完成！');
    }
    
    if (stats.tasks.failed > 0) {
        console.log(`   2. 需要检查 ${stats.tasks.failed} 个失败任务`);
    }
    
    if (stats.data_quality.needs_real_data > 0) {
        console.log(`   3. 还有 ${stats.data_quality.needs_real_data} 个品类需要真实数据`);
    }
    
    console.log('   4. 定期运行监控脚本跟踪进度');
    console.log('========================================');
}

// 命令行接口
function main() {
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
BestGoods新方法评选进度监控

用法:
  node monitor-progress.js [选项]

选项:
  --json          输出JSON格式（用于脚本处理）
  --watch         监控模式（每30秒更新一次）
  --help, -h      显示帮助信息

示例:
  node monitor-progress.js
  node monitor-progress.js --json
  node monitor-progress.js --watch
        `);
        return;
    }
    
    if (args.includes('--json')) {
        const stats = getProgressStats();
        console.log(JSON.stringify(stats, null, 2));
        return;
    }
    
    if (args.includes('--watch')) {
        console.log('👀 进入监控模式（每30秒更新一次，按Ctrl+C退出）\n');
        let count = 0;
        
        const interval = setInterval(() => {
            count++;
            console.log(`\n🔄 更新 #${count} - ${new Date().toLocaleTimeString()}`);
            console.log('----------------------------------------');
            
            const stats = getProgressStats();
            displayProgress(stats);
            
            // 清屏效果（保留最后几行）
            process.stdout.write('\x1B[2J\x1B[0f');
        }, 30000);
        
        // 处理Ctrl+C
        process.on('SIGINT', () => {
            clearInterval(interval);
            console.log('\n👋 监控已停止');
            process.exit(0);
        });
        
        // 立即显示一次
        const stats = getProgressStats();
        displayProgress(stats);
        
        return;
    }
    
    // 默认显示模式
    const stats = getProgressStats();
    displayProgress(stats);
}

if (require.main === module) {
    main();
}

module.exports = {
    getProgressStats,
    displayProgress
};