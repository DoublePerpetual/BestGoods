const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3036;

// ==========================================
// 全球最佳商品百科全书 · 增强详情页专用服务器
// ==========================================

// ==========================================
// 1. 加载数据
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

function loadRealData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'global-categories-expanded.json');
    console.log('📂 加载24.5万品类数据...');
    
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (rawData.categories) {
      CATEGORY_TREE = {};
      let chinaCount = 0;
      let globalCount = 0;
      
      Object.entries(rawData.categories).forEach(([l1, l2Categories]) => {
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
          }
        });
      });
      
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
// 2. 模拟数据（用于演示）
// ==========================================
const PRICE_INTERVALS = [
  {
    id: "interval_1",
    name: "经济型 (¥5-¥15)",
    min: 5,
    max: 15,
    description: "适合预算有限、临时使用的用户",
    targetUsers: "学生、旅行者、备用用户",
    marketShare: "40%",
    brands: ["吉列", "舒适", "飞利浦"]
  },
  {
    id: "interval_2",
    name: "标准型 (¥16-¥30)",
    min: 16,
    max: 30,
    description: "性价比最高的区间，适合日常使用",
    targetUsers: "上班族、日常用户",
    marketShare: "45%",
    brands: ["吉列锋隐", "舒适水次元", "博朗"]
  },
  {
    id: "interval_3",
    name: "高端型 (¥31-¥50)",
    min: 31,
    max: 50,
    description: "高品质体验，适合追求舒适度的用户",
    targetUsers: "商务人士、品质追求者",
    marketShare: "12%",
    brands: ["吉列锋隐致护", "舒适FlexBall", "飞利浦Norelco"]
  },
  {
    id: "interval_4",
    name: "豪华型 (¥51+)",
    min: 51,
    max: 100,
    description: "顶级配置，奢侈品级别",
    targetUsers: "高端用户、礼品购买者",
    marketShare: "3%",
    brands: ["吉列Labs", "舒适高端系列", "博朗9系"]
  }
];

const EVALUATION_DIMENSIONS = {
  "interval_1": [
    {
      id: "dim_eco_best_value",
      name: "性价比最高",
      description: "价格最低但基本功能齐全",
      evaluationCriteria: ["单支价格", "刀片数量", "基础功能", "用户评价"],
      weight: 50,
      targetUsers: "预算严格限制的用户"
    },
    {
      id: "dim_eco_most_durable",
      name: "最耐用",
      description: "使用寿命长，刀片不易钝",
      evaluationCriteria: ["刀片材质", "使用次数", "防锈处理", "用户反馈"],
      weight: 30,
      targetUsers: "希望减少更换频率的用户"
    },
    {
      id: "dim_eco_safest",
      name: "最安全",
      description: "防刮伤设计，适合新手使用",
      evaluationCriteria: ["安全设计", "刀片保护", "手柄防滑", "事故率"],
      weight: 20,
      targetUsers: "剃须新手、皮肤敏感者"
    }
  ],
  "interval_2": [
    {
      id: "dim_std_best_comfort",
      name: "最舒适",
      description: "剃须体验最顺滑，减少皮肤刺激",
      evaluationCriteria: ["润滑条质量", "刀头灵活性", "皮肤贴合度", "舒适度评分"],
      weight: 40,
      targetUsers: "注重剃须舒适度的用户"
    },
    {
      id: "dim_std_best_shave",
      name: "剃净度最高",
      description: "剃须最干净，不留胡茬",
      evaluationCriteria: ["刀片锋利度", "多层刀片设计", "剃净测试", "用户满意度"],
      weight: 35,
      targetUsers: "追求完美剃须效果的用户"
    },
    {
      id: "dim_std_best_design",
      name: "设计最佳",
      description: "人体工学设计，握感舒适",
      evaluationCriteria: ["手柄设计", "重量平衡", "防滑处理", "外观评分"],
      weight: 25,
      targetUsers: "注重产品设计和手感的用户"
    }
  ]
};

