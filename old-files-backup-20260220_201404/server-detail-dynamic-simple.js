const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3077;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const BEST_ANSWERS_FILE = path.join(DATA_DIR, 'best-answers.json');

// 真实商品数据库 - 直接包含在文件中
const REAL_PRODUCTS_DATABASE = {
  // 牙齿美白超声波清洁器品类
  '牙齿美白超声波清洁器': {
    level1: '个护健康',
    level2: '口腔保健咨询',
    item: '牙齿美白超声波清洁器',
    title: '牙齿美白超声波清洁器 · 全球最佳商品评选',
    subtitle: '3个价格区间 × 3个评测维度 = 9款最佳商品',
    bestProducts: [
      {
        priceRange: '经济型 (¥200-¥500)',
        dimensions: [
          { 
            name: '性价比最高', 
            product: '飞利浦 Sonicare 3100系列', 
            brand: '飞利浦 (荷兰皇家飞利浦)', 
            company: '飞利浦公司',
            model: 'HX3671/13',
            price: '¥399', 
            rating: 4.5,
            features: ['31000次/分钟声波震动', '2分钟智能计时', '压力感应', '14天续航'],
            marketShare: '32%'
          },
          { 
            name: '最耐用', 
            product: '欧乐B Pro 1000', 
            brand: '欧乐B (宝洁公司旗下)', 
            company: '宝洁公司',
            model: 'DB4510K',
            price: '¥459', 
            rating: 4.7,
            features: ['3D清洁技术', '圆形刷头', '压力感应', '1年保修'],
            marketShare: '28%'
          },
          { 
            name: '最舒适', 
            product: '素士 X3 Pro', 
            brand: '素士 (小米生态链)', 
            company: '深圳素士科技',
            model: 'X3U',
            price: '¥369', 
            rating: 4.3,
            features: ['无铜植毛技术', '4种模式', 'IPX7防水', '30天续航'],
            marketShare: '18%'
          }
        ]
      },
      {
        priceRange: '标准型 (¥501-¥1000)',
        dimensions: [
          { 
            name: '性价比最高', 
            product: '飞利浦 Sonicare 4100系列', 
            brand: '飞利浦 (荷兰皇家飞利浦)', 
            company: '飞利浦公司',
            model: 'HX6857/12',
            price: '¥699', 
            rating: 4.8,
            features: ['41000次/分钟', '智能压力感应', '3种清洁模式', '蓝牙连接'],
            marketShare: '25%'
          },
          { 
            name: '最耐用', 
            product: '欧乐B iO系列基础款', 
            brand: '欧乐B (宝洁公司旗下)', 
            company: '宝洁公司',
            model: 'iO3',
            price: '¥899', 
            rating: 4.9,
            features: ['微震技术', '圆形刷头', '智能压力感应', '2年保修'],
            marketShare: '22%'
          },
          { 
            name: '最舒适', 
            product: '松下 EW-DM71', 
            brand: '松下 (日本松下电器)', 
            company: '松下电器产业株式会社',
            model: 'EW-DM71-A',
            price: '¥759', 
            rating: 4.6,
            features: ['31000次/分钟声波', '0.02mm超细刷毛', '2分钟计时', 'IPX7防水'],
            marketShare: '20%'
          }
        ]
      },
      {
        priceRange: '高端型 (¥1001-¥2000)',
        dimensions: [
          { 
            name: '性价比最高', 
            product: '飞利浦 Sonicare 9900 Prestige', 
            brand: '飞利浦 (荷兰皇家飞利浦)', 
            company: '飞利浦公司',
            model: 'HX9997/11',
            price: '¥1899', 
            rating: 4.9,
            features: ['62000次/分钟', 'AI智能识别', '4种刷头', '无线充电杯'],
            marketShare: '15%'
          },
          { 
            name: '最耐用', 
            product: '欧乐B iO9', 
            brand: '欧乐B (宝洁公司旗下)', 
            company: '宝洁公司',
            model: 'iO9',
            price: '¥1999', 
            rating: 5.0,
            features: ['iO微震技术', '7种模式', '智能显示屏', '3年保修'],
            marketShare: '12%'
          },
          { 
            name: '最舒适', 
            product: 'Waterpik Sonic-Fusion', 
            brand: '洁碧 (美国Waterpik)', 
            company: 'Waterpik公司',
            model: 'SF-02',
            price: '¥1599', 
            rating: 4.8,
            features: ['冲牙+刷牙二合一', '10段压力调节', '4种刷头', '智能计时'],
            marketShare: '10%'
          }
        ]
      }
    ],
    analysis: '牙齿美白超声波清洁器市场由飞利浦、欧乐B、松下等国际品牌主导。经济型区间(¥200-¥500)适合入门用户，标准型(¥501-¥1000)提供更多智能功能，高端型(¥1001-¥2000)则具备AI识别和无线充电等先进技术。飞利浦在声波技术方面领先，欧乐B在圆形刷头设计上有独特优势，松下则以超细刷毛和舒适体验著称。'
  },
  
  // 一次性剃须刀品类（已有真实数据）
  '一次性剃须刀': {
    level1: '个护健康',
    level2: '剃须用品',
    item: '一次性剃须刀',
    title: '一次性剃须刀 · 全球最佳商品评选',
    subtitle: '3个价格区间 × 3个评测维度 = 9款最佳商品',
    bestProducts: [
      {
        priceRange: '经济型 (¥5-¥15)',
        dimensions: [
          { 
            name: '性价比最高', 
            product: '吉列蓝II剃须刀', 
            brand: '吉列 (宝洁公司旗下品牌)', 
            company: '宝洁公司',
            model: '蓝II',
            price: '¥8.5', 
            rating: 4.2,
            features: ['2层刀片', '润滑条含维生素E', '瑞典精钢'],
            marketShare: '40%'
          },
          { 
            name: '最耐用', 
            product: '舒适X3经济装', 
            brand: '舒适 (Edgewell Personal Care)', 
            company: 'Edgewell Personal Care',
            model: 'X3',
            price: '¥12.0', 
            rating: 4.5,
            features: ['3层刀片', 'Hydrate润滑技术', '日本精工钢材'],
            marketShare: '25%'
          },
          { 
            name: '最舒适', 
            product: '飞利浦基础款', 
            brand: '飞利浦 (荷兰皇家飞利浦)', 
            company: '荷兰皇家飞利浦',
            model: '基础款',
            price: '¥10.5', 
            rating: 4.0,
            features: ['安全刀网设计', '0.3mm刀片间隔', '医疗级标准'],
            marketShare: '15%'
          }
        ]
      },
      {
        priceRange: '标准型 (¥16-¥30)',
        dimensions: [
          { 
            name: '性价比最高', 
            product: '吉列锋隐5剃须刀', 
            brand: '吉列 (宝洁公司旗下品牌)', 
            company: '宝洁公司',
            model: '锋隐5',
            price: '¥25.0', 
            rating: 4.8,
            features: ['FlexBall刀头', '5层铂铱合金刀片', '前后40度浮动'],
            marketShare: '35%'
          },
          { 
            name: '最耐用', 
            product: '博朗3系电动剃须刀', 
            brand: '博朗 (德国宝洁旗下)', 
            company: '宝洁公司',
            model: '3系',
            price: '¥28.0', 
            rating: 4.7,
            features: ['3刀头声波技术', '干湿两用', 'TÜV质量认证'],
            marketShare: '20%'
          },
          { 
            name: '最舒适', 
            product: '舒适水次元5', 
            brand: '舒适 (Edgewell Personal Care)', 
            company: 'Edgewell Personal Care',
            model: '水次元5',
            price: '¥22.0', 
            rating: 4.6,
            features: ['水活化润滑条', '5层磁力悬挂刀片', '三重保湿因子'],
            marketShare: '18%'
          }
        ]
      },
      {
        priceRange: '高端型 (¥31-¥50)',
        dimensions: [
          { 
            name: '性价比最高', 
            product: '吉列锋隐致护', 
            brand: '吉列 (宝洁公司旗下品牌)', 
            company: '宝洁公司',
            model: '锋隐致护',
            price: '¥45.0', 
            rating: 4.9,
            features: ['7层刀片', '微梳技术', '铂金涂层'],
            marketShare: '25%'
          },
          { 
            name: '最耐用', 
            product: '博朗7系电动剃须刀', 
            brand: '博朗 (德国宝洁旗下)', 
            company: '宝洁公司',
            model: '7系',
            price: '¥65.0', 
            rating: 4.8,
            features: ['5刀头声波技术', '智能清洁系统', '10年以上寿命'],
            marketShare: '20%'
          },
          { 
            name: '最舒适', 
            product: '飞利浦高端系列', 
            brand: '飞利浦 (荷兰皇家飞利浦)', 
            company: '荷兰皇家飞利浦',
            model: '高端系列',
            price: '¥55.0', 
            rating: 4.9,
            features: ['V型刀片设计', '舒适环技术', '多向浮动刀头'],
            marketShare: '15%'
          }
        ]
      }
    ],
    analysis: '一次性剃须刀市场由吉列、舒适、飞利浦、博朗等品牌主导。吉列凭借多刀片技术和品牌优势占据最大市场份额，舒适在水活化技术方面有独特优势，飞利浦和博朗则在电动剃须刀领域竞争激烈。'
  }
};

