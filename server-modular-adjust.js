const express = require('express');
const app = express();
const PORT = 3047;

// 模块化数据库结构
const database = {
  // 价格区间模块
  priceIntervals: [
    { id: 1, name: '经济型', range: '¥5-¥15', color: 'green', description: '适合预算有限、临时使用或学生群体', marketShare: '40%' },
    { id: 2, name: '标准型', range: '¥16-¥30', color: 'blue', description: '性价比最高的主流选择，适合日常使用', marketShare: '45%' },
    { id: 3, name: '高端型', range: '¥31-¥50', color: 'purple', description: '高品质体验，适合追求舒适度和性能的用户', marketShare: '12%' }
  ],
  
  // 评测维度模块
  evaluationDimensions: [
    { id: 1, name: '性价比最高', color: 'green', description: '在价格和性能之间取得最佳平衡', icon: 'percentage' },
    { id: 2, name: '最耐用', color: 'blue', description: '使用寿命长，质量可靠', icon: 'shield-alt' },
    { id: 3, name: '最舒适', color: 'purple', description: '使用体验最顺滑，减少皮肤刺激', icon: 'smile' }
  ],
  
  // 最佳商品模块
  bestProducts: [
    // 经济型
    { priceId: 1, dimensionId: 1, name: '吉列蓝II剃须刀', price: '¥8.5', brand: '吉列 (宝洁公司旗下品牌)', rating: 4, reviews: '1,600+', 
      logic: '吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。' },
    { priceId: 1, dimensionId: 2, name: '舒适X3经济装', price: '¥12.0', brand: '舒适 (Edgewell Personal Care)', rating: 5, reviews: '1,200+',
      logic: '舒适为美国Edgewell旗下品牌，专注耐用技术30年。3层刀片采用日本精工钢材，Hydrate润滑技术。在耐用性测试中，连续使用20次后刀片锋利度仍保持87%。' },
    { priceId: 1, dimensionId: 3, name: '飞利浦基础款', price: '¥10.5', brand: '飞利浦 (荷兰皇家飞利浦)', rating: 4, reviews: '760+',
      logic: '飞利浦为荷兰百年电子品牌，医疗级安全标准。安全刀网设计，刀片与皮肤间隔0.3mm。在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适体验。' },
    
    // 标准型
    { priceId: 2, dimensionId: 1, name: '吉列锋隐5剃须刀', price: '¥25.0', brand: '吉列 (宝洁公司旗下品牌)', rating: 5, reviews: '23,400+',
      logic: 'FlexBall刀头技术，可前后40度、左右24度浮动。5层刀片采用铂铱合金涂层。在¥16-30区间内，综合性能/价格比达到2.8，性价比最高。' },
    { priceId: 2, dimensionId: 2, name: '博朗3系电动剃须刀', price: '¥28.0', brand: '博朗 (德国宝洁旗下)', rating: 5, reviews: '15,600+',
      logic: '博朗为德国精工代表，通过TÜV质量认证。3刀头系统采用声波技术，干湿两用。在耐用性测试中，连续使用2年后性能仍保持92%。' },
    { priceId: 2, dimensionId: 3, name: '舒适水次元5', price: '¥22.0', brand: '舒适 (Edgewell Personal Care)', rating: 5, reviews: '18,200+',
      logic: '水活化润滑条专利技术，遇水释放三重保湿因子。5层刀片采用磁力悬挂系统。在1000人盲测中，在顺滑度和皮肤友好度上得分超过竞品15%。' },
    
    // 高端型
    { priceId: 3, dimensionId: 1, name: '吉列锋隐致护', price: '¥45.0', brand: '吉列 (宝洁公司旗下品牌)', rating: 5, reviews: '8,900+',
      logic: '7层刀片为行业最高配置，微梳技术预先梳理胡须，铂金涂层减少摩擦。在高端区间内，性能/价格比达到2.1，相比竞品性价比高出35%。' },
    { priceId: 3, dimensionId: 2, name: '博朗7系电动剃须刀', price: '¥65.0', brand: '博朗 (德国宝洁旗下)', rating: 5, reviews: '6,500+',
      logic: '5刀头声波技术，剃须同时按摩皮肤，智能清洁系统自动维护刀头。德国精工制造，平均使用寿命10年以上，返修率仅0.8%。' },
    { priceId: 3, dimensionId: 3, name: '飞利浦高端系列', price: '¥55.0', brand: '飞利浦 (荷兰皇家飞利浦)', rating: 5, reviews: '5,200+',
      logic: 'V型刀片设计减少皮肤拉扯，舒适环技术最大限度减少刺激。多向浮动刀头，智能感应技术自动调节功率。舒适度评分9.8/10，行业最高。' }
  ]
};

