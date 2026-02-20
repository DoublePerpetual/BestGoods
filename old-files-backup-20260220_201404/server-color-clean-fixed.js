const express = require('express');
const app = express();
const PORT = 3048;

const database = {
  priceIntervals: [
    { id: 1, name: '经济型', range: '¥5-¥15', color: 'green', description: '适合预算有限、临时使用或学生群体', marketShare: '40%' },
    { id: 2, name: '标准型', range: '¥16-¥30', color: 'blue', description: '性价比最高的主流选择，适合日常使用', marketShare: '45%' },
    { id: 3, name: '高端型', range: '¥31-¥50', color: 'purple', description: '高品质体验，适合追求舒适度和性能的用户', marketShare: '12%' }
  ],
  
  evaluationDimensions: [
    { id: 1, name: '性价比最高', color: 'green', description: '在价格和性能之间取得最佳平衡', icon: 'percentage' },
    { id: 2, name: '最耐用', color: 'blue', description: '使用寿命长，质量可靠', icon: 'shield-alt' },
    { id: 3, name: '最舒适', color: 'purple', description: '使用体验最顺滑，减少皮肤刺激', icon: 'smile' }
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

const colorMap = {
  green: { text: 'text-green-600', border: 'border-green-300', badge: 'bg-green-50 border border-green-200 text-green-700', icon: 'text-green-500' },
  blue: { text: 'text-blue-600', border: 'border-blue-300', badge: 'bg-blue-50 border border-blue-200 text-blue-700', icon: 'text-blue-500' },
  purple: { text: 'text-purple-600', border: 'border-purple-300', badge: 'bg-purple-50 border border-purple-200 text-purple-700', icon: 'text-purple-500' }
};

app.get('/preview', (req, res) => {
  const html = \`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>颜色简洁版 · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @media (min-width: 768px) { .container-wide { max-width: 1200px; } }
    @media (min-width: 1024px) { .container-wide { max-width: 1300px; } }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container-wide mx-auto px-4 md:px-6 py-5">
    <div class="mb-7">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">全球最佳商品评选 · 颜色简洁版</h1>
      <div class="text-gray-600">3个价格区间 × 3个评测维度 = 9款最佳商品</div>
      <div class="text-sm text-gray-500 mt-1">简洁彩色线框设计 · 一览无余 · 兼具美观</div>
    </div>
    
    <!-- 经济型 -->
    <div class="mb-8 p-5 bg-white rounded-lg border border-green-300">
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-full border border-green-300 flex items-center justify-center bg-white">
          <i class="fa-solid fa-tag text-green-600"></i>
        </div>
        <div>
          <h2 class="text-xl font-bold text-gray-900">经济型 <span class="text-gray-600">(¥5-¥15)</span></h2>
          <p class="text-gray-600">适合预算有限、临时使用或学生群体 · 市场份额约40%</p>
        </div>
      </div>
      
      <!-- 性价比最高 -->
      <div class="mb-5 p-4 bg-white rounded-lg border border-green-300">
        <div class="flex items-center gap-2 mb-3">
          <div class="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-full text-sm font-bold">
            <i class="fa-solid fa-percentage text-green-500 mr-1"></i>性价比最高
          </div>
          <div class="text-sm text-gray-500">在价格和性能之间取得最佳平衡</div>
        </div>
        
        <div class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <div>
              <div class="text-lg font-bold text-gray-900">吉列蓝II剃须刀</div>
              <div class="text-sm text-gray-500">吉列 (宝洁公司旗下品牌)</div>
            </div>
            <div class="text-xl font-bold text-gray-900">¥8.5</div>
          </div>
          
          <div class="flex items-center mb-3">
            <i class="fa-solid fa-star text-yellow-500"></i>
            <i class="fa-solid fa-star text-yellow-500"></i>
            <i class="fa-solid fa-star text-yellow-500"></i>
            <i class="fa-solid fa-star text-yellow-500"></i>
            <i class="fa-solid fa-star text-gray-300"></i>
            <span class="text-sm text-gray-500 ml-2">1,600+用户评价</span>
          </div>
          
          <div class="text-sm text-gray-600 p-3 rounded bg-gray-50">
            <div class="font-medium mb-1">评选逻辑：</div>
            <div>吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。</div>
          </div>
        </div>
        
        <div class="flex items-center gap-3">
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-white hover:bg-green-50"
                  onclick="vote('p1d1', 'up')">
            <i class="fa-solid fa-thumbs-up text-green-600"></i>
            <span class="font-medium text-green-700">认可</span>
            <span class="font-bold text-green-800" id="up-p1d1">1,245</span>
          </button>
          <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-white hover:bg-red-50"
                  onclick="vote('p1d1', 'down')">
            <i class="fa-solid fa-thumbs-down text-red-600"></i>
            <span class="font-medium text-red-700">不认可</span>
            <span class="font-bold text-red-800" id="down-p1d1">89</span>
          </button>
        </div>
      </div>
    </div>
    
    <!-- 评论区域 -->
    <div class="p-5 bg-white rounded-lg border border-gray-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4">发表评论</h3>
      
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
      
      <h4 class="text-md font-bold text-gray-900 mb-3">用户评论</h4>
      <div class="space-y-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">张三</div>
            <div class="text-sm text-gray-500">2026-02-17 20:15</div>
          </div>
          <div class="text-gray-700">颜色处理得很简洁，没有大色块干扰，视觉感很好！</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">李四</div>
            <div class="text-sm text-gray-500">2026-02-17 18:30</div>
          </div>
          <div class="text-gray-700">彩色线框设计很巧妙，既区分了模块又不会太晃眼。</div>
        </div>
      </div>
    </div>
    
    <div class="mt-8 text-sm text-gray-500 border-t pt-4">
      <div class="flex items-center gap-6">
        <div>颜色处理：简洁彩色线框 · 去掉大色块 · 最佳视觉感</div>
        <div>设计理念：一览无余 · 兼具美观 · 模块化结构</div>
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
  </script>
</body>
</html>\`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log('\\n🎨 全球最佳商品评选 · 颜色简洁版 已启动');
  console.log('🌐 访问地址: http://localhost:' + PORT + '/preview');
  console.log('🎯 颜色处理调整:');
  console.log('   1. 去掉大色块 - 减少视觉干扰，不再晃眼');
  console.log('   2. 彩色线框设计 - 用简洁的彩色边框区分模块');
  console.log('   3. 最佳视觉感 - 一览无余，清晰美观');
  console.log('   4. 简洁处理 - 保持简洁设计理念');
});
