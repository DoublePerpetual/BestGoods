const express = require('express');
const DataImporterFixed = require('./dataImporter-fixed');
const app = express();
const PORT = 3020;

// ==========================================
// 全球最佳商品百科全书 · 三级目录完整版
// ==========================================

// ==========================================
// 1. 全局统计信息
// ==========================================
let STATS = {
  level1: 0,          // 一级分类数
  level2: 0,          // 二级分类数  
  level3: 0,          // 三级分类数
  items: 0,           // 商品总数
  answers: 0,         // 最佳答案数
  lastUpdated: new Date().toISOString()
};

// ==========================================
// 2. 数据导入器
// ==========================================
const dataImporter = new DataImporterFixed();
let CATEGORY_TREE = {};
let MASSIVE_DATA_LOADED = false;

// 加载数据
function loadData() {
  console.log('🚀 开始加载19万多品类数据...');
  
  try {
    const success = dataImporter.loadMassiveCategories();
    
    if (success) {
      const threeLevelData = dataImporter.convertToThreeLevelFormat();
      CATEGORY_TREE = threeLevelData.level1;
      
      // 更新统计
      STATS.level1 = Object.keys(CATEGORY_TREE).length;
      STATS.level2 = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
      STATS.level3 = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
        acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
      STATS.items = STATS.level3; // 三级分类就是商品
      
      MASSIVE_DATA_LOADED = true;
      
      console.log('✅ 19万多品类数据加载成功！');
      console.log(`📊 三级目录统计: 一级${STATS.level1} · 二级${STATS.level2} · 三级${STATS.level3}`);
      
      // 保存转换后的数据
      dataImporter.saveConvertedData({
        level1: CATEGORY_TREE,
        stats: STATS,
        metadata: {
          source: '19万品类扩展数据',
          totalOriginalL3: dataImporter.stats.totalL3,
          conversionDate: new Date().toISOString()
        }
      });
    } else {
      console.log('⚠️  使用默认数据');
      loadDefaultData();
    }
  } catch (error) {
    console.error('❌ 数据加载失败:', error.message);
    loadDefaultData();
  }
}

// 加载默认数据
function loadDefaultData() {
  CATEGORY_TREE = {
    "数码电子": {
      icon: "fa-microchip",
      region: "global",
      children: {
        "智能手机": {
          icon: "fa-mobile",
          dimensions: ["性能最强", "拍照最好", "续航最长", "充电最快"],
          items: [
            { name: "5G手机", description: "最新5G智能手机", priceRange: "1000-5000元", rating: 4.5 },
            { name: "游戏手机", description: "专业游戏性能手机", priceRange: "2000-8000元", rating: 4.3 },
            { name: "拍照手机", description: "专业摄影手机", priceRange: "3000-10000元", rating: 4.7 }
          ]
        },
        "笔记本电脑": {
          icon: "fa-laptop",
          dimensions: ["性能最强", "屏幕最好", "续航最长", "最轻薄"],
          items: [
            { name: "轻薄本", description: "超轻薄便携笔记本", priceRange: "4000-12000元", rating: 4.4 },
            { name: "游戏本", description: "高性能游戏笔记本", priceRange: "6000-20000元", rating: 4.6 }
          ]
        }
      }
    },
    "家用电器": {
      icon: "fa-house-chimney",
      region: "global",
      children: {
        "冰箱": {
          icon: "fa-thermometer-half",
          dimensions: ["保鲜最好", "最节能", "最静音", "空间利用最好"],
          items: [
            { name: "对开门冰箱", description: "大容量对开门冰箱", priceRange: "3000-15000元", rating: 4.5 },
            { name: "十字门冰箱", description: "四门十字对开冰箱", priceRange: "4000-20000元", rating: 4.6 }
          ]
        }
      }
    }
  };
  
  STATS.level1 = Object.keys(CATEGORY_TREE).length;
  STATS.level2 = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
  STATS.level3 = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
    acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
  STATS.items = STATS.level3;
}

