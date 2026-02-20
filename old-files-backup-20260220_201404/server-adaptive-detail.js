const express = require('express');
const app = express();
const PORT = 3044;

// 模拟数据库 - 价格区间
const priceIntervalsDB = [
  { id: 1, name: '经济型', range: '¥5-¥15', color: 'green', icon: 'money-bill-wave', description: '适合预算有限、临时使用或学生群体', marketShare: '40%' },
  { id: 2, name: '标准型', range: '¥16-¥30', color: 'blue', icon: 'balance-scale', description: '性价比最高的主流选择，适合日常使用', marketShare: '45%' },
  { id: 3, name: '高端型', range: '¥31-¥50', color: 'purple', icon: 'crown', description: '高品质体验，适合追求舒适度和性能的用户', marketShare: '12%' },
  { id: 4, name: '旗舰型', range: '¥51-¥100', color: 'red', icon: 'gem', description: '顶级配置，适合专业用户和追求极致体验的用户', marketShare: '3%' }
];

// 模拟数据库 - 评测维度
const evaluationDimensionsDB = [
  { id: 1, name: '性价比最高', color: 'green', icon: 'percentage', description: '在价格和性能之间取得最佳平衡' },
  { id: 2, name: '最耐用', color: 'blue', icon: 'shield-alt', description: '使用寿命长，质量可靠' },
  { id: 3, name: '最舒适', color: 'purple', icon: 'smile', description: '使用体验最顺滑，减少皮肤刺激' },
  { id: 4, name: '最环保', color: 'teal', icon: 'leaf', description: '环保材料，可回收包装，低碳排放' },
  { id: 5, name: '最智能', color: 'orange', icon: 'microchip', description: '智能功能丰富，操作便捷' }
];

// 模拟数据库 - 最佳商品
const bestProductsDB = [
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
    logic: 'V型刀片设计减少皮肤拉扯，舒适环技术最大限度减少刺激。多向浮动刀头，智能感应技术自动调节功率。舒适度评分9.8/10，行业最高。' },
  
  // 旗舰型 (示例)
  { priceId: 4, dimensionId: 1, name: '吉列实验室系列', price: '¥85.0', brand: '吉列实验室', rating: 5, reviews: '1,200+',
    logic: '10层纳米刀片，智能感应皮肤湿度，自动调节刀头角度。实验室级材料，航天级涂层技术。在旗舰区间内，技术创新评分9.9/10。' },
  { priceId: 4, dimensionId: 4, name: '环保系列电动剃须刀', price: '¥95.0', brand: '环保科技', rating: 5, reviews: '800+',
    logic: '100%可回收材料，太阳能充电，零塑料包装。碳足迹比竞品低78%，获得欧盟环保认证最高等级。' },
  { priceId: 4, dimensionId: 5, name: 'AI智能剃须系统', price: '¥120.0', brand: '智能科技', rating: 5, reviews: '950+',
    logic: 'AI面部识别，自动学习用户剃须习惯，3D建模优化刀头路径。App连接，实时数据分析，个性化剃须方案推荐。' }
];

// 颜色映射
const colorMap = {
  green: { bg: 'bg-green-100', text: 'text-green-600', border: 'border-green-500', badge: 'bg-green-500' },
  blue: { bg: 'bg-blue-100', text: 'text-blue-600', border: 'border-blue-500', badge: 'bg-blue-500' },
  purple: { bg: 'bg-purple-100', text: 'text-purple-600', border: 'border-purple-500', badge: 'bg-purple-500' },
  red: { bg: 'bg-red-100', text: 'text-red-600', border: 'border-red-500', badge: 'bg-red-500' },
  teal: { bg: 'bg-teal-100', text: 'text-teal-600', border: 'border-teal-500', badge: 'bg-teal-500' },
  orange: { bg: 'bg-orange-100', text: 'text-orange-600', border: 'border-orange-500', badge: 'bg-orange-500' }
};

