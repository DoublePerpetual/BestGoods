const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3040;

// ==========================================
// 全球最佳商品百科全书 · 垂直布局详情页
// 3个价格区间垂直排列，无需切换
// ==========================================

// 加载数据
let CATEGORY_TREE = {};
let STATS = { categories: 0, subcategories: 0, items: 0 };

function loadRealData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'global-categories-expanded.json');
    console.log('📂 加载24.5万品类数据...');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (rawData.categories) {
      CATEGORY_TREE = {};
      Object.entries(rawData.categories).forEach(([l1, l2Categories]) => {
        CATEGORY_TREE[l1] = { children: {} };
        Object.entries(l2Categories).forEach(([l2, l3Items]) => {
          if (Array.isArray(l3Items)) {
            CATEGORY_TREE[l1].children[l2] = { items: l3Items };
          }
        });
      });
      
      STATS.categories = Object.keys(CATEGORY_TREE).length;
      STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
      STATS.items = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
        acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
      
      console.log(`✅ 数据加载成功: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
    }
  } catch (error) {
    console.error('❌ 数据加载失败:', error.message);
    loadDefaultData();
  }
}

function loadDefaultData() {
  CATEGORY_TREE = {
    "个护健康": {
      children: {
        "剃须用品": {
          items: ["一次性剃须刀", "电动剃须刀", "剃须泡沫", "须后水"]
        }
      }
    }
  };
  STATS.categories = 1;
  STATS.subcategories = 1;
  STATS.items = 4;
}

// 数据模型
const PRICE_INTERVALS = [
  { id: "interval_1", name: "经济型", range: "¥5-¥15", color: "green", icon: "fa-money-bill-wave" },
  { id: "interval_2", name: "标准型", range: "¥16-¥30", color: "blue", icon: "fa-balance-scale" },
  { id: "interval_3", name: "高端型", range: "¥31-¥50", color: "purple", icon: "fa-crown" }
];

const DIMENSIONS = [
  { id: "dim_a", name: "性价比最高", description: "在价格和性能之间取得最佳平衡", color: "green", icon: "fa-percentage" },
  { id: "dim_b", name: "最耐用", description: "使用寿命长，质量可靠", color: "blue", icon: "fa-shield-alt" },
  { id: "dim_c", name: "最舒适", description: "使用体验最顺滑，减少皮肤刺激", color: "purple", icon: "fa-smile" }
];

// 电商平台
const ECOMMERCE_PLATFORMS = [
  { name: "淘宝", icon: "fa-shopping-cart", color: "orange", url: "https://taobao.com/search?q=" },
  { name: "京东", icon: "fa-bolt", color: "red", url: "https://jd.com/search?q=" },
  { name: "拼多多", icon: "fa-users", color: "yellow", url: "https://pinduoduo.com/search?q=" },
  { name: "天猫", icon: "fa-cat", color: "pink", url: "https://tmall.com/search?q=" },
  { name: "苏宁易购", icon: "fa-sun", color: "blue", url: "https://suning.com/search?q=" }
];

// 详情页路由
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  res.send(renderVerticalDetailPage(level1, level2, item));
});

function renderVerticalDetailPage(level1, level2, item) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 详细分析</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .price-interval-section { border-left: 4px solid; margin-bottom: 2rem; }
    .product-card { border: 2px solid; transition: all 0.3s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15); }
    .vote-btn:hover { transform: scale(1.1); }
    .platform-btn:hover { transform: translateY(-2px); }
    .dimension-badge { position: absolute; top: -12px; left: 16px; z-index: 10; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-6xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div class="mb-6">
      <a href="http://localhost:3024/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" 
         class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
        <i class="fa-solid fa-arrow-left"></i> 返回 ${level2} 分类
      </a>
    </div>
    
    <!-- 商品标题 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap gap-2 mb-4">
        <span class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
          <i class="fa-solid fa-tags mr-1"></i>${level1}
        </span>
        <span class="px-3 py-1.5 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
          <i class="fa-solid fa-folder mr-1"></i>${level2}
        </span>
      </div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item}</h1>
      <p class="text-gray-600">基于3个价格区间和3个评测维度的详细分析，共推荐9款最佳商品</p>
    </div>
    
    <!-- 价格区间1: 经济型 -->
    <div class="price-interval-section bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 border-l-green-500">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <i class="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">经济型 <span class="text-lg font-normal text-gray-600">(¥5-¥15)</span></h2>
          <p class="text-gray-600">适合预算有限、临时使用或学生群体</p>
        </div>
      </div>
      
      <!-- 3个维度的商品展示 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        ${DIMENSIONS.map(dim => {
          const product = {
            id: "p1" + dim.id.slice(-1),
            name: dim.id === "dim_a" ? "吉列蓝II剃须刀" : dim.id === "dim_b" ? "舒适X3经济装" : "飞利浦基础款",
            brand: dim.id === "dim_a" ? "吉列" : dim.id === "dim_b" ? "舒适" : "飞利浦",
            price: dim.id === "dim_a" ? 8.5 : dim.id === "dim_b" ? 12.0 : 10.5,
            rating: dim.id === "dim_a" ? 4.3 : dim.id === "dim_b" ? 4.5 : 4.2,
            reviewCount: dim.id === "dim_a" ? 12500 : dim.id === "dim_b" ? 8900 : 7600,
            reasons: [
              "价格合理，性价比高",
              "质量可靠，品牌保证",
              "适合日常使用需求",
              dim.id === "dim_a" ? "推荐给预算有限的学生和备用用户" : 
              dim.id === "dim_b" ? "推荐给注重耐用性的用户" : 
              "推荐给皮肤敏感的新手用户"
            ],
            votes: { up: 1245, down: 89 },
            comments: [
              { user: "张三", time: "2026-02-16", content: "性价比确实很高，适合学生党", likes: 45 }
            ]
          };
          
          return `
            <div class="product-card rounded-xl p-5 border-2 border-${dim.color}-300 bg-gradient-to-br from-${dim.color}-50 to-white relative">
              <!-- 维度标签 -->
              <div class="dimension-badge px-3 py-1 bg-${dim.color}-500 text-white rounded-full text-sm font-bold">
                ${dim.name}
              </div>
              
              <!-- 维度说明 -->
              <div class="flex items-center gap-2 mb-4 mt-2">
                <div class="w-8 h-8 rounded-full bg-${dim.color}-100 flex items-center justify-center">
                  <i class="fa-solid ${dim.icon} text-${dim.color}-600"></i>
                </div>
                <div class="text-sm text-gray-600">${dim.description}</div>
              </div>
              
              <!-- 商品信息 -->
              <h3 class="text-xl font-bold text-gray-900 mb-2">${product.name}</h3>
              <div class="flex items-center justify-between mb-4">
                <div>
                  <div class="text-sm text-gray-500">${product.brand}</div>
                  <div class="text-2xl font-bold text-gray-900">¥${product.price}</div>
                </div>
                <div class="text-right">
                  <div class="flex items-center">
                    ${Array.from({length: 5}, (_, i) => `
                      <i class="fa-solid fa-star ${i < Math.floor(product.rating) ? 'text-yellow-500' : 'text-gray-300'}"></i>
                    `).join('')}
                  </div>
                  <div class="text-xs text-gray-500">${product.reviewCount.toLocaleString()}评价</div>
                </div>
              </div>
              
              <!-- 推荐理由 -->
              <div class="mb-4">
                <h4 class="text-sm font-bold text-gray-700 mb-2">推荐理由</h4>
                <ul class="space-y-2 text-sm text-gray-600">
                  ${product.reasons.map(reason => `
                    <li class="flex items-start gap-2">
                      <i class="fa-solid fa-check text-green-500 mt-0.5"></i>
                      <span>${reason}</span>
                    </li>
                  `).join('')}
                </ul>
              </div>
              
              <!-- 点赞点踩 -->
              <div class="border-t border-gray-100 pt-4 mb-4">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-4">
                    <button class="vote-btn flex items-center gap-1 px-3 py-1.5 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100"
                            onclick="vote('${product.id}', 'up')">
                      <i class="fa-solid fa-thumbs-up text-green-600"></i>
                      <span class="font-medium text-green-700" id="up-${product.id}">${product.votes.up}</span>
                    </button>
                    <button class="vote-btn flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                            onclick="vote('${product.id}', 'down')">
                      <i class="fa-solid fa-thumbs-down text-red-600"></i>
                      <span class="font-medium text-red-700" id="down-${product.id}">${product.votes.down}</span>
                    </button>
                  </div>
                </div>
              </div>
              
              <!-- 电商平台购买链接 -->
              <div class="border-t border-gray-100 pt-4">
                <h5 class="text-sm font-bold text-gray-700 mb-2">购买渠道</h5>
                <div class="flex flex-wrap gap-2">
                  ${ECOMMERCE_PLATFORMS.map(platform => `
                    <a href="${platform.url}${encodeURIComponent(product.name)}" 
                       target="_blank"
                       class="platform-btn inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-${platform.color}-200 bg-${platform.color}-50 hover:bg-${platform.color}-100 text-${platform.color}-700">
                      <i class="fa-solid ${platform.icon}"></i>
                      <span class="text-sm font-medium">${platform.name}</span>
                    </a>
                  `).join('')}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- 价格区间2: 标准型 -->
    <div class="price-interval-section bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 border-l-blue-500">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <i class="fa-solid fa-balance-scale text-blue-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">标准型 <span class="text-lg font-normal text-gray-600">(¥16-¥30)</span></h2>
          <p class="text-gray-600">性价比最高的主流选择，适合日常使用</p>
        </div>
      </div>
      
      <!-- 3个维度的商品展示 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        ${DIMENSIONS.map(dim => {
          const product = {
            id: "p2" + dim.id.slice(-1),
            name: dim.id === "dim_a" ? "吉列锋隐5剃须刀" : dim.id === "dim_b" ? "博朗3系电动剃须刀" : "舒适水次元5",
            brand: dim.id === "dim_a" ? "吉列" : dim.id === "dim_b" ? "博朗" : "舒适",
            price: dim.id === "dim_a" ? 25.0 : dim.id === "dim_b" ? 28.0 : 22.0,
            rating: dim.id === "dim_a" ? 4.8 : dim.id === "dim_b" ? 4.6 : 4.7,
            reviewCount: dim.id === "dim_a" ? 23400 : dim.id === "dim_b" ? 15600 : 18200,
            reasons: [
              "性能均衡，适合大多数用户",
              "品牌口碑好，质量有保障",
              "功能全面，满足日常需求",
              dim.id === "dim_a" ? "推荐给追求剃净度的用户" : 
              dim.id === "dim_b" ? "推荐给需要快速剃须的用户" : 
              "推荐给注重舒适体验的用户"
            ],
            votes: { up: 2345, down: 123 },
            comments: [
              { user: "李四", time: "2026-02-17", content: "FlexBall技术确实好用，下巴部位也能剃得很干净", likes: 89 }
            ]
          };
          
          return `
            <div class="product-card rounded-xl p-5 border-2 border-${dim.color}-300 bg-gradient-to-br from-${dim.color}-50 to-white relative">
              <!-- 维度标签 -->
              <div class="dimension-badge px-3 py-1 bg-${dim.color}-500