const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3022; // 使用新端口，避免冲突

// ==========================================
// 全球最佳商品百科全书 · 3019 UI + 24.5万数据
// ==========================================

// ==========================================
// 1. 全局统计信息（基于真实数据）
// ==========================================
let STATS = {
  categories: 0,      // 一级分类数
  subcategories: 0,   // 二级分类数
  items: 0,           // 三级分类数
  answers: 0,         // 最佳答案数
  china: 0,           // 中国商品数
  global: 0,          // 全球商品数
  lastUpdated: new Date().toISOString()
};

// ==========================================
// 2. 加载24.5万品类数据（保持3019 UI结构）
// ==========================================
let CATEGORY_TREE = {};
let ALL_ITEMS = []; // 用于搜索和列表分页
let DATA_LOADED = false;

// 加载真实数据
function loadRealData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'global-categories-expanded.json');
    console.log(`📂 加载真实数据: ${dataPath}`);
    
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (rawData.categories && rawData.metadata) {
      // 转换数据结构为3019格式
      CATEGORY_TREE = convertTo3019Format(rawData.categories);
      
      // 更新统计
      STATS.categories = Object.keys(CATEGORY_TREE).length;
      STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
      STATS.items = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
        acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
      
      // 构建所有商品列表（用于搜索和分页）
      buildAllItemsList();
      
      DATA_LOADED = true;
      
      console.log(`✅ 24.5万品类数据加载成功！`);
      console.log(`📊 统计: 一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()}`);
      
      // 保存转换后的数据（可选）
      saveConvertedData();
    }
  } catch (error) {
    console.error('❌ 数据加载失败:', error.message);
    loadDefaultData();
  }
}

// 转换为3019 UI格式
function convertTo3019Format(categories) {
  const result = {};
  
  Object.entries(categories).forEach(([level1, l2Categories]) => {
    // 为每个一级分类分配图标和地区
    result[level1] = {
      icon: getIconForLevel1(level1),
      region: getRegionForLevel1(level1),
      children: {}
    };
    
    Object.entries(l2Categories).forEach(([level2, l3Items]) => {
      if (Array.isArray(l3Items)) {
        result[level1].children[level2] = {
          icon: getIconForLevel2(level2),
          dimensions: getDimensionsForCategory(level1, level2),
          items: l3Items.map(item => item) // 保持原始字符串格式
        };
      }
    });
  });
  
  return result;
}

// 构建所有商品列表（用于搜索和分页）
function buildAllItemsList() {
  ALL_ITEMS = [];
  
  Object.entries(CATEGORY_TREE).forEach(([level1, l1Data]) => {
    Object.entries(l1Data.children).forEach(([level2, l2Data]) => {
      l2Data.items.forEach(item => {
        ALL_ITEMS.push({
          level1,
          level2,
          item,
          l1Icon: l1Data.icon,
          l2Icon: l2Data.icon,
          dimensions: l2Data.dimensions,
          region: l1Data.region
        });
      });
    });
  });
  
  console.log(`📋 构建商品列表: ${ALL_ITEMS.length.toLocaleString()} 个商品`);
}

// 图标映射
function getIconForLevel1(level1) {
  const iconMap = {
    '个护健康': 'fa-user',
    '数码电子': 'fa-microchip',
    '家用电器': 'fa-house-chimney',
    '家居生活': 'fa-couch',
    '服装鞋帽': 'fa-shirt',
    '美妆护肤': 'fa-spa',
    '食品饮料': 'fa-utensils',
    '运动户外': 'fa-person-running',
    '母婴用品': 'fa-baby',
    '宠物用品': 'fa-paw',
    '汽车用品': 'fa-car',
    '办公用品': 'fa-briefcase',
    '图书音像': 'fa-book',
    '玩具游戏': 'fa-gamepad',
    '珠宝首饰': 'fa-gem',
    '钟表眼镜': 'fa-clock',
    '箱包皮具': 'fa-bag-shopping',
    '家居建材': 'fa-hammer',
    '农资农具': 'fa-tractor'
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (level1.includes(key)) {
      return icon;
    }
  }
  
  return 'fa-box';
}

function getIconForLevel2(level2) {
  const iconMap = {
    '手机': 'fa-mobile',
    '电脑': 'fa-laptop',
    '电视': 'fa-tv',
    '冰箱': 'fa-thermometer-half',
    '洗衣机': 'fa-soap',
    '空调': 'fa-wind',
    '相机': 'fa-camera',
    '耳机': 'fa-headphones',
    '手表': 'fa-clock',
    '鞋子': 'fa-shoe-prints',
    '衣服': 'fa-shirt',
    '包包': 'fa-bag-shopping',
    '化妆品': 'fa-lipstick',
    '护肤品': 'fa-spa',
    '食品': 'fa-utensils',
    '饮料': 'fa-wine-bottle',
    '玩具': 'fa-gamepad',
    '图书': 'fa-book',
    '家具': 'fa-couch'
  };
  
  for (const [key, icon] of Object.entries(iconMap)) {
    if (level2.includes(key)) {
      return icon;
    }
  }
  
  return 'fa-folder';
}

// 地区分配
function getRegionForLevel1(level1) {
  const chinaCategories = ['美妆护肤', '服装鞋帽', '家居生活', '食品饮料'];
  const globalCategories = ['数码电子', '家用电器', '汽车用品', '运动户外'];
  
  if (chinaCategories.some(cat => level1.includes(cat))) {
    return 'china';
  } else if (globalCategories.some(cat => level1.includes(cat))) {
    return 'global';
  }
  
  return Math.random() > 0.5 ? 'china' : 'global';
}

