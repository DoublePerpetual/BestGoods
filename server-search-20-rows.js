const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3028;

// ==========================================
// 全球最佳商品百科全书 · 全局搜索版本
// ==========================================

// ==========================================
// 1. 加载24.5万品类数据
// ==========================================
let CATEGORY_TREE = {};
let STATS = {
  categories: 0,
  subcategories: 0,
  items: 0,
  answers: 0,
  china: 0,
  global: 0,
  lastUpdated: new Date().toISOString()
};

// 所有商品列表（用于全局搜索）
let ALL_ITEMS = [];

function loadRealData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'global-categories-expanded.json');
    console.log('📂 加载24.5万品类数据...');
    
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (rawData.categories) {
      // 转换为3019格式
      CATEGORY_TREE = {};
      let chinaCount = 0;
      let globalCount = 0;
      
      Object.entries(rawData.categories).forEach(([l1, l2Categories]) => {
        // 随机分配地区
        const region = Math.random() > 0.5 ? 'china' : 'global';
        if (region === 'china') chinaCount++;
        else globalCount++;
        
        CATEGORY_TREE[l1] = {
          icon: getIcon(l1),
          region: region,
          children: {}
        };
        
        Object.entries(l2Categories).forEach(([l2, l3Items]) => {
          if (Array.isArray(l3Items)) {
            CATEGORY_TREE[l1].children[l2] = {
              icon: getIcon(l2),
              dimensions: getDimensions(l1, l2),
              items: l3Items
            };
            
            // 添加到所有商品列表（用于全局搜索）
            l3Items.forEach(item => {
              ALL_ITEMS.push({
                level1: l1,
                level2: l2,
                item: item,
                l1Icon: CATEGORY_TREE[l1].icon,
                l2Icon: getIcon(l2),
                dimensions: getDimensions(l1, l2),
                region: region
              });
            });
          }
        });
      });
      
      // 更新统计
      STATS.categories = Object.keys(CATEGORY_TREE).length;
      STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
      STATS.items = ALL_ITEMS.length;
      STATS.china = chinaCount;
      STATS.global = globalCount;
      
      console.log(`✅ 数据加载成功: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
    }
  } catch (error) {
    console.error('❌ 数据加载失败:', error.message);
    loadDefaultData();
  }
}

function getIcon(name) {
  const icons = {
    '个护': 'fa-user', '健康': 'fa-heart',
    '数码': 'fa-microchip', '电子': 'fa-microchip',
    '家用': 'fa-house-chimney', '电器': 'fa-plug',
    '家居': 'fa-couch', '生活': 'fa-home',
    '服装': 'fa-shirt', '鞋帽': 'fa-shoe-prints',
    '美妆': 'fa-spa', '护肤': 'fa-spa',
    '食品': 'fa-utensils', '饮料': 'fa-wine-bottle',
    '运动': 'fa-person-running', '户外': 'fa-mountain',
    '母婴': 'fa-baby', '用品': 'fa-box',
    '宠物': 'fa-paw',
    '汽车': 'fa-car',
    '办公': 'fa-briefcase', '文具': 'fa-pen',
    '图书': 'fa-book', '音像': 'fa-music',
    '玩具': 'fa-gamepad', '游戏': 'fa-gamepad',
    '珠宝': 'fa-gem', '首饰': 'fa-gem',
    '钟表': 'fa-clock', '眼镜': 'fa-glasses',
    '箱包': 'fa-bag-shopping', '皮具': 'fa-bag-shopping',
    '建材': 'fa-hammer',
    '农资': 'fa-tractor', '农具': 'fa-tractor'
  };
  
  for (const [key, icon] of Object.entries(icons)) {
    if (name.includes(key)) return icon;
  }
  return 'fa-box';
}

function getDimensions(l1, l2) {
  const dimMap = {
    '数码': ['性能最强', '性价比最高', '设计最美', '功能最全'],
    '家电': ['最节能', '最静音', '功能最全', '性价比最高'],
    '美妆': ['效果最好', '最温和', '性价比最高', '口碑最好'],
    '服装': ['最舒适', '最耐穿', '设计最美', '性价比最高'],
    '食品': ['口感最好', '最健康', '最新鲜', '性价比最高'],
    '个护': ['效果最好', '最温和', '最耐用', '性价比最高']
  };
  
  for (const [key, dims] of Object.entries(dimMap)) {
    if (l1.includes(key) || l2.includes(key)) return dims;
  }
  return ['质量最好', '性价比最高', '口碑最好', '最实用'];
}

function loadDefaultData() {
  CATEGORY_TREE = {
    "数码电子": {
      icon: "fa-microchip",
      region: "global",
      children: {
        "智能手机": {
          icon: "fa-mobile",
          dimensions: ["性能最强", "拍照最好", "续航最长", "充电最快"],
          items: ["5G手机", "游戏手机", "拍照手机"]
        }
      }
    }
  };
  ALL_ITEMS = [
    { level1: "数码电子", level2: "智能手机", item: "5G手机", l1Icon: "fa-microchip", l2Icon: "fa-mobile", dimensions: ["性能最强", "拍照最好", "续航最长", "充电最快"], region: "global" },
    { level1: "数码电子", level2: "智能手机", item: "游戏手机", l1Icon: "fa-microchip", l2Icon: "fa-mobile", dimensions: ["性能最强", "拍照最好", "续航最长", "充电最快"], region: "global" },
    { level1: "数码电子", level2: "智能手机", item: "拍照手机", l1Icon: "fa-microchip", l2Icon: "fa-mobile", dimensions: ["性能最强", "拍照最好", "续航最长", "充电最快"], region: "global" }
  ];
  STATS.categories = 1;
  STATS.subcategories = 1;
  STATS.items = 3;
  STATS.china = 0;
  STATS.global = 1;
}

// ==========================================
// 2. 最佳答案库
// ==========================================
const BEST_ANSWERS = [
  {
    id: 1,
    level1: "数码电子",
    level2: "智能手机",
    item: "5G手机",
    dimension: "性能最强",
    price: 4999,
    brand: "小米",
    product: "小米 14 Ultra",
    reason: "搭载第三代骁龙8处理器，LPDDR5X内存，UFS4.0闪存，安兔兔跑分突破220万。环形冷泵散热系统，游戏帧率稳定。同价位性能表现最强。",
    evidence: "安兔兔跑分榜TOP1",
    region: "global"
  }
];

// ==========================================
// 3. 全局搜索功能
// ==========================================
function performGlobalSearch(searchTerm, region = 'all') {
  if (!searchTerm || searchTerm.trim() === '') return [];
  
  const searchLower = searchTerm.toLowerCase().trim();
  
  return ALL_ITEMS.filter(item => {
    // 地区过滤
    if (region !== 'all' && item.region !== region) return false;
    
    // 全局搜索：搜索一级分类、二级分类、三级商品名称
    return (
      item.level1.toLowerCase().includes(searchLower) ||
      item.level2.toLowerCase().includes(searchLower) ||
      item.item.toLowerCase().includes(searchLower)
    );
  });
}

// ==========================================
// 4. 首页 - 全局搜索版本
// ==========================================
app.get('/', (req, res) => {
  const region = req.query.region || 'all';
  const search = req.query.search || '';
  const level1 = req.query.level1 || 'all';
  const level2 = req.query.level2 || 'all';
  const page = parseInt(req.query.page) || 1;
  
  STATS.answers = BEST_ANSWERS.length;
  
  res.send(renderGlobalSearch(region, search, level1, level2, page));
});

// 渲染全局搜索视图
function renderGlobalSearch(region, search, level1, level2, page) {
  let html = `<!DOCTYPE html>
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
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <i class="fa-solid fa-trophy text-yellow-500"></i>全球最佳商品百科全书
            <span class="text-sm font-normal text-gray-400 bg-gray-100 px-3 py-1 rounded-full">${STATS.items.toLocaleString()}个品类 · ${STATS.answers}个最佳答案</span>
          </h1>
          <p class="text-gray-500 mt-1"><i class="fa-solid fa-tags text-blue-500"></i> 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()} · 国货${STATS.china} · 全球${STATS.global}</p>
        </div>
        <div class="flex gap-2">
          <!-- 只保留地区切换 -->
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?region=all&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'all' ? 'bg-white shadow' : 'text-gray-600'}">全部</a>
            <a href="/?region=global&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'global' ? 'bg-white shadow' : 'text-gray-600'}">全球</a>
            <a href="/?region=china&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'china' ? 'bg-white shadow' : 'text-gray-600'}">中国</a>
          </div>
        </div>
      </div>
      
      <form class="flex gap-2 mt-4">
        <input type="hidden" name="region" value="${region}">
        <input type="hidden" name="level1" value="${level1}">
        <input type="hidden" name="level2" value="${level2}">
        <input type="text" name="search" placeholder="🔍 全局搜索24.5万品类..." value="${search}" class="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500">
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">搜索</button>
      </form>
      
      <!-- 搜索提示 -->
      ${search ? `
        <div class="mt-3 text-sm text-gray-600 bg-blue-50 p-3 rounded-lg">
          <i class="fa-solid fa-info-circle text-blue-500"></i> 正在对 <span class="font-medium">24.5万</span> 个品类进行全局搜索，搜索结果：<span class="font-medium">${performGlobalSearch(search, region).length}</span> 个匹配项
        </div>
      ` : ''}
      
      <!-- 一级目录导航 -->
      <div class="flex flex-wrap gap-2 mt-4">
        <a href="/?region=${region}&search=${search}&level1=all&level2=all" 
           class="px-4 py-2 rounded-full text-sm font-medium ${level1 === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}">
          全部一级
        </a>
        ${Object.keys(CATEGORY_TREE).map(l1 => {
          const catData = CATEGORY_TREE[l1];
          if (region !== 'all' && catData.region !== region) return '';
          return `
            <a href="/?region=${region}&search=${search}&level1=${l1}&level2=all" 
               class="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${level1 === l1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}">
              <i class="fa-solid ${catData.icon}"></i>${l1}
            </a>
          `;
        }).join('')}
      </div>
      
      <!-- 二级目录导航 -->
      ${level1 !== 'all' && CATEGORY_TREE[level1] ? `
        <div class="flex flex-wrap gap-2 mt-3 pl-2 border-l-4 border-purple-500">
          <a href="/?region=${region}&search=${search}&level1=${level1}&level2=all" 
             class="px-3 py-1.5 rounded-full text-xs font-medium ${level2 === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}">
            全部二级
          </a>
          ${Object.keys(CATEGORY_TREE[level1].children).map(l2 => {
            const subData = CATEGORY_TREE[level1].children[l2];
            return `
              <a href="/?region=${region}&search=${search}&level1=${level1}&level2=${l2}" 
                 class="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${level2 === l2 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}">
                <i class="fa-solid ${subData.icon || 'fa-folder'}"></i>${l2}
              </a>
            `;
          }).join('')}
        </div>
      ` : ''}
    </div>
    
    <!-- 内容区域 -->
    ${renderContent(region, search, level1, level2, page)}
  </div>
