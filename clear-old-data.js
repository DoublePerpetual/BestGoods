#!/usr/bin/env node

/**
 * 清空老方法测评的品类数据
 * 将所有品类数据重置为空数组，准备从0开始用新方法评选
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 开始清空老方法测评的品类数据...');

// 备份当前数据
const backupDir = path.join(__dirname, 'data', 'backups');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = Date.now();
const backupFile = path.join(backupDir, `best-answers-backup-before-clear-${timestamp}.json`);

// 读取当前数据
const dataPath = path.join(__dirname, 'data', 'best-answers.json');
let currentData = [];

try {
  currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
  console.log(`📊 当前有 ${currentData.length} 个品类数据`);
  
  // 备份
  fs.writeFileSync(backupFile, JSON.stringify(currentData, null, 2));
  console.log(`💾 已备份到: ${backupFile}`);
  
  // 清空所有品类的最佳答案数据，但保留品类结构
  const clearedData = currentData.map(category => ({
    ...category,
    bestAnswers: [], // 清空最佳答案
    evaluationNotes: '', // 清空评价备注
    priceRange: null, // 清空价格区间
    brandMatches: [], // 清空品牌匹配
    realProducts: [], // 清空真实商品数据
    evaluationStatus: 'pending', // 重置为待评价状态
    lastEvaluated: null, // 清空最后评价时间
    evaluationScore: 0, // 重置评价分数
    needsRealData: true // 标记需要真实数据
  }));
  
  // 保存清空后的数据
  fs.writeFileSync(dataPath, JSON.stringify(clearedData, null, 2));
  console.log(`✅ 已清空 ${clearedData.length} 个品类的测评数据`);
  console.log('📝 所有品类已重置为:');
  console.log('   - bestAnswers: [] (清空最佳答案)');
  console.log('   - evaluationStatus: "pending" (待评价)');
  console.log('   - needsRealData: true (需要真实数据)');
  console.log('   - 其他字段已清空或重置');
  
  // 更新自动化状态
  const statusPath = path.join(__dirname, 'data', 'automation-status.json');
  const status = {
    lastCleared: new Date().toISOString(),
    totalCategories: clearedData.length,
    clearedCategories: clearedData.length,
    pendingCategories: clearedData.length,
    completedCategories: 0,
    method: 'new-evaluation',
    requiresRealProducts: true,
    status: 'ready-for-new-method'
  };
  
  fs.writeFileSync(statusPath, JSON.stringify(status, null, 2));
  console.log('📋 自动化状态已更新');
  
  // 创建新方法配置文件
  const configPath = path.join(__dirname, 'new-evaluation-config.json');
  const config = {
    method: 'real-product-evaluation',
    description: '基于真实商品数据的全新评选方法',
    requirements: [
      '使用真实商家品牌和具体产品型号',
      '避免泛指或模拟数据',
      '全方位评估选择最佳公司/品牌/商品',
      '设置合理的价格区间和评选维度',
      '24小时不间断录入数据的自动化程序'
    ],
    evaluationDimensions: [
      '品牌知名度',
      '产品质量',
      '价格合理性', 
      '用户评价',
      '市场占有率',
      '技术创新',
      '售后服务',
      '环保认证'
    ],
    priceRangeStrategy: '根据实际消费者情况设置',
    automationEnabled: true,
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2));
  console.log('⚙️  新方法配置文件已创建');
  
  console.log('\n🎉 数据清空完成！');
  console.log('📌 下一步建议:');
  console.log('   1. 启动真实商品数据采集程序');
  console.log('   2. 配置自动化评价系统');
  console.log('   3. 开始新方法的品类评选');
  
} catch (error) {
  console.error('❌ 清空数据时出错:', error.message);
  process.exit(1);
}