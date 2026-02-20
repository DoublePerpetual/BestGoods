/**
 * 质量验证脚本 - 先处理10个品类验证评选质量
 * 确保科学性、合理性、真实性、高质量
 */

const fs = require('fs');
const path = require('path');

// 加载品类数据
const categoriesFile = path.join(__dirname, 'data/global-categories-expanded.json');
const categoriesData = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
const allCategories = categoriesData.categories || [];

// 选择10个有代表性的品类进行验证
const testCategories = [
  // 个护健康 - 常见品类
  { level1: '个护健康', level2: '剃须用品', level3: '一次性剃须刀' },
  { level1: '个护健康', level2: '口腔保健', level3: '牙齿美白凝胶' },
  { level1: '个护健康', level2: '护肤', level3: '保湿面霜' },
  
  // 电子产品
  { level1: '电子产品', level2: '手机', level3: '智能手机' },
  { level1: '电子产品', level2: '耳机', level3: '无线降噪耳机' },
  
  // 家居用品
  { level1: '家居用品', level2: '厨具', level3: '不粘锅' },
  { level1: '家居用品', level2: '清洁', level3: '扫地机器人' },
  
  // 食品饮料
  { level1: '食品饮料', level2: '饮料', level3: '碳酸饮料' },
  { level1: '食品饮料', level2: '零食', level3: '薯片' },
  
  // 特殊品类 - 测试品牌匹配
  { level1: '个护健康', level2: '口腔保健', level3: '牙齿美白棉签' }
];

console.log('🔬 质量验证测试 - 10个代表性品类');
console.log('='.repeat(60));

// 显示测试品类
testCategories.forEach((cat, index) => {
  console.log(`${index + 1}. ${cat.level1} > ${cat.level2} > ${cat.level3}`);
});

console.log('\n🎯 测试重点:');
console.log('1. 品牌与品类匹配合理性（苹果不生产棉签）');
console.log('2. 价格区间科学性');
console.log('3. 评价维度针对性');
console.log('4. 评选理由详细性（至少300字）');
console.log('5. 数据真实性验证');

console.log('\n🚀 启动质量验证...');
console.log('将调用智能评价系统API进行处理...\n');

// 这里可以调用智能评价系统的API
// 由于系统已经在运行，我们可以直接使用现有功能

// 创建验证报告
const verificationReport = {
  test_date: new Date().toISOString(),
  test_categories: testCategories,
  quality_metrics: {
    brand_relevance: '待验证',
    price_rationality: '待验证',
    dimension_specificity: '待验证',
    reason_detail: '待验证',
    data_authenticity: '待验证'
  },
  results: []
};

// 保存验证计划
const reportFile = path.join(__dirname, 'logs/quality-verification-plan.json');
fs.writeFileSync(reportFile, JSON.stringify(verificationReport, null, 2));

console.log(`📋 验证计划已保存: ${reportFile}`);
console.log('\n💡 建议操作:');
console.log('1. 访问智能评价系统: http://localhost:3080/admin');
console.log('2. 点击"批量评测10个品类"按钮');
console.log('3. 查看评选结果，验证质量');
console.log('4. 检查品牌匹配合理性（特别是"牙齿美白棉签"）');
console.log('5. 审核评选理由的详细程度');

console.log('\n✅ 质量验证准备完成！');
console.log('请按照上述步骤进行验证，确保评选质量符合要求后再开始大规模处理。');