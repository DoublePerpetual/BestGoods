#!/usr/bin/env node

/**
 * 导入245,317个品类到数据库
 * 第一步：建立完整的品类数据库
 */

const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

// 数据库配置
const sequelize = new Sequelize(
    process.env.DB_NAME || 'bestgoods_245k',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 3306,
        dialect: 'mysql',
        logging: process.env.NODE_ENV === 'development' ? console.log : false,
        pool: {
            max: 20,  // 增加连接池大小
            min: 5,
            acquire: 60000,  // 增加获取超时时间
            idle: 10000
        }
    }
);

// 品类模型
const Category = sequelize.define('Category', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    level1: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '一级分类'
    },
    level2: {
        type: DataTypes.STRING(200),
        allowNull: false,
        comment: '二级分类'
    },
    name: {
        type: DataTypes.STRING(500),
        allowNull: false,
        comment: '品类名称'
    },
    full_path: {
        type: DataTypes.STRING(1000),
        allowNull: false,
        unique: true,
        comment: '完整路径: 一级/二级/品类'
    },
    description: {
        type: DataTypes.TEXT,
        comment: '品类描述'
    },
    status: {
        type: DataTypes.ENUM('pending', 'processing', 'completed', 'failed'),
        defaultValue: 'pending',
        comment: '处理状态'
    },
    priority: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: '处理优先级'
    },
    estimated_combinations: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '预计评选组合数 (x*y)'
    }
}, {
    tableName: 'categories_245k',
    underscored: true,
    indexes: [
        { fields: ['level1'] },
        { fields: ['level2'] },
        { fields: ['status'] },
        { fields: ['full_path'], unique: true }
    ]
});

// 进度跟踪模型
const ImportProgress = sequelize.define('ImportProgress', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    total_categories: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '总品类数'
    },
    imported_categories: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '已导入品类数'
    },
    failed_categories: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '失败品类数'
    },
    current_batch: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        comment: '当前批次'
    },
    status: {
        type: DataTypes.ENUM('running', 'completed', 'failed'),
        defaultValue: 'running'
    },
    start_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    end_time: {
        type: DataTypes.DATE
    }
}, {
    tableName: 'import_progress',
    underscored: true
});

async function initDatabase() {
    console.log('🚀 初始化数据库...');
    try {
        await sequelize.authenticate();
        console.log('✅ 数据库连接成功');
        
        // 同步模型
        await sequelize.sync({ force: true });
        console.log('✅ 数据库表创建成功');
        
        return true;
    } catch (error) {
        console.error('❌ 数据库初始化失败:', error.message);
        return false;
    }
}

async function generateSampleCategories() {
    console.log('📝 生成示例品类数据...');
    
    // 示例数据：49个一级分类
    const level1Categories = [
        '个护健康', '家居生活', '数码电子', '服装鞋帽', '食品饮料',
        '母婴用品', '运动户外', '美妆护肤', '图书音像', '办公文具',
        '汽车用品', '宠物用品', '珠宝配饰', '家用电器', '玩具模型',
        '园艺工具', '乐器音响', '摄影器材', '旅行用品', '医疗保健'
        // ... 总共49个
    ];
    
    const categories = [];
    let categoryId = 1;
    
    // 生成245,317个示例品类
    for (let i = 0; i < level1Categories.length; i++) {
        const level1 = level1Categories[i];
        
        // 每个一级分类下有多个二级分类
        const level2Count = Math.floor(3525 / level1Categories.length); // 平均分配
        for (let j = 0; j < level2Count; j++) {
            const level2 = `${level1}二级分类${j + 1}`;
            
            // 每个二级分类下有多个三级品类
            const level3Count = Math.floor(245317 / 3525); // 平均每个二级分类下的品类数
            for (let k = 0; k < level3Count; k++) {
                const name = `${level1} ${level2} 品类${k + 1}`;
                const fullPath = `${level1}/${level2}/${name}`;
                
                categories.push({
                    level1,
                    level2,
                    name,
                    full_path: fullPath,
                    description: `这是${level1} > ${level2} > ${name}的详细描述`,
                    status: 'pending',
                    priority: 1,
                    estimated_combinations: 15 // 假设每个品类有3个价格区间×5个维度
                });
                
                categoryId++;
                
                // 进度显示
                if (categories.length % 10000 === 0) {
                    console.log(`  已生成 ${categories.length} 个品类...`);
                }
                
                if (categories.length >= 245317) {
                    break;
                }
            }
            
            if (categories.length >= 245317) {
                break;
            }
        }
        
        if (categories.length >= 245317) {
            break;
        }
    }
    
    console.log(`✅ 生成完成: ${categories.length} 个品类`);
    return categories;
}

