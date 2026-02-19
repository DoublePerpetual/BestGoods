const fs = require('fs');
const path = require('path');

const BEST_ANSWERS_FILE = path.join(__dirname, 'data/best-answers.json');

// 不合理的品牌品类组合
const UNREASONABLE_COMBINATIONS = [
  { brand: 'Apple', categories: ['棉签', '牙刷', '牙膏', '剃须刀', '面霜'] },
  { brand: 'Samsung', categories: ['棉签', '牙膏', '洗发水', '洗衣液'] },
  { brand: '华为', categories: ['棉签', '牙膏', '面霜', '洗发水'] },
  { brand: '小米', categories: ['棉签', '牙膏', '面霜', '洗衣液'] },
  { brand: '腾讯', categories: ['棉签', '牙刷', '剃须刀', '面霜'] },
  { brand: '阿里巴巴', categories: ['棉签', '牙膏', '洗发水', '洗衣液'] }
];

function validateBrandMatching() {
  if (!fs.existsSync(BEST_ANSWERS_FILE)) {
    console.error('❌ 找不到 best-answers.json 文件');
    return;
  }

  const data = JSON.parse(fs.readFileSync(BEST_ANSWERS_FILE, 'utf8'));
  
  let totalProducts = 0;
  let reasonableProducts = 0;
  let unreasonableProducts = 0;
  let unreasonableExamples = [];
  
  console.log('🔍 品牌匹配合理性验证');
  console.log('=' .repeat(50));
  
  data.forEach(item => {
    const categoryName = item.item;
    
    if (item.bestProducts && Array.isArray(item.bestProducts)) {
      item.bestProducts.forEach(priceRange => {
        priceRange.dimensions.forEach(dimension => {
          totalProducts++;
          
          // 检查是否为不合理组合
          let isUnreasonable = false;
          UNREASONABLE_COMBINATIONS.forEach(combo => {
            if (dimension.brand.includes(combo.brand)) {
              if (combo.categories.some(cat => categoryName.includes(cat))) {
                isUnreasonable = true;
                if (unreasonableExamples.length < 10) {
                  unreasonableExamples.push({
                    category: categoryName,
                    product: dimension.product,
                    brand: dimension.brand,
                    reason: `${combo.brand} 不生产 ${categoryName}`
                  });
                }
              }
            }
          });
          
          if (isUnreasonable) {
            unreasonableProducts++;
          } else {
            reasonableProducts++;
          }
        });
      });
    }
  });
  
  console.log(`📊 总商品数: ${totalProducts}`);
  console.log(`✅ 合理品牌匹配: ${reasonableProducts} (${((reasonableProducts/totalProducts)*100).toFixed(1)}%)`);
  console.log(`❌ 不合理品牌匹配: ${unreasonableProducts} (${((unreasonableProducts/totalProducts)*100).toFixed(1)}%)`);
  
  if (unreasonableExamples.length > 0) {
    console.log('\n⚠️  不合理品牌匹配示例:');
    unreasonableExamples.forEach(example => {
      console.log(`   • ${example.category}: ${example.product} (${example.brand})`);
      console.log(`     原因: ${example.reason}`);
    });
  }
  
  console.log('\n🎯 品类品牌匹配分析:');
  
  // 分析常见品类的品牌分布
  const categoryAnalysis = {};
  data.slice(0, 20).forEach(item => { // 只分析前20个品类
    const categoryName = item.item;
    categoryAnalysis[categoryName] = new Set();
    
    if (item.bestProducts && Array.isArray(item.bestProducts)) {
      item.bestProducts.forEach(priceRange => {
        priceRange.dimensions.forEach(dimension => {
          categoryAnalysis[categoryName].add(dimension.brand);
        });
      });
    }
  });
  
  Object.entries(categoryAnalysis).forEach(([category, brands]) => {
    console.log(`   📦 ${category}: ${Array.from(brands).join(', ')}`);
  });
  
  console.log('\n💡 建议:');
  if (unreasonableProducts > 0) {
    console.log('   1. 修复不合理品牌匹配');
    console.log('   2. 完善品类品牌数据库');
    console.log('   3. 加强品牌品类关联性检查');
  } else {
    console.log('   ✅ 所有品牌匹配都合理！');
  }
}

// 执行验证
validateBrandMatching();