const express = require('express');
const app = express();
const PORT = 3060;

// 统计数据
let stats = {
  totalCategories: 245317,
  completedCategories: 7,
  bestProductsCount: 63,
  lastUpdated: new Date().toISOString()
};

// 可访问的品类
const accessibleItems = ['一次性剃须刀', '不粘锅', '充电宝'];

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
    </div>
    
    <!-- 三级目录导航 -->
    <div class="mb-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">浏览已完成评选的品类</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/category/个护健康/剃须用品/一次性剃须刀" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">一次性剃须刀</div>
          <div class="text-sm text-gray-500 mt-1">个护健康 > 剃须用品</div>
          <div class="mt-2 text-xs text-green-600">✅ 点击查看详情</div>
        </a>
        <a href="/category/家居生活/厨房用品/不粘锅" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">不粘锅</div>
          <div class="text-sm text-gray-500 mt-1">家居生活 > 厨房用品</div>
          <div class="mt-2 text-xs text-green-600">✅ 点击查看详情</div>
        </a>
        <a href="/category/数码电子/手机配件/充电宝" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
          <div class="font-medium text-gray-900">充电宝</div>
          <div class="text-sm text-gray-500 mt-1">数码电子 > 手机配件</div>
          <div class="mt-2 text-xs text-green-600">✅ 点击查看详情</div>
        </a>
      </div>
    </div>
    
    <!-- 自动化程序状态 -->
    <div class="mt-8 p-6 bg-white border border-gray-200 rounded-lg">
      <h2 class="text-xl font-bold text-gray-900 mb-4">24小时自动化数据录入系统</h2>
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <div class="font-medium text-gray-900">正在处理所有245,317个品类</div>
            <div class="text-sm text-gray-500">自动设置价格区间、评选维度，并评选最佳商品</div>
          </div>
          <div class="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
            运行中
          </div>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2">
          <div class="bg-green-600 h-2 rounded-full" style="width: ${(stats.completedCategories / stats.totalCategories * 100).toFixed(6)}%"></div>
        </div>
        <div class="text-sm text-gray-500">
          已完成 ${stats.completedCategories.toLocaleString()} / ${stats.totalCategories.toLocaleString()} 个品类
        </div>
        <div class="text-sm text-gray-500">
          <i class="fa-solid fa-info-circle mr-1"></i> 统计数字实时更新：已完成品类 × 9 = 最佳商品数量
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
  </script>
