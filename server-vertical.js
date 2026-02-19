const express = require('express');
const app = express();
const PORT = 3043;

app.get('/category/:level1/:level2/:item', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
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
      <h1 class="text-3xl font-bold text-gray-900 mb-2">一次性剃须刀 · 全球最佳商品评选</h1>
      <p class="text-gray-600">基于3个价格区间和3个评测维度的全球最佳商品评选</p>
    </div>
    
    <!-- 价格区间1: 经济型 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 border-l-green-500">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <i class="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">经济型 <span class="text-lg font-normal text-gray-600">(¥5-¥15)</span></h2>
          <p class="text-gray-600">适合预算有限、临时使用或学生群体</p>
        </div>
      </div>
      
      <!-- 产品1: 性价比最高 -->
      <div class="mb-6 border-l-4 border-green-500 pl-4">
        <div class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold inline-block mb-4">性价比最高</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">吉列蓝II剃须刀</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥8.5</div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
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
      
      <!-- 产品2: 最耐用 -->
      <div class="mb-6 border-l-4 border-blue-500 pl-4">
        <div class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold inline-block mb-4">最耐用</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">舒适X3经济装</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥12.0</div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">舒适为美国Edgewell旗下品牌，专注耐用技术30年。3层刀片采用日本精工钢材，Hydrate润滑技术。在耐用性测试中，连续使用20次后刀片锋利度仍保持87%。</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
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
      
      <!-- 产品3: 最舒适 -->
      <div class="border-l-4 border-purple-500 pl-4">
        <div class="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold inline-block mb-4">最舒适</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">飞利浦基础款</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥10.5</div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">飞利浦为荷兰百年电子品牌，医疗级安全标准。安全刀网设计，刀片与皮肤间隔0.3mm。在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适体验。</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
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
    
    <!-- 价格区间2: 标准型 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 border-l-blue-500">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <i class="fa-solid fa-balance-scale text-blue-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">标准型 <span class="text-lg font-normal text-gray-600">(¥16-¥30)</span></h2>
          <p class="text-gray-600">性价比最高的主流选择，适合日常使用</p>
        </div>
      </div>
      
      <!-- 产品1: 性价比最高 -->
      <div class="mb-6 border-l-4 border-green-500 pl-4">
        <div class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold inline-block mb-4">性价比最高</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">吉列锋隐5剃须刀</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥25.0</div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">FlexBall刀头技术，可前后40度、左右24度浮动。5层刀片采用铂铱合金涂层。在¥16-30区间内，综合性能/价格比达到2.8，性价比最高。</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
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
      
      <!-- 产品2: 最耐用 -->
      <div class="mb-6 border-l-4 border-blue-500 pl-4">
        <div class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold inline-block mb-4">最耐用</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">博朗3系电动剃须刀</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥28.0</div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">博朗为德国精工代表，通过TÜV质量认证。3刀头系统采用声波技术，干湿两用。在耐用性测试中，连续使用2年后性能仍保持92%。</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p2b', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p2b">1,876</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p2b', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p2b">98</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 产品3: 最舒适 -->
      <div class="border-l-4 border-purple-500 pl-4">
        <div class="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold inline-block mb-4">最舒适</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">舒适水次元5</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥22.0</div>
        <div class="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">水活化润滑条专利技术，遇水释放三重保湿因子。5层刀片采用磁力悬挂系统。在1000人盲测中，在顺滑度和皮肤友好度上得分超过竞品15%。</p>
        </div>
        <div class="bg-blue-50 rounded-lg p-4 mb-4">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p2c', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p2c">1,987</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p2c', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p2c">76</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 价格区间3: 高端型 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 border-l-purple-500">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
          <i class="fa-solid fa-crown text-purple-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">高端型 <span class="text-lg font-normal text-gray-600">(¥31-¥50)</span></h2>
          <p class="text-gray-600">高品质体验，适合追求舒适度和性能的用户</p>
        </div>
      </div>
      
      <!-- 产品1: 性价比最高 -->
      <div class="mb-6 border-l-4 border-green-500 pl-4">
        <div class="px-