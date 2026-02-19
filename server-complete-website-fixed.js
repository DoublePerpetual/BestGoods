const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3060;

// 数据文件路径
const CATEGORIES_DB = path.join(__dirname, 'data', 'categories-db.json');
const PRICE_INTERVALS_DB = path.join(__dirname, 'data', 'price-intervals-db.json');
const EVALUATION_DIMENSIONS_DB = path.join(__dirname, 'data', 'evaluation-dimensions-db.json');
const BEST_PRODUCTS_DB = path.join(__dirname, 'data', 'best-products-db.json');
const PROCESSING_STATS = path.join(__dirname, 'data', 'processing-stats.json');

// 确保数据目录存在
if (!fs.existsSync(path.join(__dirname, 'data'))) {
  fs.mkdirSync(path.join(__dirname, 'data'), { recursive: true });
}

// 初始化统计数据
function initializeStats() {
  if (!fs.existsSync(PROCESSING_STATS)) {
    const stats = {
      totalCategories: 245317,
      completedCategories: 0,
      bestProductsCount: 0,
      lastUpdated: new Date().toISOString(),
      processingRate: "0/245317 (0.0000%)"
    };
    fs.writeFileSync(PROCESSING_STATS, JSON.stringify(stats, null, 2));
  }
}

// 获取统计数据
function getStats() {
  try {
    if (fs.existsSync(PROCESSING_STATS)) {
      return JSON.parse(fs.readFileSync(PROCESSING_STATS, 'utf8'));
    }
  } catch (error) {
    console.error('读取统计数据失败:', error);
  }
  
  return {
    totalCategories: 245317,
    completedCategories: 0,
    bestProductsCount: 0,
    lastUpdated: new Date().toISOString(),
    processingRate: "0/245317 (0.0000%)"
  };
}

// 更新统计数据
function updateStats(completedCategories, bestProductsCount) {
  const stats = {
    totalCategories: 245317,
    completedCategories: completedCategories,
    bestProductsCount: bestProductsCount,
    lastUpdated: new Date().toISOString(),
    processingRate: `${completedCategories}/245317 (${((completedCategories / 245317) * 100).toFixed(4)}%)`
  };
  
  fs.writeFileSync(PROCESSING_STATS, JSON.stringify(stats, null, 2));
  return stats;
}

// 检查品类是否有数据
function checkCategoryHasData(level1, level2, item) {
  try {
    if (fs.existsSync(CATEGORIES_DB)) {
      const categories = JSON.parse(fs.readFileSync(CATEGORIES_DB, 'utf8'));
      const category = categories.find(c => 
        c.level1 === level1 && c.level2 === level2 && c.name === item
      );
      return category ? category.hasData : false;
    }
  } catch (error) {
    console.error('检查品类数据失败:', error);
  }
  return false;
}

// 获取品类数据
function getCategoryData(level1, level2, item) {
  try {
    // 1. 获取品类信息
    let category = null;
    if (fs.existsSync(CATEGORIES_DB)) {
      const categories = JSON.parse(fs.readFileSync(CATEGORIES_DB, 'utf8'));
      category = categories.find(c => 
        c.level1 === level1 && c.level2 === level2 && c.name === item
      );
    }
    
    // 2. 获取价格区间
    let priceIntervals = [];
    if (fs.existsSync(PRICE_INTERVALS_DB)) {
      const allIntervals = JSON.parse(fs.readFileSync(PRICE_INTERVALS_DB, 'utf8'));
      if (category && category.priceIntervals) {
        priceIntervals = allIntervals.filter(p => category.priceIntervals.includes(p.id));
      } else {
        // 默认价格区间
        priceIntervals = allIntervals.slice(0, 3);
      }
    }
    
    // 3. 获取评测维度
    let evaluationDimensions = [];
    if (fs.existsSync(EVALUATION_DIMENSIONS_DB)) {
      const allDimensions = JSON.parse(fs.readFileSync(EVALUATION_DIMENSIONS_DB, 'utf8'));
      if (category && category.evaluationDimensions) {
        evaluationDimensions = allDimensions.filter(d => category.evaluationDimensions.includes(d.id));
      } else {
        // 默认评测维度
        evaluationDimensions = allDimensions.slice(0, 3);
      }
    }
    
    // 4. 获取最佳商品
    let bestProducts = [];
    if (fs.existsSync(BEST_PRODUCTS_DB)) {
      const allProducts = JSON.parse(fs.readFileSync(BEST_PRODUCTS_DB, 'utf8'));
      if (category) {
        bestProducts = allProducts.filter(p => p.categoryId === category.id);
      }
    }
    
    // 如果没有数据，生成示例数据
    if (bestProducts.length === 0) {
      bestProducts = generateSampleProducts(priceIntervals, evaluationDimensions, item);
    }
    
    return {
      category,
      priceIntervals,
      evaluationDimensions,
      bestProducts
    };
  } catch (error) {
    console.error('获取品类数据失败:', error);
    return null;
  }
}

