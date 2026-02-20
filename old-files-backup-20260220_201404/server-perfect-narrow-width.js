const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3075;

// ==========================================
// 全球最佳商品百科全书 · 完美窄宽度版
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
  
  console.log(`📊 示例数据加载: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items}`);
}

function getIcon(category) {
  const iconMap = {
    '个护健康': 'fa-heart',
    '剃须用品': 'fa-razor',
    '护肤品': 'fa-spa',
    '口腔护理': 'fa-tooth',
    '家居生活': 'fa-home',
    '厨房用品': 'fa-utensils',
    '清洁工具': 'fa-broom',
    '家具': 'fa-couch',
    '电子产品': 'fa-mobile-alt',
    '数码配件': 'fa-plug',
    '办公用品': 'fa-briefcase',
    '文具': 'fa-pen',
    '运动户外': 'fa-running',
    '健身器材': 'fa-dumbbell',
    '服装鞋帽': 'fa-tshirt',
    '男装': 'fa-user-tie',
    '女装': 'fa-user-dress',
    '食品饮料': 'fa-apple-alt',
    '零食': 'fa-cookie',
    '饮料': 'fa-wine-bottle',
    '母婴用品': 'fa-baby',
    '奶粉': 'fa-baby-carriage',
    '玩具': 'fa-gamepad',
    '汽车用品': 'fa-car',
    '保养': 'fa-oil-can',
    '配件': 'fa-cogs'
  };
  
  return iconMap[category] || 'fa-tag';
}

// 加载最佳答案数据
function loadBestAnswers() {
  BEST_ANSWERS = [
    { level1: '个护健康', level2: '剃须用品', item: '一次性剃须刀' },
    { level1: '家居生活', level2: '厨房用品', item: '不粘锅' },
    { level1: '电子产品', level2: '数码配件', item: '充电宝' }
  ];
  STATS.bestProductsCount = BEST_ANSWERS.length;
}

// 首页路由 - 参考3068宽度并进一步缩窄
app.get('/', (req, res) => {
  const { level1 = '个护健康', level2 = '剃须用品', search = '' } = req.query;
  
  // 获取当前一级目录数据
  const currentLevel1 = CATEGORY_TREE[level1] || Object.values(CATEGORY_TREE)[0];
  const level1Keys = Object.keys(CATEGORY_TREE);
  const level2Keys = Object.keys(currentLevel1.children);
  
  // 获取当前二级目录的商品
  let items = [];
  if (currentLevel1.children[level2]) {
    items = currentLevel1.children[level2].items;
  }
  
  // 搜索过滤
  let filteredItems = items;
  if (search) {
    filteredItems = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
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
    /* 参考3068宽度并进一步缩窄 - 更舒适的眼睛体验 */
    .level1-active { background-color: #fbbf24 !important; color: white !important; } /* 皇冠黄色 */
    .category-card { transition: all 0.2s ease; }
    .category-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
    /* 进一步缩窄宽度 - 参考3068并优化 */
    @media (min-width: 1024px) { .container-comfort { max-width: 1200px; } }
    @media (min-width: 1280px) { .container-comfort { max-width: 1300px; } }
    @media (min-width: 1536px) { .container-comfort { max-width: 1400px; } }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <!-- 进一步缩窄的容器 -->
  <div class="container-comfort mx-auto px-4 md:px-6 py-5">
    <!-- 顶部统计 -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">全球最佳商品百科全书</h1>
      <div class="flex flex-wrap items-center gap-4 text-gray-600">
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
    
    <!-- 一级目录 - 皇冠黄色选中框 -->
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
    
    <!-- 二级目录 -->
    <div class="mb-8">
      <div class="flex flex-wrap gap-2">
        ${level2Keys.map(l2 => `
          <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(l2)}&search=${search}" 
             class="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${level2 === l2 ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}">
            <i class="fa-solid ${currentLevel1.children[l2].icon}"></i>${l2}
            <span class="text-xs opacity-75">${currentLevel1.children[l2].items.length}个品类</span>
          </a>
        `).join('')}
      </div>
    </div>
    
    <!-- 三级商品展示模块 - 严格按照3068备份的4列布局 -->
    <div class="mb-6">
      <h4 class="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
        <i class="fa-solid ${currentLevel1.children[level2]?.icon || 'fa-tag'} text-purple-500"></i>${level2}
        <span class="text-sm font-normal text-gray-400">${filteredItems.length}个品类</span>
      </h4>
      
      <!-- 严格按照3068备份：grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        ${filteredItems.map(item => {
          const hasDetail = BEST_ANSWERS.some(answer => 
            answer.level1 === level1 && answer.level2 === level2 && answer.item === item
          );
          
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
    </div>
  </div>
  
  <script>
    // 实时更新统计
    function updateStats() {
      fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
          if (data.bestProductsCount !== undefined) {
            document.getElementById('bestProductsCount').textContent = data.bestProductsCount + '款最佳商品';
          }
          if (data.lastUpdated) {
            document.getElementById('lastUpdated').textContent = new Date(data.lastUpdated).toLocaleString('zh-CN');
          }
        })
        .catch(error => console.error('更新统计失败:', error));
    }
    
    // 每10秒更新一次
    setInterval(updateStats, 10000);
    
    // 页面加载时更新
    updateStats();
  </script>
</body>
</html>`;
  
  res.send(html);
});

// API统计接口
app.get('/api/stats', (req, res) => {
  res.json(STATS);
});

// 详情页路由 - 使用3074版本的详情页（已经优化）
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 重定向到3074的详情页（已经优化）
  res.redirect(`http://localhost:3074/category/${level1}/${level2}/${item}`);
});

// 初始化数据
loadRealData();
loadBestAnswers();

app.listen(PORT, () => {
  console.log('\n✅ 全球最佳商品百科全书 · 完美窄宽度版 已启动');
  console.log('==========================================');
  console.log('');
  console.log('🎯 参考3068宽度并进一步缩窄：');
  console.log('   1. 首页: 进一步缩窄宽度，更舒适的眼睛体验');
  console.log('   2. 详情页: 重定向到3074优化版');
  console.log('   3. 宽度设置: 参考3068并优化');
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
  console.log('');
  console.log('🎨 宽度优化对比：');
  console.log('   1. ❌ 3074版本: 1400px (1280px+) / 1500px (1536px+) - 太宽');
  console.log('   2. ✅ 新版本: 1200px (1024px+) / 1300px (1280px+) / 1400px (1536px+)');
  console.log('   3. ✅ 参考3068: 使用更舒适的宽度，眼睛不累');
  console.log('');
  console.log('🔍 宽度设置详情：');
  console.log('   1. 1024px+ (平板/小桌面): max-width: 1200px');
  console.log('   2. 1280px+ (标准桌面): max-width: 1300px');
  console.log('   3. 1536px+ (大桌面): max-width: 1400px');
  console.log('');
  console.log('🎯 其他功能保持不变：');
  console.log('   1. ✅ 一级目录选中框: 皇冠黄色 (#fbbf24)');
  console.log('   2. ✅ 三级目录布局: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
  console.log('   3. ✅ 超大屏幕 (xl): 每横栏展示4个品类');
  console.log('   4. ✅ 实时统计: 每10秒自动更新');
  console.log('   5. ✅ 搜索功能: 保留搜索');
});
