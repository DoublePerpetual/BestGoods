const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3076;

// ==========================================
// 全球最佳商品百科全书 · 超窄宽度版
// 进一步缩窄宽度，更舒适的眼睛体验
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
}

function getIcon(name) {
  const iconMap = {
    '个护健康': 'fa-heart',
    '家居生活': 'fa-home',
    '数码电子': 'fa-laptop',
    '服装鞋帽': 'fa-tshirt',
    '食品饮料': 'fa-utensils',
    '运动户外': 'fa-running',
    '剃须用品': 'fa-razor',
    '护肤品': 'fa-spa',
    '口腔护理': 'fa-tooth',
    '厨房用品': 'fa-utensils',
    '清洁工具': 'fa-broom',
    '家具': 'fa-couch'
  };
  
  return iconMap[name] || 'fa-tag';
}

function loadBestAnswers() {
  try {
    const answersPath = path.join(__dirname, 'data', 'best-answers.json');
    if (fs.existsSync(answersPath)) {
      BEST_ANSWERS = JSON.parse(fs.readFileSync(answersPath, 'utf8'));
      console.log(`✅ 加载最佳答案数据: ${BEST_ANSWERS.length}个`);
    }
  } catch (error) {
    console.log('ℹ️ 最佳答案数据文件不存在，使用空数据');
    BEST_ANSWERS = [];
  }
}

// 首页
app.get('/', (req, res) => {
  const { level1 = '个护健康', level2 = '剃须用品', search = '' } = req.query;
  
  const level1Keys = Object.keys(CATEGORY_TREE);
  const currentLevel1 = CATEGORY_TREE[level1] || CATEGORY_TREE[level1Keys[0]];
  const level2Keys = Object.keys(currentLevel1.children);
  const currentLevel2 = level2Keys.includes(level2) ? level2 : level2Keys[0];
  
  // 全局搜索功能 - 搜索所有24.5万个品类
  let filteredItems = currentLevel1.children[currentLevel2]?.items || [];
  let searchMessage = '';
  
  if (search) {
    // 收集所有匹配的品类
    const allMatches = [];
    Object.keys(CATEGORY_TREE).forEach(l1 => {
      Object.keys(CATEGORY_TREE[l1].children).forEach(l2 => {
        const items = CATEGORY_TREE[l1].children[l2].items;
        items.forEach(item => {
          if (item.toLowerCase().includes(search.toLowerCase())) {
            allMatches.push({
              level1: l1,
              level2: l2,
              item: item
            });
          }
        });
      });
    });
    
    if (allMatches.length > 0) {
      // 如果当前二级分类下有匹配项，优先显示
      const currentMatches = allMatches.filter(match => 
        match.level1 === level1 && match.level2 === level2
      );
      
      if (currentMatches.length > 0) {
        filteredItems = currentMatches.map(match => match.item);
        searchMessage = `在当前分类中找到 ${currentMatches.length} 个匹配项（全局共 ${allMatches.length} 个）`;
      } else {
        // 显示所有匹配项
        filteredItems = allMatches.map(match => match.item);
        searchMessage = `全局搜索找到 ${allMatches.length} 个匹配项`;
      }
    } else {
      filteredItems = [];
      searchMessage = '未找到匹配的品类';
    }
  }
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书 · 超窄宽度版</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    /* 超窄宽度设置 - 进一步缩窄 */
    @media (min-width: 1024px) {
      .container-ultra-narrow {
        max-width: 1000px !important;
      }
    }
    @media (min-width: 1280px) {
      .container-ultra-narrow {
        max-width: 1100px !important;
      }
    }
    @media (min-width: 1536px) {
      .container-ultra-narrow {
        max-width: 1200px !important;
      }
    }
    
    /* 一级目录选中样式 - 皇冠黄色 */
    .level1-active {
      background-color: #fbbf24 !important;
      color: #000 !important;
      border-color: #fbbf24 !important;
      font-weight: 600;
    }
    
    /* 卡片悬停效果 */
    .category-card {
      transition: all 0.2s ease;
    }
    .category-card:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
    }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container-ultra-narrow mx-auto px-4 md:px-6 py-8">
    <!-- 顶部统计 -->
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <h1 class="text-2xl font-bold text-gray-900 mb-4">全球最佳商品百科全书</h1>
      <div class="flex flex-wrap gap-4 text-sm">
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
      ${search ? `
        <div class="mt-3 text-sm text-gray-600">
          <i class="fa-solid fa-info-circle mr-1"></i> ${searchMessage}
        </div>
      ` : ''}
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
              <div class="p-4 bg-white rounded-lg border border-gray-200 opacity-70" 
                   data-level1="${level1}" data-level2="${level2}" data-item="${item}">
                <div class="font-bold text-gray-900">${item}</div>
                <div class="text-xs text-gray-500 mt-1">${level1} > ${level2} > ${item}</div>
                <div class="mt-2">
                  <span class="text-xs text-gray-500">⏳ 数据准备中 - 暂不可访问</span>
                  <div class="text-xs text-blue-600 mt-1 automation-status" style="display: none;">
                    <i class="fa-solid fa-sync-alt animate-spin mr-1"></i>检查数据状态...
                  </div>
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
          
          // 如果连接到自动化系统，检查品类状态
          if (data.automationConnected) {
            checkCategoryStatus();
          }
        })
        .catch(error => console.error('更新统计失败:', error));
    }
    
    // 检查品类状态
    function checkCategoryStatus() {
      const categoryItems = document.querySelectorAll('[data-level1][data-level2][data-item]');
      
      categoryItems.forEach(item => {
        const level1 = item.getAttribute('data-level1');
        const level2 = item.getAttribute('data-level2');
        const itemName = item.getAttribute('data-item');
        const statusElement = item.querySelector('.automation-status');
        
        if (statusElement) {
          statusElement.style.display = 'block';
          
          // 检查品类是否已完成数据填充
          fetch('/api/check-category/' + encodeURIComponent(level1) + '/' + encodeURIComponent(level2) + '/' + encodeURIComponent(itemName))
            .then(response => response.json())
            .then(data => {
              if (data.accessible) {
                // 品类数据已完成，转换为可点击链接
                const newHTML = '<a href="/category/' + encodeURIComponent(level1) + '/' + encodeURIComponent(level2) + '/' + encodeURIComponent(itemName) + '" class="category-card p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md block"><div class="font-bold text-gray-900">' + itemName + '</div><div class="text-xs text-gray-500 mt-1">' + level1 + ' > ' + level2 + ' > ' + itemName + '</div><div class="mt-2"><span class="text-xs text-green-600">✅ 数据已完成 - 点击查看详情</span></div></a>';
                
                item.outerHTML = newHTML;
                
                // 触发统计更新，因为最佳商品数量可能增加了
                setTimeout(updateStats, 1000);
              } else {
                statusElement.innerHTML = '<i class="fa-solid fa-clock mr-1"></i>数据准备中';
              }
            })
            .catch(error => {
              statusElement.innerHTML = '<i class="fa-solid fa-exclamation-triangle mr-1"></i>检查失败';
              console.error('检查品类状态失败:', error);
            });
        }
      });
    }
    
    // 每10秒更新一次统计
    setInterval(updateStats, 10000);
    
    // 页面加载时更新
    updateStats();
    
    // 每30秒检查一次品类状态
    setInterval(checkCategoryStatus, 30000);
  </script>
