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

// 已完成的品类
const completedItems = ['一次性剃须刀', '不粘锅', '充电宝'];

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
      <h2 class="text-xl font-bold text-gray-900 mb-4">浏览所有品类</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <a href="/category/个护健康/剃须用品/一次性剃须刀" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 block">
          <div class="font-medium text-gray-900">一次性剃须刀</div>
          <div class="text-sm text-gray-500 mt-1">个护健康 > 剃须用品</div>
          <div class="mt-2 text-xs text-green-600">✅ 点击查看详情</div>
        </a>
        <a href="/category/家居生活/厨房用品/不粘锅" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 block">
          <div class="font-medium text-gray-900">不粘锅</div>
          <div class="text-sm text-gray-500 mt-1">家居生活 > 厨房用品</div>
          <div class="mt-2 text-xs text-green-600">✅ 点击查看详情</div>
        </a>
        <a href="/category/数码电子/手机配件/充电宝" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 block">
          <div class="font-medium text-gray-900">充电宝</div>
          <div class="text-sm text-gray-500 mt-1">数码电子 > 手机配件</div>
          <div class="mt-2 text-xs text-green-600">✅ 点击查看详情</div>
        </a>
        <a href="/category/服装鞋帽/运动服饰/跑步鞋" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 block">
          <div class="font-medium text-gray-900">跑步鞋</div>
          <div class="text-sm text-gray-500 mt-1">服装鞋帽 > 运动服饰</div>
          <div class="mt-2 text-xs text-yellow-600">🔄 数据生成中</div>
        </a>
        <a href="/category/食品饮料/零食/薯片" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 block">
          <div class="font-medium text-gray-900">薯片</div>
          <div class="text-sm text-gray-500 mt-1">食品饮料 > 零食</div>
          <div class="mt-2 text-xs text-gray-500">⏳ 等待处理</div>
        </a>
        <a href="/category/运动户外/健身器材/瑜伽垫" class="p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 block">
          <div class="font-medium text-gray-900">瑜伽垫</div>
          <div class="text-sm text-gray-500 mt-1">运动户外 > 健身器材</div>
          <div class="mt-2 text-xs text-gray-500">⏳ 等待处理</div>
        </a>
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
  if (!completedItems.includes(item)) {
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
  </div>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log('\n🎉 全球最佳商品百科全书 - UI定稿版本 已启动');
  console.log('==========================================');
  console.log('');
  console.log('🔗 整体网站访问链接:');
  console.log('   首页: http://localhost:' + PORT + '/');
  console.log('');
  console.log('📊 三级目录页面:');
  console.log('   - 首页显示所有已完成品类');
  console.log('   - 动态判断品类数据状态');
  console.log('');
  console.log('📱 详情页链接 (已完成数据的品类):');
  console.log('   1. http://localhost:' + PORT + '/category/个护健康/剃须用品/一次性剃须刀');
  console.log('   2. http://localhost:' + PORT + '/category/家居生活/厨房用品/不粘锅');
  console.log('   3. http://localhost:' + PORT + '/category/数码电子/手机配件/充电宝');
  console.log('');
  console.log('🚫 不可访问的品类示例:');
  console.log('   - http://localhost:' + PORT + '/category/服装鞋帽/运动服饰/跑步鞋');
  console.log('   - http://localhost:' + PORT + '/category/食品饮料/零食/薯片');
  console.log('');
  console.log('📈 实时统计API:');
  console.log('   - http://localhost:' + PORT + '/api/stats');
  console.log('');
  console.log('✅ UI定稿特点:');
  console.log('   1. 最佳评选结果单独线框');
  console.log('   2. 详细评选分析无外框 (避免线框太多)');
  console.log('   3. 字体大小优化');
  console.log('   4. 重点突出评选理由');
  console.log('   5. 统一灰色调设计');
  console.log('');
  console.log('🎯 已完成您的第1、3步要求:');
  console.log('   ✅ 1. UI界面定稿并适配所有品类详情页');
  console.log('   ✅ 3. 提供整体网站localhost链接');
  console.log('');
  console.log('⏳ 等待执行第2、4、5步:');
  console.log('   2. 开发24小时自动化数据录入程序');
  console.log('   4. 动态化详情页展示功能');
  console.log('   5. 首页统计功能实时更新');
  console.log('');
  console.log('🚀 系统已就绪，可以开始后续开发！');
});
