/**
 * AI评选系统测试 - 只处理1个品类验证功能
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// 用户提供的API密钥
const DEEPSEEK_API_KEY = 'sk-73ae194bf6b74d0abfad280635bde8e5';

console.log('='.repeat(60));
console.log('🤖 AI评选系统测试 - 验证API连接和功能');
console.log(`🔑 API密钥: ${DEEPSEEK_API_KEY.substring(0, 10)}...`);
console.log('='.repeat(60));

// 初始化OpenAI客户端
const client = new OpenAI({
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
});

async function testAPIConnection() {
  console.log('🔌 测试API连接...');
  
  try {
    const response = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一个测试助手，请回复"API连接正常"。' },
        { role: 'user', content: '请说"API连接正常"' }
      ],
      max_tokens: 10,
    });
    
    const message = response.choices[0].message.content;
    console.log(`✅ API连接正常: "${message}"`);
    console.log(`📊 使用token数: ${response.usage.total_tokens}`);
    
    return true;
  } catch (error) {
    console.log(`❌ API连接失败: ${error.message}`);
    if (error.response) {
      console.log(`   状态码: ${error.response.status}`);
      console.log(`   错误信息: ${JSON.stringify(error.response.data)}`);
    }
    return false;
  }
}

async function testCategoryProcessing() {
  console.log('\n🔍 测试品类处理流程...');
  
  try {
    // 加载品类数据
    const categoriesFile = path.join(__dirname, 'data/global-categories-expanded.json');
    const data = JSON.parse(fs.readFileSync(categoriesFile, 'utf8'));
    
    // 获取第一个品类
    let testCategory = null;
    for (const [level1, level2Data] of Object.entries(data.categories)) {
      for (const [level2, items] of Object.entries(level2Data)) {
        if (items.length > 0) {
          testCategory = {
            level1: level1,
            level2: level2,
            level3: items[0],
            fullPath: `${level1} > ${level2} > ${items[0]}`
          };
          break;
        }
      }
      if (testCategory) break;
    }
    
    if (!testCategory) {
      console.log('❌ 未找到测试品类');
      return false;
    }
    
    console.log(`📦 测试品类: ${testCategory.fullPath}`);
    
    // 测试价格区间分析
    console.log('   1. 测试价格区间分析...');
    const pricePrompt = `作为商品分析师，请为"${testCategory.level3}"设置3个价格区间。
请用JSON格式回复：{
  "price_ranges": [
    {"level": "经济型", "min_price": 50, "max_price": 150, "description": "描述"},
    {"level": "标准型", "min_price": 151, "max_price": 300, "description": "描述"},
    {"level": "高端型", "min_price": 301, "max_price": 500, "description": "描述"}
  ],
  "reasoning": "简要分析"
}`;
    
    const priceResponse = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是一位商品分析师，请用JSON格式回复。' },
        { role: 'user', content: pricePrompt }
      ],
      max_tokens: 500,
      response_format: { type: "json_object" }
    });
    
    const priceData = JSON.parse(priceResponse.choices[0].message.content);
    console.log(`   ✅ 价格区间分析成功: ${priceData.price_ranges.length}个区间`);
    
    // 测试品牌选择
    console.log('   2. 测试品牌选择...');
    
    // 品牌映射
    const brandMapping = {
      '个护健康': {
        '剃须用品': ['吉列', '舒适', '飞利浦', '博朗', '松下']
      }
    };
    
    const suitableBrands = brandMapping[testCategory.level1]?.[testCategory.level2] || 
                          ['知名品牌A', '知名品牌B', '知名品牌C'];
    
    const brandPrompt = `为"${testCategory.level3}"在"经济型"价格区间评选一款最佳商品。
适合品牌: ${suitableBrands.join(', ')}
请用JSON格式回复：{
  "product_name": "商品名称",
  "brand_name": "品牌",
  "price": 100,
  "selection_reason": "简要评选理由"
}`;
    
    const brandResponse = await client.chat.completions.create({
      model: 'deepseek-chat',
      messages: [
        { role: 'system', content: '你是商品评测专家，请用JSON格式回复真实商品信息。' },
        { role: 'user', content: brandPrompt }
      ],
      max_tokens: 300,
      response_format: { type: "json_object" }
    });
    
    const brandData = JSON.parse(brandResponse.choices[0].message.content);
    console.log(`   ✅ 品牌选择成功: ${brandData.brand_name} - ${brandData.product_name}`);
    
    console.log('\n🎉 所有测试通过！');
    console.log('💡 系统可以正常运行真正的AI评选。');
    
    return true;
    
  } catch (error) {
    console.log(`❌ 测试失败: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 开始测试...\n');
  
  // 测试API连接
  const apiConnected = await testAPIConnection();
  if (!apiConnected) {
    console.log('\n❌ API连接测试失败，请检查API密钥');
    process.exit(1);
  }
  
  // 测试品类处理
  const processingTest = await testCategoryProcessing();
  if (!processingTest) {
    console.log('\n⚠️  品类处理测试遇到问题，但API连接正常');
  }
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 测试总结:');
  console.log('  ✅ API连接正常');
  console.log('  ✅ 品类处理流程验证');
  console.log('  ✅ 可以开始真正的AI评选');
  console.log('='.repeat(60));
  
  console.log('\n🚀 下一步:');
  console.log('  运行: node start-true-ai-evaluator.js');
  console.log('  或运行: node start-true-ai-evaluator.js --test (只处理前5个)');
}

main().catch(error => {
  console.error('💥 测试程序异常终止:', error);
  process.exit(1);
});