// 生成示例商品数据
function generateSampleProducts(priceIntervals, evaluationDimensions, itemName) {
  const bestProducts = [];
  
  const brands = ['吉列', '舒适', '飞利浦', '博朗', '松下', '飞科', '美的', '海尔', '小米', '苹果'];
  
  priceIntervals.forEach(price => {
    evaluationDimensions.forEach(dim => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const priceValue = price.range ? parseInt(price.range.match(/\d+/)[0]) : 20;
      const rating = Math.random() > 0.3 ? 5 : 4;
      const reviews = Math.floor(Math.random() * 10000) + 1000;
      
      bestProducts.push({
        priceId: price.id,
        dimensionId: dim.id,
        name: `${brand} ${itemName} ${dim.name.replace('最', '')}版`,
        price: `¥${priceValue}`,
        brand: brand,
        rating: rating,
        reviews: `${reviews.toLocaleString()}+`,
        logic: `基于市场数据、用户评价和专业评测，${brand} ${itemName}在${price.name}区间内被评为${dim.name}的最佳选择。综合考虑品牌口碑、产品质量、用户反馈和价格因素，该产品脱颖而出。`
      });
    });
  });
  
  return bestProducts;
}

// 生成最佳评选结果表格
function generateBestResultsTable(priceIntervals, evaluationDimensions, bestProducts) {
  let tableHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>
  `;
  
  evaluationDimensions.forEach(dim => {
    tableHTML += `<th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${dim.name}</th>`;
  });
  
  tableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  
  priceIntervals.forEach(price => {
    tableHTML += `<tr>`;
    tableHTML += `<td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${price.name}<br><span class="text-xs text-gray-500">${price.range || ''}</span></td>`;
    
    evaluationDimensions.forEach(dim => {
      const product = bestProducts.find(p => p.priceId === price.id && p.dimensionId === dim.id);
      if (product) {
        tableHTML += `
          <td class="px-4 py-3">
            <div class="text-sm font-medium text-gray-900">${product.name}</div>
            <div class="text-xs text-gray-500">${product.brand}</div>
            <div class="text-sm font-bold text-gray-900 mt-1">${product.price}</div>
            <div class="flex items-center mt-1">
              ${Array(product.rating).fill('<i class="fa-solid fa-star text-yellow-500 text-xs"></i>').join('')}
              <span class="text-xs text-gray-500 ml-1">${product.reviews}</span>
            </div>
          </td>
        `;
      } else {
        tableHTML += `<td class="px-4 py-3 text-sm text-gray-500">-</td>`;
      }
    });
    
    tableHTML += `</tr>`;
  });
  
  tableHTML += `</tbody></table></div>`;
  return tableHTML;
}

// API：获取统计数据
app.get('/api/stats', (req, res) => {
  const stats = getStats();
  res.json(stats);
});

// 首页
app.get('/', (req, res) => {
  const stats = getStats();
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 md:px-6 py-8">
    <!-- 顶部统计 -->
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">全球最佳商品百科全书</h1>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">${stats.totalCategories.toLocaleString()}</div>
          <div class="text-gray-600">个品类</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900" id="bestProductsCount">${stats.bestProductsCount}</div>
          <div class="text-gray-600">款最佳商品</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900" id="completedCategories">${stats.completedCategories}</div>
          <div class="text-gray-600">个品类已完成评选</div>
        </div>
      </div>
      <div class="mt-4 text-sm text-gray-500">
        <i class="fa-solid fa-info-circle mr-1"></i> 最后更新: ${new Date(stats.lastUpdated).toLocaleString('zh-CN')}
      </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="mb-8">
      <div class="relative">
        <input type="text" id="searchInput" placeholder="搜索${stats.totalCategories.toLocaleString()}个品类..." 
               class="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500">
        <i class="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    </div>
    
    <!-- 三级目录导航 -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">浏览所有品类</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/category/个护健康" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">个护健康</div>
          <div class="text-sm text-gray-500 mt-1">剃须用品、护肤品、口腔护理等</div>
        </a>
        <a href="/category/家居生活" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">家居生活</div>
          <div class="text-sm text-gray-500 mt-1">厨房用品、清洁工具、家具等</div>
        </a>
        <a href="/category/数码电子" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">数码电子</div>
          <div class="text-sm text-gray-500 mt-1">手机、电脑、智能设备等</div>
        </a>
        <a href="/category/服装鞋帽" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">服装鞋帽</div>
          <div class="text-sm text-gray-500 mt-1">男女装、运动服饰、鞋类等</div>
        </a>
        <a href="/category/食品饮料" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">食品饮料</div>
          <div class="text-sm text-gray-500 mt-1">零食、饮料、调味品等</div>
        </a>
        <a href="/category/运动户外" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">运动户外</div>
          <div class="text-sm text-gray-500 mt-1">健身器材、户外装备、运动服饰等</div>
        </a>
      </div>
    </div>
    
    <!-- 自动化程序状态 -->
    <div class="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
      <h2 class="text-xl font-bold text-gray-900 mb-4">自动化数据录入系统</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">24小时不间断录入</div>
            <div class="text-sm text-gray-500">正在为所有品类设置价格区间和评选维度</div>
          </div>
          <div class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            运行中
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full" id="progressBar" style="width: ${(stats.completedCategories / stats.totalCategories * 100).toFixed(2)}%"></div>
        </div>
        <div class="text-sm text-gray-500" id="progressText">
          已完成 ${stats.completedCategories.toLocaleString()} / ${stats.totalCategories.toLocaleString()} 个品类 (${((stats.completedCategories / stats.totalCategories) * 100).toFixed(4)}%)
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // 实时更新统计数字
    function updateStats() {
      fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
          document.getElementById('bestProductsCount').textContent = data.bestProductsCount;
          document.getElementById('completedCategories').textContent = data.completedCategories;
          document.getElementById('progressBar').style.width = (data.completedCategories / data.totalCategories * 100).toFixed(2) + '%';
          document.getElementById('progressText').textContent = 
            '已完成 ' + data.completedCategories.toLocaleString() + ' / ' + data.totalCategories.toLocaleString() + 
            ' 个品类 (' + ((data.completedCategories / data.totalCategories) * 100).toFixed(4) + '%)';
        });
    }
    
    // 每5秒更新一次
    setInterval(updateStats, 5000);
    
    // 搜索功能
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        if (query) {
          window.location.href = '/search?q=' + encodeURIComponent(query);
        }
      }
    });
  </script>
</body>
</html>`;
  
  res.send(html);
});

// 品类详情页
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 检查该品类是否有数据
  const hasData = checkCategoryHasData(level1, level2, item);
  
  if (!hasData) {
    // 没有数据的品类，返回不可访问页面
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 数据准备中</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 md:px