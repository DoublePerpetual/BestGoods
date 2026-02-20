const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3033;

// ==========================================
// 全球最佳商品百科全书 · 正确恢复版本
// 基于用户昨天优化的版本 + 数据库功能
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
            
            // 添加到全局搜索列表
            l3Items.forEach(item => {
              ALL_ITEMS.push({
                l1, l2, item,
                l1Icon: getIcon(l1),
                l2Icon: getIcon(l2),
                dimensions: getDimensions(l1, l2)
              });
            });
          }
        });
      });
      
      // 更新统计
      STATS.categories = Object.keys(CATEGORY_TREE).length;
      STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
      STATS.items = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
        acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
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
  STATS.categories = 1;
  STATS.subcategories = 1;
  STATS.items = 3;
  STATS.china = 0;
  STATS.global = 1;
}

// ==========================================
// 2. 加载后端数据库
// ==========================================
let PRICE_INTERVALS_DB = {};
let EVALUATION_DIMENSIONS_DB = {};
let BEST_PRODUCTS_DB = {};

function loadBackendDatabases() {
  try {
    console.log('📂 加载后端数据库...');
    
    // 加载价格区间数据库
    const priceIntervalsPath = path.join(__dirname, 'data', 'price-intervals-db.js');
    const priceIntervalsContent = fs.readFileSync(priceIntervalsPath, 'utf8');
    const priceIntervalsMatch = priceIntervalsContent.match(/const PRICE_INTERVALS_DB = (\{[\s\S]*?\});/);
    if (priceIntervalsMatch) {
      PRICE_INTERVALS_DB = eval(`(${priceIntervalsMatch[1]})`);
      console.log(`✅ 价格区间数据库加载成功: ${Object.keys(PRICE_INTERVALS_DB).length}个一级分类`);
    }
    
    // 加载评测维度数据库
    const dimensionsPath = path.join(__dirname, 'data', 'evaluation-dimensions-db.js');
    const dimensionsContent = fs.readFileSync(dimensionsPath, 'utf8');
    const dimensionsMatch = dimensionsContent.match(/const EVALUATION_DIMENSIONS_DB = (\{[\s\S]*?\});/);
    if (dimensionsMatch) {
      EVALUATION_DIMENSIONS_DB = eval(`(${dimensionsMatch[1]})`);
      console.log(`✅ 评测维度数据库加载成功: ${Object.keys(EVALUATION_DIMENSIONS_DB).length}个一级分类`);
    }
    
    // 加载最佳商品数据库
    const productsPath = path.join(__dirname, 'data', 'best-products-complete-db.js');
    const productsContent = fs.readFileSync(productsPath, 'utf8');
    const productsMatch = productsContent.match(/const BEST_PRODUCTS_COMPLETE_DB = (\{[\s\S]*?\});/);
    if (productsMatch) {
      BEST_PRODUCTS_DB = eval(`(${productsMatch[1]})`);
      console.log(`✅ 最佳商品数据库加载成功: ${Object.keys(BEST_PRODUCTS_DB).length}个一级分类`);
    }
    
    // 统计最佳答案数量
    let answerCount = 0;
    Object.values(BEST_PRODUCTS_DB).forEach(l1Data => {
      Object.values(l1Data).forEach(l2Data => {
        Object.values(l2Data).forEach(intervalData => {
          Object.values(intervalData).forEach(dimensionData => {
            if (dimensionData.productName) answerCount++;
          });
        });
      });
    });
    STATS.answers = answerCount;
    
    console.log(`📊 后端数据库统计: ${answerCount}个最佳答案`);
    
  } catch (error) {
    console.error('❌ 后端数据库加载失败:', error.message);
    // 创建空的数据库结构
    PRICE_INTERVALS_DB = {};
    EVALUATION_DIMENSIONS_DB = {};
    BEST_PRODUCTS_DB = {};
  }
}

