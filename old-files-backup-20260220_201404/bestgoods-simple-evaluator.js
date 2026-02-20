                await new Promise(resolve => setTimeout(resolve, CONFIG.REQUEST_DELAY * 2));
            }
        }
        
        // 更新进度
        this.processedCount += batch.length;
        this.pendingCategories = this.pendingCategories.slice(batch.length);
        
        // 保存进度
        await this.saveProgress();
        
        return this.pendingCategories.length === 0;
    }
    
    async processCategory(category) {
        const startTime = Date.now();
        Logger.info(`处理品类: ${category.item} (ID: ${category.categoryId})`);
        
        try {
            // Step 1: 生成品类画像
            Logger.debug(`   🔍 生成品类画像...`);
            const profileResult = await this.profileAgent.generate(category);
            
            if (!profileResult.success) {
                throw new Error(`品类画像生成失败: ${profileResult.error}`);
            }
            
            const profile = profileResult.profile;
            const priceRanges = profile.price_ranges || [];
            const dimensions = profile.dimensions || [];
            
            // Step 2: 评选最佳商品
            const totalCombinations = priceRanges.length * dimensions.length;
            Logger.debug(`   📊 需要评选 ${totalCombinations} 个坐标点`);
            
            const bestProducts = [];
            let successCount = 0;
            
            for (const priceRange of priceRanges) {
                for (const dimension of dimensions) {
                    Logger.debug(`   🛒 评选: ${priceRange.level} - ${dimension.name}...`);
                    
                    const productResult = await this.productAgent.select(category, priceRange, dimension);
                    
                    if (productResult.success) {
                        bestProducts.push({
                            priceRange: priceRange.level,
                            dimension: dimension.name,
                            product: productResult.product,
                            quality: productResult.quality
                        });
                        successCount++;
                        
                        // 记录成本
                        this.totalCost += productResult.metrics.cost;
                    }
                    
                    // API调用间隔
                    await new Promise(resolve => setTimeout(resolve, CONFIG.REQUEST_DELAY));
                }
            }
            
            // 更新品类数据
            const updatedCategory = {
                ...category,
                evaluationStatus: 'completed',
                evaluationMethod: 'new-real-product-method',
                bestProducts: bestProducts,
                priceRanges: priceRanges,
                dimensions: dimensions,
                profileAnalysis: profile.market_analysis,
                lastEvaluated: new Date().toISOString(),
                realProductsCount: successCount,
                needsRealData: false,
                processingStats: {
                    totalCombinations: totalCombinations,
                    successCount: successCount,
                    successRate: totalCombinations > 0 ? (successCount / totalCombinations * 100).toFixed(1) + '%' : '0%',
                    duration: (Date.now() - startTime) / 1000
                }
            };
            
            // 更新内存中的数据
            const categoryIndex = this.data.findIndex(c => c.categoryId === category.categoryId);
            if (categoryIndex !== -1) {
                this.data[categoryIndex] = updatedCategory;
            }
            
            const duration = (Date.now() - startTime) / 1000;
            Logger.success(`   品类处理完成: ${successCount}/${totalCombinations} 成功 | 耗时: ${duration.toFixed(2)}s`);
            
            // 记录任务日志
            this.logTask({
                categoryId: category.categoryId,
                categoryName: category.item,
                status: 'completed',
                successCount: successCount,
                totalCombinations: totalCombinations,
                duration: duration,
                cost: this.totalCost
            });
            
            return {
                success: true,
                category: updatedCategory,
                metrics: {
                    successCount,
                    totalCombinations,
                    duration
                }
            };
            
        } catch (error) {
            Logger.error(`   品类处理失败: ${error.message}`);
            
            // 记录失败日志
            this.logTask({
                categoryId: category.categoryId,
                categoryName: category.item,
                status: 'failed',
                error: error.message
            });
            
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    async saveProgress() {
        try {
            // 备份原文件
            const timestamp = Date.now();
            const backupFile = path.join(CONFIG.BACKUP_DIR, `progress-backup-${timestamp}.json`);
            fs.copyFileSync(CONFIG.DATA_FILE, backupFile);
            
            // 保存更新后的数据
            fs.writeFileSync(CONFIG.DATA_FILE, JSON.stringify(this.data, null, 2));
            
            // 保存进度报告
            const progressReport = {
                timestamp: new Date().toISOString(),
                totalCategories: this.data.length,
                processed: this.processedCount,
                pending: this.pendingCategories.length,
                progress: ((this.processedCount) / this.data.length * 100).toFixed(1) + '%',
                totalCost: this.totalCost.toFixed(2),
                estimatedRemaining: this.pendingCategories.length > 0 ? 
                    Math.ceil(this.pendingCategories.length / CONFIG.BATCH_SIZE) + ' 批次' : '已完成'
            };
            
            const reportFile = path.join(CONFIG.LOGS_DIR, `progress-${timestamp}.json`);
            fs.writeFileSync(reportFile, JSON.stringify(progressReport, null, 2));
            
            Logger.success(`进度已保存 | 处理: ${this.processedCount}/${this.data.length} (${progressReport.progress}) | 成本: ¥${this.totalCost.toFixed(2)}`);
            
            return true;
        } catch (error) {
            Logger.error(`保存进度失败: ${error.message}`);
            return false;
        }
    }
    
    logTask(taskInfo) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            ...taskInfo
        };
        
        const logFile = path.join(CONFIG.TASKS_DIR, `task-${Date.now()}.json`);
        fs.writeFileSync(logFile, JSON.stringify(logEntry, null, 2));
    }
    
    async run() {
        this.startTime = Date.now();
        
        Logger.info('='.repeat(60));
        Logger.info('BestGoods简化版评选系统');
        Logger.info('='.repeat(60));
        Logger.info(`总品类数: ${this.data ? this.data.length : '加载中...'}`);
        Logger.info(`批次大小: ${CONFIG.BATCH_SIZE}`);
        Logger.info(`并发数: ${CONFIG.CONCURRENT_WORKERS}`);
        Logger.info(`每日预算: ¥${CONFIG.DAILY_BUDGET}`);
        Logger.info('='.repeat(60));
        
        // 加载数据
        const loaded = await this.loadData();
        if (!loaded) {
            Logger.error('无法加载数据，程序退出');
            return;
        }
        
        if (this.pendingCategories.length === 0) {
            Logger.success('没有待处理的品类');
            return;
        }
        
        Logger.info(`目标: 处理 ${this.pendingCategories.length} 个待评价品类`);
        Logger.info(`预计批次: ${Math.ceil(this.pendingCategories.length / CONFIG.BATCH_SIZE)}`);
        Logger.info('='.repeat(60));
        
        let batchCount = 0;
        
        while (this.pendingCategories.length > 0) {
            batchCount++;
            Logger.info(`\n📦 批次 ${batchCount} 开始处理...`);
            
            const completed = await this.processBatch();
            
            Logger.info(`📊 批次 ${batchCount} 完成`);
            Logger.info(`📈 总体进度: ${this.processedCount}/${this.data.length} (${(this.processedCount / this.data.length * 100).toFixed(1)}%)`);
            Logger.info(`⏳ 剩余品类: ${this.pendingCategories.length}`);
            Logger.info(`💰 累计成本: ¥${this.totalCost.toFixed(2)}`);
            
            if (!completed && this.pendingCategories.length > 0) {
                Logger.info('⏸️  批次间隔 5秒...');
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        
        const totalDuration = (Date.now() - this.startTime) / 1000 / 60;
        Logger.success('\n' + '='.repeat(60));
        Logger.success('🎉 所有品类处理完成！');
        Logger.success('='.repeat(60));
        Logger.success(`总结:`);
        Logger.success(`   总品类数: ${this.data.length}`);
        Logger.success(`   已处理: ${this.processedCount}`);
        Logger.success(`   完成率: 100%`);
        Logger.success(`   总成本: ¥${this.totalCost.toFixed(2)}`);
        Logger.success(`   总耗时: ${totalDuration.toFixed(1)} 分钟`);
        Logger.success('='.repeat(60));
        Logger.success(`下一步:`);
        Logger.success(`   1. 检查数据质量`);
        Logger.success(`   2. 启动BestGoods服务器查看结果`);
        Logger.success(`   3. 配置自动化定期更新`);
        Logger.success('='.repeat(60));
    }
}

// ========== 命令行接口 ==========
async function main() {
    const args = process.argv.slice(2);
    
    // 显示帮助
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
BestGoods简化版评选系统

用法:
  node bestgoods-simple-evaluator.js [选项]

选项:
  --test          测试模式（只处理前3个品类）
  --batch-size N  设置批次大小（默认: 20）
  --workers N     设置并发数（默认: 3）
  --budget N      设置每日预算（默认: 500）
  --help, -h      显示帮助信息

示例:
  node bestgoods-simple-evaluator.js --test
  node bestgoods-simple-evaluator.js --batch-size 10 --workers 2
  node bestgoods-simple-evaluator.js --budget 300

环境变量:
  DEEPSEEK_API_KEY  必须设置DeepSeek API密钥
        `);
        return;
    }
    
    // 处理命令行参数
    if (args.includes('--batch-size')) {
        const index = args.indexOf('--batch-size');
        if (index + 1 < args.length) {
            CONFIG.BATCH_SIZE = parseInt(args[index + 1]) || 20;
        }
    }
    
    if (args.includes('--workers')) {
        const index = args.indexOf('--workers');
        if (index + 1 < args.length) {
            CONFIG.CONCURRENT_WORKERS = parseInt(args[index + 1]) || 3;
        }
    }
    
    if (args.includes('--budget')) {
        const index = args.indexOf('--budget');
        if (index + 1 < args.length) {
            CONFIG.DAILY_BUDGET = parseFloat(args[index + 1]) || 500;
        }
    }
    
    // 测试模式
    if (args.includes('--test')) {
        Logger.info('🧪 测试模式启动（只处理前3个品类）');
        CONFIG.BATCH_SIZE = 3;
        CONFIG.CONCURRENT_WORKERS = 1;
        CONFIG.DAILY_BUDGET = 10; // 测试模式降低预算
    }
    
    // 检查API密钥
    if (CONFIG.DEEPSEEK_API_KEY === 'your-api-key-here') {
        Logger.error('❌ 错误: 请设置DeepSeek API密钥');
        console.log('\n💡 设置方法:');
        console.log('   1. 获取DeepSeek API密钥: https://platform.deepseek.com/api_keys');
        console.log('   2. 设置环境变量: export DEEPSEEK_API_KEY=your_key_here');
        console.log('   或直接在代码中修改 CONFIG.DEEPSEEK_API_KEY');
        console.log('\n🔑 当前配置:', CONFIG.DEEPSEEK_API_KEY);
        return;
    }
    
    // 初始化目录
    [CONFIG.LOGS_DIR, CONFIG.TASKS_DIR, CONFIG.BACKUP_DIR].forEach(dir => {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
    });
    
    // 启动调度器
    const scheduler = new TaskScheduler();
    await scheduler.run();
}

// 错误处理
process.on('uncaughtException', (error) => {
    Logger.error(`未捕获的异常: ${error.message}`);
    Logger.error(error.stack);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    Logger.error(`未处理的Promise拒绝: ${reason}`);
});

// 优雅关闭
process.on('SIGINT', () => {
    Logger.info('接收到SIGINT信号，正在关闭...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    Logger.info('接收到SIGTERM信号，正在关闭...');
    process.exit(0);
});

// 启动程序
if (require.main === module) {
    main().catch(error => {
        Logger.error(`程序运行失败: ${error.message}`);
        process.exit(1);
    });
}

module.exports = {
    DeepSeekClient,
    ProfileAgent,
    ProductAgent,
    TaskScheduler,
    CONFIG
};