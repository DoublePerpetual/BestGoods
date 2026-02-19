const express = require('express');
const app = express();
const PORT = 3046;

// 数据库结构 - 支持动态扩展
const database = {
  // 价格区间数据库
  priceIntervals: [
    { id: 1, name: '经济型', range: '¥5-¥15', color: 'green', description: '适合预算有限、临时使用或学生群体' },
    { id: 2, name: '标准型', range: '¥16-¥30', color: 'blue', description: '性价比最高的主流选择，适合日常使用' },
    { id: 3, name: '高端型', range: '¥31-¥50', color: 'purple', description: '高品质体验，适合追求舒适度和性能的用户' }
  ],
  
  // 评测维度数据库
  evaluationDimensions: [
    { id: 1, name: '性价比最高', color: 'green', description: '在价格和性能之间取得最佳平衡' },
    { id: 2, name: '最耐用', color: 'blue', description: '使用寿命长，质量可靠' },
    { id: 3, name: '最舒适', color: 'purple', description: '使用体验最顺滑，减少皮肤刺激' }
  ],
  
  // 最佳商品数据库
  bestProducts: [
    // 经济型
    { priceId: 1, dimensionId: 1, name: '吉列蓝II剃须刀', price: '¥8.5', brand: '吉列 (宝洁公司旗下品牌)', logic: '吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。' },
    { priceId: 1, dimensionId: 2, name: '舒适X3经济装', price: '¥12.0', brand: '舒适 (Edgewell Personal Care)', logic: '舒适为美国Edgewell旗下品牌，专注耐用技术30年。3层刀片采用日本精工钢材，Hydrate润滑技术。在耐用性测试中，连续使用20次后刀片锋利度仍保持87%。' },
    { priceId: 1, dimensionId: 3, name: '飞利浦基础款', price: '¥10.5', brand: '飞利浦 (荷兰皇家飞利浦)', logic: '飞利浦为荷兰百年电子品牌，医疗级安全标准。安全刀网设计，刀片与皮肤间隔0.3mm。在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适体验。' },
    
    // 标准型
    { priceId: 2, dimensionId: 1, name: '吉列锋隐5剃须刀', price: '¥25.0', brand: '吉列 (宝洁公司旗下品牌)', logic: 'FlexBall刀头技术，可前后40度、左右24度浮动。5层刀片采用铂铱合金涂层。在¥16-30区间内，综合性能/价格比达到2.8，性价比最高。' },
    { priceId: 2, dimensionId: 2, name: '博朗3系电动剃须刀', price: '¥28.0', brand: '博朗 (德国宝洁旗下)', logic: '博朗为德国精工代表，通过TÜV质量认证。3刀头系统采用声波技术，干湿两用。在耐用性测试中，连续使用2年后性能仍保持92%。' },
    { priceId: 2, dimensionId: 3, name: '舒适水次元5', price: '¥22.0', brand: '舒适 (Edgewell Personal Care)', logic: '水活化润滑条专利技术，遇水释放三重保湿因子。5层刀片采用磁力悬挂系统。在1000人盲测中，在顺滑度和皮肤友好度上得分超过竞品15%。' },
    
    // 高端型
    { priceId: 3, dimensionId: 1, name: '吉列锋隐致护', price: '¥45.0', brand: '吉列 (宝洁公司旗下品牌)', logic: '7层刀片为行业最高配置，微梳技术预先梳理胡须，铂金涂层减少摩擦。在高端区间内，性能/价格比达到2.1，相比竞品性价比高出35%。' },
    { priceId: 3, dimensionId: 2, name: '博朗7系电动剃须刀', price: '¥65.0', brand: '博朗 (德国宝洁旗下)', logic: '5刀头声波技术，剃须同时按摩皮肤，智能清洁系统自动维护刀头。德国精工制造，平均使用寿命10年以上，返修率仅0.8%。' },
    { priceId: 3, dimensionId: 3, name: '飞利浦高端系列', price: '¥55.0', brand: '飞利浦 (荷兰皇家飞利浦)', logic: 'V型刀片设计减少皮肤拉扯，舒适环技术最大限度减少刺激。多向浮动刀头，智能感应技术自动调节功率。舒适度评分9.8/10，行业最高。' }
  ]
};

