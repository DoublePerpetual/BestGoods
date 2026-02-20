const express = require('express');
const DataImporter = require('./dataImporter');
const app = express();
const PORT = 3020;

// ==========================================
// 全球最佳商品百科全书 · BestGoods 完整版
// ==========================================

// ==========================================
// 1. 全局统计信息（动态更新）
// ==========================================
let STATS = {
  categories: 0,      // 总品类数
  subcategories: 0,   // 总子品类数
  items: 0,           // 总条目数
  answers: 0,         // 最佳答案数
  china: 0,           // 中国商品数
  global: 0,          // 全球商品数
  lastUpdated: new Date().toISOString()
};

// ==========================================
// 2. 数据导入器
// ==========================================
const dataImporter = new DataImporter();
let CATEGORY_TREE = {};
let MASSIVE_DATA_LOADED = false;

// 异步加载数据
async function loadMassiveData() {
  console.log('🚀 开始加载19万多品类数据...');
  
  try {
    const success = dataImporter.loadMassiveCategories();
    
    if (success) {
      const frontendData = dataImporter.convertToFrontendFormat();
      CATEGORY_TREE = frontendData.categories;
      
      // 更新统计
      STATS.categories = Object.keys(CATEGORY_TREE).length;
      STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
      STATS.items = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
        acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
      
      MASSIVE_DATA_LOADED = true;
      
      console.log('✅ 19万多品类数据加载成功！');
      console.log(`📊 统计: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items}`);
      
      // 保存转换后的数据
      dataImporter.saveConvertedData({
        categories: CATEGORY_TREE,
        stats: STATS,
        metadata: {
          source: '19万品类扩展数据',
          totalOriginalCategories: dataImporter.stats.totalCategories,
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

// 加载默认数据（备用）
function loadDefaultData() {
  CATEGORY_TREE = {
    "数码电子": {
      icon: "fa-microchip",
      region: "global",
      children: {
        "智能手机": {
          icon: "fa-mobile",
          dimensions: ["性能最强", "拍照最好", "续航最长", "充电最快"],
          items: ["5G手机", "游戏手机", "拍照手机", "折叠屏手机"]
        },
        "笔记本电脑": {
          icon: "fa-laptop",
          dimensions: ["性能最强", "屏幕最好", "续航最长", "最轻薄"],
          items: ["轻薄本", "游戏本", "商务本", "创作本"]
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
          items: ["对开门冰箱", "十字门冰箱", "法式冰箱", "三门冰箱"]
        },
        "洗衣机": {
          icon: "fa-soap",
          dimensions: ["洗净比最高", "最节能", "最静音", "功能最全"],
          items: ["滚筒洗衣机", "波轮洗衣机", "洗烘一体机", "迷你洗衣机"]
        }
      }
    }
  };
  
  STATS.categories = Object.keys(CATEGORY_TREE).length;
  STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
  STATS.items = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
    acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
}

// ==========================================
// 3. 最佳答案库
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
  },
  {
    id: 2,
    level1: "数码电子",
    level2: "智能手机",
    item: "5G手机",
    dimension: "拍照最好",
    price: 8999,
    brand: "Apple",
    product: "iPhone 15 Pro Max",
    reason: "后置三摄系统，主摄4800万像素，5倍光学变焦。A17 Pro芯片加持，计算摄影能力强大，人像模式自然，视频拍摄行业标杆。",
    evidence: "DXOMARK手机影像榜TOP3",
    region: "global"
  }
];

// ==========================================
// 4. 用户反馈
// ==========================================
const userFeedback = {};

// ==========================================
// 5. 首页 - 支持海量数据
// ==========================================
app.get('/', (req, res) => {
  const view = req.query.view || 'grid';
  const region = req.query.region || 'all';
  const search = req.query.search || '';
  const level1 = req.query.level1 || 'all';
  const level2 = req.query.level2 || 'all';
  
  // 更新统计
  STATS.answers = BEST_ANSWERS.length;
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书 · BestGoods 完整版 · ${STATS.items.toLocaleString()}个品类</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .category-card { transition: all 0.2s; }
    .category-card:hover { transform: translateY(-2px); box-shadow: 0 12px 20px -8px rgba(0,0,0,0.08); }
    .massive-data-badge { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
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
              <i class="fa-solid fa-trophy text-yellow-500"></i>全球最佳商品百科全书 · BestGoods 完整版
            </h1>
            ${MASSIVE_DATA_LOADED ? '<span class="massive-data-badge text-white px-3 py-1 rounded-full text-sm font-bold">19万+品类数据库</span>' : ''}
          </div>
          <p class="text-gray-500 mt-1">
            <i class="fa-solid fa-tags text-blue-500"></i> 
            一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()} · 
            最佳答案${STATS.answers}
          </p>
          ${MASSIVE_DATA_LOADED ? '<p class="text-green-600 text-sm mt-1"><i class="fa-solid fa-database"></i> 基于19万多品类扩展数据构建</p>' : ''}
        </div>
        <div class="flex gap-2">
          <!-- 视图切换 -->
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=grid&region=${region}&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${view === 'grid' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-grid-2"></i> 卡片
            </a>
            <a href="/?view=list&region=${region}&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${view === 'list' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-list"></i> 列表
            </a>
          </div>
          <!-- 地区切换 -->
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=${view}&region=all&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'all' ? 'bg-white shadow' : 'text-gray-600'}">全部</a>
            <a href="/?view=${view}&region=global&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'global' ? 'bg-white shadow' : 'text-gray-600'}">全球</a>
            <a href="/?view=${view}&region=china&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'china' ? 'bg-white shadow' : 'text-gray-600'}">中国</a>
          </div>
        </div>
      </div>
      
      <!-- 搜索框 -->
      <form class="flex gap-2 mt-4">
        <input type="hidden" name="view" value="${view}">
        <input type="hidden" name="region" value="${region}">
        <input type="text" name="search" placeholder="🔍 在${STATS.items.toLocaleString()}个品类中搜索..." value="${search}" 
               class="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500">
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">搜索</button>
      </form>
      
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
            if (region !== 'all' && subData.region !== region) return '';
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
    ${view === 'grid' ? renderGrid(level1, level2, region, search) : renderList(level1, level2, region, search)}
  </div>
</body>
</html>`;
  
  res.send(html);
});

// 渲染网格视图
function renderGrid(level1, level2, region, search) {
  let html = '<div class="space-y-8">';
  
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
      if (region !== 'all' && l2Data.region !== region) return;
      
      const items = (l2Data.items || []).filter(item => {
        if (!search) return true;
        const itemName = typeof item === 'object' ? item.name : item;
        return itemName.toLowerCase().includes(search.toLowerCase());
      });
      
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
        const itemName = typeof item === 'object' ? item.name : item;
        const itemDesc = typeof item === 'object' ? item.description : `${l2} - ${item}`;
        const priceRange = typeof item === 'object' ? item.priceRange : '价格待定';
        const rating = typeof item === 'object' ? item.rating : 4.0;
        
        const hasAnswers = BEST_ANSWERS.some(a => a.level1 === l1 && a.level2 === l2 && a.item === itemName);
        const answerCount = BEST_ANSWERS.filter(a => a.level1 === l1 && a.level2 === l2 && a.item === itemName).length;
        
        html += `
          <div onclick="location.href='${hasAnswers ? '/category/' + encodeURIComponent(l1) + '/' + encodeURIComponent(l2) + '/' + encodeURIComponent(itemName) : '#'}'" 
               class="category-card bg-white rounded-xl p-4 border border-gray-100 ${hasAnswers ? 'cursor-pointer hover:shadow-md' : 'opacity-60'}">
            <div class="flex justify-between items-start mb-2">
              <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${l2Data.dimensions?.length || 0}个维度</span>
              ${hasAnswers ? `<span class="text-xs text-green-600">${answerCount}个答案</span>` : '<span class="text-xs text-gray-400">暂无答案</span>'}
            </div>
            <h4 class="font-bold text-gray-900">${itemName}</h4>
            <p class="text-xs text-gray-500 mt-1">${itemDesc.substring(0, 30)}...</p>
            <div class="flex justify-between items-center mt-2">
              <span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">${priceRange}</span>
              <span class="text-xs text-yellow-600">⭐ ${rating.toFixed(1)}</span>
            </div>
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
  
  html += '</div>';
  return html;
}

// 渲染列表视图
function renderList(level1, level2, region, search) {
  let items = [];
  const level1s = level1 === 'all' ? Object.keys(CATEGORY_TREE) : [level1];
  
  level1s.forEach(l1 => {
    const l1Data = CATEGORY_TREE[l1];
    if (region !== 'all' && l1Data.region !== region) return;
    
    const level2s = level2 === 'all' ? Object.keys(l1Data.children) : [level2];
    
    level2s.forEach(l2 => {
      const l2Data = l1Data.children[l2];
      if (!l2Data) return;
      if (region !== 'all' && l2Data.region !== region) return;
      
      (l2Data.items || []).forEach(item => {
        const itemName = typeof item === 'object' ? item.name : item;
        if (search && !itemName.toLowerCase().includes(search.toLowerCase())) return;
        
        const hasAnswers = BEST_ANSWERS.some(a => a.level1 === l1 && a.level2 === l2 && a.item === itemName);
        const answerCount = BEST_ANSWERS.filter(a => a.level1 === l1 && a.level2 === l2 && a.item === itemName).length;
        
        items.push({
          l1, l2, item: itemName,
          l1Icon: l1Data.icon,
          l2Icon: l2Data.icon || 'fa-folder',
          hasAnswers, answerCount,
          dimensions: l2Data.dimensions || [],
          priceRange: typeof item === 'object' ? item.priceRange : '价格待定',
          rating: typeof item === 'object' ? item.rating : 4.0
        });
      });
    });
  });
  
  // 4列布局
  let html = '<div class="grid grid-cols-4 gap-4">';
  for (let i = 0; i < 4; i++) {
    html += '<div class="space-y-2">';
    items.filter((_, idx) => idx % 4 === i).forEach(item => {
      html += `
        <div onclick="location.href='${item.hasAnswers ? '/category/' + encodeURIComponent(item.l1) + '/' + encodeURIComponent(item.l2) + '/' + encodeURIComponent(item.item) : '#'}'" 
             class="p-3 bg-white rounded-lg border border-gray-100 ${item.hasAnswers ? 'cursor-pointer hover:bg-gray-50' : 'opacity-60'}">
          <div class="flex items-start gap-2">
            <i class="fa-solid ${item.l1Icon} text-blue-500 mt-1"></i>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-1 text-xs text-gray-400">
                <span>${item.l1}</span>
                <i class="fa-solid fa-chevron-right text-[8px]"></i>
                <span>${item.l2}</span>
              </div>
              <div class="font-medium truncate">${item.item}</div>
              <div class="flex justify-between items-center mt-1">
                <span class="text-xs bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded">${item.priceRange}</span>
                <span class="text-xs text-yellow-600">⭐ ${item.rating.toFixed(1)}</span>
              </div>
              ${item.hasAnswers ? 
                `<div class="text-xs text-green-600 mt-1">${item.answerCount}个最佳答案</div>` : 
                '<div class="text-xs text-gray-400 mt-1">暂无答案</div>'
              }
            </div>
          </div>
        </div>
      `;
    });
    html += '</div>';
  }
  html += '</div>';
  
  if (items.length === 0) {
    html = `
      <div class="bg-white rounded-xl p-8 text-center">
        <i class="fa-solid fa-search text-gray-300 text-4xl mb-4"></i>
        <h3 class="text-lg font-bold text-gray-700 mb-2">未找到匹配的商品</h3>
        <p class="text-gray-500">尝试调整搜索关键词或筛选条件</p>
      </div>
    `;
  }
  
  return html;
}

// ==========================================
// 6. 品类详情页
// ==========================================
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 验证目录存在
  if (!CATEGORY_TREE[level1] || !CATEGORY_TREE[level1].children[level2]) {
    return res.status(404).send('品类不存在');
  }
  
  const l2Data = CATEGORY_TREE[level1].children[level2];
  const dimensions = l2Data.dimensions || [];
  const answers = BEST_ANSWERS.filter(a => a.level1 === level1 && a.level2 === level2 && a.item === item);
  
  res.send(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${item} · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 py-8">
    <div class="mb-6">
      <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="text-gray-500">
        <i class="fa-solid fa-arrow-left"></i> 返回
      </a>
    </div>
    
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex items-center gap-3 mb-4">
        <span class="bg-blue-100 text-blue-800 text-xs px-3 py-1 rounded-full">${level1}</span>
        <span class="bg-purple-100 text-purple-800 text-xs px-3 py-1 rounded-full">${level2}</span>
        <span class="bg-pink-100 text-pink-800 text-xs px-3 py-1 rounded-full">${item}</span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-4">${item}</h1>
      <div class="flex flex-wrap gap-2 mb-4">
        ${dimensions.map(d => `<span class="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm">🏆 最佳${d}</span>`).join('')}
      </div>
      <p class="text-gray-500">✨ ${answers.length} 个最佳答案 · ${dimensions.length} 个评选维度</p>
      ${MASSIVE_DATA_LOADED ? '<p class="text-green-600 text-sm mt-2"><i class="fa-solid fa-database"></i> 来自19万品类数据库</p>' : ''}
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      ${answers.map(a => `
        <div onclick="location.href='/answer/${a.id}'" class="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md cursor-pointer">
          <span class="text-sm font-bold text-blue-600">🏆 最佳${a.dimension}</span>
          <h3 class="text-lg font-bold text-gray-900 mt-2">${a.product}</h3>
          <p class="text-sm text-gray-600">${a.brand} · ¥${a.price}</p>
          <p class="text-xs text-gray-500 line-clamp-2 mt-2">${a.reason}</p>
        </div>
      `).join('')}
    </div>
  </div>
</body>
</html>`);
});

// ==========================================
// 7. API接口
// ==========================================
app.get('/api/stats', (req, res) => {
  res.json({
    ...STATS,
    massiveDataLoaded: MASSIVE_DATA_LOADED,
    dataSource: MASSIVE_DATA_LOADED ? '19万品类扩展数据库' : '默认数据库'
  });
});

app.get('/api/categories', (req, res) => {
  res.json({
    level1: Object.keys(CATEGORY_TREE),
    total: STATS,
    timestamp: new Date().toISOString()
  });
});

// ==========================================
// 8. 启动服务器
// ==========================================
async function startServer() {
  // 先加载默认数据确保服务器快速启动
  loadDefaultData();
  
  // 异步加载海量数据
  setTimeout(() => {
    loadMassiveData();
  }, 1000);
  
  app.listen(PORT, () => {
    console.log(`\n🚀 全球最佳商品百科全书 · BestGoods 完整版 已启动`);
    console.log(`📊 初始统计: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items}`);
    console.log(`💾 数据源: ${MASSIVE_DATA_LOADED ? '19万品类数据库' : '默认数据库 (海量数据加载中...)'}`);
    console.log(`🌐 访问地址: http://localhost:${PORT}/`);
    console.log(`🔧 API接口: http://localhost:${PORT}/api/stats`);
    
    if (!MASSIVE_DATA_LOADED) {
      console.log(`\n⏳ 正在后台加载19万多品类数据，请稍候...`);
      console.log(`   📁 数据文件: ${__dirname}/data/global-categories-expanded.json`);
    }
  });
}

// 启动服务器
startServer();