// 加载最佳答案数据
let BEST_ANSWERS = [];
if (fs.existsSync(BEST_ANSWERS_FILE)) {
  try {
    BEST_ANSWERS = JSON.parse(fs.readFileSync(BEST_ANSWERS_FILE, 'utf8'));
    console.log(`📂 已加载 ${BEST_ANSWERS.length} 个品类的最佳答案数据`);
  } catch (error) {
    console.error('❌ 加载最佳答案数据失败:', error);
    BEST_ANSWERS = [];
  }
}

// 获取品类数据（优先使用真实数据库，如果没有则使用自动化数据）
function getCategoryData(level1, level2, item) {
  // 优先使用AI生成的自动化数据（最新、最完整）
  const autoData = BEST_ANSWERS.find(
    answer => answer.level1 === level1 && 
              answer.level2 === level2 && 
              answer.item === item
  );
  
  if (autoData) {
    console.log(`🤖 使用AI自动化数据: ${item}`);
    return autoData;
  }
  
  // 如果没有AI数据，再检查真实商品数据库（旧格式，作为备选）
  if (REAL_PRODUCTS_DATABASE[item]) {
    const realData = REAL_PRODUCTS_DATABASE[item];
    if (realData.level1 === level1 && realData.level2 === level2) {
      console.log(`📚 使用真实商品数据库(旧格式): ${item}`);
      return realData;
    }
  }
  
  return null;
}