// 详情页路由
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 生成价格区间HTML
  let priceSectionsHTML = '';
  priceIntervalsDB.forEach(price => {
    const color = colorMap[price.color];
    
    // 找到该价格区间的所有产品
    const products = bestProductsDB.filter(p => p.priceId === price.id);
    
    let productsHTML = '';
    products.forEach(product => {
      const dimension = evaluationDimensionsDB.find(d => d.id === product.dimensionId);
      const dimColor = colorMap[dimension.color];
      
      productsHTML += `
        <!-- ${dimension.name} -->
        <div class="mb-6 border-l-4 ${dimColor.border} pl-4">
          <div class="px-3 py-1 ${dimColor.badge} text-white rounded-full text-sm font-bold inline-block mb-4">${dimension.name}</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">${product.name}</h3>
          <div class="text-2xl font-bold text-gray-900 mb-4">${product.price}</div>
          
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">品牌背景：</span>${product.brand}</p>
              <p><span class="font-medium">产品评测：</span>${product.logic}</p>
              <p><span class="font-medium">参数数据：</span>${product.rating}星评分，${product.reviews}用户评价</p>
              <p><span class="font-medium">评选依据：</span>基于全球消费者调研、专业评测机构数据、用户满意度调查综合评选。</p>
            </div>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center gap-4">
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100"
                      onclick="vote('p${price.id}d${dimension.id}', 'up')">
                <i class="fa-solid fa-thumbs-up text-green-600"></i>
                <span class="font-medium text-green-700">认可</span>
                <span class="font-bold text-green-800" id="up-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 2000) + 500}</span>
              </button>
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                      onclick="vote('p${price.id}d${dimension.id}', 'down')">
                <i class="fa-solid fa-thumbs-down text-red-600"></i>
                <span class="font-medium text-red-700">不认可</span>
                <span class="font-bold text-red-800" id="down-p${price.id}d${dimension.id}">${Math.floor(Math.random() * 100) + 20}</span>
              </button>
            </div>
          </div>
        </div>
      `;
    });
    
    priceSectionsHTML += `
      <!-- ${price.name} -->
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 ${color.border} border-l-4">
        <div class="flex items-center gap-3 mb-6">
          <div class="w-12 h-12 rounded-full ${color.bg} flex items-center justify-center">
            <i class="fa-solid fa-${price.icon} ${color.text} text-xl"></i>
          </div>
          <div>
            <h2 class="text-2xl font-bold text-gray-900">${price.name} <span class="text-lg font-normal text-gray-600">(${price.range})</span></h2>
            <p class="text-gray-600">${price.description} · 市场份额约${price.marketShare}</p>
          </div>
        </div>
        ${productsHTML}
      </div>
    `;
  });
  
  // 生成对比表格
  let comparisonTableHTML = '<table class="w-full text-sm"><thead class="bg-gray-50"><tr><th class="px-4 py-3 text-left font-bold text-gray-700">价格区间</th>';
  
  evaluationDimensionsDB.forEach(dim => {
    const color = colorMap[dim.color];
    comparisonTableHTML += `<th class="px-4 py-3 text-center font-bold ${color.text}">${dim.name}</th>`;
  });
  
  comparisonTableHTML += '</tr></thead><tbody>';
  
  priceIntervalsDB.forEach(price => {
    comparisonTableHTML += `<tr class="bg-white hover:bg-gray-50"><td class="px-4 py-3 font-bold text-gray-900 border-r">${price.name} (${price.range})</td>`;
    
    evaluationDimensionsDB.forEach(dim => {
      const product = bestProductsDB.find(p => p.priceId === price.id && p.dimensionId === dim.id);
      comparisonTableHTML += `<td class="px-4 py-3 text-center">${product ? `${product.name} ${product.price}` : '-'}</td>`;
    });
    
    comparisonTableHTML += '</tr>';
  });
  
  comparisonTableHTML += '</tbody></table>';
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .price-section { margin-bottom: 2.5rem; }
    .product-card { margin-bottom: 1.5rem; }
    .logic-box { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
    .vote-box { background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div class="mb-6">
      <a href="http://localhost:3023/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
        <i class="fa-solid fa-arrow-left"></i> 返回卡片模式
      </a>
    </div>
    
    <!-- 商品标题 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <p class="text-gray-600">基于${priceIntervalsDB.length}个价格区间和${evaluationDimensionsDB.length}个评测维度的全球最佳商品评选</p>
      <div class="mt-2 text-sm text-gray-500">
        <i class="fa-solid fa-database mr-1"></i> 数据库驱动 · 完全自适应 · 无限扩展
      </div>
    </div>
    
    <!-- 价格区间展示 -->
    ${priceSectionsHTML}
    
    <!-- 对比分析 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4">${priceIntervalsDB.length}×${evaluationDimensionsDB.length}商品对比分析</h3>
      <div class="overflow-x-auto">
        ${comparisonTableHTML}
      </div>
    </div>
    
    <!-- 系统架构说明 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4">自适应UI架构说明</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="p-4 bg-green-50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-layer-group text-green-600"></i>
            <h4 class="font-bold text-gray-900">垂直排列设计</h4>
          </div>
          <p class="text-sm text-gray-600">价格区间上下排列，每个区间内的产品也上下排列，无论多少个维度都能自适应。</p>
        </div>
        <div class="p-4 bg-blue-50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-expand-arrows-alt text-blue-600"></i>
            <h4 class="font-bold text-gray-900">无限扩展性</h4>
          </div>
          <p class="text-sm text-gray-600">支持4个、5个甚至更多价格区间和评测维度，UI自动适应。</p>
        </div>
        <div class="p-4 bg-purple-50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-database text-purple-600"></i>
            <h4 class="font-bold text-gray-900">数据库驱动</h4>
          </div>
          <p class="text-sm text-gray-600">价格区间、评测维度、最佳商品都存储在独立数据库中，便于修改维护。</p>
        </div>
        <div class="p-4 bg-orange-50 rounded-lg">
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-scroll text-orange-600"></i>
            <h4 class="font-bold text-gray-900">详细评选逻辑</h4>
          </div>
          <p class="text-sm text-gray-600">每个评选结果都有详细的品牌背景、产品评测、参数数据、评选依据说明。</p>
        </div>
      </div>
    </div>
    
    <!-- 评论区域 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">用户评论</h3>
      <div class="space-y-4">
        <div class="p-3 hover:bg-gray-50">
          <div class="font-medium text-gray-900">系统管理员</div>
          <div class="text-sm text-gray-500 mb-2">2026-02-17</div>
          <div class="text-gray-700">自适应UI架构已实现：${priceIntervalsDB.length}个价格区间 × ${evaluationDimensionsDB.length}个评测维度 = ${priceIntervalsDB.length * evaluationDimensionsDB.length}款最佳商品自动生成。</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    function vote(productId, type) {
      const upElement = document.getElementById('up-' + productId);
      const downElement = document.getElementById('down-' + productId);
      
      if (type === 'up') {
        upElement.textContent = parseInt(upElement.textContent) + 1;
        alert('感谢您的认可！');
      } else {
        downElement.textContent = parseInt(downElement.textContent) + 1;
        alert('感谢您的反馈！我们会改进评选标准。');
      }
    }
  </script>
</body>
</html>`;
  
  res.send(html);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`\n🚀 全球最佳商品评选 · 自适应详情页 已启动`);
  console.log(`🌐 访问地址: http://localhost:${PORT}/`);
  console.log(`📱 详情页: http://localhost:${PORT}/category/个护健康/剃须用品/一次性剃须刀`);
  console.log(`🎯 自适应UI架构:`);
  console.log(`   1. 数据库驱动 - 价格区间(${priceIntervalsDB.length}个) · 评测维度(${evaluationDimensionsDB.length}个) · 最佳商品(${bestProductsDB.length}款)`);
  console.log(`   2. 完全垂直排列 - 价格区间上下排列 · 产品上下排列`);
  console.log(`   3. 无限扩展性 - 支持4个、5个甚至更多价格区间和评测维度`);
  console.log(`   4. UI自动生成 - 基于数据库自动生成界面，无需硬编码`);
  console.log(`   5. 详细评选逻辑 - 品牌背景 · 产品评测 · 参数数据 · 评选依据`);
});