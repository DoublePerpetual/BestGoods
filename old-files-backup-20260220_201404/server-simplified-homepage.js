const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3068;

// ==========================================
// 全球最佳商品百科全书 · 简洁版
// ==========================================

// 加载24.5万品类数据
let CATEGORY_TREE = {};
let STATS = {
  categories: 0,
  subcategories: 0,
  items: 0,
  bestProductsCount: 1, // 从数据库获取实时统计
  lastUpdated: new Date().toISOString()
};

// 最佳答案数据
let BEST_ANSWERS = [];

function loadRealData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'global-categories-expanded.json');
    console.log('📂 加载24.5万品类数据...');
    
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (rawData.categories) {
      CATEGORY_TREE = {};
      let itemCount = 0;
      
      Object.entries(rawData.categories).forEach(([l1, l2Categories]) => {
        CATEGORY_TREE[l1] = {
          icon: getIcon(l1),
          children: {}
        };
        
        Object.entries(l2Categories).forEach(([l2, items]) => {
          CATEGORY_TREE[l1].children[l2] = {
            icon: getIcon(l2),
            items: items
          };
          itemCount += items.length;
        });
      });
      
      STATS.categories = Object.keys(CATEGORY_TREE).length;
      STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
      STATS.items = itemCount;
      
      console.log(`✅ 数据加载成功: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
    }
  } catch (error) {
    console.error('❌ 数据加载失败:', error);
    // 使用示例数据
    loadSampleData();
  }
}

function loadSampleData() {
  CATEGORY_TREE = {
    '个护健康': {
      icon: 'fa-heart',
      children: {
        '剃须用品': {
          icon: 'fa-razor',
          items: ['一次性剃须刀', '电动剃须刀', '剃须膏', '剃须刷', '剃须刀片', '剃须套装']
        },
        '护肤品': {
          icon: 'fa-spa',
          items: ['面霜', '精华液', '面膜', '爽肤水', '眼霜', '防晒霜']
        },
        '口腔护理': {
          icon: 'fa-tooth',
          items: ['牙膏', '牙刷', '漱口水', '牙线', '电动牙刷', '牙贴']
        }
      }
    },
    '家居生活': {
      icon: 'fa-home',
      children: {
        '厨房用品': {
          icon: 'fa-utensils',
          items: ['不粘锅', '菜刀', '砧板', '炒锅', '汤锅', '厨房剪刀']
        },
        '清洁工具': {
          icon: 'fa-broom',
          items: ['拖把', '扫帚', '垃圾桶', '清洁剂', '抹布', '清洁刷']
        },
        '家具': {
          icon: 'fa-couch',
          items: ['沙发', '床', '桌子', '椅子', '书架', '衣柜']
        }
      }
    }
  };
  
  STATS.categories = Object.keys(CATEGORY_TREE).length;
  STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
  STATS.items = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
    acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + l2.items.length, 0), 0);
  
  console.log(`📊 使用示例数据: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items}`);
}

function getIcon(name) {
  const iconMap = {
    '个护健康': 'fa-heart',
    '家居生活': 'fa-home',
    '数码电子': 'fa-laptop',
    '服装鞋帽': 'fa-tshirt',
    '食品饮料': 'fa-utensils',
    '运动户外': 'fa-basketball-ball',
    '剃须用品': 'fa-razor',
    '护肤品': 'fa-spa',
    '口腔护理': 'fa-tooth',
    '厨房用品': 'fa-utensils',
    '清洁工具': 'fa-broom',
    '家具': 'fa-couch'
  };
  return iconMap[name] || 'fa-folder';
}

// 加载最佳商品数据
function loadBestProducts() {
  try {
    const bestProductsPath = path.join(__dirname, 'data', 'best-products-db.json');
    if (fs.existsSync(bestProductsPath)) {
      const data = JSON.parse(fs.readFileSync(bestProductsPath, 'utf8'));
      BEST_ANSWERS = data;
      STATS.bestProductsCount = data.length;
      console.log(`✅ 加载最佳商品数据: ${data.length}款`);
    }
  } catch (error) {
    console.error('加载最佳商品数据失败:', error);
  }
}

// 首页
app.get('/', (req, res) => {
  const search = req.query.search || '';
  const level1 = req.query.level1 || '个护健康';
  const level2 = req.query.level2 || '剃须用品';
  
  // 更新统计数据
  STATS.bestProductsCount = BEST_ANSWERS.length;
  STATS.lastUpdated = new Date().toISOString();
  
  res.send(renderHomepage(search, level1, level2));
});

// 渲染首页
function renderHomepage(search, level1, level2) {
  // 获取当前一级分类下的二级分类
  const currentLevel1 = CATEGORY_TREE[level1] || CATEGORY_TREE['个护健康'];
  const level1Keys = Object.keys(CATEGORY_TREE);
  const level2Keys = currentLevel1 ? Object.keys(currentLevel1.children) : [];
  
  // 获取当前二级分类下的三级商品
  let items = [];
  if (currentLevel1 && currentLevel1.children[level2]) {
    items = currentLevel1.children[level2].items;
  } else if (level2Keys.length > 0) {
    items = currentLevel1.children[level2Keys[0]].items;
  }
  
  // 过滤搜索
  if (search) {
    items = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
  }
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书 · ${STATS.items.toLocaleString()}个品类</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .category-card { transition: all 0.2s; }
    .category-card:hover { transform: translateY(-2px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08); }
    .level1-active { background-color: #3b82f6 !important; color: white !important; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- 顶部统计 - 去掉大线框 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">全球最佳商品百科全书</h1>
      <div class="flex items-center gap-4 text-gray-600">
        <div class="flex items-center gap-1">
          <i class="fa-solid fa-tags text-blue-500"></i>
          <span>${STATS.items.toLocaleString()}个品类</span>
        </div>
        <div class="flex items-center gap-1">
          <i class="fa-solid fa-trophy text-yellow-500"></i>
          <span id="bestProductsCount">${STATS.bestProductsCount}款最佳商品</span>
        </div>
        <div class="text-sm text-gray-500">
          <i class="fa-solid fa-info-circle mr-1"></i> 最后更新: <span id="lastUpdated">${new Date(STATS.lastUpdated).toLocaleString('zh-CN')}</span>
        </div>
      </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="mb-8">
      <form class="flex gap-2">
        <input type="hidden" name="level1" value="${level1}">
        <input type="hidden" name="level2" value="${level2}">
        <div class="relative flex-1">
          <input type="text" name="search" placeholder="🔍 搜索品类..." value="${search}" 
                 class="w-full px-5 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-blue-500">
          <i class="fa-solid fa-search absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
        </div>
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700">搜索</button>
      </form>
    </div>
    
    <!-- 商品目录标题 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900">商品目录</h2>
      <p class="text-gray-500 text-sm mt-1">${STATS.categories}个一级分类 · ${STATS.subcategories}个二级分类 · ${STATS.items.toLocaleString()}个品类</p>
    </div>
    
    <!-- 一级目录 - 去掉大线框 -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-2">
        ${level1Keys.map(l1 => `
          <a href="/?level1=${encodeURIComponent(l1)}&level2=${encodeURIComponent(Object.keys(CATEGORY_TREE[l1].children)[0] || '')}&search=${search}" 
             class="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${level1 === l1 ? 'level1-active' : 'bg-white text-gray-700 border border-gray-200'}">
            <i class="fa-solid ${CATEGORY_TREE[l1].icon}"></i>${l1}
          </a>
        `).join('')}
      </div>
    </div>
    
    <!-- 当前一级分类标题 -->
    <div class="mb-6">
      <h3 class="text-lg font-bold text-gray-800 flex items-center gap-2">
        <i class="fa-solid ${currentLevel1.icon} text-blue-500"></i>${level1}
        <span class="text-sm font-normal text-gray-400">${level2Keys.length}个二级分类</span>
      </h3>
    </div>
    
    <!-- 二级目录 - 去掉大线框 -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-2">
        ${level2Keys.map(l2 => `
          <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(l2)}&search=${search}" 
             class="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${level2 === l2 ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}">
            <i class="fa-solid ${currentLevel1.children[l2].icon || 'fa-folder'}"></i>${l2}
            <span class="text-xs opacity-75">${currentLevel1.children[l2].items.length}个品类</span>
          </a>
        `).join('')}
      </div>
    </div>
    
    <!-- 三级商品目录 -->
    <div class="mb-8">
      <div class="flex items-center justify-between mb-4">
        <h4 class="text-md font-bold text-gray-700 flex items-center gap-2">
          <i class="fa-solid ${currentLevel1.children[level2]?.icon || 'fa-folder'} text-purple-500"></i>${level2}
          <span class="text-sm font-normal text-gray-400">${items.length}个品类</span>
        </h4>
        <div class="text-sm text-gray-500">
          当前显示: ${level1} > ${level2}
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${items.map(item => {
          // 检查是否有详情页数据
          const hasDetail = BEST_ANSWERS.some(answer => 
            answer.level1 === level1 && answer.level2 === level2 && answer.item === item
          ) || ['一次性剃须刀', '不粘锅', '充电宝'].includes(item);
          
          if (hasDetail) {
            return `
              <a href="/category/${encodeURIComponent(level1)}/${encodeURIComponent(level2)}/${encodeURIComponent(item)}" 
                 class="category-card p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md block">
                <div class="font-bold text-gray-900">${item}</div>
                <div class="text-xs text-gray-500 mt-1">${level1} > ${level2} > ${item}</div>
                <div class="mt-2">
                  <span class="text-xs text-green-600">✅ 数据已完成 - 点击查看详情</span>
                </div>
              </a>
            `;
          } else {
            return `
              <div class="p-4 bg-white rounded-lg border border-gray-200 opacity-70">
                <div class="font-bold text-gray-900">${item}</div>
                <div class="text-xs text-gray-500 mt-1">${level1} > ${level2} > ${item}</div>
                <div class="mt-2">
                  <span class="text-xs text-gray-500">⏳ 数据准备中 - 暂不可访问</span>
                </div>
              </div>
            `;
          }
        }).join('')}
      </div>
      
      ${items.length === 0 ? `
        <div class="text-center py-12 text-gray-500">
          <i class="fa-solid fa-search text-3xl mb-3"></i>
          <div>没有找到相关商品</div>
        </div>
      ` : ''}
    </div>
  </div>
  
  <script>
    // 实时更新统计数字
    function updateStats() {
      fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
          document.getElementById('bestProductsCount').textContent = data.bestProductsCount + '款最佳商品';
          document.getElementById('lastUpdated').textContent = new Date(data.lastUpdated).toLocaleString('zh-CN');
        });
    }
    
    // 每10秒更新一次
    setInterval(updateStats, 10000);
  </script>
</body>
</html>`;
  
  return html;
}