// ==========================================
// 3. 最佳答案库
// ==========================================
const BEST_ANSWERS = [
  {
    id: 1,
    level1: "数码电子",
    level2: "智能手机",
    level3: "5G手机",
    dimension: "性能最强",
    price: 4999,
    brand: "小米",
    product: "小米 14 Ultra",
    reason: "搭载第三代骁龙8处理器，LPDDR5X内存，UFS4.0闪存，安兔兔跑分突破220万。环形冷泵散热系统，游戏帧率稳定。同价位性能表现最强。",
    evidence: "安兔兔跑分榜TOP1"
  }
];

// ==========================================
// 4. 首页 - 三级目录折叠式展示
// ==========================================
app.get('/', (req, res) => {
  const view = req.query.view || 'grid'; // grid: 卡片折叠式, list: 列表分页式
  const region = req.query.region || 'all';
  const search = req.query.search || '';
  const level1 = req.query.level1 || '';
  const level2 = req.query.level2 || '';
  const page = parseInt(req.query.page) || 1;
  const pageSize = 50; // 每页显示50条
  
  // 更新统计
  STATS.answers = BEST_ANSWERS.length;
  
  if (view === 'grid') {
    // 卡片折叠式展示
    res.send(renderGridPage(level1, level2, region, search));
  } else {
    // 列表分页式展示
    res.send(renderListPage(page, pageSize, region, search));
  }
});