</body>
</html>`;
  
  res.send(html);
});

// API：获取统计数据
app.get('/api/stats', (req, res) => {
  // 模拟数据增长
  if (Math.random() > 0.9) {
    stats.completedCategories += 1;
    stats.bestProductsCount = stats.completedCategories * 9;
  }
  stats.lastUpdated = new Date().toISOString();
  
  res.json(stats);
});

// 详情页
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 检查是否是可访问的品类
  if (!accessibleItems.includes(item)) {
    // 不可访问的品类
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
  
  // 可访问的品类，显示定稿UI详情页
  const priceIntervals = [
    { id: 1, name: '经济型', range: '¥5-¥15', description: '适合预算有限、临时使用或学生群体' },
    { id: 2, name: '标准型', range: '¥16-¥30', description: '性价比最高的主流选择，适合日常使用' },
    { id: 3, name: '高端型', range: '¥31-¥50', description: '高品质体验，适合追求舒适度和性能的用户' }
  ];
  
  const evaluationDimensions = [
    { id: 1, name: '性价比最高', description: '在价格和性能之间取得最佳平衡', icon: 'percentage' },
    { id: 2, name: '最耐用', description: '使用寿命长，质量可靠', icon: 'shield-alt' },
    { id: 3, name: '最舒适', description: '使用体验最顺滑，减少皮肤刺激', icon: 'smile' }
  ];
  
  // 生成最佳评选结果表格
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
      const brand = ['吉列', '舒适', '飞利浦', '博朗', '美的', '海尔', '小米', '苹果'][Math.floor(Math.random() * 8)];
      const priceValue = parseInt(price.range.match(/\d+/)[0]) + Math.floor(Math.random() * 5);
      
      tableHTML += `
        <td class="px-4 py-3">
          <div class="text-sm font-medium text-gray-900">${brand} ${item}</div>
          <div class="text-xs text-gray-500">${brand}</div>
          <div class="text-sm font-bold text-gray-900 mt-1">¥${priceValue}</div>
          <div class="flex items-center mt-1">
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <span class="text-xs text-gray-500 ml-1">1,200+</span>
          </div>
        </td>
      `;
    });
    
    tableHTML += `</tr>`;
  });
  
  tableHTML += `</tbody></table></div>`;
  
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
  <div class="container mx-auto px-4 md:px-6 py-5">
    <!-- 返回按钮 -->
    <div class="mb-6">
      <a href="/" class="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-300">
        <i class="fa-solid fa-arrow-left"></i> 返回首页
      </a>
    </div>
    
    <!-- 商品标题 -->
    <div class="mb-7">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <div class="text-gray-600">3个价格区间 × 3个评测维度 = 9款最佳商品</div>
    </div>
    
    <!-- 最佳评选结果表格（单独线框） -->
    <div class="mb-8 p-5 bg-white rounded-lg border border-gray-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4">最佳评选结果</h3>
      ${tableHTML}
    </div>
    
    <!-- 详细评选分析（无外框） -->
    <div class="mt-8">
      <h3 class="text-lg font-bold text-gray-900 mb-4">详细评选分析</h3>
      
      ${priceIntervals.map(price => `
        <div class="mb-8">
          <div class="flex items-center gap-3 mb-5">
            <div class="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center bg-white">
              <i class="fa-solid fa-tag text-gray-600 text-sm"></i>
            </div>
            <div>
              <h2 class="text-lg font-bold text-gray-900">${price.name} <span class="text-gray-600 text-sm">(${price.range})</span></h2>
              <p class="text-sm text-gray-500">${price.description}</p>
            </div>
          </div>
          
          ${evaluationDimensions.map(dim => `
            <div class="mb-5 p-4 bg-white rounded-lg border border-gray-200">
              <div class="flex items-center gap-2 mb-3">
                <div class="px-3 py-1 bg-gray-50 border border-gray-200 rounded-full text-xs font-bold text-gray-700">
                  <i class="fa-solid fa-${dim.icon} text-gray-600 mr-1"></i>
                  ${dim.name}
                </div>
                <div class="text-xs text-gray-500">${dim.description}</div>
              </div>
              
              <div class="mb-4">
                <div class="flex items-center justify-between mb-2">
                  <div>
                    <div class="text-lg font-bold text-gray-900">${['吉列', '舒适', '飞利浦', '博朗', '美的', '海尔', '小米', '苹果'][Math.floor(Math.random() * 8)]} ${item}</div>
                    <div class="text-sm text-gray-500">品牌</div>
                  </div>
                  <div class="text-xl font-bold text-gray-900">¥${parseInt(price.range.match(/\d+/)[0]) + Math.floor(Math.random() * 5)}</div>
                </div>
                
                <div class="text-sm text-gray-600 p-3 rounded bg-gray-50 border border-gray-200">
                  <div class="font-bold text-gray-800 mb-2">评选理由：</div>
                  <div class="leading-relaxed">基于市场数据、用户评价和专业评测，该产品在${price.name}区间内被评为${dim.name}的最佳选择。综合考虑品牌口碑、产品质量、用户反馈和价格因素，该产品脱颖而出。</div>
                </div>
              </div>
              
              <div class="flex items-center gap-3">
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
                  <i class="fa-solid fa-thumbs-up text-gray-600 text-sm"></i>
                  <span class="font-medium text-gray-700 text-sm">认可</span>
                  <span class="font-bold text-gray-800 text-sm">${Math.floor(Math.random() * 2000) + 500}</span>
                </button>
                <button class="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 bg-white hover:bg-gray-50">
                  <i class="fa-solid fa-thumbs-down text-gray-600 text-sm"></i>
                  <span class="font-medium text-gray-700 text-sm">不认可</span>
                  <span class="font-bold text-gray-800 text-sm">${Math.floor(Math.random() * 100) + 20}</span>
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `).join('')}
    </div>
    
    <!-- 评论功能 -->
    <div class="mt-8 p-5 bg-white rounded-lg border border-gray-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4">发表评论</h3>
      
      <div class="mb-6">
        <textarea class="w-full h-32 p-4 border border-gray