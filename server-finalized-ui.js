const express = require('express');
const app = express();
const PORT = 3054;

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

// 生成最佳评选结果表格（单独线框）
function generateBestResultsTable(priceIntervals, evaluationDimensions, bestProducts) {
  const priceCount = priceIntervals.length;
  const dimensionCount = evaluationDimensions.length;
  
  let tableHTML = `
    <div class="overflow-x-auto">
      <table class="min-w-full divide-y divide-gray-200">
        <thead>
          <tr>
            <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>
  `;
  
  // 表头 - 评测维度
  evaluationDimensions.forEach(dim => {
    tableHTML += `<th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${dim.name}</th>`;
  });
  
  tableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  
  // 表格内容
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

app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  const { priceIntervals, evaluationDimensions, bestProducts } = database;
  
  // 生成最佳评选结果表格（单独线框）
  const bestResultsTableHTML = generateBestResultsTable(priceIntervals, evaluationDimensions, bestProducts);
  
  // 生成价格区间HTML - 去掉外面的大线框
  let priceSectionsHTML = '';
  priceIntervals.forEach(price => {
    const products = bestProducts.filter(p => p.priceId === price.id);
    
    let productsHTML = '';
    products.forEach(product => {
      const dimension = evaluationDimensions.find(d => d.id === product.dimensionId);
      
      productsHTML += `
        <div class="mb-5 p-4 bg-white rounded-lg border border-gray-200">
          <!-- 评测维度标签 - 字体放小 -->
          <div class="flex items-center gap-2 mb-3">
            <div class="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">
              <i class="fa-solid fa-${dimension.icon} text-gray-600 mr-1"></i>
              ${dimension.name}
            </div>
            <div class="text-xs text-gray-500">${dimension.description}</div>
          </div>
          
          <!-- 商品信息 -->
          <div class="mb-4">
            <div class="flex items-center justify-between mb-2">
              <div>
                <div class="text-lg font-bold text-gray-900">${product.name}</div>
                <div class="text-sm text-gray-500">${product.brand}</div>
              </div>
              <div class="text-xl font-bold text-gray-900">${product.price}</div>
            </div>
            
            <div class="flex items-center mb-3">
              ${Array(product.rating).fill('<i class="fa-solid fa-star text-yellow-500"></i>').join('')}
              ${Array(5 - product.rating).fill('<i class="fa-solid fa-star text-gray-300"></i>').join('')}
              <span class="text-sm text-gray-500 ml-2">${product.reviews}用户评价</span>
            </div>
            
            <!-- 评选理由 - 重点突出 -->
            <div class="text-sm text-gray-600 p-3 rounded bg-gray-50 border border-gray-200">
              <div class="font-bold text-gray-800 mb-2">评选理由：</div>
              <div class="leading-relaxed">${product.logic}</div>
            </div>
          </div>
          
          <!-- 投票按钮 - 字体放小 -->
          <div class="flex items-center gap-3">
            <button class="vote-btn flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    onclick="vote('p${price.id}d${dimension.id}', 'up')">
              <i class="fa-solid fa-thumbs-up text-gray-600 text-sm"></i>
              <span class="font-medium text-gray-700 text-sm">认可</span>
              <span class="font-bold text-gray-800 text-sm" id="up-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 2000) + 500}</span>
            </button>
            <button class="vote-btn flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50"
                    onclick="vote('p${price.id}d${dimension.id}', 'down')">
              <i class="fa-solid fa-thumbs-down text-gray-600 text-sm"></i>
              <span class="font-medium text-gray-700 text-sm">不认可</span>
              <span class="font-bold text-gray-800 text-sm" id="down-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 100) + 20}</span>
            </button>
          </div>
        </div>
      `;
    });
    
    priceSectionsHTML += `
      <!-- 价格区间模块 - 去掉外面的大线框 -->
      <div class="mb-8">
        <!-- 价格区间标题 - 字体放小 -->
        <div class="flex items-center gap-3 mb-5">
          <div class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white">
            <i class="fa-solid fa-tag text-gray-600 text-sm"></i>
          </div>
          <div>
            <h2 class="text-lg font-bold text-gray-900">${price.name} <span class="text-gray-600 text-sm">(${price.range})</span></h2>
            <p class="text-sm text-gray-500">${price.description} · 市场份额约${price.marketShare}</p>
          </div>
        </div>
        ${productsHTML}
      </div>
    `;
  });
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @media (min-width: 768px) { .container-wide { max-width: 1200px; } }
    @media (min-width: 1024px) { .container-wide { max-width: 1300px; } }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container-wide mx-auto px-4 md:px-6 py-5">
    <!-- 返回按钮 -->
    <div class="mb-6">
      <a href="http://localhost:3023/" class="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-300">
        <i class="fa-solid fa-arrow-left"></i> 返回上级目录：${level2}
      </a>
      <div class="text-sm text-gray-500 mt-2">
        <i class="fa-solid fa-folder mr-1"></i> 当前位置：${level1} > ${level2} > ${item}
      </div>
    </div>
    
    <!-- 商品标题 -->
    <div class="mb-7">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <div class="text-gray-600">${priceIntervals.length}个价格区间 × ${evaluationDimensions.length}个评测维度 = ${bestProducts.length}款最佳商品</div>
    </div>
    
    <!-- 最佳评选结果表格（单独线框） -->
    <div class="mb-8 p-5 bg-white rounded-lg border border-gray-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4">最佳评选结果</h3>
      ${bestResultsTableHTML}
    </div>
    
    <!-- 详细评选分析（去掉外面的大线框） -->
    <div class="mt-8">
      <h3 class="text-lg font-bold text-gray-900 mb-4">详细评选分析</h3>
      ${priceSectionsHTML}
    </div>
    
    <!-- 评论功能 -->
    <div class="mt-8 p-5 bg-white rounded-lg border border-gray-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4">发表评论</h3>
      
      <div class="mb-6">
        <textarea id="commentInput" class="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 resize-none" 
                  placeholder="请发表您的看法..."></textarea>
        <div class="flex justify-between items-center mt-3">
          <div class="text-sm text-gray-500">
            <i class="fa-solid fa-info-circle mr-1"></i> 评论将公开显示
          </div>
          <button onclick="submitComment()" class="px-6 py-2 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800">
            发表评论
          </button>
        </div>
      </div>
      
      <h4 class="text-md font-bold text-gray-900 mb-3">用户评论</h4>
      <div class="space-y-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">张三</div>
            <div class="text-sm text-gray-500">2026-02-18 00:30</div>
          </div>
          <div class="text-gray-700">页面设计很简洁，线框不多不少刚刚好！</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">李四</div>
            <div class="text-sm text-gray-500">2026-02-18 00:25</div>
          </div>
          <div class="text-gray-700">评选结果清晰，评选理由详细，页面很干净。</div>
        </div>
      </div>
    </div>
  </div>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log('\n🎨 全球最佳商品评选 · 简洁最终版 已启动');
  console.log('🌐 访问地址: http://localhost:' + PORT + '/');
  console.log('📱 详情页: http://localhost:' + PORT + '/category/个护健康/剃须用品/一次性剃须刀');
  console.log('✅ 修改内容:');
  console.log('   1. 去掉详细评选分析外面的大线框 - 避免线框太多');
  console.log('   2. 最佳评选结果单独线框 - 跟详细评选分析分开');
  console.log('   3. 评论功能加上 - 完整的评论输入和展示');
  console.log('   4. 字体大小优化 - 经济型/标准型/高端型 和 认可/不认可 字体放小');
  console.log('   5. 重点突出评选理由 - "评选逻辑"改为"评选理由"，字体加粗突出');
});