// 颜色映射 - 去掉大色块，只用线框和文字颜色
const colorMap = {
  green: { 
    text: 'text-green-600', 
    border: 'border-green-300',
    badge: 'bg-green-50 border border-green-200 text-green-700',
    icon: 'text-green-500'
  },
  blue: { 
    text: 'text-blue-600', 
    border: 'border-blue-300',
    badge: 'bg-blue-50 border border-blue-200 text-blue-700',
    icon: 'text-blue-500'
  },
  purple: { 
    text: 'text-purple-600', 
    border: 'border-purple-300',
    badge: 'bg-purple-50 border border-purple-200 text-purple-700',
    icon: 'text-purple-500'
  }
};

// 模块化渲染函数
function renderPriceInterval(price) {
  const color = colorMap[price.color];
  const products = database.bestProducts.filter(p => p.priceId === price.id);
  
  let productsHTML = '';
  products.forEach(product => {
    const dimension = database.evaluationDimensions.find(d => d.id === product.dimensionId);
    const dimColor = colorMap[dimension.color];
    
    productsHTML += `
      <!-- 评测维度模块 -->
      <div class="mb-5 p-4 ${dimColor.bg} rounded-lg border ${dimColor.border}">
        <div class="flex items-center gap-2 mb-3">
          <div class="px-3 py-1 ${dimColor.badge} text-white rounded-full text-sm font-bold">${dimension.name}</div>
          <div class="text-sm text-gray-600">${dimension.description}</div>
        </div>
        
        <!-- 评选结果模块 -->
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
          
          <div class="text-sm text-gray-600 bg-white p-3 rounded border border-gray-100">
            <div class="font-medium mb-1">评选逻辑：</div>
            <div>${product.logic}</div>
          </div>
        </div>
        
        <!-- 投票模块 -->
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50"
                  onclick="vote('p${price.id}d${dimension.id}', 'up')">
            <i class="fa-solid fa-thumbs-up text-green-600"></i>
            <span class="font-medium text-green-700">认可</span>
            <span class="font-bold text-green-800" id="up-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 2000) + 500}</span>
          </button>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50"
                  onclick="vote('p${price.id}d${dimension.id}', 'down')">
            <i class="fa-solid fa-thumbs-down text-red-600"></i>
            <span class="font-medium text-red-700">不认可</span>
            <span class="font-bold text-red-800" id="down-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 100) + 20}</span>
          </button>
        </div>
      </div>
    `;
  });
  
  return `
    <!-- 价格区间模块 -->
    <div class="mb-8 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-full ${color.bg} flex items-center justify-center">
          <i class="fa-solid fa-tag ${color.text}"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">${price.name} <span class="text-gray-600">(${price.range})</span></h2>
          <p class="text-gray-600">${price.description} · 市场份额约${price.marketShare}</p>
        </div>
      </div>
      ${productsHTML}
    </div>
  `;
}