// ==========================================
// 3. 辅助函数：获取商品的最佳答案
// ==========================================
function getBestAnswersForItem(level1, level2, item) {
  const answers = [];
  
  // 检查是否有匹配的最佳商品
  if (BEST_PRODUCTS_DB[level1] && BEST_PRODUCTS_DB[level1][level2]) {
    const l2Data = BEST_PRODUCTS_DB[level1][level2];
    
    Object.entries(l2Data).forEach(([intervalId, intervalData]) => {
      Object.entries(intervalData).forEach(([dimensionId, productData]) => {
        if (productData.productName) {
          // 获取价格区间信息
          let priceIntervalInfo = {};
          if (PRICE_INTERVALS_DB[level1] && PRICE_INTERVALS_DB[level1][level2]) {
            const interval = PRICE_INTERVALS_DB[level1][level2].find(i => i.id === intervalId);
            if (interval) priceIntervalInfo = interval;
          }
          
          // 获取评测维度信息
          let dimensionInfo = {};
          if (EVALUATION_DIMENSIONS_DB[level1] && EVALUATION_DIMENSIONS_DB[level1][level2] && 
              EVALUATION_DIMENSIONS_DB[level1][level2][intervalId]) {
            const dimension = EVALUATION_DIMENSIONS_DB[level1][level2][intervalId].find(d => d.id === dimensionId);
            if (dimension) dimensionInfo = dimension;
          }
          
          answers.push({
            level1,
            level2,
            item,
            dimension: dimensionInfo.name || dimensionId,
            price: productData.price,
            brand: productData.brand,
            product: productData.productName,
            reason: productData.recommendationReasons ? productData.recommendationReasons[0] : '暂无推荐理由',
            priceInterval: priceIntervalInfo.name || intervalId,
            productData: productData
          });
        }
      });
    });
  }
  
  return answers;
}

// ==========================================
// 4. 首页 - 包含列表模式和智能分页
// ==========================================
app.get('/', (req, res) => {
  const view = req.query.view || 'grid';
  const region = req.query.region || 'all';
  const search = req.query.search || '';
  const level1 = req.query.level1 || 'all';
  const level2 = req.query.level2 || 'all';
  const page = parseInt(req.query.page) || 1;
  const mode = req.query.mode || 'all'; // all, all-level1, all-level2
  
  if (view === 'grid') {
    if (mode === 'all-level1' || mode === 'all-level2') {
      res.send(renderSmartPagination(mode, page, region, search));
    } else {
      res.send(renderGrid(view, region, search, level1, level2));
    }
  } else {
    res.send(renderList(page, region, search));
  }
});

