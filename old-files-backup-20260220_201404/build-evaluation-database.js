// 续接上面的代码...

/**
 * 生成项目统计报告
 */
async function generateReport(progress, importResult) {
    console.log('\n' + '='.repeat(70));
    console.log('📋 评选体系数据库建立报告');
    console.log('='.repeat(70));
    
    const now = new Date();
    const startTime = new Date(progress.start_time);
    const duration = (now - startTime) / 1000 / 60; // 分钟
    
    console.log('📅 项目信息:');
    console.log(`   开始时间: ${startTime.toLocaleString()}`);
    console.log(`   当前时间: ${now.toLocaleString()}`);
    console.log(`   运行时长: ${duration.toFixed(2)} 分钟`);
    
    console.log('\n📊 数据统计:');
    console.log(`   总品类数: ${importResult.total}`);
    console.log(`   成功导入: ${importResult.imported}`);
    console.log(`   导入成功率: ${(importResult.imported / importResult.total * 100).toFixed(2)}%`);
    
    // 计算总评选任务
    const avgPriceRanges = 4; // 平均每个品类4个价格区间
    const avgDimensions = 6;  // 平均每个品类6个评选维度
    const totalEvaluations = importResult.imported * avgPriceRanges * avgDimensions;
    
    console.log('\n🎯 评选规模估算:');
    console.log(`   平均价格区间数: ${avgPriceRanges} (x)`);
    console.log(`   平均评选维度数: ${avgDimensions} (y)`);
    console.log(`   总评选任务数: ${totalEvaluations.toLocaleString()}`);
    console.log(`   计算公式: ${importResult.imported} × ${avgPriceRanges} × ${avgDimensions}`);
    
    console.log('\n🚀 下一步工作:');
    console.log('   1. 为每个品类设置价格区间 (x个区间)');
    console.log('   2. 为每个品类设置评选维度 (y个维度)');
    console.log('   3. 开发自动化评选系统');
    console.log('   4. 开始评选最佳商品');
    
    console.log('\n💡 建议:');
    console.log('   • 分阶段实施，先处理核心品类');
    console.log('   • 建立质量监控体系');
    console.log('   • 定期备份数据库');
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ 第一步完成：评选体系数据库基础建立成功！');
    console.log('='.repeat(70));
    
    return {
        totalCategories: importResult.total,
        importedCategories: importResult.imported,
        totalEvaluations,
        durationMinutes: duration,
        avgPriceRanges,
        avgDimensions
    };
}

/**
 * 主函数
 */
async function main() {
    console.log('='.repeat(70));
    console.log('🏗️  评选体系数据库建立工具');
    console.log('='.repeat(70));
    console.log('基于现有的245,317个品类数据，建立完整的评选体系数据库');
    console.log('');
    
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
用法:
  node build-evaluation-database.js [选项]

选项:
  --init-only       只初始化数据库，不导入数据
  --verify-only     只验证现有数据
  --sample N        只导入前N个品类作为样本
  --batch-size N    设置批次大小 (默认: 5000)
  --help, -h        显示帮助信息

示例:
  node build-evaluation-database.js
  node build-evaluation-database.js --init-only
  node build-evaluation-database.js --verify-only
  node build-evaluation-database.js --sample 1000
  node build-evaluation-database.js --batch-size 10000
        `);
        return;
    }
    
    if (args.includes('--verify-only')) {
        await verifyDatabase();
        return;
    }
    
    try {
        // 1. 初始化数据库
        const progress = await initDatabase();
        
        if (args.includes('--init-only')) {
            console.log('✅ 数据库初始化完成，未导入数据');
            return;
        }
        
        // 2. 加载现有数据
        const categories = await loadExistingCategories();
        
        // 3. 如果指定了样本数量
        if (args.includes('--sample')) {
            const sampleIndex = args.indexOf('--sample') + 1;
            const sampleSize = parseInt(args[sampleIndex]) || 1000;
            const sampledCategories = categories.slice(0, Math.min(sampleSize, categories.length));
            console.log(`🧪 使用样本模式: 只导入前 ${sampledCategories.length} 个品类`);
            
            const importResult = await importCategories(sampledCategories, progress);
            await generateReport(progress, importResult);
            return;
        }
        
        // 4. 导入全部数据
        const importResult = await importCategories(categories, progress);
        
        // 5. 验证数据库
        await verifyDatabase();
        
        // 6. 生成报告
        await generateReport(progress, importResult);
        
        // 7. 更新进度状态
        await progress.update({
            status: 'importing',
            last_update: new Date()
        });
        
    } catch (error) {
        console.error('❌ 程序运行失败:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// 错误处理
process.on('uncaughtException', (error) => {
    console.error('❌ 未捕获的异常:', error.message);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ 未处理的Promise拒绝:', reason);
});

// 优雅关闭
process.on('SIGINT', async () => {
    console.log('\n👋 接收到中断信号，正在退出...');
    process.exit(0);
});

if (require.main === module) {
    main().catch(error => {
        console.error('❌ 程序运行失败:', error.message);
        process.exit(1);
    });
}

module.exports = {
    initDatabase,
    loadExistingCategories,
    importCategories,
    verifyDatabase,
    generateReport
};