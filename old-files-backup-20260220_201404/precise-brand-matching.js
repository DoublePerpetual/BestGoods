const fs = require('fs');
const path = require('path');

const BEST_ANSWERS_FILE = path.join(__dirname, 'data/best-answers.json');

// 精确的品类品牌映射
const PRECISE_CATEGORY_BRANDS = {
  // 口腔护理品类
  '牙膏': {
    globalBrands: ['Crest (宝洁)', 'Colgate (高露洁)', 'Sensodyne (舒适达)', 'Oral-B (欧乐B)', 'Listerine (李施德林)'],
    chineseBrands: ['云南白药', '冷酸灵', '黑人牙膏', '中华', '佳洁士'],
    techBrands: [] // 科技公司不生产牙膏
  },
  '牙刷': {
    globalBrands: ['Oral-B (欧乐B)', 'Philips (飞利浦)', 'Colgate (高露洁)', 'Sensodyne (舒适达)', 'Waterpik (洁碧)'],
    chineseBrands: ['小米', '华为', '飞利浦', '欧乐B', '舒客'],
    techBrands: ['小米', '华为'] // 科技公司可能生产电动牙刷
  },
  '棉签': {
    globalBrands: ['Q-tips', 'Johnson & Johnson (强生)', 'Unilever (联合利华)', 'P&G (宝洁)'],
    chineseBrands: ['稳健医疗', '全棉时代', '洁柔', '维达', '心相印'],
    techBrands: [] // 科技公司不生产棉签
  },
  '剃须刀': {
    globalBrands: ['Gillette (吉列)', 'Schick (舒适)', 'Philips (飞利浦)', 'BIC (比克)', 'Wilkinson Sword'],
    chineseBrands: ['飞科', '超人', '奔腾', '小米', '华为'],
    techBrands: ['小米', '华为'] // 科技公司可能生产电动剃须刀
  },
  '电动牙刷': {
    globalBrands: ['Oral-B (欧乐B)', 'Philips (飞利浦)', 'Waterpik (洁碧)', 'Colgate (高露洁)', 'FOREO'],
    chineseBrands: ['小米', '华为', '飞利浦', '欧乐B', '舒客'],
    techBrands: ['小米', '华为', '苹果'] // 科技公司生产电动牙刷
  },
  
  // 默认映射（用于未明确指定的品类）
  'default': {
    globalBrands: ['Procter & Gamble (宝洁)', 'Unilever (联合利华)', 'Johnson & Johnson (强生)', 'L\'Oréal (欧莱雅)', 'Nestlé (雀巢)'],
    chineseBrands: ['云南白药', '冷酸灵', '黑人牙膏', '飞科', '超人'],
    techBrands: [] // 默认不包含科技公司
  }
};

// 品类关键词到主要品类的映射
const CATEGORY_KEYWORD_MAPPING = {
  '牙齿': '牙膏',
  '牙': '牙膏',
  '刷': '牙刷',
  '棉签': '棉签',
  '剃须': '剃须刀',
  '电动': '电动牙刷',
  '护理': '护理用品',
  '清洁': '清洁用品',
  '美白': '美白产品'
};

function getPreciseBrandForCategory(categoryName, priceRange, dimension) {
  // 确定品类类型
  let mainCategory = 'default';
  for (const [keyword, mappedCategory] of Object.entries(CATEGORY_KEYWORD_MAPPING)) {
    if (categoryName.includes(keyword)) {
      mainCategory = mappedCategory;
      break;
    }
  }
  
  // 获取品牌列表
  const categoryData = PRECISE_CATEGORY_BRANDS[mainCategory] || PRECISE_CATEGORY_BRANDS.default;
  
  // 根据价格区间选择品牌池
  const priceLevel = getPriceLevel(priceRange);
  let brandPool;
  
  if (priceLevel === '经济型') {
    // 经济型优先选择中国品牌
    brandPool = [...categoryData.chineseBrands];
  } else if (priceLevel === '高端型') {
    // 高端型优先选择国际品牌
    brandPool = [...categoryData.globalBrands];
  } else {
    // 标准型混合选择
    brandPool = [...categoryData.chineseBrands, ...categoryData.globalBrands];
  }
  
  // 如果品牌池为空，使用默认
  if (brandPool.length === 0) {
    brandPool = [...PRECISE_CATEGORY_BRANDS.default.chineseBrands, ...PRECISE_CATEGORY_BRANDS.default.globalBrands];
  }
  
  // 根据评测维度选择品牌
  const dimensionType = getDimensionType(dimension);
  let selectedBrand;
  
  if (dimensionType === 'value') {
    // 性价比选择经济型品牌
    selectedBrand = brandPool.find(b => 
      b.includes('小米') || b.includes('云南白药') || b.includes('冷酸灵') || b.includes('飞科')
    ) || brandPool[0];
  } else if (dimensionType === 'durable') {
    // 耐用性选择知名品牌
    selectedBrand = brandPool.find(b => 
      b.includes('Philips') || b.includes('Gillette') || b.includes('Oral-B') || b.includes('飞利浦')
    ) || brandPool[brandPool.length - 1];
  } else {
    // 随机选择
    selectedBrand = brandPool[Math.floor(Math.random() * brandPool.length)];
  }
  
  // 生成产品名称
  const productName = generatePreciseProductName(categoryName, selectedBrand, dimensionType, priceLevel);
  
  return {
    product: productName,
    brand: selectedBrand,
    company: getCompanyName(selectedBrand),
    description: `${getCompanyName(selectedBrand)}生产的${categoryName}，专注于${dimension}`
  };
}