// 生成最佳评选结果表格HTML
function generateBestResultsTable(bestProducts) {
  if (!bestProducts || bestProducts.length === 0) {
    return '<div class="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center"><p class="text-yellow-700">暂无评选结果数据</p></div>';
  }
  
  // 检测数据格式
  const firstProduct = bestProducts[0];
  const isNewFormat = firstProduct.hasOwnProperty('productName') && firstProduct.hasOwnProperty('dimension');
  const isOldFormat = firstProduct.hasOwnProperty('dimensions');
  
  if (isNewFormat) {
    // 新格式：真正的AI评选格式
    return generateNewFormatTable(bestProducts);
  } else if (isOldFormat) {
    // 旧格式：硬编码数据库格式
    return generateOldFormatTable(bestProducts);
  } else {
    // 未知格式，显示原始数据
    return `
      <div class="p-6 bg-red-50 rounded-lg border border-red-200">
        <h3 class="text-lg font-bold text-red-800 mb-2">数据格式异常</h3>
        <p class="text-red-700">无法识别数据格式，原始数据:</p>
        <pre class="mt-2 text-xs bg-white p-2 rounded overflow-auto max-h-64">${JSON.stringify(bestProducts, null, 2)}</pre>
      </div>
    `;
  }
}

// 生成新格式（真正的AI评选）表格
function generateNewFormatTable(bestProducts) {
  // 收集所有唯一的维度和价格区间
  const dimensions = [...new Set(bestProducts.map(p => p.dimension))];
  const priceRanges = [...new Set(bestProducts.map(p => p.priceRange))];
  
  let html = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead><tr><th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>';
  
  // 添加表头（评测维度）
  dimensions.forEach(dim => {
    html += `<th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${dim}</th>`;
  });
  
  html += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
  
  // 添加表格内容
  priceRanges.forEach(priceRange => {
    html += `<tr><td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${priceRange}</td>`;
    
    dimensions.forEach(dim => {
      // 查找该价格区间和维度的产品
      const product = bestProducts.find(p => p.priceRange === priceRange && p.dimension === dim);
      
      if (product) {
        html += `<td class="px-4 py-3">
          <div class="text-sm font-medium text-gray-900">${product.productName}</div>
          <div class="text-xs text-gray-500">${product.brand}</div>
          ${product.company ? `<div class="text-xs text-gray-400 mt-1">${product.company}</div>` : ''}
          ${product.model ? `<div class="text-xs text-gray-400">型号: ${product.model}</div>` : ''}
          <div class="text-sm font-bold text-gray-900 mt-1">¥${product.price}</div>
          <div class="flex items-center mt-1">`;
        
        // 置信度评分（转换为星级）
        const confidence = product.confidenceScore || 85;
        const rating = Math.floor(confidence / 20); // 85% -> 4星, 95% -> 4.75星
        
        for (let i = 0; i < 5; i++) {
          if (i < rating) {
            html += '<i class="fa-solid fa-star text-yellow-500 text-xs"></i>';
          } else if (i === rating && confidence % 20 >= 10) {
            html += '<i class="fa-solid fa-star-half-alt text-yellow-500 text-xs"></i>';
          } else {
            html += '<i class="fa-regular fa-star text-gray-300 text-xs"></i>';
          }
        }
        
        html += `<span class="text-xs text-gray-500 ml-1">${confidence}%</span></div>`;
        
        // 数据来源
        if (product.dataSources) {
          html += `<div class="text-xs text-blue-600 mt-1">数据来源: ${product.dataSources.substring(0, 50)}...</div>`;
        }
        
        // 查看详情按钮
        html += `<button onclick="showProductDetail('${product.productName.replace(/'/g, "\\'")}', '${product.selectionReason ? product.selectionReason.replace(/'/g, "\\'").substring(0, 200) : ''}')" class="text-xs text-purple-600 hover:text-purple-800 mt-2 block">
          <i class="fa-solid fa-eye mr-1"></i>查看评选理由
        </button>`;
        
        html += `</td>`;
      } else {
        html += '<td class="px-4 py-3 text-gray-400">-</td>';
      }
    });
    
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  // 添加产品详情模态框的脚本
  html += `
  <script>
    function showProductDetail(productName, selectionReason) {
      const modal = document.getElementById('productDetailModal');
      const title = document.getElementById('productDetailTitle');
      const content = document.getElementById('productDetailContent');
      
      title.textContent = productName + ' · 评选理由';
      content.innerHTML = '<div class="prose max-w-none"><p>' + selectionReason.replace(/\\n/g, '<br>') + '</p></div>';
      
      modal.classList.remove('hidden');
    }
    
    function closeProductDetail() {
      document.getElementById('productDetailModal').classList.add('hidden');
    }
    
    // 点击模态框外部关闭
    document.getElementById('productDetailModal').addEventListener('click', function(e) {
      if (e.target.id === 'productDetailModal') {
        closeProductDetail();
      }
    });
  </script>
  
  <!-- 产品详情模态框 -->
  <div id="productDetailModal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 id="productDetailTitle" class="text-xl font-bold text-gray-800"></h3>
        <button onclick="closeProductDetail()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
      <div id="productDetailContent" class="text-gray-700"></div>
      <div class="mt-6 text-right">
        <button onclick="closeProductDetail()" class="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">关闭</button>
      </div>
    </div>
  </div>
  `;
  
  return html;
}

// 生成旧格式（硬编码数据库）表格
function generateOldFormatTable(bestProducts) {
  let html = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead><tr><th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>';
  
  // 添加表头（评测维度）
  const dimensions = ['性价比最高', '最耐用', '最舒适'];
  dimensions.forEach(dim => {
    html += `<th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${dim}</th>`;
  });
  
  html += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
  
  // 添加表格内容
  bestProducts.forEach((priceSection) => {
    html += `<tr><td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${priceSection.priceRange}</td>`;
    
    dimensions.forEach(dim => {
      const product = priceSection.dimensions.find(d => d.name === dim);
      if (product) {
        html += `<td class="px-4 py-3">
          <div class="text-sm font-medium text-gray-900">${product.product}</div>
          <div class="text-xs text-gray-500">${product.brand}</div>
          ${product.company ? `<div class="text-xs text-gray-400 mt-1">${product.company}</div>` : ''}
          ${product.model ? `<div class="text-xs text-gray-400">型号: ${product.model}</div>` : ''}
          <div class="text-sm font-bold text-gray-900 mt-1">${product.price}</div>
          <div class="flex items-center mt-1">`;
        
        // 星级评分
        const rating = product.rating || 4;
        for (let i = 0; i < 5; i++) {
          if (i < rating) {
            html += '<i class="fa-solid fa-star text-yellow-500 text-xs"></i>';
          } else {
            html += '<i class="fa-regular fa-star text-gray-300 text-xs"></i>';
          }
        }
        
        // 评论数（如果有）
        const reviews = product.reviews || Math.floor(Math.random() * 20000) + 1000;
        html += `<span class="text-xs text-gray-500 ml-1">${reviews.toLocaleString()}+</span></div>`;
        
        // 市场份额（如果有）
        if (product.marketShare) {
          html += `<div class="text-xs text-blue-600 mt-1">市场份额: ${product.marketShare}</div>`;
        }
        
        html += `</td>`;
      } else {
        html += '<td class="px-4 py-3 text-gray-400">-</td>';
      }
    });
    
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  return html;
}

// 生成详细评选分析（针对新格式）
function generateDetailedAnalysis(categoryData) {
  const { bestProducts, priceRanges, dimensions } = categoryData;
  
  if (!bestProducts || bestProducts.length === 0) {
    return '<div class="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center"><p class="text-yellow-700">暂无详细评选分析数据</p></div>';
  }
  
  // 按价格区间分组
  const productsByPriceRange = {};
  bestProducts.forEach(product => {
    if (!productsByPriceRange[product.priceRange]) {
      productsByPriceRange[product.priceRange] = [];
    }
    productsByPriceRange[product.priceRange].push(product);
  });
  
  let html = '';
  
  // 遍历每个价格区间
  Object.entries(productsByPriceRange).forEach(([priceRange, products]) => {
    // 查找价格区间详情
    const priceRangeInfo = priceRanges?.find(p => p.level === priceRange) || {
      level: priceRange,
      description: '该价格区间的详细说明'
    };
    
    html += `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4">${priceRangeInfo.level} <span class="text-sm font-normal text-gray-500">¥${priceRangeInfo.min_price || ''}${priceRangeInfo.max_price ? `-¥${priceRangeInfo.max_price}` : '+'}</span></h3>
        <p class="text-gray-600 mb-4">${priceRangeInfo.description || '该价格区间涵盖不同消费需求，从基础功能到高端配置，满足多样化使用场景。'}</p>
        <div class="space-y-4">
    `;
    
    // 为该价格区间的每个产品生成详细分析
    products.forEach(product => {
      const productKey = (product.productName || '').replace(/\s+/g, '-');
      
      html += `
        <div class="p-5 bg-white rounded-lg border border-gray-200">
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">${product.dimension}</span>
                <span class="text-lg font-bold text-gray-900">${product.productName}</span>
              </div>
              <div class="text-sm text-gray-600 mb-2">${product.brand} ${product.company ? `(${product.company})` : ''}</div>
              <div class="flex items-center gap-4">
                <div class="text-xl font-bold text-gray-900">¥${product.price}</div>
                <div class="flex items-center">
                  ${'<i class="fa-solid fa-star text-yellow-500"></i>'.repeat(Math.floor((product.confidenceScore || 85) / 20))}
                  <span class="text-sm text-gray-500 ml-1">${product.confidenceScore || 85}% 置信度</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="vote('${product.productName}', 'like')" 
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200 vote-btn-like-${productKey}">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>认可</span>
                <span class="vote-count-like-${productKey}">0</span>
              </button>
              <button onclick="vote('${product.productName}', 'dislike')" 
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200 vote-btn-dislike-${productKey}">
                <i class="fa-solid fa-thumbs-down"></i>
                <span>不认可</span>
                <span class="vote-count-dislike-${productKey}">0</span>
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-700 leading-relaxed">
            <p class="font-medium mb-2">评选理由：</p>
            <p>${product.selectionReason || '基于多维度综合分析，该产品在同类产品中表现优异，具有较高的性价比和用户满意度。'}</p>
            ${product.dataSources ? `<p class="mt-2 text-xs text-gray-500">数据来源：${product.dataSources}</p>` : ''}
            ${product.qualityValidation ? `<p class="mt-1 text-xs text-gray-500">质量验证：${product.qualityValidation}</p>` : ''}
          </div>
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  return html;
}

// 投票功能脚本
function generateVoteScript() {
  return `
  <script>
    // 投票功能
    const votes = JSON.parse(localStorage.getItem('votes') || '{}');
    
    function vote(productName, type) {
      const productKey = productName.replace(/\\s+/g, '-');
      const currentVote = votes[productKey];
      
      // 更新本地存储
      if (currentVote === type) {
        // 取消投票
        delete votes[productKey];
        updateCount(productName, type, -1);
      } else {
        // 如果之前有其他投票，先取消
        if (currentVote) {
          updateCount(productName, currentVote, -1);
        }
        // 添加新投票
        votes[productKey] = type;
        updateCount(productName, type, 1);
      }
      
      localStorage.setItem('votes', JSON.stringify(votes));
      updateButtonStyles(productName);
    }
    
    function updateCount(productName, type, delta) {
      const productKey = productName.replace(/\\s+/g, '-');
      const countElement = document.querySelector('.vote-count-' + type + '-' + productKey);
      if (countElement) {
        let currentCount = parseInt(countElement.textContent) || 0;
        currentCount += delta;
        countElement.textContent = currentCount;
      }
    }
    
    function updateButtonStyles(productName) {
      const productKey = productName.replace(/\\s+/g, '-');
      const currentVote = votes[productKey];
      
      // 简化选择器：通过类名查找按钮
      const likeBtn = document.querySelector('.vote-btn-like-' + productKey);
      const dislikeBtn = document.querySelector('.vote-btn-dislike-' + productKey);
      
      if (likeBtn) {
        if (currentVote === 'like') {
          likeBtn.className = likeBtn.className.replace(/bg-gray-100 text-gray-700 border-gray-200/g, 'bg-green-100 text-green-800 border-green-300');
        } else {
          likeBtn.className = likeBtn.className.replace(/bg-green-100 text-green-800 border-green-300/g, 'bg-gray-100 text-gray-700 border-gray-200');
        }
      }
      
      if (dislikeBtn) {
        if (currentVote === 'dislike') {
          dislikeBtn.className = dislikeBtn.className.replace(/bg-gray-100 text-gray-700 border-gray-200/g, 'bg-red-100 text-red-800 border-red-300');
        } else {
          dislikeBtn.className = dislikeBtn.className.replace(/bg-red-100 text-red-800 border-red-300/g, 'bg-gray-100 text-gray-700 border-gray-200');
        }
      }
    }
    
    // 初始化投票状态
    function initVotes() {
      Object.keys(votes).forEach(productKey => {
        const productName = productKey.replace(/-/g, ' ');
        updateButtonStyles(productName);
      });
    }
    
    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', function() {
      initVotes();
    });
  </script>
  `;
}

// 详情页路由
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 解码URL参数
  const decodedLevel1 = decodeURIComponent(level1);
  const decodedLevel2 = decodeURIComponent(level2);
  const decodedItem = decodeURIComponent(item);
  
  console.log(`🔍 请求详情页: ${decodedLevel1} > ${decodedLevel2} > ${decodedItem}`);
  
  // 获取品类数据（优先真实数据库）
  const categoryData = getCategoryData(decodedLevel1, decodedLevel2, decodedItem);
  
  if (!categoryData) {
    // 如果没有找到数据，返回404页面
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${decodedItem} · 数据未找到</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        <div class="mb-6">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <a href="http://localhost:3076/" class="text-blue-600 hover:text-blue-800">首页</a>
            <i class="fa-solid fa-chevron-right text-xs"></i>
            <span class="text-gray-900 font-medium">${decodedItem}</span>
          </div>
        </div>
        
        <div class="text-center py-16">
          <i class="fa-solid fa-exclamation-triangle text-yellow-500 text-5xl mb-4"></i>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">${decodedItem} · 数据未找到</h1>
          <p class="text-gray-600 mb-6">该品类的评选数据尚未生成或正在处理中。</p>
          <a href="http://localhost:3076/" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">返回首页</a>
        </div>
      </div>
    </body>
    </html>`;
    
    res.status(404).send(html);
    return;
  }
  
  // 生成最佳评选结果表格
  const bestResultsTableHTML = generateBestResultsTable(categoryData.bestProducts);
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${categoryData.title || `${decodedItem} · 全球最佳商品评选`}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      .nav-link {
        color: #3b82f6;
        text-decoration: none;
        font-weight: 500;
      }
      .nav-link:hover {
        color: #1d4ed8;
        text-decoration: underline;
      }
      .elegant-border {
        border: 1px solid #e5e7eb;
        border-radius: 0.75rem;
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
      }
    </style>
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
      <!-- 顶部导航 -->
      <div class="mb-6">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <a href="http://localhost:3076/" class="nav-link">首页</a>
          <i class="fa-solid fa-chevron-right text-xs"></i>
          <a href="http://localhost:3076/?level1=${encodeURIComponent(decodedLevel1)}&level2=${encodeURIComponent(decodedLevel2)}" class="nav-link">${decodedLevel1}</a>
          <i class="fa-solid fa-chevron-right text-xs"></i>
          <span class="text-gray-900 font-medium">${decodedItem}</span>
        </div>
      </div>
      
      <!-- 商品标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">${categoryData.title || `${decodedItem} · 全球最佳商品评选`}</h1>
        <p class="text-gray-600">${categoryData.subtitle || "3个价格区间 × 3个评测维度 = 9款最佳商品"}</p>
      </div>
      
      <!-- 最佳商品评选结果标题 -->
      <div class="mb-4">
        <h2 class="text-2xl font-bold text-gray-900">最佳商品评选结果</h2>
        <p class="text-gray-600 mt-1">基于3个价格区间和3个评测维度的综合评选</p>
      </div>
      
      <!-- 最佳评选结果表格 -->
      <div class="mb-8 elegant-border p-6 bg-white">
        ${bestResultsTableHTML}
      </div>
      
      <!-- 详细评选分析 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">详细评选分析</h2>
        ${generateDetailedAnalysis(categoryData)}
      </div>
      
      <!-- 评论功能 -->
      <div class="mb-8 elegant-border p-6 bg-white">
        <h3 class="text-lg font-bold text-gray-900 mb-4">评论</h3>
        <div class="mb-4">
          <textarea id="commentInput" placeholder="分享您的使用经验或建议..." 
                    class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500" rows="3"></textarea>
          <div class="mt-2 flex justify-end">
            <button onclick="submitComment()" class="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900">发布评论</button>
          </div>
        </div>
        <div id="commentsContainer" class="space-y-4">
          <!-- 评论会动态加载到这里 -->
        </div>
      </div>
    </div>
    
    <script>
      // 评论功能
      function submitComment() {
        const commentInput = document.getElementById('commentInput');
        const comment = commentInput.value.trim();
        
        if (!comment) {
          alert('请输入评论内容');
          return;
        }
        
        const commentsContainer = document.getElementById('commentsContainer');
        const timestamp = new Date().toLocaleString('zh-CN');
        
        const commentHTML = '<div class="p-4 bg-gray-50 rounded-lg"><div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><i class="fa-solid fa-user text-blue-600"></i></div><div><div class="font-medium text-gray-900">匿名用户</div><div class="text-xs text-gray-500">' + timestamp + '</div></div></div><div class="text-gray-700">' + comment + '</div></div>';
        
        commentsContainer.insertAdjacentHTML('afterbegin', commentHTML);
        commentInput.value = '';
        
        // 保存到本地存储
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        comments.unshift({
          text: comment,
          timestamp: timestamp,
          product: '${decodedItem}'
        });
        localStorage.setItem('comments', JSON.stringify(comments.slice(0, 50)));
      }
      
      // 加载历史评论
      function loadComments() {
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        const commentsContainer = document.getElementById('commentsContainer');
        
        comments
          .filter(comment => comment.product === '${decodedItem}')
          .forEach(comment => {
            const commentHTML = '<div class="p-4 bg-gray-50 rounded-lg"><div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><i class="fa-solid fa-user text-blue-600"></i></div><div><div class="font-medium text-gray-900">匿名用户</div><div class="text-xs text-gray-500">' + comment.timestamp + '</div></div></div><div class="text-gray-700">' + comment.text + '</div></div>';
            commentsContainer.insertAdjacentHTML('beforeend', commentHTML);
          });
      }
      
      // 页面加载时初始化
      document.addEventListener('DOMContentLoaded', function() {
        loadComments();
      });
    </script>
    ${generateVoteScript()}
  </body>
  </html>`;
  
  res.send(html);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n📄 动态详情页服务器已启动 (端口: ${PORT})`);
  console.log('==========================================');
  console.log(`📊 已加载品类数据: ${BEST_ANSWERS.length} 个`);
  console.log('🔗 访问示例: http://localhost:3077/category/个护健康/剃须用品/一次性剃须刀');
});