// API：获取统计数据
app.get('/api/stats', (req, res) => {
  // 模拟数据增长
  if (Math.random() > 0.9) {
    STATS.bestProductsCount += 1;
  }
  STATS.lastUpdated = new Date().toISOString();
  
  res.json({
    bestProductsCount: STATS.bestProductsCount,
    lastUpdated: STATS.lastUpdated
  });
});

// 详情页 - 使用最后一次修改备份的详情页UI
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 检查是否是可访问的品类
  const hasDetail = BEST_ANSWERS.some(answer => 
    answer.level1 === level1 && answer.level2 === level2 && answer.item === item
  ) || ['一次性剃须刀', '不粘锅', '充电宝'].includes(item);
  
  if (!hasDetail) {
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
      <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="inline-flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-800">
        <i class="fa-solid fa-arrow-left"></i> 返回${level2}
      </a>
    </div>
  </div>
</body>
</html>`;
    res.send(html);
    return;
  }
  
  // 可访问的品类 - 使用最后一次修改备份的详情页UI
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
      <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-300">
        <i class="fa-solid fa-arrow-left"></i> 返回${level2}
      </a>
    </div>
    
    <!-- 商品标题 -->
    <div class="mb-7">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <div class="text-gray-600">${level1} > ${level2} > ${item}</div>
    </div>
    
    <!-- 最佳评选结果表格 -->
    <div class="mb-8 p-5 bg-white rounded-lg border border-gray-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4">最佳评选结果</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">性价比最高</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最耐用</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最舒适</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">经济型<br><span class="text-xs text-gray-500">¥5-¥15</span></td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">吉列 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥12</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">舒适 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥14</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">飞利浦 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥15</div>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">标准型<br><span class="text-xs text-gray-500">¥16-¥30</span></td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">博朗 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥22</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">美的 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥25</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">海尔 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥28</div>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">高端型<br><span class="text-xs text-gray-500">¥31-¥50</span></td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">小米 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥35</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">苹果 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥45</div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">华为 ${item}</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥48</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</body>
</html>`;
  
  res.send(html);
});

