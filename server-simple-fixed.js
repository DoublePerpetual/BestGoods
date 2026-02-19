const express = require('express');
const app = express();
const PORT = 3041;

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
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-6">
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
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 性价比最高 -->
        <div class="rounded-xl p-5 border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
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
        
        <!-- 最耐用 -->
        <div class="rounded-xl p-5 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
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
        
        <!-- 最舒适 -->
        <div class="rounded-xl p-5 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
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
    </div>
    
    <!-- ========================================== -->
    <!-- 价格区间2: 标准型 (垂直排列 - 中间) -->
    <!-- ========================================== -->
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
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 性价比最高 -->
        <div class="rounded-xl p-5 border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
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
        
        <!-- 最耐用 -->
        <div class="rounded-xl p-5 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
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
        
        <!-- 最舒适 -->
        <div class="rounded-xl p-5 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
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
    </div>
    
    <!-- ========================================== -->
    <!-- 价格区间3: 高端型 (垂直排列 - 最下方) -->
    <!-- ========================================== -->
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
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 性价比最高 -->
        <div class="rounded-xl p-5 border-2 border-green-300 bg-gradient-to-br from-green-50 to-white">
          <div class="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold inline-block mb-4">性价比最高</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">吉列锋隐致护</h3>
          <div class="text-2xl font-bold text-gray-900 mb-4">¥45.0</div>
          
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <p class="text-sm text-gray-600">7层刀片为行业最高配置，微梳技术预先梳理胡须，铂金涂层减少摩擦。在高端区间内，性能/价格比达到2.1，相比竞品性价比高出35%。</p>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center gap-4">
              <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p3a', 'up')">
                <i class="fa-solid fa-thumbs-up text-green-600"></i>
                <span class="font-medium text-green-700">认可</span>
                <span class="font-bold text-green-800" id="up-p3a">1,456</span>
              </button>
              <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p3a', 'down')">
                <i class="fa-solid fa-thumbs-down text-red-600"></i>
                <span class="font-medium text-red-700">不认可</span>
                <span class="font-bold text-red-800" id="down-p3a">45</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 最耐用 -->
        <div class="rounded-xl p-5 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white">
          <div class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold inline-block mb-4">最耐用</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">博朗7系电动剃须刀</h3>
          <div class="text-2xl font-bold text-gray-900 mb-4">¥65.0</div>
          
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <p class="text-sm text-gray-600">5刀头声波技术，剃须同时按摩皮肤。智能清洁系统，自动维护刀头。德国精工制造，平均使用寿命10年以上，返修率仅0.8%。</p>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center gap-4">
              <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p3b', 'up')">
                <i class="fa-solid fa-thumbs-up text-green-600"></i>
                <span class="font-medium text-green-700">认可</span>
                <span class="font-bold text-green-800" id="up-p3b">987</span>
              </button>
              <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p3b', 'down')">
                <i class="fa-solid fa-thumbs-down text-red-600"></i>
                <span class="font-medium text-red-700">不认可</span>
                <span class="font-bold text-red-800" id="down-p3b">34</span>
              </button>
            </div>
          </div>
        </div>
        
        <!-- 最舒适 -->
        <div class="rounded-xl p-5 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white">
          <div class="px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold inline-block mb-4">最舒适</div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">飞利浦高端系列</h3>
          <div class="text-2xl font-bold text-gray-900 mb-4">¥55.0</div>
          
          <div class="bg-gray-50 rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <p class="text-sm text-gray-600">V型刀片设计减少皮肤拉扯，舒适环技术最大限度减少刺激。多向浮动刀头，智能感应技术自动调节功率。舒适度评分9.8/10，行业最高。</p>
          </div>
          
          <div class="bg-blue-50 rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center gap-4">
              <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100" onclick="vote('p3c', 'up')">
                <i class="fa-solid fa-thumbs-up text-green-600"></i>
                <span class="font-medium text-green-700">认可</span>
                <span class="font-bold text-green-800" id="up-p3c">876</span>
              </button>
              <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100" onclick="vote('p3c', 'down')">
                <i class="fa-solid fa-thumbs-down text-red-600"></i>
                <span class="font-medium text-red-700">不认可</span>
                <span class="font-bold text-red-800" id="down-p3c">29</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 9款商品对比分析 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
      <h3 class="text-xl font-bold text-gray-900 mb-4">9款商品对比分析</h3>
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-3 text-left font-bold text-gray-700">价格区间</th>
              <th class="px-4 py-3 text-center font-bold text-green-700">性价比最高</th>
              <th class="px-4 py-3 text-center font-bold text-blue-700">最耐用</th>
              <th class="px-4 py-3 text-center font-bold text-purple-700">最舒适</th>
            </tr>
          </thead>
          <tbody>
            <tr class="bg-white hover:bg-gray-50">
              <td class="px-4 py-3 font-bold text-gray-900 border-r">经济型 (¥5-15)</td>
              <td class="px-4 py-3 text-center">吉列蓝II ¥8.5</td>
              <td class="px-4 py-3 text-center">舒适X3 ¥12.0</td>
              <td class="px-4 py-3 text-center">飞利浦 ¥10.5</td>
            </tr>
            <tr class="bg-white hover:bg-gray-50">
              <td class="px-4 py-3 font-bold text-gray-900 border-r">标准型 (¥16-30)</td>
              <td class="px-4 py-3 text-center">吉列锋隐5 ¥25.0</td>
              <td class="px-4 py-3 text-center">博朗3系 ¥28.0</td>
              <td class="px-4 py-3 text-center">舒适水次元5 ¥22.0</td>
            </tr>
            <tr class="bg-white hover:bg-gray-50">
              <td class="px-4 py-3 font-bold text-gray-900 border-r">高端型 (¥31-50)</td>
              <td class="px-4 py-3 text-center">吉列锋隐致护 ¥45.0</td>
              <td class="px-4 py-3 text-center">博朗7系 ¥65.0</td>
              <td class="px-4 py-3 text-center">飞利浦高端 ¥55.0</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 评论区域 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">用户评论</h3>
      <div class="space-y-4">
        <div class="p-3 hover:bg-gray-50">
          <div class="font-medium text-gray-900">张三</div>
          <div class="text-sm text-gray-500 mb-2">2026-02-16</div>
          <div class="text-gray-700">评选逻辑很详细，数据支撑充分，认可这个结果！</div>
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
  console.log(`\n🚀 全球最佳商品评选 · 修复版详情页 已启动`);
  console.log(`🌐 访问地址: http://localhost:${PORT}/`);
  console.log(`📱 修复详情页: http://localhost:${PORT}/category/个护健康/剃须用品/一次性剃须刀`);
  console.log(`🎯 修复内容:`);
  console.log(`   1. 价格区间垂直排列 - 经济型(上) · 标准型(中) · 高端型(下)`);
  console.log(`   2. 点赞点踩提示 - "你认可这个评选结果吗？"`);
  console.log(`   3. 详细评选逻辑 - 品牌介绍、产品评测、参数数据、评选依据`);
});