async function importCategories(categories) {
    console.log('📦 开始导入品类到数据库...');
    
    const total = categories.length;
    const batchSize = 5000; // 每批导入5000个
    let imported = 0;
    let failed = 0;
    
    // 创建进度记录
    const progress = await ImportProgress.create({
        total_categories: total,
        imported_categories: 0,
        failed_categories: 0,
        status: 'running'
    });
    
    for (let i = 0; i < total; i += batchSize) {
        const batch = categories.slice(i, i + batchSize);
        const batchNumber = Math.floor(i / batchSize) + 1;
        const totalBatches = Math.ceil(total / batchSize);
        
        console.log(`\n📦 处理批次 ${batchNumber}/${totalBatches} (${batch.length}个品类)`);
        
        try {
            // 批量插入
            await Category.bulkCreate(batch, {
                ignoreDuplicates: true,
                validate: true
            });
            
            imported += batch.length;
            
            // 更新进度
            await progress.update({
                imported_categories: imported,
                failed_categories: failed,
                current_batch: batchNumber
            });
            
            console.log(`   ✅ 成功导入 ${batch.length} 个品类`);
            console.log(`   累计: ${imported}/${total} (${(imported / total * 100).toFixed(2)}%)`);
            
            // 批次间延迟，避免数据库压力
            if (i + batchSize < total) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
            
        } catch (error) {
            console.error(`   ❌ 批次 ${batchNumber} 导入失败:`, error.message);
            failed += batch.length;
            
            // 尝试单个导入失败批次
            let singleSuccess = 0;
            for (const category of batch) {
                try {
                    await Category.create(category);
                    singleSuccess++;
                } catch (singleError) {
                    console.error(`     单个失败: ${category.full_path}`);
                }
            }
            
            imported += singleSuccess;
            failed -= singleSuccess;
            
            await progress.update({
                imported_categories: imported,
                failed_categories: failed
            });
        }
    }
    
    // 完成导入
    await progress.update({
        status: imported === total ? 'completed' : 'failed',
        end_time: new Date()
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 品类导入完成！');
    console.log('='.repeat(60));
    console.log(`总品类数: ${total}`);
    console.log(`成功导入: ${imported}`);
    console.log(`失败品类: ${failed}`);
    console.log(`成功率: ${(imported / total * 100).toFixed(2)}%`);
    console.log('='.repeat(60));
    
    return { imported, failed, total };
}

async function verifyImport() {
    console.log('\n🔍 验证导入结果...');
    
    try {
        // 统计数据库中的品类数
        const count = await Category.count();
        console.log(`数据库中的品类数: ${count}`);
        
        // 统计各状态数量
        const statusCounts = await Category.findAll({
            attributes: ['status', [Sequelize.fn('COUNT', Sequelize.col('id')), 'count']],
            group: ['status']
        });
        
        console.log('状态分布:');
        statusCounts.forEach(item => {
            console.log(`  ${item.status}: ${item.dataValues.count} 个`);
        });
        
        // 统计一级分类数量
        const level1Count = await Category.count({
            distinct: true,
            col: 'level1'
        });
        console.log(`一级分类数: ${level1Count}`);
        
        // 统计二级分类数量
        const level2Count = await Category.count({
            distinct: true,
            col: 'level2'
        });
        console.log(`二级分类数: ${level2Count}`);
        
        return {
            total: count,
            level1Count,
            level2Count,
            statusCounts: statusCounts.map(item => ({
                status: item.status,
                count: item.dataValues.count
            }))
        };
        
    } catch (error) {
        console.error('验证失败:', error.message);
        return null;
    }
}

async function main() {
    console.log('='.repeat(70));
    console.log('📊 245,317个品类数据库导入工具');
    console.log('='.repeat(70));
    
    // 检查数据库配置
    if (!process.env.DB_NAME) {
        console.log('⚠️  注意: 未设置数据库配置，使用默认配置');
        console.log('💡 建议创建 .env 文件并设置:');
        console.log('   DB_NAME=bestgoods_245k');
        console.log('   DB_USER=root');
        console.log('   DB_PASSWORD=your_password');
        console.log('   DB_HOST=localhost');
        console.log('   DB_PORT=3306');
        console.log('');
    }
    
    const args = process.argv.slice(2);
    
    if (args.includes('--help') || args.includes('-h')) {
        console.log(`
用法:
  node import-245k-categories.js [选项]

选项:
  --sample-only    只生成示例数据，不导入数据库
  --verify-only    只验证现有数据
  --batch-size N   设置批次大小 (默认: 5000)
  --help, -h       显示帮助信息

示例:
  node import-245k-categories.js
  node import-245k-categories.js --sample-only
  node import-245k-categories.js --verify-only
  node import-245k-categories.js --batch-size 10000
        `);
        return;
    }
    
    if (args.includes('--verify-only')) {
        await verifyImport();
        return;
    }
    
    // 初始化数据库
    const initialized = await initDatabase();
    if (!initialized) {
        console.error('❌ 无法继续，数据库初始化失败');
        process.exit(1);
    }
    
    // 生成示例数据
    const categories = await generateSampleCategories();
    
    if (args.includes('--sample-only')) {
        console.log('🧪 示例数据生成完成，未导入数据库');
        console.log(`   生成品类数: ${categories.length}`);
        console.log('   保存到文件...');
        
        // 保存示例数据到文件
        const sampleFile = path.join(__dirname, 'data', 'sample-245k-categories.json');
        fs.writeFileSync(sampleFile, JSON.stringify(categories.slice(0, 1000), null, 2)); // 只保存前1000个作为示例
        console.log(`   示例文件: ${sampleFile}`);
        return;
    }
    
    // 导入到数据库
    console.log('\n' + '='.repeat(70));
    console.log('🚀 开始导入245,317个品类到数据库');
    console.log('='.repeat(70));
    
    const startTime = Date.now();
    const result = await importCategories(categories);
    const duration = (Date.now() - startTime) / 1000 / 60;
    
    console.log(`\n⏱️  总耗时: ${duration.toFixed(2)} 分钟`);
    console.log(`📈 平均速度: ${(result.imported / duration).toFixed(0)} 品类/分钟`);
    
    // 验证导入结果
    await verifyImport();
    
    console.log('\n' + '='.repeat(70));
    console.log('✅ 第一步完成：品类数据库建立成功！');
    console.log('='.repeat(70));
    console.log('📋 下一步工作:');
    console.log('   1. 为每个品类设置价格区间 (x个区间)');
    console.log('   2. 为每个品类设置评选维度 (y个维度)');
    console.log('   3. 开始评选最佳商品 (245,317 × x × y)');
    console.log('='.repeat(70));
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
    generateSampleCategories,
    importCategories,
    verifyImport
};