// 渲染卡片折叠式页面
function renderGridPage(level1, level2, region, search) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书 · 三级目录完整版 · ${STATS.level3.toLocaleString()}个品类</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .category-card { transition: all 0.2s; }
    .category-card:hover { transform: translateY(-2px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08); }
    .level1-section { border: 1px solid #e5e7eb; border-radius: 0.75rem; overflow: hidden; }
    .level2-section { border-left: 4px solid #8b5cf6; background: #fafafa; }
    .level3-item { border-bottom: 1px solid #f1f5f9; transition: all 0.2s; }
    .level3-item:hover { background: #f8fafc; }
    .collapsible { max-height: 0; overflow: hidden; transition: max-height 0.3s ease-out; }
    .collapsible.open { max-height: 5000px; }
    .badge-19w { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- 头部统计 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fa-solid fa-sitemap text-blue-500"></i>全球最佳商品百科全书 · 三级目录完整版
            </h1>
            ${MASSIVE_DATA_LOADED ? '<span class="badge-19w text-white px-3 py-1 rounded-full text-sm font-bold">19万+品类数据库</span>' : ''}
          </div>
          <p class="text-gray-500 mt-1">
            <i class="fa-solid fa-layer-group text-blue-500"></i> 
            一级${STATS.level1} · 二级${STATS.level2} · 三级${STATS.level3.toLocaleString()} · 
            最佳答案${STATS.answers}
          </p>
          ${MASSIVE_DATA_LOADED ? '<p class="text-green-600 text-sm mt-1"><i class="fa-solid fa-database"></i> 基于19万多品类扩展数据构建</p>' : ''}
        </div>
        <div class="flex gap-2">
          <!-- 视图切换 -->
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=grid&region=${region}&search=${search}" class="px-3 py-1.5 rounded-md text-sm ${view === 'grid' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-grid-2"></i> 卡片折叠
            </a>
            <a href="/?view=list&region=${region}&search=${search}" class="px-3 py-1.5 rounded-md text-sm ${view === 'list' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-list"></i> 列表分页
            </a>
          </div>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <form class="flex gap-2 mt-4">
        <input type="hidden" name="view" value="grid">
        <input type="hidden" name="region" value="${region}">
        <input type="text" name="search" placeholder="🔍 在${STATS.level3.toLocaleString()}个品类中搜索..." value="${search}" 
               class="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500">
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">搜索</button>
      </form>
      
      <!-- 面包屑导航 -->
      ${renderBreadcrumb(level1, level2)}
    </div>
    
    <!-- 三级目录内容 -->
    ${renderThreeLevelContent(level1, level2, search)}
  </div>
  
  <script>
    // 折叠展开功能
    function toggleCollapse(elementId) {
      const element = document.getElementById(elementId);
      element.classList.toggle('open');
      
      const icon = document.getElementById('icon-' + elementId);
      if (element.classList.contains('open')) {
        icon.className = 'fa-solid fa-chevron-up';
      } else {
        icon.className = 'fa-solid fa-chevron-down';
      }
    }
    
    // 点击一级分类
    function selectLevel1(level1) {
      window.location.href = '/?view=grid&level1=' + encodeURIComponent(level1);
    }
    
    // 点击二级分类
    function selectLevel2(level1, level2) {
      window.location.href = '/?view=grid&level1=' + encodeURIComponent(level1) + '&level2=' + encodeURIComponent(level2);
    }
    
    // 点击三级分类
    function selectLevel3(level1, level2, level3) {
      window.location.href = '/category/' + encodeURIComponent(level1) + '/' + encodeURIComponent(level2) + '/' + encodeURIComponent(level3);
    }
  </script>
</body>
</html>`;
  
  return html;
}

// 渲染面包屑导航
function renderBreadcrumb(level1, level2) {
  if (!level1 && !level2) {
    return '<div class="text-sm text-gray-500 mt-2">当前位置: 全部一级分类</div>';
  }
  
  let breadcrumb = '<div class="flex items-center gap-2 text-sm mt-2">';
  breadcrumb += '<span class="text-gray-500">当前位置:</span>';
  breadcrumb += '<a href="/?view=grid" class="text-blue-600 hover:text-blue-800">全部一级</a>';
  
  if (level1) {
    breadcrumb += '<i class="fa-solid fa-chevron-right text-gray-400 text-xs"></i>';
    breadcrumb += `<a href="/?view=grid&level1=${encodeURIComponent(level1)}" class="text-blue-600 hover:text-blue-800">${level1}</a>`;
  }
  
  if (level2) {
    breadcrumb += '<i class="fa-solid fa-chevron-right text-gray-400 text-xs"></i>';
    breadcrumb += `<span class="text-gray-700">${level2}</span>`;
  }
  
  breadcrumb += '</div>';
  return breadcrumb;
}

// 渲染三级目录内容
function renderThreeLevelContent(level1, level2, search) {
  let html = '';
  
  if (!level1) {
    // 显示所有一级分类
    html = '<div class="space-y-6">';
    html += '<h2 class="text-2xl font-bold text-gray-800 mb-4">🏷️ 全部一级分类</h2>';
    html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">';
    
    Object.entries(CATEGORY_TREE).forEach(([l1, l1Data]) => {
      const l2Count = Object.keys(l1Data.children).length;
      const l3Count = Object.values(l1Data.children).reduce((acc, l2) => acc + (l2.items?.length || 0), 0);
      
      html += `
        <div onclick="selectLevel1('${l1}')" class="category-card bg-white rounded-xl p-5 border border-gray-100 cursor-pointer">
          <div class="flex items-center gap-3 mb-3">
            <i class="fa-solid ${l1Data.icon} text-blue-500 text-xl"></i>
            <h3 class="text-lg font-bold text-gray-900">${l1}</h3>
          </div>
          <div class="text-sm text-gray-600">
            <div class="flex justify-between mb-1">
              <span>二级分类:</span>
              <span class="font-medium">${l2Count}个</span>
            </div>
            <div class="flex justify-between">
              <span>三级品类:</span>
              <span class="font-medium">${l3Count}个</span>
            </div>
          </div>
          <div class="mt-4 text-center">
            <button class="px-4 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm hover:bg-blue-100">
              查看详情 <i class="fa-solid fa-arrow-right ml-1"></i>
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
    
  } else if (level1 && !level2) {
    // 显示指定一级分类下的所有二级分类
    const l1Data = CATEGORY_TREE[level1];
    if (!l1Data) return '<div class="text-center py-8 text-gray-500">一级分类不存在</div>';
    
    html = `<div class="space-y-6">
      <div class="flex items-center justify-between">
        <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <i class="fa-solid ${l1Data.icon} text-blue-500"></i>${level1}
          <span class="text-sm font-normal text-gray-400">${Object.keys(l1Data.children).length}个二级分类</span>
        </h2>
        <a href="/?view=grid" class="text-sm text-blue-600 hover:text-blue-800">
          <i class="fa-solid fa-arrow-left mr-1"></i>返回一级
        </a>
      </div>`;
    
    html += '<div class="space-y-4">';
    
    Object.entries(l1Data.children).forEach(([l2, l2Data]) => {
      const l3Count = l2Data.items?.length || 0;
      const collapsedId = `collapse-${l2.replace(/[^a-zA-Z0-9]/g, '-')}`;
      
      // 过滤三级分类（如果搜索）
      let filteredItems = l2Data.items || [];
      if (search) {
        filteredItems = filteredItems.filter(item => {
          const itemName = typeof item === 'object' ? item.name : item;
          return itemName.toLowerCase().includes(search.toLowerCase());
        });
      }
      
      if (filteredItems.length === 0 && search) return '';
      
      html += `
        <div class="level1-section bg-white">
          <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center cursor-pointer" 
               onclick="toggleCollapse('${collapsedId}')">
            <div class="flex items-center gap-3">
              <i class="fa-solid ${l2Data.icon || 'fa-folder'} text-purple-500"></i>
              <div>
                <h3 class="font-bold text-gray-900">${l2}</h3>
                <p class="text-sm text-gray-500">${l3Count}个三级品类 · ${l2Data.dimensions?.length || 0}个评测维度</p>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <button onclick="event.stopPropagation(); selectLevel2('${level1}', '${l2}')" 
                      class="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm hover:bg-purple-100">
                查看全部
              </button>
              <i id="icon-${collapsedId}" class="fa-solid fa-chevron-down text-gray-400"></i>
            </div>
          </div>
          
          <div id="${collapsedId}" class="collapsible">
            <div class="p-4">
              ${filteredItems.length > 0 ? `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  ${filteredItems.slice(0, 12).map(item => {
                    const itemName = typeof item === 'object' ? item.name : item;
                    const itemDesc = typeof item === 'object' ? item.description : `${l2} - ${item}`;
                    const priceRange = typeof item === 'object' ? item.priceRange : '价格待定';
                    const rating = typeof item === 'object' ? item.rating : 4.0;
                    
                    return `
                      <div onclick="selectLevel3('${level1}', '${l2}', '${itemName}')" 
                           class="level3-item p-3 rounded-lg border border-gray-100 cursor-pointer hover:bg-gray-50">
                        <div class="flex justify-between items-start mb-1">
                          <h4 class="font-medium text-gray-900">${itemName}</h4>
                          <span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">${priceRange}</span>
                        </div>
                        <p class="text-xs text-gray-500 mb-2">${itemDesc.substring(0, 40)}...</p>
                        <div class="flex justify-between items-center">
                          <span class="text-xs text-yellow-600">⭐ ${rating.toFixed(1)}</span>
                          <span class="text-xs text-gray-400">点击查看详情</span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
                ${filteredItems.length > 12 ? `
                  <div class="mt-4 text-center">
                    <span class="text-sm text-gray-500">还有 ${filteredItems.length - 12} 个品类未显示</span>
                  </div>
                ` : ''}
              ` : `
                <div class="text-center py-4 text-gray-500">
                  <i class="fa-solid fa-box-open text-2xl mb-2"></i>
                  <p>暂无三级品类数据</p>
                </div>
              `}
            </div>
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
    
  } else if (level1 && level2) {
    // 显示指定二级分类下的所有三级分类
    const l1Data = CATEGORY_TREE[level1];
    const l2Data = l1Data?.children[level2];
    if (!l2Data) return '<div class="text-center py-8 text-gray-500">二级分类不存在</div>';
    
    let filteredItems = l2Data.items || [];
    if (search) {
      filteredItems = filteredItems.filter(item => {
        const itemName = typeof item === 'object' ? item.name : item;
        return itemName.toLowerCase().includes(search.toLowerCase());
      });
    }
    
    html = `<div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <div class="flex items-center gap-2 text-sm text-gray-500 mb-1">
            <a href="/?view=grid" class="text-blue-600 hover:text-blue-800">全部一级</a>
            <i class="fa-solid fa-chevron-right"></i>
            <a href="/?view=grid&level1=${encodeURIComponent(level1)}" class="text-blue-600 hover:text-blue-800">${level1}</a>
            <i class="fa-solid fa-chevron-right"></i>
            <span class="text-gray-700">${level2}</span>
          </div>
          <h2 class="text-2xl font-bold text-gray-800 flex items-center gap-3">
            <i class="fa-solid ${l2Data.icon || 'fa-folder'} text-purple-500"></i>${level2}
            <span class="text-sm font-normal text-gray-400">${filteredItems.length}个三级品类</span>
          </h2>
        </div>
        <a href="/?view=grid&level1=${encodeURIComponent(level1)}" class="text-sm text-blue-600 hover:text-blue-800">
          <i class="fa-solid fa-arrow-left mr-1"></i>返回二级
        </a>
      </div>
      
      <!-- 评测维度 -->
      <div class="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4">
        <h3 class="font-bold text-gray-900 mb-2">🏆 评测维度</h3>
        <div class="flex flex-wrap gap-2">
          ${(l2Data.dimensions || []).map(d => `
            <span class="px-3 py-1.5 bg-white text-purple-700 rounded-full text-sm border border-purple-200">${d}</span>
          `).join('')}
        </div>
      </div>
      
      <!-- 三级品类列表 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
    `;
    
    filteredItems.forEach(item => {
      const itemName = typeof item === 'object' ? item.name : item;
      const itemDesc = typeof item === 'object' ? item.description : `${level2} - ${item}`;
      const priceRange = typeof item === 'object' ? item.priceRange : '价格待定';
      const rating = typeof item === 'object' ? item.rating : 4.0;
      
      html += `
        <div onclick="selectLevel3('${level1}', '${level2}', '${itemName}')" 
             class="category-card bg-white rounded-xl p-4 border border-gray-100 cursor-pointer">
          <div class="flex justify-between items-start mb-2">
            <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${priceRange}</span>
            <span class="text-xs text-yellow-600">⭐ ${rating.toFixed(1)}</span>
          </div>
          <h4 class="font-bold text-gray-900 mb-1">${itemName}</h4>
          <p class="text-xs text-gray-500 mb-3">${itemDesc.substring(0, 50)}...</p>
          <div class="text-center">
            <button class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 w-full">
              查看详情
            </button>
          </div>
        </div>
      `;
    });
    
    html += '</div></div>';
  }
  
  if (html === '') {
    html = '<div class="text-center py-12 text-gray-500">';
    html += '<i class="fa-solid fa-search text-3xl mb-4"></i>';
    html += '<h3 class="text-lg font-bold text-gray-700 mb-2">未找到匹配的内容</h3>';
    html += '<p>尝试调整搜索关键词或选择其他分类</p>';
    html += '</div>';
  }
  
  return html;
}

// 渲染列表分页式页面
function renderListPage(page, pageSize, region, search) {
  // 收集所有三级分类
  let allItems = [];
  
  Object.entries(CATEGORY_TREE).forEach(([l1, l1Data]) => {
    if (region !== 'all' && l1Data.region !== region) return;
    
    Object.entries(l1Data.children).forEach(([l2, l2Data]) => {
      (l2Data.items || []).forEach(item => {
        const itemName = typeof item === 'object' ? item.name : item;
        if (search && !itemName.toLowerCase().includes(search.toLowerCase())) return;
        
        allItems.push({
          level1: l1,
          level2: l2,
          level3: itemName,
          l1Icon: l1Data.icon,
          l2Icon: l2Data.icon || 'fa-folder',
          priceRange: typeof item === 'object' ? item.priceRange : '价格待定',
          rating: typeof item === 'object' ? item.rating : 4.0,
          description: typeof item === 'object' ? item.description : `${l2} - ${itemName}`
        });
      });
    });
  });
  
  // 分页计算
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);
  const pageItems = allItems.slice(startIndex, endIndex);
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书 · 列表分页 · 第${page}页/${totalPages}页</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .list-row { border-bottom: 1px solid #e5e7eb; transition: all 0.2s; }
    .list-row:hover { background-color: #f9fafb; }
    .pagination-btn { transition: all 0.2s; }
    .pagination-btn:hover { transform: translateY(-1px); }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <!-- 头部 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i class="fa-solid fa-list text-blue-500"></i>列表分页浏览
          </h1>
          <p class="text-gray-500 mt-1">
            共 ${totalItems.toLocaleString()} 个三级品类 · 第 ${page}/${totalPages} 页 · 每页 ${pageSize} 条
          </p>
        </div>
        <div class="flex gap-2">
          <a href="/?view=grid" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            <i class="fa-solid fa-grid-2 mr-1"></i>卡片视图
          </a>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <form class="flex gap-2 mt-4">
        <input type="hidden" name="view" value="list">
        <input type="hidden" name="region" value="${region}">
        <input type="text" name="search" placeholder="🔍 搜索三级品类..." value="${search}" 
               class="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500">
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">搜索</button>
      </form>
    </div>
    
    <!-- 列表内容 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">三级品类</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">分类路径</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评分</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
  `;
  
  pageItems.forEach((item, index) => {
    html += `
            <tr class="list-row">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="font-medium text-gray-900">${item.level3}</div>
                <div class="text-sm text-gray-500">${item.description.substring(0, 60)}...</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-1 text-sm">
                  <i class="fa-solid ${item.l1Icon} text-blue-500"></i>
                  <span>${item.level1}</span>
                  <i class="fa-solid fa-chevron-right text-xs text-gray-400"></i>
                  <i class="fa-solid ${item.l2Icon} text-purple-500"></i>
                  <span>${item.level2}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">${item.priceRange}</span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center">
                  <span class="text-yellow-500 mr-1">⭐</span>
                  <span>${item.rating.toFixed(1)}</span>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button onclick="location.href='/category/${encodeURIComponent(item.level1)}/${encodeURIComponent(item.level2)}/${encodeURIComponent(item.level3)}'" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  查看详情
                </button>
              </td>
            </tr>
    `;
  });
  
  html += `
          </tbody>
        </table>
      </div>
      
      <!-- 分页 -->
      ${renderPagination(page, totalPages, search, region)}
    </div>
  </div>
  
  <script>
    function goToPage(pageNum) {
      const url = new URL(window.location.href);
      url.searchParams.set('page', pageNum);
      window.location.href = url.toString();
    }
  </script>
</body>
</html>`;
  
  return html;
}

// 渲染分页组件
function renderPagination(currentPage, totalPages, search, region) {
  if (totalPages <= 1) return '';
  
  let html = '<div class="px-6 py-4 border-t border-gray-200">';
  html += '<div class="flex items-center justify-between">';
  html += '<div class="text-sm text-gray-700">';
  html += `第 <span class="font-medium">${currentPage}</span> 页，共 <span class="font-medium">${totalPages}</span> 页`;
  html += '</div>';
  
  html += '<div class="flex gap-1">';
  
  // 上一页
  if (currentPage > 1) {
    html += `<button onclick="goToPage(${currentPage - 1})" 
            class="pagination-btn px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            <i class="fa-solid fa-chevron-left mr-1"></i>上一页
          </button>`;
  }
  
  // 页码
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);
  
  for (let i = startPage; i <= endPage; i++) {
    if (i === currentPage) {
      html += `<span class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">${i}</span>`;
    } else {
      html += `<button onclick="goToPage(${i})" 
              class="pagination-btn px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">${i}</button>`;
    }
  }
  
  // 下一页
  if (currentPage < totalPages) {
    html += `<button onclick="goToPage(${currentPage + 1})" 
            class="pagination-btn px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
            下一页<i class="fa-solid fa-chevron-right ml-1"></i>
          </button>`;
  }
  
  html += '</div></div></div>';
  return html;
}

// ==========================================
// 5. 品类详情页
// ==========================================
app.get('/category/:level1/:level2/:level3', (req, res) => {
  const { level1, level2, level3 } = req.params;
  
  // 查找商品
  const l1Data = CATEGORY_TREE[level1];
  const l2Data = l1Data?.children[level2];
  let itemData = null;
  
  if (l2Data?.items) {
    itemData = l2Data.items.find(item => {
      const itemName = typeof item === 'object' ? item.name : item;
      return itemName === level3;
    });
  }
  
  if (!itemData) {
    return res.status(404).send('品类不存在');
  }
  
  const itemName = typeof itemData === 'object' ? itemData.name : level3;
  const itemDesc = typeof itemData === 'object' ? itemData.description : `${level2} - ${level3}`;
  const priceRange = typeof itemData === 'object' ? itemData.priceRange : '价格待定';
  const rating = typeof itemData === 'object' ? itemData.rating : 4.0;
  
  const answers = BEST_ANSWERS.filter(a => 
    a.level1 === level1 && a.level2 === level2 && a.level3 === level3
  );
  
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${itemName} · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