// 渲染网格视图 - 包含一级/二级目录导航
function renderGrid(view, region, search, level1, level2) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书 · ${STATS.items.toLocaleString()}个品类 · ${STATS.answers}个最佳答案</title>
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
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=grid&region=${region}&search=${search}" class="px-3 py-1.5 rounded-md text-sm ${view === 'grid' ? 'bg-white shadow' : 'text-gray-600'}"><i class="fa-solid fa-grid-2"></i> 卡片</a>
            <a href="/?view=list&region=${region}&search=${search}" class="px-3 py-1.5 rounded-md text-sm ${view === 'list' ? 'bg-white shadow' : 'text-gray-600'}"><i class="fa-solid fa-list"></i> 列表</a>
          </div>
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=${view}&region=all&search=${search}" class="px-3 py-1.5 rounded-md text-sm ${region === 'all' ? 'bg-white shadow' : 'text-gray-600'}">全部</a>
            <a href="/?view=${view}&region=global&search=${search}" class="px-3 py-1.5 rounded-md text-sm ${region === 'global' ? 'bg-white shadow' : 'text-gray-600'}">全球</a>
            <a href="/?view=${view}&region=china&search=${search}" class="px-3 py-1.5 rounded-md text-sm ${region === 'china' ? 'bg-white shadow' : 'text-gray-600'}">中国</a>
          </div>
        </div>
      </div>
      
      <form class="flex gap-2 mt-4">
        <input type="hidden" name="view" value="${view}">
        <input type="hidden" name="region" value="${region}">
        <input type="text" name="search" placeholder="🔍 搜索品类..." value="${search}" class="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500">
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">搜索</button>
      </form>
      
      <!-- 智能分页模式选择 -->
      <div class="flex flex-wrap gap-2 mt-4">
        <a href="/?view=grid&mode=all&region=${region}&search=${search}" 
           class="px-4 py-2 rounded-full text-sm font-medium ${!mode || mode === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}">
          标准浏览
        </a>
        <a href="/?view=grid&mode=all-level1&region=${region}&search=${search}" 
           class="px-4 py-2 rounded-full text-sm font-medium ${mode === 'all-level1' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-700'}">
          全部一级 (智能分页)
        </a>
        <a href="/?view=grid&mode=all-level2&region=${region}&search=${search}" 
           class="px-4 py-2 rounded-full text-sm font-medium ${mode === 'all-level2' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-700'}">
          全部二级 (智能分页)
        </a>
      </div>
      
      <!-- 一级目录导航 -->
      <div class="flex flex-wrap gap-2 mt-4">
        <a href="/?view=${view}&region=${region}&search=${search}&level1=all&level2=all" 
           class="px-4 py-2 rounded-full text-sm font-medium ${level1 === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}">
          全部一级
        </a>
        ${Object.keys(CATEGORY_TREE).slice(0, 10).map(l1 => {
          const catData = CATEGORY_TREE[l1];
          if (region !== 'all' && catData.region !== region) return '';
          return `
            <a href="/?view=${view}&region=${region}&search=${search}&level1=${l1}&level2=all" 
               class="px-4 py-2 rounded-full text-sm font-medium flex items-center gap-1 ${level1 === l1 ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}">
              <i class="fa-solid ${catData.icon}"></i>${l1}
            </a>
          `;
        }).join('')}
        ${Object.keys(CATEGORY_TREE).length > 10 ? `
          <span class="px-4 py-2 rounded-full text-sm font-medium bg-gray-100 text-gray-500">
            +${Object.keys(CATEGORY_TREE).length - 10}更多
          </span>
        ` : ''}
      </div>
      
      <!-- 二级目录导航 -->
      ${level1 !== 'all' && CATEGORY_TREE[level1] ? `
        <div class="flex flex-wrap gap-2 mt-3 pl-2 border-l-4 border-purple-500">
          <a href="/?view=${view}&region=${region}&search=${search}&level1=${level1}&level2=all" 
             class="px-3 py-1.5 rounded-full text-xs font-medium ${level2 === 'all' ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}">
            全部二级
          </a>
          ${Object.keys(CATEGORY_TREE[level1].children).slice(0, 8).map(l2 => {
            const subData = CATEGORY_TREE[level1].children[l2];
            return `
              <a href="/?view=${view}&region=${region}&search=${search}&level1=${level1}&level2=${l2}" 
                 class="px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1 ${level2 === l2 ? 'bg-purple-600 text-white' : 'bg-gray-100 text-gray-600'}">
                <i class="fa-solid ${subData.icon || 'fa-folder'}"></i>${l2}
              </a>
            `;
          }).join('')}
          ${Object.keys(CATEGORY_TREE[level1].children).length > 8 ? `
            <span class="px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
              +${Object.keys(CATEGORY_TREE[level1].children).length - 8}更多
            </span>
          ` : ''}
        </div>
      ` : ''}
    </div>
    
    <!-- 内容区域 -->
    <div class="space-y-8">
  `;
  
  // 确定要显示的分类
  const level1s = level1 === 'all' ? Object.keys(CATEGORY_TREE) : [level1];
  
  level1s.forEach(l1 => {
    const l1Data = CATEGORY_TREE[l1];
    if (region !== 'all' && l1Data.region !== region) return;
    
    const level2s = level2 === 'all' ? Object.keys(l1Data.children) : [level2];
    
    html += `
      <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div class="bg-gray-50 px-6 py-3 border-b border-gray-100">
          <h2 class="text-lg font-bold text-gray-800 flex items-center gap-2">
            <i class="fa-solid ${l1Data.icon} text-blue-500"></i>${l1}
            <span class="text-sm font-normal text-gray-400">${Object.keys(l1Data.children).length}个二级分类</span>
          </h2>
        </div>
        <div class="p-6">
    `;
    
    level2s.forEach(l2 => {
      const l2Data = l1Data.children[l2];
      if (!l2Data) return;
      
      // 过滤搜索
      let items = l2Data.items;
      if (search) {
        items = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
      }
      if (items.length === 0) return;
      
      html += `
        <div class="mb-6 last:mb-0">
          <h3 class="text-md font-bold text-gray-700 mb-3 flex items-center gap-2">
            <i class="fa-solid ${l2Data.icon || 'fa-folder'} text-purple-500"></i>${l2}
            <span class="text-sm font-normal text-gray-400">${items.length}个商品</span>
          </h3>
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      `;
      
      items.slice(0, 12).forEach(item => {
        const hasAnswers = getBestAnswersForItem(l1, l2, item).length > 0;
        
        html += `
          <div onclick="location.href='${hasAnswers ? '/category/' + encodeURIComponent(l1) + '/' + encodeURIComponent(l2) + '/' + encodeURIComponent(item) : '#'}'" 
               class="category-card bg-white rounded-xl p-4 border border-gray-100 ${hasAnswers ? 'cursor-pointer hover:shadow-md' : 'opacity-60'}">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${l2Data.dimensions?.length || 0}个维度</span>
                ${hasAnswers ? '<span class="text-xs text-green-600">有答案</span>' : '<span class="text-xs text-gray-400">暂无答案</span>'}
              </div>
              <h4 class="font-bold text-gray-900">${item}</h4>
              <p class="text-xs text-gray-500 mt-1">${l2} - ${item}</p>
              <div class="mt-2 flex flex-wrap gap-1">
                ${(l2Data.dimensions || []).slice(0, 2).map(d => `<span class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">${d}</span>`).join('')}
              </div>
            </div>
        `;
      });
      
      html += `
          </div>
          ${items.length > 12 ? `
            <div class="mt-4 text-center">
              <span class="text-sm text-gray-500">还有 ${items.length - 12} 个商品未显示</span>
            </div>
          ` : ''}
        </div>
      `;
    });
    
    html += `
        </div>
      </div>
    `;
  });
  
  html += `
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

