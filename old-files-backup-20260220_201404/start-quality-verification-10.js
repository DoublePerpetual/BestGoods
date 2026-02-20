/**
 * 启动10个品类的质量验证
 * 验证通过后再开始大规模处理
 */

const fs = require('fs');
const path = require('path');

console.log('🔬 启动10个品类的质量验证测试');
console.log('🎯 验证标准: 科学性、合理性、真实性、高质量');
console.log('='.repeat(70));

// 加载品类数据
const categoriesFile = path.join(__dirname, 'data/global-categories-expanded.json');
const categoriesData = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
const allCategories = categoriesData.categories || [];

// 选择10个有代表性的品类
const testCategories = allCategories.slice(0, 10).map((cat, index) => ({
  index: index + 1,
  ...cat
}));

console.log('\n📋 测试品类列表:');
testCategories.forEach(cat => {
  console.log(`  ${cat.index}. ${cat.level1} > ${cat.level2} > ${cat.level3}`);
});

console.log('\n🎯 验证重点:');
console.log('  1. 品牌匹配合理性（防止苹果生产棉签问题）');
console.log('  2. 价格区间科学性（基于市场实际）');
console.log('  3. 评价维度针对性（品类特异性）');
console.log('  4. 评选理由详细性（至少400字）');
console.log('  5. 数据真实性验证（可验证来源）');

console.log('\n📏 质量标准:');
console.log('  • 最小评选理由长度: 400字');
console.log('  • 最小置信度: 80/100');
console.log('  • 品牌匹配: 严格验证');
console.log('  • 价格验证: 必须在指定区间内');

console.log('\n🚀 启动验证...');

// 创建验证计划
const verificationPlan = {
  start_time: new Date().toISOString(),
  test_categories: testCategories,
  quality_standards: {
    min_reason_length: 400,
    min_confidence: 80,
    brand_relevance_check: true,
    price_range_validation: true,
    require_specific_models: true
  },
  expected_output: {
    total_categories: 10,
    expected_products: '约30-50个（3价格区间×3-5维度）',
    validation_rate: '目标: ≥80%通过率'
  }
};

// 保存验证计划
const planDir = path.join(__dirname, 'logs/quality-verification');
if (!fs.existsSync(planDir)) {
  fs.mkdirSync(planDir, { recursive: true });
}

const planFile = path.join(planDir, 'verification-plan.json');
fs.writeFileSync(planFile, JSON.stringify(verificationPlan, null, 2));

console.log(`\n📋 验证计划已保存: ${planFile}`);

console.log('\n💡 操作步骤:');
console.log('  1. 确保DEEPSEEK_API_KEY环境变量已设置');
console.log('  2. 运行: export DEEPSEEK_API_KEY=your_api_key_here');
console.log('  3. 启动质量处理器: node quality-first-processor-complete.js --test');
console.log('  4. 检查验证结果');
console.log('  5. 审核通过后开始大规模处理');

console.log('\n🔗 相关链接:');
console.log('  • 智能评价系统: http://localhost:3080/admin');
console.log('  • 网站首页: http://localhost:3076');
console.log('  • 详情页示例: http://localhost:3077/category/个护健康/剃须用品/一次性剃须刀');

console.log('\n✅ 质量验证准备完成！');
console.log('请按照上述步骤进行验证，确保评选质量完全符合要求。');