function getCompanyName(brand) {
  const companyMap = {
    'Crest (宝洁)': 'Procter & Gamble',
    'Colgate (高露洁)': 'Colgate-Palmolive',
    'Sensodyne (舒适达)': 'GlaxoSmithKline',
    'Oral-B (欧乐B)': 'Procter & Gamble',
    'Philips (飞利浦)': 'Philips',
    'Gillette (吉列)': 'Procter & Gamble',
    '云南白药': '云南白药集团',
    '冷酸灵': '重庆登康',
    '黑人牙膏': '好来化工',
    '小米': '小米科技',
    '华为': '华为技术',
    '飞科': '上海飞科电器',
    '超人': '中国超人集团'
  };
  
  return companyMap[brand] || brand.split(' (')[0] || brand;
}

function getPriceLevel(priceRange) {
  if (priceRange.includes('经济型')) return '经济型';
  if (priceRange.includes('高端型')) return '高端型';
  return '标准型';
}

function getDimensionType(dimension) {
  if (dimension.includes('性价比')) return 'value';
  if (dimension.includes('耐用')) return 'durable';
  if (dimension.includes('舒适')) return 'comfort';
  return 'standard';
}

function generatePreciseProductName(categoryName, brand, dimensionType, priceLevel) {
  const brandName = brand.split(' (')[0]; // 去掉括号部分
  const dimensionSuffixes = {
    'value': ['超值版', '经济款', '性价比优选'],
    'durable': ['耐用版', '持久款', '加强型'],
    'comfort': ['舒适版', '柔护款', '亲肤型'],
    'standard': ['标准版', '经典款', '基础型']
  };
  
  const priceSuffixes = {
    '经济型': ['入门款', '实惠装', '经济型'],
    '标准型': ['标准款', '常规装', '经典款'],
    '高端型': ['尊享版', '旗舰款', '豪华型']
  };
  
  const dimensionSuffix = dimensionSuffixes[dimensionType]?.[Math.floor(Math.random() * dimensionSuffixes[dimensionType].length)] || '';
  const priceSuffix = priceSuffixes[priceLevel]?.[Math.floor(Math.random() * priceSuffixes[priceLevel].length)] || '';
  
  return `${brandName} ${categoryName} ${priceSuffix} ${dimensionSuffix}`.trim();
}

function updateWithPreciseBrandMatching() {
  if (!fs.existsSync(BEST_ANSWERS_FILE)) {
    console.error('❌ 找不到 best-answers.json 文件');
    return;
  }

  const data = JSON.parse(fs.readFileSync(BEST_ANSWERS_FILE, 'utf8'));
  let updatedCount = 0;
  let fixedUnreasonable = 0;
  
  console.log('🎯 开始精确品牌匹配...');
  
  data.forEach((item, index) => {
    const categoryName = item.item;
    
    if (item.bestProducts && Array.isArray(item.bestProducts)) {
      item.bestProducts.forEach(priceRange => {
        priceRange.dimensions.forEach(dimension => {
          // 检查当前品牌是否合理
          const currentBrand = dimension.brand;
          const isUnreasonable = isUnreasonableCombination(categoryName, currentBrand);
          
          // 获取精确匹配的品牌
          const brandInfo = getPreciseBrandForCategory(categoryName, priceRange.priceRange, dimension.name);
          
          // 更新数据
          dimension.product = brandInfo.product;
          dimension.brand = brandInfo.brand;
          dimension.company = brandInfo.company;
          dimension.description = brandInfo.description;
          
          // 生成合理的价格和评分
          updatePriceAndRating(dimension, priceRange.priceRange);
          
          updatedCount++;
          if (isUnreasonable) {
            fixedUnreasonable++;
          }
        });
      });
    }
    
    // 显示进度
    if (index % 100 === 0) {
      console.log(`  处理进度: ${index + 1}/${data.length} (${Math.round((index + 1) / data.length * 100)}%)`);
    }
  });
  
  // 保存更新后的数据
  fs.writeFileSync(BEST_ANSWERS_FILE, JSON.stringify(data, null, 2));
  
  console.log('\n✅ 精确品牌匹配完成！');
  console.log(`📊 更新商品数据: ${updatedCount}`);
  console.log(`🔧 修复不合理匹配: ${fixedUnreasonable}`);
  console.log(`📁 总品类数: ${data.length}`);
  console.log(`💾 文件已保存: ${BEST_ANSWERS_FILE}`);
}

function isUnreasonableCombination(categoryName, brand) {
  const unreasonable = [
    { brand: 'Apple', categories: ['棉签', '牙膏', '洗发水', '洗衣液'] },
    { brand: '华为', categories: ['棉签', '牙膏', '面霜', '洗发水'] },
    { brand: '腾讯', categories: ['棉签', '牙刷', '剃须刀', '面霜'] },
    { brand: '阿里巴巴', categories: ['棉签', '牙膏', '洗发水', '洗衣液'] },
    { brand: '百度', categories: ['棉签', '牙膏', '面霜', '洗发水'] }
  ];
  
  return unreasonable.some(combo => 
    brand.includes(combo.brand) && combo.categories.some(cat => categoryName.includes(cat))
  );
}

function updatePriceAndRating(dimension, priceRange) {
  const matches = priceRange.match(/¥(\d+)-¥(\d+)/);
  if (matches) {
    const min = parseInt(matches[1]);
    const max = parseInt(matches[2]);
    const price = Math.floor(Math.random() * (max - min + 1) + min);
    dimension.price = `¥${price}.${Math.floor(Math.random() * 9)}`;
  }
  
  dimension.rating = (Math.random() * 0.5 + 4.0).toFixed(1);
  dimension.reviews = Math.floor(Math.random() * 10000 + 1000) + '+';
}

// 执行精确品牌匹配
updateWithPreciseBrandMatching();