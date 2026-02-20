      console.log(`📈 处理进度: ${this.totalCount - this.pendingCategories.length}/${this.totalCount} (${((this.totalCount - this.pendingCategories.length) / this.totalCount * 100).toFixed(1)}%)`);
      
      return true;
    } catch (error) {
      console.error(`❌ 保存进度失败: ${error.message}`);
      return false;
    }
  }

  logTask(taskInfo) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      ...taskInfo
    };

    const logFile = path.join(CONFIG.LOGS_PATH, `evaluation-${Date.now()}.json`);
    fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async run() {
    console.log('🚀 启动最佳商品新方法评选系统');
    console.log('========================================');
    
    // 初始化目录
    initDirectories();
    
    // 加载数据
    const loaded = await this.loadData();
    if (!loaded) {
      console.error('❌ 无法加载数据，程序退出');
      return;
    }
    
    if (this.pendingCategories.length === 0) {
      console.log('✅ 没有待处理的品类');
      return;
    }
    
    console.log(`🎯 目标: 处理 ${this.pendingCategories.length} 个待评价品类`);
    console.log(`⚙️  配置: 批次大小 ${CONFIG.BATCH_SIZE}, 并发数 ${CONFIG.CONCURRENT_WORKERS}`);
    console.log('========================================\n');
    
    let batchCount = 0;
    let totalProcessed = 0;
    
    while (this.pendingCategories.length > 0) {
      batchCount++;
      console.log(`\n📦 批次 ${batchCount} 开始处理...`);
      
      const completed = await this.processBatch();
      totalProcessed += Math.min(CONFIG.BATCH_SIZE, this.pendingCategories.length);
      
      console.log(`\n📊 批次 ${batchCount} 完成`);
      console.log(`📈 总体进度: ${totalProcessed}/${this.totalCount} (${(totalProcessed / this.totalCount * 100).toFixed(1)}%)`);
      console.log(`⏳ 剩余品类: ${this.pendingCategories.length}`);
      
      if (!completed && this.pendingCategories.length > 0) {
        console.log('⏸️  批次间隔 10秒...');
        await this.sleep(10000);
      }
    }
    
    console.log('\n🎉 所有品类处理完成！');
    console.log('========================================');
    console.log('📋 总结:');
    console.log(`   总品类数: ${this.totalCount}`);
    console.log(`   已处理: ${totalProcessed}`);
    console.log(`   完成率: 100%`);
    console.log('========================================');
    console.log('🚀 下一步:');
    console.log('   1. 检查数据质量');
    console.log('   2. 启动BestGoods服务器查看结果');
    console.log('   3. 配置自动化定期更新');
  }
}

// 命令行接口
async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help') || args.includes('-h')) {
    console.log(`
最佳商品新方法评选系统 - Node.js版本

用法:
  node new-method-evaluator.js [选项]

选项:
  --test          测试模式（只处理前3个品类）
  --batch-size N  设置批次大小（默认: 10）
  --workers N     设置并发数（默认: 3）
  --help, -h      显示帮助信息

示例:
  node new-method-evaluator.js --test
  node new-method-evaluator.js --batch-size 5 --workers 2
    `);
    return;
  }
  
  // 处理命令行参数
  if (args.includes('--batch-size')) {
    const index = args.indexOf('--batch-size');
    if (index + 1 < args.length) {
      CONFIG.BATCH_SIZE = parseInt(args[index + 1]) || 10;
    }
  }
  
  if (args.includes('--workers')) {
    const index = args.indexOf('--workers');
    if (index + 1 < args.length) {
      CONFIG.CONCURRENT_WORKERS = parseInt(args[index + 1]) || 3;
    }
  }
  
  // 测试模式
  if (args.includes('--test')) {
    console.log('🧪 测试模式启动（只处理前3个品类）');
    CONFIG.BATCH_SIZE = 3;
    CONFIG.CONCURRENT_WORKERS = 1;
  }
  
  // 检查API密钥
  if (CONFIG.DEEPSEEK_API_KEY === 'your-api-key-here') {
    console.error('❌ 错误: 请设置DeepSeek API密钥');
    console.log('💡 设置方法:');
    console.log('   1. 获取DeepSeek API密钥: https://platform.deepseek.com/api_keys');
    console.log('   2. 设置环境变量: export DEEPSEEK_API_KEY=your_key_here');
    console.log('   或直接在代码中修改 CONFIG.DEEPSEEK_API_KEY');
    return;
  }
  
  const scheduler = new SelectionScheduler();
  await scheduler.run();
}

// 启动程序
if (require.main === module) {
  main().catch(error => {
    console.error('❌ 程序运行失败:', error);
    process.exit(1);
  });
}

module.exports = {
  DeepSeekClient,
  CategoryProfileAgent,
  ProductSelectorAgent,
  SelectionScheduler,
  CONFIG
};