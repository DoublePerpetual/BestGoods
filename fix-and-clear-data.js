#!/usr/bin/env node

/**
 * 完全清空品类数据，确保从0开始
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 开始完全清空品类数据...');

const dataPath = path.join(__dirname, 'data', 'best-answers.json');
const backupPath = path.join(__dirname, 'data', 'backups', `complete-clear-backup-${Date.now()}.json`);

try {
    // 读取数据
    const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    console.log(`📊 当前有 ${data.length} 个品类数据`);
    
    // 备份
    fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
    console.log(`💾 完整备份已保存: ${backupPath}`);
    
    // 完全清空所有商品数据，重置状态
    const clearedData = data.map((category, index) => {
        // 提取基本信息
        const { level1, level2, item } = category;
        
        // 创建完全清空的数据结构
        return {
            level1,
            level2,
            item,
            title: `${item} · 全球最佳商品评选（新方法待评价）`,
            subtitle: "使用真实商品数据进行全新评选",
            bestProducts: [], // 完全清空
            evaluationStatus: "pending",
            evaluationMethod: "new-real-product-method",
            needsRealData: true,
            lastEvaluated: null,
            evaluationNotes: "等待使用新方法进行真实商品评选",
            realProductsCount: 0,
            priceRange: null,
            brandMatches: [],
            evaluationDimensions: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            // 添加唯一标识符
            categoryId: `cat-${index + 1}`,
            // 添加处理优先级（基于品类层级）
            priority: level1 === '个护健康' ? 1 : 2
        };
    });
    
    // 保存清空后的数据
    fs.writeFileSync(dataPath, JSON.stringify(clearedData, null, 2));
    
    // 验证清空结果
    const verifiedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    const hasProducts = verifiedData.some(cat => cat.bestProducts && cat.bestProducts.length > 0);
    const totalProducts = verifiedData.reduce((sum, cat) => sum + (cat.bestProducts?.length || 0), 0);
    
    console.log(`\n✅ 数据清空完成:`);
    console.log(`   品类总数: ${verifiedData.length}`);
    console.log(`   是否还有商品数据: ${hasProducts ? '是 ❌' : '否 ✅'}`);
    console.log(`   商品总数: ${totalProducts} (应为0)`);
    
    if (hasProducts || totalProducts > 0) {
        console.log('⚠️  警告: 数据未完全清空！');
        // 显示有问题的品类
        const problematic = verifiedData.filter(cat => cat.bestProducts && cat.bestProducts.length > 0);
        console.log(`   有问题的品类: ${problematic.length}个`);
        if (problematic.length > 0) {
            console.log('   示例:', problematic[0].item, '-', problematic[0].bestProducts.length, '个商品');
        }
    } else {
        console.log('🎯 验证通过: 所有商品数据已完全清空！');
    }
    
    // 创建新方法配置文件
    const config = {
        project: "BestGoods新方法评选系统",
        version: "2.0.0",
        totalCategories: verifiedData.length,
        clearedAt: new Date().toISOString(),
        backupFile: path.basename(backupPath),
        requirements: {
            realProducts: true,
            realBrands: true,
            specificModels: true,
            qualityValidation: true,
            costControl: true
        },
        processingStrategy: {
            batchSize: 50,
            concurrentWorkers: 5,
            dailyBudget: 500,
            priorityOrder: ["个护健康", "其他品类"]
        },
        expectedOutcomes: {
            processingSpeed: "20-50品类/小时",
            completionTime: "2-5天",
            totalCost: "约500-1000元",
            dataQuality: "置信度>85%"
        }
    };
    
    const configPath = path.join(__dirname, 'new-method-config-v2.json');
    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
    
    console.log(`\n⚙️  新方法配置文件已创建: ${configPath}`);
    console.log('\n🎉 数据准备完成，可以开始新方法评选！');
    
} catch (error) {
    console.error('❌ 清空数据时出错:', error.message);
    process.exit(1);
}