// 智能分页渲染
function renderSmartPagination(mode, page, region, search) {
  // 收集所有二级目录
  let allLevel2 = [];
  Object.entries(CATEGORY_TREE).forEach(([l1, l1Data]) => {
    if (region !== 'all' && l1Data.region !== region) return;
    
    Object.entries(l1Data.children).forEach(([l2, l2Data]) => {
      allLevel2.push({
        l1, l2,
        l1Data, l2Data,
        itemCount: l2Data.items.length
      });
    });
  });
  
  const pageSize = 1; // 每页1个二级目录
  const totalPages = allLevel2.length;
  const currentIndex = Math.min(page - 1, totalPages - 1);
  const currentLevel2 = allLevel2[currentIndex];
  
  if (!currentLevel2) {
    return '<h1>没有找到数据</h1>';
  }
  
  const { l1, l2, l1Data, l2Data } = currentLevel2;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${mode === 'all-level1' ? '全部一级' : '全部二级'} · 第${page}页/${totalPages}页 · ${l2}</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">
            ${mode === 'all-level1' ? '全部一级 · 智能分页' : '全部二级 · 智能分页'}
            <span class="text-sm font-normal text-gray-400">第 ${page}/${totalPages} 页</span>
          </h1>
          <p class="text-gray-500 mt-1">
            <i class="fa-solid ${l1Data.icon} text-blue-500"></i> ${l1} 
            <i class="fa-solid fa-chevron-right text-xs mx-2"></i>
            <i class="fa-solid ${l2Data.icon || 'fa-folder'} text-purple-500"></i> ${l2}
            <span class="ml-2">(${l2Data.items.length}个商品)</span>
          </p>
        </div>
        <div class="flex gap-2">
          <a href="/?view=grid" class="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200">
            <i class="fa-solid fa-grid-2 mr-1"></i>返回标准浏览
          </a>
        </div>
      </div>
      
      <!-- 分页导航 -->
      <div class="flex items-center justify-between mt-4">
        <div>
          ${page > 1 ? `
            <a href="/?view=grid&mode=${mode}&page=${page-1}&region=${region}&search=${search}" 
               class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              上一页
            </a>
          ` : ''}
        </div>
        
        <div class="flex gap-1">
          ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
            const p = Math.max(1, page - 2) + i;
            if (p > totalPages) return '';
            return p === page ? `
              <span class="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm font-medium">${p}</span>
            ` : `
              <a href="/?view=grid&mode=${mode}&page=${p}&region=${region}&search=${search}" 
                 class="px-3 py-1 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">${p}</a>
            `;
          }).join('')}
        </div>
        
        <div>
          ${page < totalPages ? `
            <a href="/?view=grid&mode=${mode}&page=${page+1}&region=${region}&search=${search}" 
               class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              下一页
            </a>
          ` : ''}
        </div>
      </div>
    </div>
    
    <!-- 当前二级目录的所有商品 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="bg-gray-50 px-6 py-3 border-b border-gray-100">
        <h2 class="text-lg font-bold text-gray-800">
          ${l2} 的所有商品 (${l2Data.items.length}个)
        </h2>
      </div>
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
  `;
  
  l2Data.items.forEach(item => {
    const hasAnswers = getBestAnswersForItem(l1, l2, item).length > 0;
    
    html += `
          <div onclick="location.href='${hasAnswers ? '/category/' + encodeURIComponent(l1) + '/' + encodeURIComponent(l2) + '/' + encodeURIComponent(item) : '#'}'" 
               class="category-card bg-white rounded-xl p-4 border border-gray-100 ${hasAnswers ? 'cursor-pointer hover:shadow-md' : 'opacity-60'}">
              <div class="flex justify-between items-start mb-2">
                <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${l2Data.dimensions?.length || 0}个维度</span>
                ${hasAnswers ? '<span class="text-xs text-green-600">有答案</span>' : '<span class="text-xs text-gray-400">暂无答案</span>'}
              </div>
              <h4 class="font-bold text-gray-900">${item}</h4>
              <p class="text-xs text-gray-500 mt-1">${l2} - ${item}</p>
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
</body>
</html>`;
  
  return html;
}

// 列表视图渲染
function renderList(page, region, search) {
  // 收集所有商品
  let allItems = [];
  Object.entries(CATEGORY_TREE).forEach(([l1, l1Data]) => {
    if (region !== 'all' && l1Data.region !== region) return;
    
    Object.entries(l1Data.children).forEach(([l2, l2Data]) => {
      l2Data.items.forEach(item => {
        if (search && !item.toLowerCase().includes(search.toLowerCase())) return;
        
        allItems.push({
          l1, l2, item,
          l1Icon: l1Data.icon,
          l2Icon: l2Data.icon || 'fa-folder',
          dimensions: l2Data.dimensions || []
        });
      });
    });
  });
  
  const pageSize = 20;
  const totalItems = allItems.length;
  const totalPages = Math.ceil(totalItems / pageSize);
  const startIndex = (page - 1) * pageSize;
  const pageItems = allItems.slice(startIndex, startIndex + pageSize);
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>列表浏览 · 第${page}页/${totalPages}页 · ${totalItems.toLocaleString()}个商品</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 py-8">
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-