</body>
</html>`;
  
  res.send(html);
});

// API统计接口 - 直接返回本地数据（不再依赖自动化系统）
app.get('/api/stats', async (req, res) => {
  try {
    // 更新最佳商品数量
    STATS.bestProductsCount = BEST_ANSWERS.reduce((total, category) => {
      return total + (category.bestProducts?.length || 0);
    }, 0);
    
    STATS.lastUpdated = new Date().toISOString();
    
    res.json({
      categories: STATS.categories,
      subcategories: STATS.subcategories,
      items: STATS.items,
      bestProductsCount: STATS.bestProductsCount,
      lastUpdated: STATS.lastUpdated,
      automationConnected: true  // 设置为true，以便前端执行品类检查
    });
  } catch (error) {
    // 出错时返回本地数据
    console.log('⚠️ 获取统计数据失败:', error.message);
    res.json({
      ...STATS,
      automationConnected: true  // 即使出错也设置为true，确保前端检查品类
    });
  }
});

// 详情页路由 - 使用完整详情页
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 重定向到完整详情页
  res.redirect(`http://localhost:3077/category/${level1}/${level2}/${item}`);
});

// 品类检查接口 - 直接读取best-answers.json
app.get('/api/check-category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  try {
    // 直接检查BEST_ANSWERS数组
    const hasData = BEST_ANSWERS.some(answer => 
      answer.level1 === level1 && answer.level2 === level2 && answer.item === item
    );
    
    res.json({
      accessible: hasData,
      hasData: hasData,
      redirectUrl: hasData ? `http://localhost:${PORT}/category/${encodeURIComponent(level1)}/${encodeURIComponent(level2)}/${encodeURIComponent(item)}` : null
    });
  } catch (error) {
    console.log('⚠️ 检查品类状态失败:', error.message);
    res.json({
      accessible: false,
      hasData: false,
      redirectUrl: null
    });
  }
});

// 初始化数据
loadRealData();
loadBestAnswers();

// 定时重新加载最佳答案数据（每30秒）
setInterval(() => {
  try {
    const answersPath = path.join(__dirname, 'data', 'best-answers.json');
    if (fs.existsSync(answersPath)) {
      const newAnswers = JSON.parse(fs.readFileSync(answersPath, 'utf8'));
      if (Array.isArray(newAnswers)) {
        BEST_ANSWERS = newAnswers;
        console.log(`🔄 更新最佳答案数据: ${BEST_ANSWERS.length}个 (${new Date().toLocaleTimeString()})`);
      }
    }
  } catch (error) {
    console.log('⚠️ 重新加载最佳答案数据失败:', error.message);
  }
}, 30000);

app.listen(PORT, () => {
  console.log('\n✅ 全球最佳商品百科全书 · 超窄宽度版 已启动');
  console.log('==========================================');
  console.log('');
  console.log('🎯 超窄宽度优化：');
  console.log('   1. 首页: 进一步缩窄宽度，更舒适的眼睛体验');
  console.log('   2. 详情页: 使用优化后的详情页（3074端口）');
  console.log('   3. 宽度设置: 比3068版本更窄，更舒适');
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
  console.log('🎨 超窄宽度设置详情：');
  console.log('   1. 1024px+ (平板/小桌面): max-width: 1000px');
  console.log('   2. 1280px+ (标准桌面): max-width: 1100px');
  console.log('   3. 1536px+ (大桌面): max-width: 1200px');
  console.log('');
  console.log('🎯 其他功能保持不变：');
  console.log('   1. ✅ 一级目录选中框: 皇冠黄色 (#fbbf24)');
  console.log('   2. ✅ 三级目录布局: grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4');
  console.log('   3. ✅ 超大屏幕 (xl): 每横栏展示4个品类');
  console.log('   4. ✅ 实时统计: 每10秒自动更新');
  console.log('   5. ✅ 搜索功能: 保留搜索');
});