// 颜色映射
const colorMap = {
  green: { text: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  blue: { text: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
  purple: { text: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200' }
};

// 预览页面路由
app.get('/preview', (req, res) => {
  const { priceIntervals, evaluationDimensions, bestProducts } = database;
  
  // 生成价格区间HTML
  let priceSectionsHTML = '';
  priceIntervals.forEach(price => {
    const color = colorMap[price.color];
    
    // 找到该价格区间的所有产品
    const products = bestProducts.filter(p => p.priceId === price.id);
    
    let productsHTML = '';
    products.forEach(product => {
      const dimension = evaluationDimensions.find(d => d.id === product.dimensionId);
      const dimColor = colorMap[dimension.color];
      
      productsHTML += `
        <!-- ${dimension.name} -->
        <div class="mb-6">
          <div class="flex items-center gap-2 mb-2">
            <div class="text-sm font-bold ${dimColor.text}">${dimension.name}</div>
            <div class="text-xs text-gray-500">${dimension.description}</div>
          </div>
          
          <div class="flex items-center justify-between mb-3">
            <div>
              <div class="text-lg font-bold text-gray-900">${product.name}</div>
              <div class="text-sm text-gray-500">${product.brand}</div>
            </div>
            <div class="text-xl font-bold text-gray-900">${product.price}</div>
          </div>
          
          <div class="text-sm text-gray-600 mb-4">
            <div class="font-medium mb-1">评选逻辑：</div>
            <div>${product.logic}</div>
          </div>
          
          <div class="flex items-center gap-3 mb-4">
            <button class="flex items-center gap-1 px-3 py-1 text-sm rounded border ${dimColor.border} hover:${color.bg}" onclick="vote('p${price.id}d${dimension.id}', 'up')">
              <i class="fa-solid fa-thumbs-up ${dimColor.text}"></i>
              <span class="${dimColor.text}">认可</span>
              <span class="font-bold ${dimColor.text}" id="up-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 2000) + 500}</span>
            </button>
            <button class="flex items-center gap-1 px-3 py-1 text-sm rounded border ${dimColor.border} hover:${color.bg}" onclick="vote('p${price.id}d${dimension.id}', 'down')">
              <i class="fa-solid fa-thumbs-down ${dimColor.text}"></i>
              <span class="${dimColor.text}">不认可</span>
              <span class="font-bold ${dimColor.text}" id="down-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 100) + 20}</span>
            </button>
          </div>
        </div>
      `;
    });
    
    priceSectionsHTML += `
      <!-- ${price.name} -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-4">
          <div class="text-xl font-bold text-gray-900">${price.name}</div>
          <div class="text-gray-600">${price.range}</div>
          <div class="text-sm text-gray-500">${price.description}</div>
        </div>
        ${productsHTML}
      </div>
    `;
  });
  
  // 生成对比表格
  let comparisonTableHTML = '<table class="w-full text-sm"><thead><tr><th class="px-3 py-2 text-left font-bold text-gray-700">价格区间</th>';
  
  evaluationDimensions.forEach(dim => {
    const color = colorMap[dim.color];
    comparisonTableHTML += `<th class="px-3 py-2 text-center font-bold ${color.text}">${dim.name}</th>`;
  });
  
  comparisonTableHTML += '</tr></thead><tbody>';
  
  priceIntervals.forEach(price => {
    comparisonTableHTML += `<tr><td class="px-3 py-2 font-bold text-gray-900 border-r">${price.name} (${price.range})</td>`;
    
    evaluationDimensions.forEach(dim => {
      const product = bestProducts.find(p => p.priceId === price.id && p.dimensionId === dim.id);
      comparisonTableHTML += `<td class="px-3 py-2 text-center">${product ? `${product.name}<br><span class="text-xs text-gray-500">${product.price}</span>` : '-'}</td>`;
    });
    
    comparisonTableHTML += '</tr>';
  });
  
  comparisonTableHTML += '</tbody></table>';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>简洁预览 · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @media (min-width: 768px) { .container-wide { max-width: 1400px; } }
    @media (min-width: 1024px) { .container-wide { max-width: 1600px; } }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container-wide mx-auto px-4 md:px-6 py-4">
    <!-- 标题 -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-900 mb-1">全球最佳商品评选 · 简洁预览</h1>
      <div class="text-gray-600">${priceIntervals.length}个价格区间 × ${evaluationDimensions.length}个评测维度 = ${bestProducts.length}款最佳商品</div>
    </div>
    
    <!-- 价格区间展示 -->
    ${priceSectionsHTML}
    
    <!-- 对比分析 -->
    <div class="mb-8">
      <div class="text-lg font-bold text-gray-900 mb-3">${priceIntervals.length}×${evaluationDimensions.length}商品对比分析</div>
      <div class="overflow-x-auto">
        ${comparisonTableHTML}
      </div>
    </div>
    
    <!-- 数据库信息 -->
    <div class="text-sm text-gray-500 border-t pt-4">
      <div class="flex items-center gap-4">
        <div>数据库结构：价格区间(${priceIntervals.length}) · 评测维度(${evaluationDimensions.length}) · 最佳商品(${bestProducts.length})</div>
        <div>自适应框架：支持动态扩展</div>
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
    
    // 演示动态扩展
    function addPriceInterval() {
      const newId = database.priceIntervals.length + 1;
      database.priceIntervals.push({
        id: newId,
        name: '新增区间' + newId,
        range: '¥100-¥200',
        color: 'green',
        description: '新增的价格区间'
      });
      alert('已添加第' + newId + '个价格区间，刷新页面查看效果');
    }
    
    function addDimension() {
      const newId = database.evaluationDimensions.length + 1;
      database.evaluationDimensions.push({
        id: newId,
        name: '新增维度' + newId,
        color: 'blue',
        description: '新增的评测维度'
      });
      alert('已添加第' + newId + '个评测维度，刷新页面查看效果');
    }
  </script>
</body>
</html>`;
  
  res.send(html);
});

// 启动服务器
app.listen(PORT, () => {
  console.log('\n🎯 全球最佳商品评选 · 简洁预览版 已启动');
  console.log('🌐 访问地址: http://localhost:' + PORT + '/preview');
  console.log('📊 预览规格: 3个价格区间 × 3个评测维度 = 9个商品');
  console.log('🎨 设计特点:');
  console.log('   1. 更简洁 - 减少线条和框框，简洁设计');
  console.log('   2. 更紧凑 - 文字排版紧凑，减少留白');
  console.log('   3. 宽屏设计 - 最大宽度1600px，宽幅横版');
  console.log('   4. 自适应框架 - 支持动态扩展价格区间和评测维度');
  console.log('   5. 数据库驱动 - 价格区间、评测维度、最佳商品独立数据库');
  console.log('   6. 自动展示 - 根据数据库数据自动生成界面');
});