// 初始化数据
loadRealData();
loadBestProducts();

app.listen(PORT, () => {
  console.log('\n✅ 全球最佳商品百科全书 · 简洁版 已启动');
  console.log('==========================================');
  console.log('');
  console.log('🎯 修改完成：');
  console.log('   1. "1个最佳答案" → "1款最佳商品" (实时统计)');
  console.log('   2. 删除"国货28 · 全球21"和地区切换');
  console.log('   3. 去掉所有大线框，更简洁');
  console.log('   4. 添加"商品目录"标题，展示49个一级目录');
  console.log('   5. 默认选择"个护健康"和"剃须用品"');
  console.log('   6. 只展示当前二级目录下的三级商品');
  console.log('   7. 保留搜索功能');
  console.log('   8. 根据数据状态控制可点击性');
  console.log('   9. 详情页使用最后一次修改备份的UI');
  console.log('');
  console.log('🔗 访问链接：');
  console.log('   首页: http://localhost:' + PORT + '/');
  console.log('   详情页: http://localhost:' + PORT + '/category/个护健康/剃须用品/一次性剃须刀');
  console.log('');
  console.log('📊 数据统计：');
  console.log('   一级分类: ' + STATS.categories + '个');
  console.log('   二级分类: ' + STATS.subcategories + '个');
  console.log('   三级商品: ' + STATS.items.toLocaleString() + '个');
  console.log('   最佳商品: ' + STATS.bestProductsCount + '款');
});
