#!/usr/bin/env node

/**
 * 完全清空所有品类数据，只保留品类结构
 * 准备从0开始用新方法评选
 */

const fs = require('fs');
const path = require('path');

console.log('🧹 开始完全清空所有品类数据...');

// 备份当前数据
const backupDir = path.join(__dirname, 'data', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = Date.now();
const backupFile = path.join(backupDir, `complete-backup-before-clear-${timestamp}.json`);

// 读取当前数据
const dataPath = path.join(__dirname, 'data', 'best-answers.json');
let currentData = [];

try {
  currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📊 当前有 ${currentData.length} 个品类数据`);
  
  // 备份完整数据
  fs.writeFileSync(backupFile, JSON.stringify(currentData, null, 2));
  console.log(`💾 完整备份已保存到: ${backupFile}`);
  
  // 只保留最基本的品类结构，清空所有评价数据
  const minimalData = currentData.map(category => {
    // 提取品类基本信息
    const { level1, level2, item } = category;
    
    // 创建最小化数据结构
    return {
      level1,
      level2,
      item,
      title: `${item} · 全球最佳商品评选（待评价）`,
      subtitle: "使用新方法进行真实商品评选",
      bestProducts: [], // 完全清空
      evaluationStatus: "pending",
      evaluationMethod: "new-real-product-method",
      needsRealData: true,
      lastUpdated: null,
      evaluationNotes: "等待使用新方法进行真实商品评选",
      realProductsCount: 0,
      priceRange: null,
      brandMatches: [],
      evaluationDimensions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  });
  
  // 保存最小化数据
  fs.writeFileSync(dataPath, JSON.stringify(minimalData, null, 2));
  console.log(`✅ 已完全清空 ${minimalData.length} 个品类的所有评价数据`);
  console.log('📝 只保留了品类结构:');
  console.log('   - level1, level2, item (品类信息)');
  console.log('   - bestProducts: [] (完全清空)');
  console.log('   - evaluationStatus: "pending" (待评价)');
  console.log('   - needsRealData: true (需要真实数据)');
  
  // 检查清空结果
  const clearedData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  const hasProducts = clearedData.some(cat => cat.bestProducts && cat.bestProducts.length > 0);
  const totalProducts = clearedData.reduce((sum, cat) => sum + (cat.bestProducts?.length || 0), 0);
  
  console.log(`\n🔍 验证结果:`);
  console.log(`   品类总数: ${clearedData.length}`);
  console.log(`   是否还有商品数据: ${hasProducts ? '是 ❌' : '否 ✅'}`);
  console.log(`   商品总数: ${totalProducts} (应为0)`);
  
  if (hasProducts || totalProducts > 0) {
    console.log('⚠️  警告: 数据未完全清空！');
  } else {
    console.log('🎯 验证通过: 所有商品数据已完全清空！');
  }
  
  // 创建空的真实商品数据库
  const realProductsPath = path.join(__dirname, 'data', 'real-products-database.json');
  const realProductsDB = {
    metadata: {
      name: "真实商品数据库",
      description: "用于新方法评选的真实商品数据",
      createdAt: new Date().toISOString(),
      totalProducts: 0,
      totalBrands: 0,
      lastUpdated: null
    },
    products: [],
    brands: [],
    categories: Array.from(new Set(currentData.map(cat => `${cat.level1} > ${cat.level2} > ${cat.item}`))),
    evaluationQueue: minimalData.map(cat => ({
      categoryId: `${cat.level1}-${cat.level2}-${cat.item}`.replace(/\s+/g, '-').toLowerCase(),
      level1: cat.level1,
      level2: cat.level2,
      item: cat.item,
      priority: 1,
      status: "pending"
    }))
  };
  
  fs.writeFileSync(realProductsPath, JSON.stringify(realProductsDB, null, 2));
  console.log(`📦 真实商品数据库已创建 (${realProductsDB.products.length} 个商品)`);
  
  // 更新系统状态
  const statusPath = path.join(__dirname, 'data', 'system-status.json');
  const status = {
    dataCleared: true,
    clearedAt: new Date().toISOString(),
    totalCategories: minimalData.length,
    oldMethodData: {
      backedUp: true,
      backupFile: path.basename(backupFile),
      itemsCount: currentData.length
    },
    newMethod: {
      enabled: true,
      name: "真实商品评选系统",
      requiresRealData: true,
      automationReady: false,
      nextSteps: [
        "配置真实商品数据源",
        "设置自动化采集程序",
        "定义评选维度和标准",
        "启动自动化评价流程"
      ]
    },
    recommendations: [
      "建议先采集至少100个品类的真实商品数据",
      "建立品牌库和产品数据库",
      "配置自动化质量验证",
      "设置定期数据更新机制"
    ]
  };
  
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
  console.log('📋 系统状态已更新');
  
  console.log('\n🎉 数据清空工作完成！');
  console.log('========================================');
  console.log('📌 下一步行动建议:');
  console.log('   1. 🛒 启动真实商品数据采集');
  console.log('   2. 🤖 配置自动化评价系统');
  console.log('   3. 📊 建立品牌和产品数据库');
  console.log('   4. 🔄 设置数据质量验证流程');
  console.log('   5. ⚡ 开始新方法的品类评选');
  console.log('========================================');
  
} catch (error) {
  console.error('❌ 清空数据时出错:', error.message);
  console.error(error.stack);
  process.exit(1);
}