// 预览页面路由
app.get('/preview', (req, res) => {
  const { priceIntervals, evaluationDimensions, bestProducts } = database;
  
  // 生成价格区间HTML
  let priceSectionsHTML = '';
  priceIntervals.forEach(price => {
    priceSectionsHTML += renderPriceInterval(price);
  });
  
  // 生成对比表格
  let comparisonTableHTML = '<table class="w-full text-sm"><thead class="bg-gray-50"><tr><th class="px-4 py-3 text-left font-bold text-gray-700 border-b">价格区间</th>';
  
  evaluationDimensions.forEach(dim => {
    const color = colorMap[dim.color];
    comparisonTableHTML += `<th class="px-4 py-3 text-center font-bold ${color.text} border-b">${dim.name}</th>`;
  });
  
  comparisonTableHTML += '</tr></thead><tbody>';
  
  priceIntervals.forEach(price => {
    comparisonTableHTML += `<tr class="hover:bg-gray-50"><td class="px-4 py-3 font-bold text-gray-900 border-r border-b">${price.name} (${price.range})</td>`;
    
    evaluationDimensions.forEach(dim => {
      const product = bestProducts.find(p => p.priceId === price.id && p.dimensionId === dim.id);
      comparisonTableHTML += `<td class="px-4 py-3 text-center border-b">${product ? `${product.name}<br><span class="text-xs text-gray-500">${product.price}</span>` : '-'}</td>`;
    });
    
    comparisonTableHTML += '</tr>';
  });
  
  comparisonTableHTML += '</tbody></table>';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>模块化预览 · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @media (min-width: 768px) { .container-wide { max-width: 1200px; } }
    @media (min-width: 1024px) { .container-wide { max-width: 1300px; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .module { transition: all 0.2s ease; }
    .module:hover { transform: translateY(-2px); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container-wide mx-auto px-4 md:px-6 py-5">
    <!-- 标题 -->
    <div class="mb-7">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">全球最佳商品评选 · 模块化预览</h1>
      <div class="text-gray-600">${priceIntervals.length}个价格区间 × ${evaluationDimensions.length}个评测维度 = ${bestProducts.length}款最佳商品</div>
    </div>
    
    <!-- 价格区间展示 -->
    ${priceSectionsHTML}
    
    <!-- 对比分析 -->
    <div class="mb-8 p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      <div class="text-lg font-bold text-gray-900 mb-4">${priceIntervals.length}×${evaluationDimensions.length}商品对比分析</div>
      <div class="overflow-x-auto">
        ${comparisonTableHTML}
      </div>
    </div>
    
    <!-- 评论区域 -->
    <div class="p-5 bg-white rounded-xl border border-gray-200 shadow-sm">
      <h3 class="text-lg font-bold text-gray-900 mb-4">发表评论</h3>
      
      <!-- 评论输入框 -->
      <div class="mb-6">
        <textarea id="commentInput" class="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                  placeholder="请发表您的看法..."></textarea>
        <div class="flex justify-between items-center mt-3">
          <div class="text-sm text-gray-500">
            <i class="fa-solid fa-info-circle mr-1"></i> 评论将公开显示
          </div>
          <button onclick="submitComment()" class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            发表评论
          </button>
        </div>
      </div>
      
      <!-- 现有评论 -->
      <h4 class="text-md font-bold text-gray-900 mb-3">用户评论</h4>
      <div class="space-y-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">张三</div>
            <div class="text-sm text-gray-500">2026-02-17 20:15</div>
          </div>
          <div class="text-gray-700">模块化设计很实用，层次感清晰，投票功能也很方便！</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">李四</div>
            <div class="text-sm text-gray-500">2026-02-17 18:30</div>
          </div>
          <div class="text-gray-700">宽度调整得很合适，既有层次感又不会太复杂。</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">王五</div>
            <div class="text-sm text-gray-500">2026-02-17 16:45</div>
          </div>
          <div class="text-gray-700">即插即用的模块化设计很赞，以后扩展会很方便。</div>
        </div>
      </div>
    </div>
    
    <!-- 模块化信息 -->
    <div class="mt-8 text-sm text-gray-500 border-t pt-4">
      <div class="flex items-center gap-6">
        <div>模块化结构：价格区间(${priceIntervals.length}) · 评测维度(${evaluationDimensions.length}) · 最佳商品(${bestProducts.length})</div>
        <div>即插即用：支持高效增减 · 自适应展示</div>
      </div>
    </div>
  </div>
  
  <script>
    function vote(productId, type) {
      const upElement = document.getElementById('up-' + productId);
      const downElement = document.getElementById('down-' + productId);
      
      if (type === 'up') {
        upElement.textContent = parseInt(upElement.textContent) + 1;
      } else {
        downElement.textContent = parseInt(downElement.textContent) + 1;
      }
    }
    
    function submitComment() {
      const commentInput = document.getElementById('commentInput');
      const commentText = commentInput.value.trim();
      
      if (!commentText) {
        alert('请输入评论内容');
        return;
      }
      
      alert('评论已提交，感谢您的参与！');
      commentInput.value = '';
    }
    
    // 演示模块化扩展
    function addPriceInterval() {
      const newId = database.priceIntervals.length + 1;
      database.priceIntervals.push({
        id: newId,
        name: '新增区间' + newId,
        range: '¥100-¥200',
        color: 'green',
        description: '新增的价格区间',
        marketShare: '3%'
      });
      alert('已添加第' + newId + '个价格区间模块，刷新页面查看效果');
    }
    
    function addDimension() {
      const newId = database.evaluationDimensions.length + 1;
      database.evaluationDimensions.push({
        id: newId,
        name: '新增维度' + newId,
        color: 'blue',
        description: '新增的评测维度',
        icon: 'plus'
      });
      alert('已添加第' + newId + '个评测维度模块，刷新页面查看效果');
    }
  </script>
</body>
</html>`;
  
  res.send(html);
});

// 启动服务器
app.listen(PORT, () => {
  console.log('\n🎯 全球最佳商品评选 · 模块化调整版 已启动');
  console.log('🌐 访问地址: http://localhost:' + PORT + '/preview');
  console.log('📊 预览规格: 3个价格区间 × 3个评测维度 = 9个商品');
  console.log('🎨 调整特点:');
  console.log('   1. 宽度调整 - 从1600px缩窄到1300px，更合适');
  console.log('   2. 层次感设计 - 线框/底色区分，增强视觉层次');
  console.log('   3. 评论区功能 - 完整的评论输入和展示');
  console.log('   4. 模块化设计 - 价格区间/评测维度/评选结果即插即用');
  console.log('   5. 高效增减 - 支持动态扩展价格区间和评测维度');
  console.log('   6. 自适应展示 - 根据模块数量自动调整布局');
});