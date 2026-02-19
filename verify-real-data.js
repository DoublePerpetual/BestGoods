const fs = require('fs');
const path = require('path');

const BEST_ANSWERS_FILE = path.join(__dirname, 'data/best-answers.json');

function verifyRealData() {
  if (!fs.existsSync(BEST_ANSWERS_FILE)) {
    console.error('❌ 找不到 best-answers.json 文件');
    return;
  }

  const data = JSON.parse(fs.readFileSync(BEST_ANSWERS_FILE, 'utf8'));
  
  let totalCategories = 0;
  let categoriesWithRealData = 0;
  let categoriesWithFakeData = 0;
  let fakeDataExamples = [];
  
  const FAKE_PATTERNS = [
    /知名品牌[A-Z]/,
    /经济款[A-Z]/,
    /耐用款[A-Z]/,
    /舒适款[A-Z]/,
    /高端款[A-Z]/,
    /品牌[A-Z]/,
    /款[A-Z]$/
  ];
  
  data.forEach(item => {
    totalCategories++;
    let hasFakeData = false;
    
    if (item.bestProducts && Array.isArray(item.bestProducts)) {
      item.bestProducts.forEach(priceRange => {
        priceRange.dimensions.forEach(dimension => {
          // 检查是否为虚假数据
          FAKE_PATTERNS.forEach(pattern => {
            if (pattern.test(dimension.product) || pattern.test(dimension.brand)) {
              hasFakeData = true;
              if (fakeDataExamples.length < 5) {
                fakeDataExamples.push({
                  category: item.item,
                  product: dimension.product,
                  brand: dimension.brand
                });
              }
            }
          });
        });
      });
    }
    
    if (hasFakeData) {
      categoriesWithFakeData++;
    } else {
      categoriesWithRealData++;
    }
  });
  
  console.log('🔍 真实数据验证报告');
  console.log('=' .repeat(40));
  console.log(`📊 总品类数: ${totalCategories}`);
  console.log(`✅ 真实品牌数据: ${categoriesWithRealData} (${((categoriesWithRealData/totalCategories)*100).toFixed(1)}%)`);
  console.log(`❌ 虚假模拟数据: ${categoriesWithFakeData} (${((categoriesWithFakeData/totalCategories)*100).toFixed(1)}%)`);
  
  if (fakeDataExamples.length > 0) {
    console.log('\n📋 虚假数据示例:');
    fakeDataExamples.forEach(example => {
      console.log(`   • ${example.category}: ${example.product} (${example.brand})`);
    });
  }
  
  console.log('\n🎯 建议:');
  if (categoriesWithFakeData > 0) {
    console.log(`   1. 运行 update-real-products.js 更新剩余虚假数据`);
    console.log(`   2. 检查自动化系统是否生成真实品牌数据`);
    console.log(`   3. 验证智能评测系统的数据源`);
  } else {
    console.log(`   ✅ 所有品类都已使用真实品牌数据！`);
  }
}

// 执行验证
verifyRealData();