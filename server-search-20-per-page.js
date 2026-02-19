const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3037;

// ==========================================
// 全球最佳商品百科全书 · 搜索结果每页20行
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
// 4. 首页 - 搜索结果每页20行
// ==========================================
app.get('/', (req, res) => {
  const region = req.query.region || 'all';
  const search = req.query.search || '';
  const level1 = req.query.level1 || 'all';
  const level2 = req.query.level2 || 'all';
  const page = parseInt(req.query.page) || 1;
  
  STATS.answers = BEST_ANSWERS.length;
  
  res.send(renderSearchResults20PerPage(region, search, level1, level2, page));
});

// 渲染搜索结果每页20行视图
function renderSearchResults20PerPage(region, search, level1, level2, page) {
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
          <i class="fa-solid fa-info-circle text-blue-500"></i> 正在对 <span class="font-medium">24.5万</span> 个品类进行全局搜索，搜索结果：<span class="font-medium">${performGlobalSearch(search, region).length}</span> 个匹配项 · 每页显示 <span class="font-medium">20</span> 行
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
  
  // 如果有搜索词，显示全局搜索结果（每页20行）
  if (search) {
    html = renderGlobalSearchResults20PerPage(region, search, page);
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

// 渲染全局搜索结果 - 每页20行
function renderGlobalSearchResults20PerPage(region, search, page) {
  const itemsPerPage = 20; // 每页20行
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
            <p class="text-sm text-gray-500 mt-1">搜索关键词："${search}" · 第 ${page} 页，共 ${totalPages} 页 · 每页显示 <span class="font-medium">20</span> 行</p>
          </div>
          <div class="text-sm text-gray-600">
            在24.5万个品类中搜索
          </div>
        </div>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  `;
  
  // 显示搜索结果 - 每页20行
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
               class="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">
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
  
  // 模拟数据（实际应该从数据库加载）
  const priceIntervals = [
    { id: "p1", name: "经济型 (¥5-¥15)", min: 5, max: 15, description: "适合预算有限用户", targetUsers: "学生、旅行者", marketShare: "40%" },
    { id: "p2", name: "标准型 (¥16-¥30)", min: 16, max: 30, description: "性价比最高区间", targetUsers: "上班族、日常用户", marketShare: "45%" },
    { id: "p3", name: "高端型 (¥31-¥50)", min: 31, max: 50, description: "高品质体验", targetUsers: "商务人士", marketShare: "12%" },
    { id: "p4", name: "豪华型 (¥51+)", min: 51, max: 100, description: "顶级配置", targetUsers: "高端用户", marketShare: "3%" }
  ];
  
  const evaluationDimensions = {
    "p1": [
      { id: "d1", name: "性价比最高", description: "价格最低但功能齐全", weight: 50, criteria: ["单支价格", "刀片数量", "基础功能"] },
      { id: "d2", name: "最耐用", description: "使用寿命长", weight: 30, criteria: ["刀片材质", "使用次数", "防锈处理"] },
      { id: "d3", name: "最安全", description: "防刮伤设计", weight: 20, criteria: ["安全设计", "刀片保护", "手柄防滑"] }
    ],
    "p2": [
      { id: "d4", name: "最舒适", description: "剃须体验最顺滑", weight: 40, criteria: ["润滑条质量", "刀头灵活性", "皮肤贴合度"] },
      { id: "d5", name: "剃净度最高", description: "剃须最干净", weight: 35, criteria: ["刀片锋利度", "多层刀片", "剃净测试"] },
      { id: "d6", name: "设计最佳", description: "人体工学设计", weight: 25, criteria: ["手柄设计", "重量平衡", "防滑处理"] }
    ]
  };
  
  const bestProducts = {
    "p1": {
      "d1": { product: "吉列蓝II剃须刀", brand: "吉列", price: 8.5, rating: 4.3, reasons: ["价格最低的吉列正品", "2层刀片设计", "5支装适合家庭使用"] },
      "d2": { product: "舒适X3经济装", brand: "舒适", price: 12.0, rating: 4.5, reasons: ["3层刀片设计", "Hydrate润滑技术", "刀片寿命较长"] }
    },
    "p2": {
      "d4": { product: "吉列锋隐5剃须刀", brand: "吉列", price: 25.0, rating: 4.8, reasons: ["5层刀片设计", "FlexBall刀头技术", "润滑条含维生素E"] }
    }
  };
  
  // 模拟投票和评论数据
  const voteData = { likes: 128, dislikes: 12, userVote: null };
  const comments = [
    { id: 1, user: "张三", content: "吉列蓝II确实性价比很高，适合学生党使用", time: "2小时前", likes: 24 },
    { id: 2, user: "王五", content: "舒适X3的润滑技术确实不错，皮肤不刺激", time: "5小时前", likes: 18 },
    { id: 3, user: "赵六", content: "锋隐5虽然贵点，但体验真的好很多", time: "1天前", likes: 32 }
  ];
  
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 详情 · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .price-card { border-left: 4px solid #10b981; transition: all 0.3s; }
    .price-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.12); }
    .dimension-card { border-left: 4px solid #3b82f6; background: #f8fafc; }
    .product-card { border: 2px solid #fbbf24; background: #fffbeb; }
    .vote-btn.active { background-color: #3b82f6; color: white; }
    .vote-btn.dislike.active { background-color: #ef4444; }
    .comment-card:hover { background-color: #f9fafb; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div class="mb-6">
      <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" 
         class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
        <i class="fa-solid fa-arrow-left"></i> 返回 ${level2} 分类
      </a>
    </div>
    
    <!-- 商品标题 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <i class="fa-solid fa-tags mr-1"></i>${level1}
        </span>
        <span class="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          <i class="fa-solid fa-folder mr-1"></i>${level2}
        </span>
      </div>
      
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item}</h1>
      <p class="text-gray-600 mb-6">在"${level2}"分类下的详细商品分析和推荐</p>
      
      <!-- 点赞点踩 -->
      <div class="flex items-center gap-4 border-t border-gray-100 pt-4">
        <div class="flex items-center gap-2">
          <button class="vote-btn like-btn px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 ${voteData.userVote === 'like' ? 'active' : ''}"
                  onclick="handleVote('like')">
            <i class="fa-solid fa-thumbs-up mr-2"></i>赞同
          </button>
          <span class="font-bold text-gray-700" id="like-count">${voteData.likes}</span>
        </div>
        <div class="flex items-center gap-2">
          <button class="vote-btn dislike-btn px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 ${voteData.userVote === 'dislike' ? 'active dislike active' : ''}"
                  onclick="handleVote('dislike')">
            <i class="fa-solid fa-thumbs-down mr-2"></i>反对
          </button>
          <span class="font-bold text-gray-700" id="dislike-count">${voteData.dislikes}</span>
        </div>
      </div>
    </div>
    
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧内容 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 价格区间 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-money-bill-wave text-green-500"></i>价格区间分析
            <span class="text-sm font-normal text-gray-400">${priceIntervals.length}个价格区间</span>
          </h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${priceIntervals.map(interval => `
              <div class="price-card bg-white rounded-lg border border-gray-200 p-4">
                <div class="flex justify-between items-start mb-2">
                  <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">${interval.name.split(' ')[0]}</span>
                  <span class="text-sm font-bold">¥${interval.min}-${interval.max}</span>
                </div>
                <p class="text-gray-600 text-sm mb-3">${interval.description}</p>
                <div class="text-xs text-gray-500">
                  <div class="flex justify-between">
                    <span>目标用户:</span>
                    <span class="font-medium">${interval.targetUsers}</span>
                  </div>
                  <div class="flex justify-between mt-1">
                    <span>市场份额:</span>
                    <span class="font-medium">${interval.marketShare}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
        
        <!-- 最佳商品推荐 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-trophy text-yellow-500"></i>最佳商品推荐
            <span class="text-sm font-normal text-gray-400">基于不同维度的评选</span>
          </h2>
          
          <div class="space-y-6">
            ${Object.entries(bestProducts).map(([priceId, dimensions]) => {
              const priceInterval = priceIntervals.find(p => p.id === priceId);
              return Object.entries(dimensions).map(([dimId, product]) => {
                const dimension = evaluationDimensions[priceId]?.find(d => d.id === dimId);
                return `
                  <div class="product-card rounded-lg p-5">
                    <div class="flex flex-wrap justify-between items-start mb-4">
                      <div>
                        <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                          🏆 最佳${dimension?.name || '商品'}
                        </span>
                        <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                          ${priceInterval?.name || ''}
                        </span>
                      </div>
                      <div class="text-right">
                        <div class="text-2xl font-bold text-gray-900">¥${product.price}</div>
                        <div class="text-sm text-gray-500">${product.brand}</div>
                      </div>
                    </div>
                    
                    <h3 class="text-lg font-bold text-gray-900 mb-3">${product.product}</h3>
                    <div class="flex items-center mb-4">
                      <i class="fa-solid fa-star text-yellow-500 mr-1"></i>
                      <span class="font-bold">${product.rating}</span>
                      <span class="text-gray-500 text-sm ml-1">(高评分)</span>
                    </div>
                    
                    <div class="mb-4">
                      <h4 class="text-sm font-bold text-gray-700 mb-2">评选理由</h4>
                      <ul class="space-y-2">
                        ${product.reasons.map(reason => `
                          <li class="flex items-start gap-2 text-sm text-gray-600">
                            <i class="fa-solid fa-check text-green-500 mt-0.5"></i>
                            <span>${reason}</span>
                          </li>
                        `).join('')}
                      </ul>
                    </div>
                    
                    <div class="flex items-center justify-between border-t border-gray-100 pt-4">
                      <button class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
                        <i class="fa-solid fa-cart-shopping mr-1"></i>查看购买
                      </button>
                      <button class="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm">
                        <i class="fa-solid fa-share mr-1"></i>分享推荐
                      </button>
                    </div>
                  </div>
                `;
              }).join('');
            }).join('')}
          </div>
        </div>
        
        <!-- 评论区域 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-comments text-blue-500"></i>用户评论
            <span class="text-sm font-normal text-gray-400">${comments.length}条评论</span>
          </h2>
          
          <!-- 发表评论 -->
          <div class="mb-6">
            <textarea id="comment-input" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                      rows="3" 
                      placeholder="分享你的使用经验或看法..."></textarea>
            <div class="flex justify-end mt-3">
              <button onclick="submitComment()" 
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                发表评论
              </button>
            </div>
          </div>
          
          <!-- 评论列表 -->
          <div class="space-y-6">
            ${comments.map(comment => `
              <div class="comment-card pb-6 border-b border-gray-100 last:border-0">
                <div class="flex items-start gap-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    ${comment.user.charAt(0)}
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between">
                      <span class="font-bold text-gray-900">${comment.user}</span>
                      <span class="text-gray-500 text-sm">${comment.time}</span>
                    </div>
                    <p class="text-gray-700 mt-2">${comment.content}</p>
                    <div class="flex items-center gap-4 mt-3">
                      <button class="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm">
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${comment.likes}</span>
                      </button>
                      <button class="text-gray-500 hover:text-gray-700 text-sm">
                        <i class="fa-solid fa-reply mr-1"></i>回复
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <!-- 右侧栏 -->
      <div class="space-y-6">
        <!-- 评测维度 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-chart-bar text-purple-500"></i>评测维度
          </h3>
          <div class="space-y-3">
            ${Object.entries(evaluationDimensions).slice(0, 2).map(([priceId, dims]) => 
              dims.map(dim => `
                <div class="dimension-card rounded-r p-3">
                  <div class="flex justify-between items-start mb-1">
                    <span class="font-medium text-gray-900">${dim.name}</span>
                    <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">权重 ${dim.weight}%</span>
                  </div>
                  <p class="text-xs text-gray-600 mb-2">${dim.description}</p>
                  <div class="text-xs text-gray-500">
                    <div class="font-medium mb-1">评价标准:</div>
                    <div class="flex flex-wrap gap-1">
                      ${dim.criteria.map(criteria => `
                        <span class="px-2 py-0.5 bg-white border border-gray-200 rounded">${criteria}</span>
                      `).join('')}
                    </div>
                  </div>
                </div>
              `).join('')
            ).join('')}
          </div>
        </div>
        
        <!-- 统计信息 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-chart-pie text-orange-500"></i>数据统计
          </h3>
          <div class="space-y-3">
            <div class="flex justify-between items-center">
              <span class="text-gray-600">商品热度</span>
              <span class="font-bold text-gray-900">🔥 8.5/10</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">价格竞争力</span>
              <span class="font-bold text-green-600">★★★★☆</span>
            </div>
            <div class="flex justify-between items-center">
              <span class="text-gray-600">用户满意度</span>
              <span class="font-bold text-blue-600">92%</span>
            </div>
          </div>
        </div>
        
        <!-- 购买建议 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-lightbulb text-yellow-500"></i>购买建议
          </h3>
          <ul class="space-y-2 text-sm text-gray-600">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-green-500 mt-0.5"></i>
              <span>根据预算选择合适的价格区间</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-green-500 mt-0.5"></i>
              <span>关注评测维度，选择最看重的特性</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-green-500 mt-0.5"></i>
              <span>参考用户评论和评分</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    let currentVote = '${voteData.userVote}';
    let likeCount = ${voteData.likes};
    let dislikeCount = ${voteData.dislikes};
    
    function handleVote(type) {
      const likeBtn = document.querySelector('.like-btn');
      const dislikeBtn = document.querySelector('.dislike-btn');
      const likeCountEl = document.getElementById('like-count');
      const dislikeCountEl = document.getElementById('dislike-count');
      
      if (currentVote === type) {
        // 取消投票
        if (type === 'like') {
          likeCount--;
          likeBtn.classList.remove('active');
        } else {
          dislikeCount--;
          dislikeBtn.classList.remove('active');
        }
        currentVote = null;
      } else {
        // 新投票或更改投票
        if (type === 'like') {
          likeCount++;
          likeBtn.classList.add('active');
          if (currentVote === 'dislike') {
            dislikeCount--;
            dislikeBtn.classList.remove('active');
          }
        } else {
          dislikeCount++;
          dislikeBtn.classList.add('active');
          if (currentVote === 'like') {
            likeCount--;
            likeBtn.classList.remove('active');
          }
        }
        currentVote = type;
      }
      
      likeCountEl.textContent = likeCount;
      dislikeCountEl.textContent = dislikeCount;
      console.log('投票更新:', { type: currentVote, likes: likeCount, dislikes: dislikeCount });
    }
    
    function submitComment() {
      const commentInput = document.getElementById('comment-input');
      const content = commentInput.value.trim();
      
      if (!content) {
        alert('请输入评论内容');
        return;
      }
      
      console.log('提交评论:', content);
      commentInput.value = '';
      alert('评论已提交（演示功能）');
    }
  </script>
</body>
</html>`);
});

// ==========================================
// 6. 启动服务器
// ==========================================
loadRealData();

app.listen(PORT, () => {
  console.log(`\n🚀 全球最佳商品百科全书 · 搜索结果每页20行 已启动`);
  console.log(`📊 数据统计: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}/`);
  console.log(`📱 增强详情页: http://localhost:${PORT}/category/个护健康/剃须用品/一次性剃须刀`);
  console.log(`🎯 增强功能:`);
  console.log(`   1. 价格区间展示 - 4个价格区间分析`);
  console.log(`   2. 评测维度分析 - 不同维度的详细评估`);
  console.log(`   3. 最佳商品推荐 - 基于维度的商品推荐`);
  console.log(`   4. 详细评选理由 - 每个推荐的详细理由`);
  console.log(`   5. 点赞点踩功能 - 用户互动投票`);
  console.log(`   6. 评论互动系统 - 用户评论和讨论`);
});
