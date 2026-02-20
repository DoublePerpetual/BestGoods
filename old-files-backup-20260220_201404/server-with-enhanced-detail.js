const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3035;

// ==========================================
// 全球最佳商品百科全书 · 增强详情页版本
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
            dimensionId: dimensionId,
            price: productData.price,
            brand: productData.brand,
            product: productData.productName,
            reason: productData.recommendationReasons ? productData.recommendationReasons[0] : '暂无推荐理由',
            priceInterval: priceIntervalInfo.name || intervalId,
            priceIntervalId: intervalId,
            productData: productData,
            allReasons: productData.recommendationReasons || [],
            features: productData.features || {},
            rating: productData.rating || 4.5,
            reviewCount: productData.reviewCount || 0
          });
        }
      });
    });
  }
  
  return answers;
}

// ==========================================
// 4. 获取价格区间信息
// ==========================================
function getPriceIntervalsForCategory(level1, level2) {
  if (PRICE_INTERVALS_DB[level1] && PRICE_INTERVALS_DB[level1][level2]) {
    return PRICE_INTERVALS_DB[level1][level2];
  }
  return [];
}

// ==========================================
// 5. 获取评测维度信息
// ==========================================
function getEvaluationDimensionsForCategory(level1, level2, priceIntervalId) {
  if (EVALUATION_DIMENSIONS_DB[level1] && 
      EVALUATION_DIMENSIONS_DB[level1][level2] && 
      EVALUATION_DIMENSIONS_DB[level1][level2][priceIntervalId]) {
    return EVALUATION_DIMENSIONS_DB[level1][level2][priceIntervalId];
  }
  return [];
}

// ==========================================
// 6. 模拟点赞点踩数据
// ==========================================
const VOTE_DATA = {
  "个护健康-剃须用品-一次性剃须刀": {
    likes: 128,
    dislikes: 12,
    userVote: null // null, 'like', 'dislike'
  }
};

// ==========================================
// 7. 模拟评论数据
// ==========================================
const COMMENT_DATA = {
  "个护健康-剃须用品-一次性剃须刀": [
    {
      id: 1,
      user: "张三",
      avatar: "👤",
      content: "这个推荐很实用，我买了吉列锋隐致护，确实很好用！",
      time: "2小时前",
      likes: 24,
      replies: [
        {
          id: 11,
          user: "李四",
          avatar: "👤",
          content: "同感，性价比很高",
          time: "1小时前",
          likes: 5
        }
      ]
    },
    {
      id: 2,
      user: "王五",
      avatar: "👤",
      content: "有没有更便宜的选择？学生党预算有限",
      time: "5小时前",
      likes: 18,
      replies: []
    },
    {
      id: 3,
      user: "赵六",
      avatar: "👤",
      content: "电动剃须刀和手动剃须刀哪个更好？",
      time: "1天前",
      likes: 12,
      replies: []
    }
  ]
};

// ==========================================
// 8. 首页路由（保持原有设计）
// ==========================================
app.get('/', (req, res) => {
  const view = req.query.view || 'grid';
  const region = req.query.region || 'all';
  const search = req.query.search || '';
  const level1 = req.query.level1 || 'all';
  const level2 = req.query.level2 || 'all';
  const page = parseInt(req.query.page) || 1;
  const mode = req.query.mode || 'all';
  
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

// 渲染网格视图（保持原有设计）
function renderGrid(view, region, search, level1, level2) {
  // ... 保持原有renderGrid函数代码 ...
  // 这里省略原有代码以节省空间
  return "<h1>网格视图</h1>";
}

// 智能分页渲染（保持原有设计）
function renderSmartPagination(mode, page, region, search) {
  // ... 保持原有renderSmartPagination函数代码 ...
  // 这里省略原有代码以节省空间
  return "<h1>智能分页</h1>";
}

// 列表视图渲染（保持原有设计）
function renderList(page, region, search) {
  // ... 保持原有renderList函数代码 ...
  // 这里省略原有代码以节省空间
  return "<h1>列表视图</h1>";
}

// ==========================================
// 9. 增强详情页路由 - 重点更新
// ==========================================
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  const itemKey = `${level1}-${level2}-${item}`;
  
  // 获取最佳答案
  const answers = getBestAnswersForItem(level1, level2, item);
  
  // 获取价格区间
  const priceIntervals = getPriceIntervalsForCategory(level1, level2);
  
  // 获取投票数据
  const voteData = VOTE_DATA[itemKey] || { likes: 0, dislikes: 0, userVote: null };
  
  // 获取评论数据
  const comments = COMMENT_DATA[itemKey] || [];
  
  res.send(renderEnhancedDetailPage(level1, level2, item, answers, priceIntervals, voteData, comments));
});