// 评测维度
function getDimensionsForCategory(level1, level2) {
  const dimensionsMap = {
    '数码': ['性能最强', '性价比最高', '设计最美', '功能最全'],
    '家电': ['最节能', '最静音', '功能最全', '性价比最高'],
    '美妆': ['效果最好', '最温和', '性价比最高', '口碑最好'],
    '服装': ['最舒适', '最耐穿', '设计最美', '性价比最高'],
    '食品': ['口感最好', '最健康', '最新鲜', '性价比最高'],
    '个护': ['效果最好', '最温和', '最耐用', '性价比最高'],
    '运动': ['性能最好', '最耐用', '最舒适', '性价比最高'],
    '母婴': ['最安全', '最温和', '最实用', '性价比最高'],
    '宠物': ['最安全', '最有效', '最耐用', '性价比最高']
  };
  
  for (const [key, dims] of Object.entries(dimensionsMap)) {
    if (level1.includes(key) || level2.includes(key)) {
      return dims;
    }
  }
  
  return ['质量最好', '性价比最高', '口碑最好', '最实用'];
}

// 保存转换后的数据
function saveConvertedData() {
  try {
    const outputPath = path.join(__dirname, 'data', 'converted-3019-format.json');
    fs.writeFileSync(outputPath, JSON.stringify({
      categories: CATEGORY_TREE,
      stats: STATS,
      metadata: {
        source: '24.5万品类数据转换',
        originalStats: { totalL1: 49, totalL2: 3525, totalL3: 245317 },
        convertedAt: new Date().toISOString()
      }
    }, null, 2));
    console.log(`💾 转换后的数据已保存: ${outputPath}`);
  } catch (error) {
    console.error('保存转换数据失败:', error.message);
  }
}

// 加载默认数据（备用）
function loadDefaultData() {
  console.log('⚠️  使用默认数据');
  
  CATEGORY_TREE = {
    "数码电子": {
      icon: "fa-microchip",
      region: "global",
      children: {
        "智能手机": {
          icon: "fa-mobile",
          dimensions: ["性能最强", "拍照最好", "续航最长", "充电最快"],
          items: ["5G手机", "游戏手机", "拍照手机", "折叠屏手机"]
        }
      }
    }
  };
  
  STATS.categories = Object.keys(CATEGORY_TREE).length;
  STATS.subcategories = Object.values(CATEGORY_TREE).reduce((acc, l1) => acc + Object.keys(l1.children).length, 0);
  STATS.items = Object.values(CATEGORY_TREE).reduce((acc, l1) => 
    acc + Object.values(l1.children).reduce((acc2, l2) => acc2 + (l2.items?.length || 0), 0), 0);
  
  buildAllItemsList();
}

// ==========================================
// 3. 最佳答案库（保持3019格式）
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
// 4. 首页 - 保持3019 UI设计
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
  <title>全球最佳商品百科全书 · 3019 UI + 24.5万数据 · ${STATS.items.toLocaleString()}个品类</title>
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
    <!-- 头部统计 - 保持3019设计 -->
    <div class="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
      <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div class="flex items-center gap-3 mb-2">
            <h1 class="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <i class="fa-solid fa-trophy text-yellow-500"></i>全球最佳商品百科全书 · 3019 UI
            </h1>
            ${DATA_LOADED ? '<span class="massive-data-badge text-white px-3 py-1 rounded-full text-sm font-bold">24.5万+品类数据库</span>' : ''}
          </div>
          <p class="text-gray-500 mt-1">
            <i class="fa-solid fa-tags text-blue-500"></i> 
            一级${STATS.categories} · 二级${STATS.subcategories} · 三级${STATS.items.toLocaleString()} · 
            最佳答案${STATS.answers}
          </p>
          ${DATA_LOADED ? '<p class="text-green-600 text-sm mt-1"><i class="fa-solid fa-database"></i> 基于24.5万品类真实数据构建</p>' : ''}
        </div>
        <div class="flex gap-2">
          <!-- 视图切换 - 保持3019设计 -->
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=grid&region=${region}&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${view === 'grid' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-grid-2"></i> 卡片
            </a>
            <a href="/?view=list&region=${region}&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${view === 'list' ? 'bg-white shadow' : 'text-gray-600'}">
              <i class="fa-solid fa-list"></i> 列表
            </a>
          </div>
          <!-- 地区切换 - 保持3019设计 -->
          <div class="flex items-center bg-gray-100 p-1 rounded-lg">
            <a href="/?view=${view}&region=all&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'all' ? 'bg-white shadow' : 'text-gray-600'}">全部</a>
            <a href="/?view=${view}&region=global&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'global' ? 'bg-white shadow' : 'text-gray-600'}">全球</a>
            <a href="/?view=${view}&region=china&search=${search}&level1=${level1}&level2=${level2}" class="px-3 py-1.5 rounded-md text-sm ${region === 'china' ? 'bg-white shadow' : 'text-gray-600'}">中国</a>
          </div>
        </div>
      </div>
      
      <!-- 搜索框 - 保持3019设计 -->
      <form class="flex gap-2 mt-4">
        <input type="hidden" name="view" value="${view}">
        <input type="hidden" name="region" value="${region}">
        <input type="text" name="search" placeholder="🔍 在${STATS.items.toLocaleString()}个品类中搜索..." value="${search}" 
               class="flex-1 px-5 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-blue-500">
        <button type="submit" class="px-6 py-3 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">搜索</button>
      </form>
      
      <!-- 一级目录导航 - 保持3019设计 -->
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
              <i class="fa-solid ${catData.icon}"></i>${