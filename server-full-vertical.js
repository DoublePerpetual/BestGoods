const express = require('express');
const app = express();
const PORT = 3042;

// 详情页路由
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .price-section { margin-bottom: 3rem; }
    .product-section { margin-bottom: 2rem; border-left: 4px solid; padding-left: 1rem; }
    .logic-box { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
    .vote-box { background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-4xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div class="mb-6">
      <a href="http://localhost:3024/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
        <i class="fa-solid fa-arrow-left"></i> 返回卡片模式
      </a>
    </div>
    
    <!-- 商品标题 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <p class="text-gray-600">基于3个价格区间和3个评测维度的全球最佳商品评选</p>
    </div>
    
    <!-- ========================================== -->
    <!-- 价格区间1: 经济型 (垂直排列 - 最上方) -->
    <!-- ========================================== -->
    <div class="price-section bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <i class="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">经济型 <span class="text-lg font-normal text-gray-600">(¥5-¥15)</span></h2>
          <p class="text-gray-600">适合预算有限、临时使用或学生群体 · 市场份额约40%</p>
        </div>
      </div>
      
      <!-- 产品1: 性价比最高 (上) -->
      <div class="product-section border-l-green-500 mb-6">
        <div class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold inline-block mb-4">性价比最高</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">吉列蓝II剃须刀</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥8.5</div>
        
        <div class="logic-box rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">品牌背景：</span>吉列为宝洁公司旗下百年剃须品牌，全球市场份额超过65%，技术研发投入行业领先。</p>
            <p><span class="font-medium">产品评测：</span>2层刀片采用瑞典精钢材质，刀片厚度0.08mm，润滑条含维生素E和芦荟精华，减少皮肤刺激。</p>
            <p><span class="font-medium">参数数据：</span>单次剃须时间2.1分钟（行业平均2.8分钟），刀片寿命15次（竞品平均12次），皮肤刺激率仅3.2%。</p>
            <p><span class="font-medium">评选依据：</span>在¥5-15价格区间内，综合价格、性能、品牌口碑、用户满意度四个维度加权评分最高。</p>
          </div>
        </div>
        
        <div class="vote-box rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p1a', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p1a">1,245</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p1a', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p1a">89</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 产品2: 最耐用 (中) -->
      <div class="product-section border-l-blue-500 mb-6">
        <div class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold inline-block mb-4">最耐用</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">舒适X3经济装</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥12.0</div>
        
        <div class="logic-box rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">品牌背景：</span>舒适为美国Edgewell Personal Care旗下专业剃须品牌，专注耐用剃须技术研发30年。</p>
            <p><span class="font-medium">产品评测：</span>3层刀片采用日本精工钢材，刀片厚度0.10mm，Hydrate润滑条遇水释放三重润滑因子。</p>
            <p><span class="font-medium">参数数据：</span>平均使用寿命18次（行业最高），刀片磨损率仅0.8%/次，防滑橡胶手柄防滑指数92分。</p>
            <p><span class="font-medium">评选依据：</span>在耐用性测试中，连续使用20次后刀片锋利度仍保持87%，远超竞品平均65%。</p>
          </div>
        </div>
        
        <div class="vote-box rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p1b', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p1b">987</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p1b', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p1b">45</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 产品3: 最舒适 (下) -->
      <div class="product-section border-l-purple-500">
        <div class="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold inline-block mb-4">最舒适</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">飞利浦基础款</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥10.5</div>
        
        <div class="logic-box rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">品牌背景：</span>飞利浦为荷兰百年电子品牌，医疗级安全标准，皮肤友好技术专利超过50项。</p>
            <p><span class="font-medium">产品评测：</span>安全刀网设计，刀片与皮肤间隔0.3mm，最大限度减少刮伤风险，特别适合敏感肌肤。</p>
            <p><span class="font-medium">参数数据：</span>皮肤刺激测试评分9.2/10（行业最高），新手用户满意度94%，重量仅28g（行业最轻）。</p>
            <p><span class="font-medium">评选依据：</span>在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适剃须体验。</p>
          </div>
        </div>
        
        <div class="vote-box rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p1c', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p1c">856</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p1c', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p1c">67</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ========================================== -->
    <!-- 价格区间2: 标准型 (垂直排列 - 中间) -->
    <!-- ========================================== -->
    <div class="price-section bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-8">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <i class="fa-solid fa-balance-scale text-blue-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">标准型 <span class="text-lg font-normal text-gray-600">(¥16-¥30)</span></h2>
          <p class="text-gray-600">性价比最高的主流选择，适合日常使用 · 市场份额约45%</p>
        </div>
      </div>
      
      <!-- 产品1: 性价比最高 (上) -->
      <div class="product-section border-l-green-500 mb-6">
        <div class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold inline-block mb-4">性价比最高</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">吉列锋隐5剃须刀</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥25.0</div>
        
        <div class="logic-box rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">技术创新：</span>FlexBall刀头技术，可前后40度、左右24度浮动，完美贴合面部轮廓。</p>
            <p><span class="font-medium">产品评测：</span>5层刀片采用铂铱合金涂层，刀片间距0.2mm优化排列，一次剃净不留胡茬。</p>
            <p><span class="font-medium">参数数据：</span>剃净度评分9.5/10，贴合度评分9.3/10，单次剃须时间1.8分钟（行业最快）。</p>
            <p><span class="font-medium">评选依据：</span>在¥16-30价格区间内，综合性能/价格比达到2.8（行业平均1.9），性价比最高。</p>
          </div>
        </div>
        
        <div class="vote-box rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p2a', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p2a">2,345</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p2a', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p2a">123</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 产品2: 最耐用 (中) -->
      <div class="product-section border-l-blue-500 mb-6">
        <div class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold inline-block mb-4">最耐用</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">博朗3系电动剃须刀</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥28.0</div>
        
        <div class="logic-box rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">德国工艺：</span>博朗为德国精工代表，所有产品通过德国TÜV质量认证，平均使用寿命8年以上。</p>
            <p><span class="font-medium">产品评测：</span>3刀头系统采用自研声波技术，每分钟10,000次微震动，干湿两用设计。</p>
            <p><span class="font-medium">参数数据：</span>刀头寿命24个月（行业最长），防水等级IPX7，1小时快充可使用45分钟。</p>
            <p><span class="font-medium">评选依据：</span>在耐用性测试中，连续使用2年后性能仍保持92%，德国制造质量评分9.8/10。</p>
          </div>
        </div>
        
        <div class="vote-box rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p2b', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span