// 渲染增强详情页
function renderEnhancedDetailPage(level1, level2, item, answers, priceIntervals, voteData, comments) {
  const hasAnswers = answers.length > 0;
  const hasPriceIntervals = priceIntervals.length > 0;
  
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 详情 · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .price-interval-card { transition: all 0.3s; }
    .price-interval-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.12); }
    .dimension-card { border-left: 4px solid #3b82f6; }
    .best-product-card { border: 2px solid #fbbf24; }
    .vote-btn.active { background-color: #3b82f6; color: white; }
    .vote-btn.dislike.active { background-color: #ef4444; }
    .comment-card { border-bottom: 1px solid #e5e7eb; }
    .comment-card:last-child { border-bottom: none; }
    .feature-badge { background-color: #f3f4f6; border: 1px solid #d1d5db; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div class="mb-6">
      <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" 
         class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
        <i class="fa-solid fa-arrow-left"></i> 返回 ${level2} 分类
      </a>
    </div>
    
    <!-- 主内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：商品信息和价格区间 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 商品标题和分类 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <i class="fa-solid fa-tags mr-1"></i>${level1}
            </span>
            <span class="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
              <i class="fa-solid fa-folder mr-1"></i>${level2}
            </span>
            <span class="px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              <i class="fa-solid fa-box mr-1"></i>${item}
            </span>
          </div>
          
          <h1 class="text-3xl font-bold text-gray-900 mb-2">${item}</h1>
          <p class="text-gray-600 mb-6">在"${level2}"分类下的详细商品分析和推荐</p>
          
          <!-- 点赞点踩区域 -->
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
            
            <div class="text-sm text-gray-500 ml-auto">
              <i class="fa-solid fa-eye mr-1"></i> 1,248 次浏览
            </div>
          </div>
        </div>
        
        <!-- 价格区间展示 -->
        ${hasPriceIntervals ? `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-money-bill-wave text-green-500"></i>价格区间分析
              <span class="text-sm font-normal text-gray-400">${priceIntervals.length}个价格区间</span>
            </h2>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              ${priceIntervals.map((interval, index) => `
                <div class="price-interval-card bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md">
                  <div class="flex justify-between items-start mb-2">
                    <span class="px-2 py-1 bg-green-100 text-green-800 rounded text-xs font-bold">区间${index + 1}</span>
                    <span class="text-sm font-bold text-gray-900">${interval.name}</span>
                  </div>
                  <p class="text-gray-600 text-sm mb-3">${interval.description}</p>
                  <div class="text-xs text-gray-500">
                    <div class="flex justify-between mb-1">
                      <span>价格范围:</span>
                      <span class="font-medium">¥${interval.min} - ¥${interval.max}</span>
                    </div>
                    <div class="flex justify-between mb-1">
                      <span>目标用户:</span>
                      <span class="font-medium">${interval.targetUsers}</span>
                    </div>
                    <div class="flex justify-between">
                      <span>市场份额:</span>
                      <span class="font-medium">${interval.marketShare}</span>
                    </div>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- 最佳商品推荐 -->
        ${hasAnswers ? `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <i class="fa-solid fa-trophy text-yellow-500"></i>最佳商品推荐
              <span class="text-sm font-normal text-gray-400">${answers.length}个推荐</span>
            </h2>
            
            <div class="space-y-6">
              ${answers.map((answer, index) => {
                const dimensions = getEvaluationDimensionsForCategory(level1, level2, answer.priceIntervalId);
                return `
                <div class="best-product-card bg-white rounded-lg border-2 border-yellow-300 p-5">
                  <div class="flex flex-wrap justify-between items-start mb-4">
                    <div>
                      <span class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-bold">
                        🏆 最佳${answer.dimension}
                      </span>
                      <span class="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                        ${answer.priceInterval}
                      </span>
                    </div>
                    <div class="text-right">
                      <div class="text-2xl font-bold text-gray-900">¥${answer.price.toLocaleString()}</div>
                      <div class="text-sm text-gray-500">${answer.brand}</div>
                    </div>
                  </div>
                  
                  <h3 class="text-lg font-bold text-gray-900 mb-2">${answer.product}</h3>
                  
                  <!-- 商品特性 -->
                  ${answer.features && Object.keys(answer.features).length > 0 ? `
                    <div class="mb-4">
                      <h4 class="text-sm font-bold text-gray-700 mb-2">商品特性</h4>
                      <div class="flex flex-wrap gap-2">
                        ${Object.entries(answer.features).map(([key, value]) => `
                          <span class="feature-badge px-3 py-1 rounded-full text-xs">
                            <span class="font-medium">${key}:</span> ${value}
                          </span>
                        `).join('')}
                      </div>
                    </div>
                  ` : ''}
                  
                  <!-- 评选理由 -->
                  <div class="mb-4">
                    <h4 class="text-sm font-bold text-gray-700 mb-2">评选理由</h4>
                    <ul class="space-y-2">
                      ${answer.allReasons.map(reason => `
                        <li class="flex items-start gap-2 text-sm text-gray-600">
                          <i class="fa-solid fa-check text-green-500 mt-0.5"></i>
                          <span>${reason}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                  
                  <!-- 评分和评价 -->
                  <div class="flex items-center justify-between border-t border-gray-100 pt-4">
                    <div class="flex items-center gap-4">
                      <div class="flex items-center">
                        <i class="fa-solid fa-star text-yellow-500 mr-1"></i>
                        <span class="font-bold">${answer.rating}</span>
                        <span class="text-gray-500 text-sm ml-1">(${answer.reviewCount.toLocaleString()}评价)</span>
                      </div>
                      <button class="text-blue-600 hover:text-blue-800 text-sm font-medium">
                        <i class="fa-solid fa-cart-shopping mr-1"></i>立即购买
                      </button>
                    </div>
                    <button class="text-gray-600 hover:text-gray-800 text-sm">
                      <i class="fa-solid fa-share mr-1"></i>分享
                    </button>
                  </div>
                </div>
                `;
              }).join('')}
            </div>
          </div>
        ` : `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div class="text-center py-8">
              <i class="fa-solid fa-search text-4xl text-gray-300 mb-4"></i>
              <p class="text-gray-500">暂无最佳商品推荐</p>
              <p class="text-sm text-gray-400 mt-2">该商品尚未有完整的分析和推荐</p>
            </div>
          </div>
        `}
        
        <!-- 评论区域 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h2 class="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-comments text-blue-500"></i>用户评论
            <span class="text-sm font-normal text-gray-400">${comments.length}条评论</span>
          </h2>
          
          <!-- 发表评论框 -->
          <div class="mb-6">
            <textarea id="comment-input" 
                      class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" 
                      rows="3" 
                      placeholder="分享你的使用经验或看法..."></textarea>
            <div class="flex justify-between items-center mt-3">
              <div class="text-sm text-gray-500">
                <i class="fa-solid fa-info-circle mr-1"></i>请文明发言，遵守社区规范
              </div>
              <button onclick="submitComment()" 
                      class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
                发表评论
              </button>
            </div>
          </div>
          
          <!-- 评论列表 -->
          <div class="space-y-6">
            ${comments.map(comment => `
              <div class="comment-card pb-6">
                <div class="flex items-start gap-3 mb-3">
                  <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-lg">
                    ${comment.avatar}
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <div>
                        <span class="font-bold text-gray-900">${comment.user}</span>
                        <span class="text-gray-500 text-sm ml-2">${comment.time}</span>
                      </div>
                      <button class="text-gray-400 hover:text-gray-600">
                        <i class="fa-solid fa-ellipsis-h"></i>
                      </button>
                    </div>
                    <p class="text-gray-700 mt-2">${comment.content}</p>
                    
                    <div class="flex items-center gap-4 mt-3">
                      <button class="flex items-center gap-1 text-gray-500 hover:text-blue-600 text-sm">
                        <i class="fa-solid fa-thumbs-up"></i>
                        <span>${comment.likes}</span>
                      </button>
                      <button class="text-gray-500 hover:text-gray-700 text-sm" onclick="toggleReply(${comment.id})">
                        <i class="fa-solid fa-reply mr-1"></i>回复
                      </button>
                    </div>
                    
                    <!-- 回复列表 -->
                    ${comment.replies && comment.replies.length > 0 ? `
                      <div class="ml-10 mt-4 space-y-4">
                        ${comment.replies.map(reply => `
                          <div class="flex items-start gap-3">
                            <div class="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm">
                              ${reply.avatar}
                            </div>
                            <div class="flex-1">
                              <div class="flex justify-between">
                                <span class="font-medium text-gray-900">${reply.user}</span>
                                <span class="text-gray-500 text-xs">${reply.time}</span>
                              </div>
                              <p class="text-gray-600 text-sm mt-1">${reply.content}</p>
                              <button class="flex items-center gap-1 text-gray-400 hover:text-blue-600 text-xs mt-2">
                                <i class="fa-solid fa-thumbs-up"></i>
                                <span>${reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <!-- 右侧：评测维度和相关信息 -->
      <div class="space-y-6">
        <!-- 评测维度 -->
        ${hasAnswers ? `
          <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
            <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
              <i class="fa-solid fa-chart-bar text-purple-500"></i>评测维度
            </h3>
            <div class="space-y-3">
              ${answers.slice(0, 3).map(answer => {
                const dimensions = getEvaluationDimensionsForCategory(level1, level2, answer.priceIntervalId);
                return dimensions.map(dim => `
                  <div class="dimension-card bg-gray-50 rounded-r p-3">
                    <div class="flex justify-between items-start mb-1">
                      <span class="font-medium text-gray-900">${dim.name}</span>
                      <span class="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">权重 ${dim.weight}%</span>
                    </div>
                    <p class="text-xs text-gray-600 mb-2">${dim.description}</p>
                    <div class="text-xs text-gray-500">
                      <div class="font-medium mb-1">评价标准:</div>
                      <div class="flex flex-wrap gap-1">
                        ${dim.evaluationCriteria.map(criteria => `
                          <span class="px-2 py-0.5 bg-white border border-gray-200 rounded">${criteria}</span>
                        `).join('')}
                      </div>
                    </div>
                  </div>
                `).join('');
              }).join('')}
            </div>
          </div>
        ` : ''}
        
        <!-- 相关商品 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="font-bold text-gray-900 mb-3 flex items-center gap-2">
            <i class="fa-solid fa-link text-green-500"></i>相关商品
          </h3>
          <div class="space-y-3">
            <a href="#" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <i class="fa-solid fa-razor text-blue-600"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">电动剃须刀</div>
                <div class="text-xs text-gray-500">同属剃须用品</div>
              </div>
            </a>
            <a href="#" class="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
              <div class="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <i class="fa-solid fa-spray-can-sparkles text-purple-600"></i>
              </div>
              <div>
                <div class="font-medium text-gray-900">剃须泡沫</div>
                <div class="text
