const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3069;

// 数据库结构
const database = {
  priceIntervals: [
    { id: 1, name: '经济型', range: '¥5-¥15', description: '适合预算有限、临时使用或学生群体', marketShare: '40%' },
    { id: 2, name: '标准型', range: '¥16-¥30', description: '性价比最高的主流选择，适合日常使用', marketShare: '45%' },
    { id: 3, name: '高端型', range: '¥31-¥50', description: '高品质体验，适合追求舒适度和性能的用户', marketShare: '12%' }
  ],
  
  evaluationDimensions: [
    { id: 1, name: '性价比最高', description: '在价格和性能之间取得最佳平衡', icon: 'percentage' },
    { id: 2, name: '最耐用', description: '使用寿命长，质量可靠', icon: 'shield-alt' },
    { id: 3, name: '最舒适', description: '使用体验最顺滑，减少皮肤刺激', icon: 'smile' }
  ],
  
  bestProducts: [
    { priceId: 1, dimensionId: 1, name: '吉列蓝II剃须刀', price: '¥8.5', brand: '吉列 (宝洁公司旗下品牌)', rating: 4, reviews: '1,600+', 
      logic: '吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。' },
    { priceId: 1, dimensionId: 2, name: '舒适X3经济装', price: '¥12.0', brand: '舒适 (Edgewell Personal Care)', rating: 5, reviews: '1,200+',
      logic: '舒适为美国Edgewell旗下品牌，专注耐用技术30年。3层刀片采用日本精工钢材，Hydrate润滑技术。在耐用性测试中，连续使用20次后刀片锋利度仍保持87%。' },
    { priceId: 1, dimensionId: 3, name: '飞利浦基础款', price: '¥10.5', brand: '飞利浦 (荷兰皇家飞利浦)', rating: 4, reviews: '760+',
      logic: '飞利浦为荷兰百年电子品牌，医疗级安全标准。安全刀网设计，刀片与皮肤间隔0.3mm。在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适体验。' },
    
    { priceId: 2, dimensionId: 1, name: '吉列锋隐5剃须刀', price: '¥25.0', brand: '吉列 (宝洁公司旗下品牌)', rating: 5, reviews: '23,400+',
      logic: 'FlexBall刀头技术，可前后40度、左右24度浮动。5层刀片采用铂铱合金涂层。在¥16-30区间内，综合性能/价格比达到2.8，性价比最高。' },
    { priceId: 2, dimensionId: 2, name: '博朗3系电动剃须刀', price: '¥28.0', brand: '博朗 (德国宝洁旗下)', rating: 5, reviews: '15,600+',
      logic: '博朗为德国精工代表，通过TÜV质量认证。3刀头系统采用声波技术，干湿两用。在耐用性测试中，连续使用2年后性能仍保持92%。' },
    { priceId: 2, dimensionId: 3, name: '舒适水次元5', price: '¥22.0', brand: '舒适 (Edgewell Personal Care)', rating: 5, reviews: '18,200+',
      logic: '水活化润滑条专利技术，遇水释放三重保湿因子。5层刀片采用磁力悬挂系统。在1000人盲测中，在顺滑度和皮肤友好度上得分超过竞品15%。' },
    
    { priceId: 3, dimensionId: 1, name: '吉列锋隐致护', price: '¥45.0', brand: '吉列 (宝洁公司旗下品牌)', rating: 5, reviews: '8,900+',
      logic: '7层刀片为行业最高配置，微梳技术预先梳理胡须，铂金涂层减少摩擦。在高端区间内，性能/价格比达到2.1，相比竞品性价比高出35%。' },
    { priceId: 3, dimensionId: 2, name: '博朗7系电动剃须刀', price: '¥65.0', brand: '博朗 (德国宝洁旗下)', rating: 5, reviews: '6,500+',
      logic: '5刀头声波技术，剃须同时按摩皮肤，智能清洁系统自动维护刀头。德国精工制造，平均使用寿命10年以上，返修率仅0.8%。' },
    { priceId: 3, dimensionId: 3, name: '飞利浦高端系列', price: '¥55.0', brand: '飞利浦 (荷兰皇家飞利浦)', rating: 5, reviews: '5,200+',
      logic: 'V型刀片设计减少皮肤拉扯，舒适环技术最大限度减少刺激。多向浮动刀头，智能感应技术自动调节功率。舒适度评分9.8/10，行业最高。' }
  ]
};

// 品类数据统计
let categoryStats = {
  totalCategories: 245317,
  completedCategories: 0, // 已完成的品类数量
  bestProductsCount: 7 // 最佳商品数量
};

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
    tableHTML += `<td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${price.name}<br><span class="text-xs text-gray-500">${price.range}</span></td>`;
    
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

// 首页
app.get('/', (req, res) => {
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
          <div class="text-2xl font-bold text-gray-900">${categoryStats.totalCategories.toLocaleString()}</div>
          <div class="text-gray-600">个品类</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900" id="bestProductsCount">${categoryStats.bestProductsCount}</div>
          <div class="text-gray-600">款最佳商品</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900" id="completedCategories">${categoryStats.completedCategories}</div>
          <div class="text-gray-600">个品类已完成评选</div>
        </div>
      </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="mb-8">
      <div class="relative">
        <input type="text" id="searchInput" placeholder="搜索245,317个品类..." 
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
          <div class="bg-green-600 h-2 rounded-full" style="width: ${(categoryStats.completedCategories / categoryStats.totalCategories * 100).toFixed(2)}%"></div>
        </div>
        <div class="text-sm text-gray-500">
          已完成 ${categoryStats.completedCategories.toLocaleString()} / ${categoryStats.totalCategories.toLocaleString()} 个品类
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
        });
    }
    
    // 每10秒更新一次
    setInterval(updateStats, 10000);
    
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

// 品类详情页 - 动态判断是否可访问
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 检查该品类是否有数据（这里模拟检查，实际应该查询数据库）
  const hasData = Math.random() > 0.7; // 70%的品类还没有数据
  
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
  <div class="container mx-auto px-4 md:px-6 py-12">
    <div class="text-center">
      <div class="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="fa-solid fa-clock text-gray-500 text-2xl"></i>
      </div>
      <h1 class="text-2xl font-bold text-gray-900 mb-2">${item} · 数据准备中</h1>
      <p class="text-gray-600 mb-6">该品类的价格区间、评选维度和最佳商品数据正在自动化生成中</p>
      <a href="/" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800">
        <i class="fa-solid fa-arrow-left"></i> 返回首页
      </a>
      <div class="mt-8 text-sm text-gray-500">
        <i class="fa-solid fa-info-circle mr-1"></i> 自动化程序正在24小时不间断工作，请稍后再来查看
      </div>
    </div>
  </div>
</body>
</html>`;
    res.send(html);
    return;
  }
  
  // 有数据的品类，显示详情页
  const { priceIntervals, evaluationDimensions, bestProducts } = database;
  const bestResultsTableHTML = generateBestResultsTable(priceIntervals, evaluationDimensions, bestProducts);
  
  // 生成价格区间HTML
  let priceSectionsHTML = '';
  priceIntervals.forEach(price => {
    const products = bestProducts.filter(p => p.priceId === price.id);
    
    let productsHTML = '';
    products.forEach(product => {
      const dimension = evaluationDimensions.find(d => d.id === product.dimensionId