</body>
</html>`;
  
  return html;
}

// 渲染内容
function renderContent(region, search, level1, level2, page) {
  let html = '';
  
  // 如果有搜索词，显示全局搜索结果
  if (search) {
    html = renderGlobalSearchResults(region, search, page);
  } else if (level1 === 'all') {
    // 全部一级 - 智能分页：每页1个二级目录
    html = renderAllLevel1SmartPagination(region, search, page);
  } else if (level1 !== 'all' && level2 === 'all') {
    // 全部二级 - 智能分页：每页1个二级目录
    html = renderAllLevel2SmartPagination(level1, region, search, page);
  } else if (level1 !== 'all' && level2 !== 'all') {
    // 具体二级分类 - 显示所有三级商品
    html = renderAllLevel3(level1, level2, region, search);
  }
  
  return html;
}

// 渲染全局搜索结果
function renderGlobalSearchResults(region, search, page) {
  const itemsPerPage = 20; // 每页20行 // 每页20个搜索结果
  const searchResults = performGlobalSearch(search, region);
  const totalPages = Math.ceil(searchResults.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const pageResults = searchResults.slice(startIndex, startIndex + itemsPerPage);
  
  if (searchResults.length === 0) {
    return `
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
        <i class="fa-solid fa-search text-gray-300 text-4xl mb-4"></i>
        <h3 class="text-lg font-bold text-gray-700 mb-2">没有找到匹配的品类</h3>
        <p class="text-gray-500">在24.5万个品类中没有找到包含"${search}"的匹配项</p>
        <p class="text-sm text-gray-400 mt-2">尝试使用其他关键词或查看所有分类</p>
      </div>
    `;
  }
  
  let html = '<div class="space-y-8">';
  
  html += `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <i class="fa-solid fa-search text-blue-500"></i>全局搜索结果
              <span class="text-sm font-normal text-gray-400">${searchResults.length}个匹配项</span>
            </h2>
            <p class="text-sm text-gray-500 mt-1">搜索关键词："${search}" · 第 ${page} 页，共 ${totalPages} 页</p>
          </div>
          <div class="text-sm text-gray-600">
            在24.5万个品类中搜索
          </div>
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  `;
  
  // 显示搜索结果
  pageResults.forEach(item => {
    const hasAnswers = BEST_ANSWERS.some(a => a.level1 === item.level1 && a.level2 === item.level2 && a.item === item.item);
    
    html += `
      <div onclick="location.href='/category/${encodeURIComponent(item.level1)}/${encodeURIComponent(item.level2)}/${encodeURIComponent(item.item)}'" 
           class="category-card bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${item.dimensions?.length || 0}个维度</span>
          ${hasAnswers ? '<span class="text-xs text-green-600">有答案</span>' : '<span class="text-xs text-gray-400">暂无答案</span>'}
        </div>
        <h4 class="font-bold text-gray-900">${item.item}</h4>
        <p class="text-xs text-gray-500 mt-1">
          <span class="text-blue-600">${item.level1}</span> → <span class="text-purple-600">${item.level2}</span>
        </p>
        <div class="mt-2 flex flex-wrap gap-1">
          ${(item.dimensions || []).slice(0, 2).map(d => `<span class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">${d}</span>`).join('')}
        </div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
    </div>
  </div>
  `;
  
  // 添加分页
  if (totalPages > 1) {
    html += renderPagination(page, totalPages, region, search, 'all', 'all', searchResults.length, '搜索结果');
  }
  
  return html;
}

// 渲染全部一级的智能分页 - 每页1个二级目录
function renderAllLevel1SmartPagination(region, search, page) {
  const itemsPerPage = 1; // 每页只展示1个二级目录
  const allLevel2 = Object.values(CATEGORY_TREE).flatMap(l1Data => 
    Object.keys(l1Data.children).map(l2 => ({
      level1: Object.keys(CATEGORY_TREE).find(key => CATEGORY_TREE[key] === l1Data),
      level2: l2,
      l1Data: l1Data,
      l2Data: l1Data.children[l2]
    }))
  ).filter(item => {
    if (region !== 'all' && item.l1Data.region !== region) return false;
    return true;
  });
  
  const totalPages = Math.ceil(allLevel2.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentItem = allLevel2[startIndex];
  
  if (!currentItem) {
    return '<div class="text-center py-8 text-gray-500">没有找到匹配的分类</div>';
  }
  
  // 过滤搜索
  let items = currentItem.l2Data.items;
  if (search) {
    items = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
  }
  
  let html = '<div class="space-y-8">';
  
  html += `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <i class="fa-solid ${currentItem.l1Data.icon} text-blue-500"></i>${currentItem.level1}
              <span class="text-sm font-normal text-gray-400">→</span>
              <i class="fa-solid ${currentItem.l2Data.icon || 'fa-folder'} text-purple-500"></i>${currentItem.level2}
            </h2>
            <p class="text-sm text-gray-500 mt-1">第 ${page} 页，共 ${totalPages} 页 · 当前展示：${currentItem.level2}（${items.length}个商品）</p>
          </div>
          <div class="text-sm text-gray-600">
            二级分类 ${startIndex + 1} / ${allLevel2.length}
          </div>
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  `;
  
  // 显示当前二级目录下的所有三级商品
  items.forEach(item => {
    const hasAnswers = BEST_ANSWERS.some(a => a.level1 === currentItem.level1 && a.level2 === currentItem.level2 && a.item === item);
    
    html += `
      <div onclick="location.href='/category/${encodeURIComponent(currentItem.level1)}/${encodeURIComponent(currentItem.level2)}/${encodeURIComponent(item)}'" 
           class="category-card bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${currentItem.l2Data.dimensions?.length || 0}个维度</span>
          ${hasAnswers ? '<span class="text-xs text-green-600">有答案</span>' : '<span class="text-xs text-gray-400">暂无答案</span>'}
        </div>
        <h4 class="font-bold text-gray-900">${item}</h4>
        <p class="text-xs text-gray-500 mt-1">${currentItem.level2} - ${item}</p>
        <div class="mt-2 flex flex-wrap gap-1">
          ${(currentItem.l2Data.dimensions || []).slice(0, 2).map(d => `<span class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">${d}</span>`).join('')}
        </div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
    </div>
  </div>
  `;
  
  // 添加智能分页
  html += renderPagination(page, totalPages, region, search, 'all', 'all', allLevel2.length, '二级分类');
  
  return html;
}

// 渲染全部二级的智能分页 - 每页1个二级目录
function renderAllLevel2SmartPagination(level1, region, search, page) {
  const itemsPerPage = 1; // 每页只展示1个二级目录
  const l1Data = CATEGORY_TREE[level1];
  if (!l1Data) return '<div class="text-center py-8 text-gray-500">分类不存在</div>';
  
  const allLevel2 = Object.keys(l1Data.children);
  const totalPages = Math.ceil(allLevel2.length / itemsPerPage);
  const startIndex = (page - 1) * itemsPerPage;
  const currentLevel2 = allLevel2[startIndex];
  
  if (!currentLevel2) {
    return '<div class="text-center py-8 text-gray-500">没有找到匹配的分类</div>';
  }
  
  const l2Data = l1Data.children[currentLevel2];
  
  // 过滤搜索
  let items = l2Data.items;
  if (search) {
    items = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
  }
  
  let html = '<div class="space-y-8">';
  
  html += `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
              <i class="fa-solid ${l1Data.icon} text-blue-500"></i>${level1}
              <span class="text-sm font-normal text-gray-400">→</span>
              <i class="fa-solid ${l2Data.icon || 'fa-folder'} text-purple-500"></i>${currentLevel2}
            </h2>
            <p class="text-sm text-gray-500 mt-1">第 ${page} 页，共 ${totalPages} 页 · 当前展示：${currentLevel2}（${items.length}个商品）</p>
          </div>
          <div class="text-sm text-gray-600">
            二级分类 ${startIndex + 1} / ${allLevel2.length}
          </div>
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  `;
  
  // 显示当前二级目录下的所有三级商品
  items.forEach(item => {
    const hasAnswers = BEST_ANSWERS.some(a => a.level1 === level1 && a.level2 === currentLevel2 && a.item === item);
    
    html += `
      <div onclick="location.href='/category/${encodeURIComponent(level1)}/${encodeURIComponent(currentLevel2)}/${encodeURIComponent(item)}'" 
           class="category-card bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${l2Data.dimensions?.length || 0}个维度</span>
          ${hasAnswers ? '<span class="text-xs text-green-600">有答案</span>' : '<span class="text-xs text-gray-400">暂无答案</span>'}
        </div>
        <h4 class="font-bold text-gray-900">${item}</h4>
        <p class="text-xs text-gray-500 mt-1">${currentLevel2} - ${item}</p>
        <div class="mt-2 flex flex-wrap gap-1">
          ${(l2Data.dimensions || []).slice(0, 2).map(d => `<span class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">${d}</span>`).join('')}
        </div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
    </div>
  </div>
  `;
  
  // 添加智能分页
  html += renderPagination(page, totalPages, region, search, level1, 'all', allLevel2.length, '二级分类');
  
  return html;
}

// 渲染所有三级分类
function renderAllLevel3(level1, level2, region, search) {
  const l2Data = CATEGORY_TREE[level1]?.children[level2];
  if (!l2Data) return '<div class="text-center py-8 text-gray-500">分类不存在</div>';
  
  // 过滤搜索
  let items = l2Data.items;
  if (search) {
    items = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
  }
  
  let html = '<div class="space-y-8">';
  
  html += `
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
          <i class="fa-solid ${l2Data.icon || 'fa-folder'} text-purple-500"></i>${level2}
          <span class="text-sm font-normal text-gray-400">${items.length}个商品</span>
        </h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  `;
  
  // 显示所有三级商品
  items.forEach(item => {
    const hasAnswers = BEST_ANSWERS.some(a => a.level1 === level1 && a.level2 === level2 && a.item === item);
    
    html += `
      <div onclick="location.href='/category/${encodeURIComponent(level1)}/${encodeURIComponent(level2)}/${encodeURIComponent(item)}'" 
           class="category-card bg-white rounded-xl p-4 border border-gray-100 cursor-pointer hover:shadow-md">
        <div class="flex justify-between items-start mb-2">
          <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${l2Data.dimensions?.length || 0}个维度</span>
          ${hasAnswers ? '<span class="text-xs text-green-600">有答案</span>' : '<span class="text-xs text-gray-400">暂无答案</span>'}
        </div>
        <h4 class="font-bold text-gray-900">${item}</h4>
        <p class="text-xs text-gray-500 mt-1">${level2} - ${item}</p>
        <div class="mt-2 flex flex-wrap gap-1">
          ${(l2Data.dimensions || []).slice(0, 2).map(d => `<span class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">${d}</span>`).join('')}
        </div>
      </div>
    `;
  });
  
  html += `
        </div>
      </div>
    </div>
  </div>
  `;
  
  return html;
}

// 渲染分页组件
function renderPagination(currentPage, totalPages, region, search, level1, level2, totalItems, itemType) {
  return `
    <div class="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div class="flex items-center justify-between">
        <div class="text-sm text-gray-700">
          第 <span class="font-medium">${currentPage}</span> 页，共 <span class="font-medium">${totalPages}</span> 页 · 共 ${totalItems} 个${itemType}
        </div>
        <div class="flex gap-1">
          ${currentPage > 1 ? `
            <a href="/?region=${region}&search=${encodeURIComponent(search)}&level1=${level1}&level2=${level2}&page=${currentPage-1}" 
               class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              上一页
            </a>
          ` : ''}
          
          ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
            const pageNum = i + Math.max(1, currentPage - 2);
            if (pageNum > totalPages) return '';
            
            if (pageNum === currentPage) {
              return `<span class="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">${pageNum}</span>`;
            } else {
              return `<a href="/?region=${region}&search=${encodeURIComponent(search)}&level1=${level1}&level2=${level2}&page=${pageNum}" 
                       class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">${pageNum}</a>`;
            }
          }).join('')}
          
          ${currentPage < totalPages ? `
            <a href="/?region=${region}&search=${encodeURIComponent(search)}&level1=${level1}&level2=${level2}&page=${currentPage+1}" 
               class="               class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
              下一页
            </a>
          ` : ''}
        </div>
      </div>
    </div>
  `;
}

// ==========================================
// 5. 详情页路由
// ==========================================
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  const answers = BEST_ANSWERS.filter(a => 
    a.level1 === level1 && a.level2 === level2 && a.item === item
  );
  
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${item} · 详情</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="max-w-4xl mx-auto p-4">
    <div class="mb-4">
      <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="text-blue-600">← 返回</a>
    </div>
    
    <div class="bg-white rounded-lg shadow p-6">
      <div class="flex gap-2 mb-4">
        <span class="px-3 py-1 bg-blue-100 text-blue-800 rounded-full">${level1}</span>
        <span class="px-3 py-1 bg-purple-100 text-purple-800 rounded-full">${level2}</span>
      </div>
      
      <h1 class="text-3xl font-bold mb-4">${item}</h1>
      
      ${answers.length > 0 ? `
        <div class="mt-6">
          <h2 class="text-xl font-bold mb-4">最佳答案</h2>
          ${answers.map(a => `
            <div class="border rounded-lg p-4 mb-4">
              <span class="text-sm font-bold text-blue-600">🏆 最佳${a.dimension}</span>
              <h3 class="text-lg font-bold mt-2">${a.product}</h3>
              <p class="text-gray-600">${a.brand} · ¥${a.price}</p>
              <p class="mt-2">${a.reason}</p>
            </div>
          `).join('')}
        </div>
      ` : `
        <div class="text-center py-8 text-gray-500">
          <p>暂无最佳答案</p>
        </div>
      `}
    </div>
  </div>
</body>
</html>`);
});

// ==========================================
// 6. 启动服务器
// ==========================================
loadRealData();

app.listen(PORT, () => {
  console.log(`\n🚀 全球最佳商品百科全书 · 全局搜索版本 已启动`);
  console.log(`📊 数据统计: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}/`);
  console.log(`🎯 全局搜索功能:`);
  console.log(`   - 无论用户在哪个页面搜索，都视为对24.5万品类进行全局搜索`);
  console.log(`   - 搜索范围: 一级分类、二级分类、三级商品名称`);
  console.log(`   - 搜索结果: 显示匹配的分类路径和商品信息`);
  console.log(`   - 智能分页: 搜索结果分页显示，每页20个`);
});
