const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3038;

// ==========================================
// 全球最佳商品百科全书 · 3×3详情页架构
// 3个价格区间 × 3个维度 = 9款商品
// ==========================================

// ==========================================
// 1. 加载24.5万品类数据
// ==========================================
let CATEGORY_TREE = {};
let STATS = {
  categories: 0,
  subcategories: 0,
  items: 0,
  lastUpdated: new Date().toISOString()
};

function loadRealData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'global-categories-expanded.json');
    console.log('📂 加载24.5万品类数据...');
    
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (rawData.categories) {
      CATEGORY_TREE = {};
      
      Object.entries(rawData.categories).forEach(([l1, l2Categories]) => {
        CATEGORY_TREE[l1] = {
          icon: getIcon(l1),
          children: {}
        };
        
        Object.entries(l2Categories).forEach(([l2, l3Items]) => {
          if (Array.isArray(l3Items)) {
            CATEGORY_TREE[l1].children[l2] = {
              icon: getIcon(l2),
              items: l3Items
            };
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
    '汽车': 'fa-car'
  };
  
  for (const [key, icon] of Object.entries(icons)) {
    if (name.includes(key)) return icon;
  }
  return 'fa-box';
}

function loadDefaultData() {
  CATEGORY_TREE = {
    "个护健康": {
      icon: "fa-user",
      children: {
        "剃须用品": {
          icon: "fa-razor",
          items: ["一次性剃须刀", "电动剃须刀", "剃须泡沫", "须后水"]
        }
      }
    }
  };
  STATS.categories = 1;
  STATS.subcategories = 1;
  STATS.items = 4;
}

// ==========================================
// 2. 3×3架构数据模型
// ==========================================
const PRICE_INTERVALS = [
  {
    id: "interval_1",
    name: "经济型",
    range: "¥5-¥15",
    description: "适合预算有限、临时使用或学生群体",
    color: "green",
    icon: "fa-money-bill-wave",
    marketShare: "40%",
    targetUsers: "学生、旅行者、备用用户"
  },
  {
    id: "interval_2", 
    name: "标准型",
    range: "¥16-¥30",
    description: "性价比最高的主流选择，适合日常使用",
    color: "blue",
    icon: "fa-balance-scale",
    marketShare: "45%",
    targetUsers: "上班族、日常用户、家庭用户"
  },
  {
    id: "interval_3",
    name: "高端型",
    range: "¥31-¥50",
    description: "高品质体验，适合追求舒适度和性能的用户",
    color: "purple",
    icon: "fa-crown",
    marketShare: "12%",
    targetUsers: "商务人士、品质追求者、礼品购买者"
  }
];

const DIMENSIONS = [
  {
    id: "dim_a",
    name: "性价比最高",
    description: "在价格和性能之间取得最佳平衡",
    icon: "fa-percentage",
    color: "green",
    criteria: ["价格/性能比", "功能完整性", "用户满意度", "长期使用成本"]
  },
  {
    id: "dim_b",
    name: "最耐用",
    description: "使用寿命长，质量可靠",
    icon: "fa-shield-alt",
    color: "blue",
    criteria: ["材质质量", "使用寿命", "维护成本", "用户反馈"]
  },
  {
    id: "dim_c",
    name: "最舒适",
    description: "使用体验最顺滑，减少皮肤刺激",
    icon: "fa-smile",
    color: "purple",
    criteria: ["人体工学设计", "皮肤友好度", "操作便利性", "舒适度评分"]
  }
];

// 9款商品数据 (3区间 × 3维度)
const BEST_PRODUCTS = {
  // 经济型区间
  "interval_1": {
    "dim_a": {
      id: "p1a",
      name: "吉列蓝II剃须刀",
      brand: "吉列",
      price: 8.5,
      rating: 4.3,
      reviewCount: 12500,
      features: ["2层刀片", "普通润滑条", "塑料手柄", "5支装"],
      reasons: [
        "价格最低的吉列正品剃须刀，性价比极高",
        "2层刀片设计足够满足基本剃须需求",
        "5支装适合家庭使用或长期备用",
        "吉列品牌保证，质量可靠"
      ],
      pros: ["价格极低", "品牌可靠", "适合备用"],
      cons: ["刀片较薄", "润滑条一般", "手柄质感普通"]
    },
    "dim_b": {
      id: "p1b",
      name: "舒适X3经济装",
      brand: "舒适",
      price: 12.0,
      rating: 4.5,
      reviewCount: 8900,
      features: ["3层刀片", "Hydrate润滑技术", "防滑橡胶手柄", "4支装"],
      reasons: [
        "3层刀片设计，剃须更干净彻底",
        "Hydrate润滑技术减少皮肤刺激",
        "刀片寿命较长，单次使用成本更低",
        "防滑手柄设计，使用更安全"
      ],
      pros: ["刀片耐用", "润滑技术好", "手柄防滑"],
      cons: ["价格稍高", "包装较少", "品牌知名度较低"]
    },
    "dim_c": {
      id: "p1c",
      name: "飞利浦基础款",
      brand: "飞利浦",
      price: 10.5,
      rating: 4.2,
      reviewCount: 7600,
      features: ["安全刀网", "防刮伤设计", "轻量化手柄", "3支装"],
      reasons: [
        "安全刀网设计，最大限度减少刮伤风险",
        "特别适合剃须新手和皮肤敏感者",
        "轻量化设计，握持舒适",
        "飞利浦品质保证"
      ],
      pros: ["最安全", "适合新手", "重量轻"],
      cons: ["剃净度一般", "刀片较贵", "包装量少"]
    }
  },
  
  // 标准型区间
  "interval_2": {
    "dim_a": {
      id: "p2a",
      name: "吉列锋隐5剃须刀",
      brand: "吉列",
      price: 25.0,
      rating: 4.8,
      reviewCount: 23400,
      features: ["5层刀片", "FlexBall润滑条", "金属质感手柄", "FlexBall刀头"],
      reasons: [
        "5层刀片设计，一次剃净不留胡茬",
        "FlexBall刀头技术，完美贴合面部轮廓",
        "润滑条含维生素E，保护皮肤",
        "金属质感手柄，握感舒适耐用"
      ],
      pros: ["剃净度高", "贴合性好", "手感优秀"],
      cons: ["价格较高", "刀头较贵", "需要定期更换"]
    },
    "dim_b": {
      id: "p2b",
      name: "博朗3系电动剃须刀",
      brand: "博朗",
      price: 28.0,
      rating: 4.6,
      reviewCount: 15600,
      features: ["3刀头系统", "干湿两用", "1小时快充", "自动清洁"],
      reasons: [
        "3刀头系统，覆盖面积大剃须快",
        "干湿两用设计，适应不同使用习惯",
        "1小时快充，可使用45分钟",
        "自动清洁底座，维护方便"
      ],
      pros: ["剃须快速", "使用方便", "维护简单"],
      cons: ["需要充电", "初期适应期", "刀头更换贵"]
    },
    "dim_c": {
      id: "p2c",
      name: "舒适水次元5",
      brand: "舒适",
      price: 22.0,
      rating: 4.7,
      reviewCount: 18200,
      features: ["5层刀片", "水活化润滑条", "FlexBall手柄", "磁力悬挂"],
      reasons: [
        "水活化润滑条，遇水释放更多润滑剂",
        "FlexBall手柄设计，操作更灵活",
        "磁力悬挂刀头，贴合度极佳",
        "特别适合敏感肌肤"
      ],
      pros: ["润滑极佳", "贴合度好", "适合敏感肌"],
      cons: ["价格偏高", "耗材较贵", "需要湿润使用"]
    }
  },
  
  // 高端型区间
  "interval_3": {
    "dim_a": {
      id: "p3a",
      name: "吉列锋隐致护",
      brand: "吉列",
      price: 45.0,
      rating: 4.9,
      reviewCount: 8900,
      features: ["7层刀片", "微梳技术", "铂金涂层", "智能润滑条"],
      reasons: [
        "7层刀片设计，行业领先的剃净技术",
        "微梳技术预先梳理胡须，剃须更顺畅",
        "铂金涂层刀片，更耐用更顺滑",
        "智能润滑条根据使用情况释放润滑剂"
      ],
      pros: ["剃净度顶级", "技术先进", "耐用性好"],
      cons: ["价格昂贵", "刀头极贵", "适合特定人群"]
    },
    "dim_b": {
      id: "p3b",
      name: "博朗7系电动剃须刀",
      brand: "博朗",
      price: 65.0,
      rating: 4.8,
      reviewCount: 6700,
      features: ["5刀头系统", "声波技术", "智能清洁", "LED显示屏"],
      reasons: [
        "5刀头声波技术，剃须同时按摩皮肤",
        "智能清洁系统，自动维护刀头",
        "LED显示屏显示状态和剩余电量",
        "德国精工制造，质量可靠"
      ],
      pros: ["技术先进", "智能清洁", "德国品质"],
      cons: ["价格很高", "需要维护", "较重"]
    },
    "dim_c": {
      id: "p3c",
      name: "飞利浦高端系列",
      brand: "飞利浦",
      price: 55.0,
      rating: 4.7,
      reviewCount: 5400,
      features: ["V型刀片", "舒适环技术", "多向浮动", "智能感应"],
      reasons: [
        "V型刀片设计，减少皮肤拉扯感",
        "舒适环技术，最大限度减少刺激",
        "多向浮动刀头，完美贴合面部",
        "智能感应技术，自动调节功率"
      ],
      pros: ["舒适度顶级", "智能感应", "贴合度好"],
      cons: ["价格昂贵", "充电较慢", "较重"]
    }
  }
};

// ==========================================
// 3. 详情页路由 - 3×3架构
// ==========================================
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  res.send(render3x3DetailPage(level1, level2, item));
});

// 渲染3×3详情页
function render3x3DetailPage(level1, level2, item) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 3×3详细分析 · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .interval-tab.active { background-color: #3b82f6; color: white; }
    .dimension-card { border-left: 4px solid; transition: all 0.3s; }
    .dimension-card:hover { transform: translateY(-2px); box-shadow: 0 8px 16px -4px rgba(0,0,0,0.1); }
    .product-card { border: 2px solid; transition: all 0.3s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15); }
    .feature-badge { background-color: #f3f4f6; border: 1px solid #d1d5db; }
    .pros-cons li { position: relative; padding-left: 1.5rem; }
    .pros-cons li.pro:before { content: "✓"; color: #10b981; }
    .pros-cons li.con:before { content: "✗"; color: #ef4444; }
    .comparison-table td, .comparison-table th { border: 1px solid #e5e7eb; }
    .price-badge { font-size: 0.75rem; padding: 0.25rem 0.5rem; border-radius: 9999px; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div class="mb-6">
      <a href="http://localhost:3024/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" 
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
      <p class="text-gray-600 mb-4">基于3个价格区间 × 3个评测维度的详细分析，共评选9款最佳商品</p>
      
      <!-- 架构说明 -->
      <div class="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-2 mb-2">
          <i class="fa-solid fa-sitemap text-blue-500"></i>
          <span class="font-bold text-blue-700">3×3分析架构</span>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div class="text-center">
            <div class="font-bold text-green-600">3个价格区间</div>
            <div class="text-gray-600">覆盖不同预算需求</div>
          </div>
          <div class="text-center">
            <div class="font-bold text-blue-600">3个评测维度</div>
            <div class="text-gray-600">多角度评估商品</div>
          </div>
          <div class="text-center">
            <div class="font-bold text-purple-600">9款最佳商品</div>
            <div class="text-gray-600">每个维度评选1款</div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 价格区间导航 -->
    <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-6">
      <div class="flex flex-wrap gap-2">
        ${PRICE_INTERVALS.map((interval, index) => `
          <button class="interval-tab px-4 py-2 rounded-lg border border-gray-300 font-medium ${index === 0 ? 'active' : 'bg-gray-50 hover:bg-gray-100'}"
                  onclick="switchInterval('${interval.id}')"
                  id="tab-${interval.id}">
            <i class="fa-solid ${interval.icon} mr-2"></i>${interval.name}
            <span class="ml-2 text-sm font-normal">${interval.range}</span>
          </button>
        `).join('')}
      </div>
    </div>
    
    <!-- 3×3内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-4 gap-6">
      <!-- 左侧：维度说明 -->
      <div class="lg:col-span-1">
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sticky top-6">
          <h3 class="font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-chart-bar text-blue-500"></i>评测维度说明
          </h3>
          <div class="space-y-4">
            ${DIMENSIONS.map(dim => `
              <div class="dimension-card rounded-r p-4 border-l-4 border-${dim.color}-500">
                <div class="flex items-center gap-2 mb-2">
                  <i class="fa-solid ${dim.icon} text-${dim.color}-500"></i>
                  <span class="font-bold text-gray-900">${dim.name}</span>
                </div>
                <p class="text-sm text-gray-600 mb-3">${dim.description}</p>
                <div class="text-xs text-gray-500">
                  <div class="font-medium mb-1">评价标准:</div>
                  <div class="flex flex-wrap gap-1">
                    ${dim.criteria.map(criteria => `
                      <span class="px-2 py-0.5 bg-gray-100 rounded">${criteria}</span>
                    `).join('')}
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
      
      <!-- 右侧：3×3商品展示 -->
      <div class="lg:col-span-3">
        <!-- 当前价格区间信息 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5 mb-6">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h2 class="text-xl font-bold text-gray-900" id="current-interval-name">${PRICE_INTERVALS[0].name}</h2>
              <p class="text-gray-600" id="current-interval-desc">${PRICE_INTERVALS[0].description}</p>
            </div>
            <div class="text-right">
              <div class="text-2xl font-bold text-gray-900" id="current-interval-range">${PRICE_INTERVALS[0].range}</div>
              <div class="text-sm text-gray-500">价格范围</div>
            </div>
          </div>
          
          <!-- 3个维度的商品展示 -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            ${DIMENSIONS.map(dim => {
              const product = BEST_PRODUCTS["interval_1"][dim.id];
              return `
                <div class="product-card rounded-xl p-5 border-2 border-${dim.color}-300 bg-gradient-to-br from-${dim.color}-50 to-white">
                  <div class="flex justify-between items-start mb-3">
                    <span class="px-3 py-1 bg-${dim.color}-100 text-${dim.color}-800 rounded-full text-sm font-bold">
                      ${dim.name}
                    </span>
                    <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">推荐度 ${product.rating}/5.0</span>
                  </div>
                  
                  <h3 class="text-lg font-bold text-gray-900 mb-2">${product.name}</h3>
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
                  
                  <!-- 商品特性 -->
                  <div class="mb-4">
                    <h4 class="text-sm font-bold text-gray-700 mb-2">主要特性</h4>
                    <div class="flex flex-wrap gap-2">
                      ${product.features.map(feature => `
                        <span class="feature-badge px-2 py-1 rounded text-xs">${feature}</span>
                      `).join('')}
                    </div>
                  </div>
                  
                  <!-- 推荐理由 -->
                  <div class="mb-4">
                    <h4 class="text-sm font-bold text-gray-700 mb-2">推荐理由</h4>
                    <ul class="space-y-1 text-sm text-gray-600">
                      ${product.reasons.slice(0, 2).map(reason => `
                        <li class="flex items-start gap-1">
                          <i class="fa-solid fa-check text-green-500 mt-0.5"></i>
                          <span>${reason}</span>
                        </li>
                      `).join('')}
                    </ul>
                  </div>
                  
                  <!-- 优缺点 -->
                  <div class="border-t border-gray-100 pt-4">
                    <div class="grid grid-cols-2 gap-4">
                      <div>
                        <h5 class="text-xs font-bold text-green-600 mb-1">优点</h5>
                        <ul class="pros-cons space-y-1 text-xs">
                          ${product.pros.slice(0, 2).map(pro => `
                            <li class="pro">${pro}</li>
                          `).join('')}
                        </ul>
                      </div>
                      <div>
                        <h5 class="text-xs font-bold text-red-600 mb-1">缺点</h5>
                        <ul class="pros-cons space-y-1 text-xs">
                          ${product.cons.slice(0, 2).map(con => `
                            <li class="con">${con}</li>
                          `).join('')}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
        
        <!-- 对比分析表格 -->
        <div class="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 class="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <i class="fa-solid fa-table text-purple-500"></i>9款商品对比分析
          </h3>
          
          <div class="overflow-x-auto">
            <table class="comparison-table w-full text-sm">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-4 py-3 text-left font-bold text-gray-700">价格区间 / 维度</th>
                  ${DIMENSIONS.map(dim => `
                    <th class="px-4 py-3 text-center font-bold text-${dim.color}-700">${dim.name}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${PRICE_INTERVALS.map(interval => `
                  <tr class="bg-white hover:bg-gray-50">
                    <td class="px-4 py-3 font-bold text-gray-900 border-r">
                      <div class="flex items-center gap-2">
                        <i class="fa-solid ${interval.icon} text-${interval.color}-500"></i>
                        <span>${interval.name}</span>
                        <span class="text-xs font-normal text-gray-500">${interval.range}</span>
                      </div>
                    </td>
                    ${DIMENSIONS.map(dim => {
                      const product = BEST_PRODUCTS[interval.id][dim.id];
                      return `
                        <td class="px-4 py-3 text-center">
                          <div class="font-bold text-gray-900">${product.name}</div>
                          <div class="text-xs text-gray-500">${product.brand}</div>
                          <div class="mt-1">
                            <span class="price-badge bg-${interval.color}-100 text-${interval.color}-800">¥${product.price}</span>
                          </div>
                          <div class="mt-1 text-xs">
                            <i class="fa-solid fa-star text-yellow-500"></i>
                            <span>${product.rating}</span>
                          </div>
                        </td>
                      `;
                    }).join('')}
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          
          <!-- 购买建议 -->
          <div class="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <div class="flex items-center gap-2 mb-2">
              <i class="fa-solid fa-lightbulb text-blue-500"></i>
              <span class="font-bold text-blue-700">购买建议</span>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div class="font-medium text-gray-900 mb-1">选择经济型如果:</div>
                <ul class="text-gray-600 space-y-1">
                  <li>• 预算有限，追求实用</li>
                  <li>• 临时使用或旅行备用</li>
                  <li>• 对剃须要求不高</li>
                </ul>
              </div>
              <div>
                <div class="font-medium text-gray-900 mb-1">选择标准型如果:</div>
                <ul class="text-gray-600 space-y-1">
                  <li>• 日常使用，追求平衡</li>
                  <li>• 注重性价比和舒适度</li>
                  <li>• 希望有较好体验</li>
                </ul>
              </div>
              <div>
                <div class="font-medium text-gray-900 mb-1">选择高端型如果:</div>
                <ul class="text-gray-600 space-y-1">
                  <li>• 追求顶级体验</li>
                  <li>• 商务场合或礼品</li>
                  <li>• 预算充足</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    // 当前显示的价格区间
    let currentInterval = 'interval_1';
    
    // 切换价格区间
    function switchInterval(intervalId) {
      // 更新标签状态
      document.querySelectorAll('.interval-tab').forEach(tab => {
        tab.classList.remove('active');
        tab.classList.add('bg-gray-50', 'hover:bg-gray-100');
      });
      document.getElementById('tab-' + intervalId).classList.add('active');
      document.getElementById('tab-' + intervalId).classList.remove('bg-gray-50', 'hover:bg-gray-100');
      
      // 更新区间信息
      const interval = ${JSON.stringify(PRICE_INTERVALS)}.find(i => i.id === intervalId);
      if (interval) {
        document.getElementById('current-interval-name').textContent = interval.name;
        document.getElementById('current-interval-desc').textContent = interval.description;
        document.getElementById('current-interval-range').textContent = interval.range;
      }
      
      currentInterval = intervalId;
      console.log('切换到价格区间:', intervalId);
      
      // 这里可以添加AJAX请求来动态加载该区间的商品数据
      // 由于是演示，我们只更新UI状态
    }
    
    // 初始化
    document.addEventListener('DOMContentLoaded', function() {
      console.log('3×3详情页已加载');
      console.log('价格区间:', ${JSON.stringify(PRICE_INTERVALS.map(i => i.name))});
      console.log('评测维度:', ${JSON.stringify(DIMENSIONS.map(d => d.name))});
      console.log('商品总数: 9款 (3区间 × 3维度)');
    });
  </script>
</body>
</html>`;
}

// ==========================================
// 4. 启动服务器
// ==========================================
loadRealData();

app.listen(PORT, () => {
  console.log(`\n🚀 全球最佳商品百科全书 · 3×3详情页架构 已启动`);
  console.log(`📊 数据统计: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}/`);
  console.log(`📱 3×3详情页: http://localhost:${PORT}/category/个护健康/剃须用品/一次性剃须刀`);
  console.log(`🎯 架构特点:`);
  console.log(`   1. 3个价格区间: 经济型 · 标准型 · 高端型`);
  console.log(`   2. 3个评测维度: 性价比 · 耐用性 · 舒适度`);
  console.log(`   3. 9款最佳商品: 每个维度评选1款`);
  console.log(`   4. 对比分析: 完整的9款商品对比表格`);
  console.log(`   5. 交互切换: 点击切换不同价格区间`);
});