const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3039;

// ==========================================
// 全球最佳商品百科全书 · 优化详情页
// 简洁设计 + 核心功能突出
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
// 2. 数据模型
// ==========================================
const PRICE_INTERVALS = [
  {
    id: "interval_1",
    name: "经济型",
    range: "¥5-¥15",
    description: "适合预算有限、临时使用或学生群体",
    color: "green",
    icon: "fa-money-bill-wave"
  },
  {
    id: "interval_2", 
    name: "标准型",
    range: "¥16-¥30",
    description: "性价比最高的主流选择，适合日常使用",
    color: "blue",
    icon: "fa-balance-scale"
  },
  {
    id: "interval_3",
    name: "高端型",
    range: "¥31-¥50",
    description: "高品质体验，适合追求舒适度和性能的用户",
    color: "purple",
    icon: "fa-crown"
  }
];

const DIMENSIONS = [
  {
    id: "dim_a",
    name: "性价比最高",
    description: "在价格和性能之间取得最佳平衡",
    icon: "fa-percentage",
    color: "green"
  },
  {
    id: "dim_b",
    name: "最耐用",
    description: "使用寿命长，质量可靠",
    icon: "fa-shield-alt",
    color: "blue"
  },
  {
    id: "dim_c",
    name: "最舒适",
    description: "使用体验最顺滑，减少皮肤刺激",
    icon: "fa-smile",
    color: "purple"
  }
];

// 9款商品数据
const BEST_PRODUCTS = {
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
      cons: ["刀片较薄", "润滑条一般", "手柄质感普通"],
      votes: { up: 1245, down: 89 },
      comments: [
        { user: "张三", time: "2026-02-16", content: "性价比确实很高，适合学生党", likes: 45 },
        { user: "李四", time: "2026-02-15", content: "5支装很划算，可以用很久", likes: 32 }
      ]
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
      cons: ["价格稍高", "包装较少", "品牌知名度较低"],
      votes: { up: 987, down: 45 },
      comments: [
        { user: "王五", time: "2026-02-17", content: "防滑手柄设计很贴心，不容易滑手", likes: 28 }
      ]
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
      cons: ["剃净度一般", "刀片较贵", "包装量少"],
      votes: { up: 856, down: 67 },
      comments: []
    }
  },
  
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
      cons: ["价格较高", "刀头较贵", "需要定期更换"],
      votes: { up: 2345, down: 123 },
      comments: [
        { user: "赵六", time: "2026-02-17", content: "FlexBall技术确实好用，下巴部位也能剃得很干净", likes: 89 },
        { user: "钱七", time: "2026-02-16", content: "金属手柄质感很好，比塑料的耐用多了", likes: 67 }
      ]
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
      cons: ["需要充电", "初期适应期", "刀头更换贵"],
      votes: { up: 1876, down: 98 },
      comments: [
        { user: "孙八", time: "2026-02-15", content: "干湿两用很方便，洗澡时也能用", likes: 54 }
      ]
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
      cons: ["价格偏高", "耗材较贵", "需要湿润使用"],
      votes: { up: 1987, down: 76 },
      comments: [
        { user: "周九", time: "2026-02-16", content: "水活化技术确实不一样，润滑效果很好", likes: 72 }
      ]
    }
  },
  
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
      cons: ["价格昂贵", "刀头极贵", "适合特定人群"],
      votes: { up: 1456, down: 45 },
      comments: [
        { user: "吴十", time: "2026-02-17", content: "7层刀片确实厉害，一次就剃得很干净", likes: 38 }
      ]
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
      cons: ["价格很高", "需要维护", "较重"],
      votes: { up: 987, down: 34 },
      comments: []
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
      cons: ["价格昂贵", "充电较慢", "较重"],
      votes: { up: 876, down: 29 },
      comments: [
        { user: "郑十一", time: "2026-02-15", content: "舒适环技术对敏感皮肤很友好", likes: 41 }
      ]
    }
  }
};

// 电商平台购买链接
const ECOMMERCE_PLATFORMS = [
  {
    name: "淘宝",
    icon: "fa-shopping-cart",
    color: "orange",
    url: "https://taobao.com/search?q="
  },
  {
    name: "京东",
    icon: "fa-bolt",
    color: "red",
    url: "https://jd.com/search?q="
  },
  {
    name: "拼多多",
    icon: "fa-users",
    color: "yellow",
    url: "https://pinduoduo.com/search?q="
  },
  {
    name: "天猫",
    icon: "fa-cat",
    color: "pink",
    url: "https://tmall.com/search?q="
  },
  {
    name: "苏宁易购",
    icon: "fa-sun",
    color: "blue",
    url: "https://suning.com/search?q="
  }
];

// ==========================================
// 3. 详情页路由
// ==========================================
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  res.send(renderOptimizedDetailPage(level1, level2, item));
});

// 渲染优化详情页
function renderOptimizedDetailPage(level1, level2, item) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 详细分析 · 全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .interval-tab.active { background-color: #3b82f6; color: white; }
    .product-card { border: 2px solid; transition: all 0.3s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15); }
    .vote-btn { transition: all 0.2s; }
    .vote-btn:hover { transform: scale(1.1); }
    .vote-btn.active { background-color: #3b82f6; color: white; }
    .comment-item { border-bottom: 1px solid #e5e7eb; }
    .comment-item:last-child { border-bottom: none; }
    .platform-btn { transition: all 0.2s; }
    .platform-btn:hover { transform: translateY(-2px); }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="max-w-7xl mx-auto px-4 py-6">
    <!-- 返回导航 -->
    <div// 启动服务器
loadRealData();

app.listen(PORT, () => {
  console.log(`
🚀 全球最佳商品百科全书 · 优化详情页 已启动`);
  console.log(`📊 数据统计: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
  console.log(`🌐 访问地址: http://localhost:${PORT}/`);
  console.log(`📱 优化详情页: http://localhost:${PORT}/category/个护健康/剃须用品/一次性剃须刀`);
  console.log(`🎯 优化特点:`);
  console.log(`   1. 简洁设计 - 删除冗余架构说明`);
  console.log(`   2. 维度嵌入 - 评测维度直接嵌入推荐栏目`);
  console.log(`   3. 点赞点踩 - 用户互动投票功能`);
  console.log(`   4. 评论系统 - 完整的用户评论功能`);
  console.log(`   5. 购买链接 - 各大电商平台购买渠道`);
});