const BEST_PRODUCTS = {
  "interval_1": {
    "dim_eco_best_value": {
      productId: "gillette_blue2",
      productName: "吉列蓝II剃须刀",
      brand: "吉列",
      model: "蓝II",
      price: 8.5,
      rating: 4.3,
      reviewCount: 12500,
      features: {
        "刀片数量": "2层刀片",
        "润滑条": "普通润滑条",
        "手柄": "塑料手柄",
        "包装": "5支装",
        "适用肤质": "普通肤质"
      },
      recommendationReasons: [
        "价格最低的吉列正品剃须刀，性价比极高",
        "2层刀片设计足够满足基本剃须需求",
        "5支装适合家庭使用或长期备用",
        "吉列品牌保证，质量可靠"
      ]
    },
    "dim_eco_most_durable": {
      productId: "schick_x3",
      productName: "舒适X3经济装",
      brand: "舒适",
      model: "X3",
      price: 12.0,
      rating: 4.5,
      reviewCount: 8900,
      features: {
        "刀片数量": "3层刀片",
        "润滑技术": "Hydrate润滑技术",
        "手柄": "防滑橡胶手柄",
        "包装": "4支装",
        "刀片寿命": "最长8次使用"
      },
      recommendationReasons: [
        "3层刀片设计，剃须更干净",
        "Hydrate润滑技术减少皮肤刺激",
        "刀片寿命较长，性价比更高",
        "防滑手柄设计，使用更安全"
      ]
    }
  },
  "interval_2": {
    "dim_std_best_comfort": {
      productId: "gillette_fusion5",
      productName: "吉列锋隐5剃须刀",
      brand: "吉列",
      model: "锋隐5",
      price: 25.0,
      rating: 4.8,
      reviewCount: 23400,
      features: {
        "刀片数量": "5层刀片",
        "润滑条": "FlexBall润滑条",
        "手柄": "金属质感手柄",
        "刀头": "FlexBall灵活刀头",
        "适用肤质": "所有肤质"
      },
      recommendationReasons: [
        "5层刀片设计，一次剃净不留胡茬",
        "FlexBall刀头技术，完美贴合面部轮廓",
        "润滑条含维生素E，保护皮肤",
        "金属质感手柄，握感舒适"
      ]
    }
  }
};

// 模拟投票数据
const VOTE_DATA = {
  "个护健康-剃须用品-一次性剃须刀": {
    likes: 128,
    dislikes: 12,
    userVote: null
  }
};

// 模拟评论数据
const COMMENTS = [
  {
    id: 1,
    user: "张三",
    avatar: "👤",
    content: "吉列蓝II确实性价比很高，适合学生党使用",
    time: "2小时前",
    likes: 24,
    replies: [
      {
        id: 11,
        user: "李四",
        avatar: "👤",
        content: "同意，我用了好几年了",
        time: "1小时前",
        likes: 5
      }
    ]
  },
  {
    id: 2,
    user: "王五",
    avatar: "👤",
    content: "舒适X3的润滑技术确实不错，皮肤不刺激",
    time: "5小时前",
    likes: 18,
    replies: []
  },
  {
    id: 3,
    user: "赵六",
    avatar: "👤",
    content: "锋隐5虽然贵点，但体验真的好很多",
    time: "1天前",
    likes: 32,
    replies: []
  }
];

// ==========================================
// 3. 增强详情页路由
// ==========================================
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  const itemKey = `${level1}-${level2}-${item}`;
  
  // 获取投票数据
  const voteData = VOTE_DATA[itemKey] || { likes: 0, dislikes: 0, userVote: null };
  
  res.send(renderEnhancedDetailPage(level1, level2, item, voteData, COMMENTS));
});

// 渲染增强详情页
function renderEnhancedDetailPage(level1, level2, item, voteData, comments) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 详情 · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .price-interval-card { transition: all 0.3s; border-left: 4px solid #10b981; }
    .price-interval-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.12); }
    .dimension-card { border-left: 4px solid #3b82f6; background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
    .best-product-card { border: 2px solid #fbbf24; background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%); }
    .vote-btn.active { background-color: #3b82f6; color: white; border-color: #3b82f6; }
    .vote-btn.dislike.active { background-color: #ef4444; border-color: #ef4444; }
    .feature-badge { background-color: #f3f4f6; border: 1px solid #d1d5db; transition: all 0.2s; }
    .feature-badge:hover { background-color: #e5e7eb; }
    .comment-card { border-bottom: 1px solid #e5e7eb; transition: all 0.2s; }
    .comment-card:hover { background-color: #f9fafb; }
    .stats-card { background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div class="mb-6">
      <a href="http://localhost:3027/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" 
         class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50">
        <i class="fa-solid fa-arrow-left"></i> 返回 ${level2} 分类
      </a>
    </div>
    
    <!-- 主内容区域 -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 左侧：商品信息和核心内容 -->
      <div class="lg:col-span-2 space-y-6">
        <!-- 商品标题和分类 -->
        <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div class="flex flex-wrap gap-2 mb-4">
            <span class="px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
              <i class="fa-solid fa-tags mr-1"></i>${level1}
            </span>
            <span class="px-3 py-1.5 bg