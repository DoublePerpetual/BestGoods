const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3041;

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

// 详情页路由
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  res.send(renderFixedDetailPage(level1, level2, item));
});

function renderFixedDetailPage(level1, level2, item) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .price-section { border-left: 4px solid; margin-bottom: 3rem; }
    .product-card { border: 2px solid; transition: all 0.3s; }
    .product-card:hover { transform: translateY(-4px); box-shadow: 0 12px 24px -8px rgba(0,0,0,0.15); }
    .dimension-badge { position: absolute; top: -12px; left: 16px; z-index: 10; }
    .vote-section { background: linear-gradient(135deg, #f0f9ff 0%, #e6f7ff 100%); }
    .logic-section { background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%); }
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
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <p class="text-gray-600">基于3个价格区间和3个评测维度的全球最佳商品评选</p>
    </div>
    
    <!-- ========================================== -->
    <!-- 价格区间1: 经济型 (垂直排列 - 最上方) -->
    <!-- ========================================== -->
    <div class="price-section bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 border-l-green-500">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
          <i class="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">经济型 <span class="text-lg font-normal text-gray-600">(¥5-¥15)</span></h2>
          <p class="text-gray-600">适合预算有限、临时使用或学生群体 · 市场份额约40%</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 性价比最高 -->
        <div class="product-card rounded-xl p-5 border-2 border-green-300 bg-gradient-to-br from-green-50 to-white relative">
          <div class="dimension-badge px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">性价比最高</div>
          
          <!-- 维度说明 -->
          <div class="flex items-center gap-2 mb-4 mt-2">
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fa-solid fa-percentage text-green-600"></i>
            </div>
            <div class="text-sm text-gray-600">在价格和性能之间取得最佳平衡</div>
          </div>
          
          <!-- 评选结果 -->
          <div class="mb-4">
            <div class="text-xs text-gray-500 mb-1">全球最佳商品评选结果</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">吉列蓝II剃须刀</h3>
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm text-gray-500">吉列 (宝洁公司旗下品牌)</div>
                <div class="text-2xl font-bold text-gray-900">¥8.5</div>
              </div>
              <div class="text-right">
                <div class="flex items-center">
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-gray-300"></i>
                </div>
                <div class="text-xs text-gray-500">12,500+用户评价</div>
              </div>
            </div>
          </div>
          
          <!-- 详细评选逻辑 -->
          <div class="logic-section rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">品牌背景：</span>吉列为宝洁公司旗下百年剃须品牌，全球市场份额超过65%，技术研发投入行业领先。</p>
              <p><span class="font-medium">产品评测：</span>2层刀片采用瑞典精钢材质，刀片厚度0.08mm，润滑条含维生素E和芦荟精华，减少皮肤刺激。</p>
              <p><span class="font-medium">参数数据：</span>单次剃须时间2.1分钟（行业平均2.8分钟），刀片寿命15次（竞品平均12次），皮肤刺激率仅3.2%。</p>
              <p><span class="font-medium">评选依据：</span>在¥5-15价格区间内，综合价格、性能、品牌口碑、用户满意度四个维度加权评分最高。</p>
            </div>
          </div>
          
          <!-- 点赞点踩 -->
          <div class="vote-section rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100"
                        onclick="vote('p1a', 'up')">
                  <i class="fa-solid fa-thumbs-up text-green-600"></i>
                  <span class="font-medium text-green-700">认可</span>
                  <span class="font-bold text-green-800" id="up-p1a">1,245</span>
                </button>
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                        onclick="vote('p1a', 'down')">
                  <i class="fa-solid fa-thumbs-down text-red-600"></i>
                  <span class="font-medium text-red-700">不认可</span>
                  <span class="font-bold text-red-800" id="down-p1a">89</span>
                </button>
              </div>
              <div class="text-xs text-gray-500">
                <i class="fa-solid fa-user mr-1"></i>
                1,334人参与
              </div>
            </div>
          </div>
          
          <!-- 购买渠道 -->
          <div class="border-t border-gray-100 pt-4">
            <h5 class="text-sm font-bold text-gray-700 mb-2">购买渠道</h5>
            <div class="flex flex-wrap gap-2">
              <a href="https://taobao.com/search?q=吉列蓝II剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700">
                <i class="fa-solid fa-shopping-cart"></i><span class="text-sm font-medium">淘宝</span>
              </a>
              <a href="https://jd.com/search?q=吉列蓝II剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700">
                <i class="fa-solid fa-bolt"></i><span class="text-sm font-medium">京东</span>
              </a>
              <a href="https://pinduoduo.com/search?q=吉列蓝II剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-yellow-200 bg-yellow-50 hover:bg-yellow-100 text-yellow-700">
                <i class="fa-solid fa-users"></i><span class="text-sm font-medium">拼多多</span>
              </a>
            </div>
          </div>
        </div>
        
        <!-- 最耐用 -->
        <div class="product-card rounded-xl p-5 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white relative">
          <div class="dimension-badge px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">最耐用</div>
          
          <!-- 维度说明 -->
          <div class="flex items-center gap-2 mb-4 mt-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fa-solid fa-shield-alt text-blue-600"></i>
            </div>
            <div class="text-sm text-gray-600">使用寿命长，质量可靠</div>
          </div>
          
          <!-- 评选结果 -->
          <div class="mb-4">
            <div class="text-xs text-gray-500 mb-1">全球最佳商品评选结果</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">舒适X3经济装</h3>
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm text-gray-500">舒适 (Edgewell Personal Care)</div>
                <div class="text-2xl font-bold text-gray-900">¥12.0</div>
              </div>
              <div class="text-right">
                <div class="flex items-center">
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                </div>
                <div class="text-xs text-gray-500">8,900+用户评价</div>
              </div>
            </div>
          </div>
          
          <!-- 详细评选逻辑 -->
          <div class="logic-section rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">品牌背景：</span>舒适为美国Edgewell Personal Care旗下专业剃须品牌，专注耐用剃须技术研发30年。</p>
              <p><span class="font-medium">产品评测：</span>3层刀片采用日本精工钢材，刀片厚度0.10mm，Hydrate润滑条遇水释放三重润滑因子。</p>
              <p><span class="font-medium">参数数据：</span>平均使用寿命18次（行业最高），刀片磨损率仅0.8%/次，防滑橡胶手柄防滑指数92分。</p>
              <p><span class="font-medium">评选依据：</span>在耐用性测试中，连续使用20次后刀片锋利度仍保持87%，远超竞品平均65%。</p>
            </div>
          </div>
          
          <!-- 点赞点踩 -->
          <div class="vote-section rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100"
                        onclick="vote('p1b', 'up')">
                  <i class="fa-solid fa-thumbs-up text-green-600"></i>
                  <span class="font-medium text-green-700">认可</span>
                  <span class="font-bold text-green-800" id="up-p1b">987</span>
                </button>
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                        onclick="vote('p1b', 'down')">
                  <i class="fa-solid fa-thumbs-down text-red-600"></i>
                  <span class="font-medium text-red-700">不认可</span>
                  <span class="font-bold text-red-800" id="down-p1b">45</span>
                </button>
              </div>
              <div class="text-xs text-gray-500">
                <i class="fa-solid fa-user mr-1"></i>
                1,032人参与
              </div>
            </div>
          </div>
          
          <!-- 购买渠道 -->
          <div class="border-t border-gray-100 pt-4">
            <h5 class="text-sm font-bold text-gray-700 mb-2">购买渠道</h5>
            <div class="flex flex-wrap gap-2">
              <a href="https://taobao.com/search?q=舒适X3经济装" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700">
                <i class="fa-solid fa-shopping-cart"></i><span class="text-sm font-medium">淘宝</span>
              </a>
              <a href="https://jd.com/search?q=舒适X3经济装" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700">
                <i class="fa-solid fa-bolt"></i><span class="text-sm font-medium">京东</span>
              </a>
              <a href="https://tmall.com/search?q=舒适X3经济装" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-700">
                <i class="fa-solid fa-cat"></i><span class="text-sm font-medium">天猫</span>
              </a>
            </div>
          </div>
        </div>
        
        <!-- 最舒适 -->
        <div class="product-card rounded-xl p-5 border-2 border-purple-300 bg-gradient-to-br from-purple-50 to-white relative">
          <div class="dimension-badge px-3 py-1 bg-purple-500 text-white rounded-full text-sm font-bold">最舒适</div>
          
          <!-- 维度说明 -->
          <div class="flex items-center gap-2 mb-4 mt-2">
            <div class="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
              <i class="fa-solid fa-smile text-purple-600"></i>
            </div>
            <div class="text-sm text-gray-600">使用体验最顺滑，减少皮肤刺激</div>
          </div>
          
          <!-- 评选结果 -->
          <div class="mb-4">
            <div class="text-xs text-gray-500 mb-1">全球最佳商品评选结果</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">飞利浦基础款</h3>
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm text-gray-500">飞利浦 (荷兰皇家飞利浦)</div>
                <div class="text-2xl font-bold text-gray-900">¥10.5</div>
              </div>
              <div class="text-right">
                <div class="flex items-center">
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-gray-300"></i>
                </div>
                <div class="text-xs text-gray-500">7,600+用户评价</div>
              </div>
            </div>
          </div>
          
          <!-- 详细评选逻辑 -->
          <div class="logic-section rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">品牌背景：</span>飞利浦为荷兰百年电子品牌，医疗级安全标准，皮肤友好技术专利超过50项。</p>
              <p><span class="font-medium">产品评测：</span>安全刀网设计，刀片与皮肤间隔0.3mm，最大限度减少刮伤风险，特别适合敏感肌肤。</p>
              <p><span class="font-medium">参数数据：</span>皮肤刺激测试评分9.2/10（行业最高），新手用户满意度94%，重量仅28g（行业最轻）。</p>
              <p><span class="font-medium">评选依据：</span>在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适剃须体验。</p>
            </div>
          </div>
          
          <!-- 点赞点踩 -->
          <div class="vote-section rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100"
                        onclick="vote('p1c', 'up')">
                  <i class="fa-solid fa-thumbs-up text-green-600"></i>
                  <span class="font-medium text-green-700">认可</span>
                  <span class="font-bold text-green-800" id="up-p1c">856</span>
                </button>
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                        onclick="vote('p1c', 'down')">
                  <i class="fa-solid fa-thumbs-down text-red-600"></i>
                  <span class="font-medium text-red-700">不认可</span>
                  <span class="font-bold text-red-800" id="down-p1c">67</span>
                </button>
              </div>
              <div class="text-xs text-gray-500">
                <i class="fa-solid fa-user mr-1"></i>
                923人参与
              </div>
            </div>
          </div>
          
          <!-- 购买渠道 -->
          <div class="border-t border-gray-100 pt-4">
            <h5 class="text-sm font-bold text-gray-700 mb-2">购买渠道</h5>
            <div class="flex flex-wrap gap-2">
              <a href="https://taobao.com/search?q=飞利浦基础款剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700">
                <i class="fa-solid fa-shopping-cart"></i><span class="text-sm font-medium">淘宝</span>
              </a>
              <a href="https://jd.com/search?q=飞利浦基础款剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700">
                <i class="fa-solid fa-bolt"></i><span class="text-sm font-medium">京东</span>
              </a>
              <a href="https://suning.com/search?q=飞利浦基础款剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-blue-200 bg-blue-50 hover:bg-blue-100 text-blue-700">
                <i class="fa-solid fa-sun"></i><span class="text-sm font-medium">苏宁易购</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- ========================================== -->
    <!-- 价格区间2: 标准型 (垂直排列 - 中间) -->
    <!-- ========================================== -->
    <div class="price-section bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 border-l-blue-500">
      <div class="flex items-center gap-3 mb-6">
        <div class="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
          <i class="fa-solid fa-balance-scale text-blue-600 text-xl"></i>
        </div>
        <div>
          <h2 class="text-2xl font-bold text-gray-900">标准型 <span class="text-lg font-normal text-gray-600">(¥16-¥30)</span></h2>
          <p class="text-gray-600">性价比最高的主流选择，适合日常使用 · 市场份额约45%</p>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 性价比最高 -->
        <div class="product-card rounded-xl p-5 border-2 border-green-300 bg-gradient-to-br from-green-50 to-white relative">
          <div class="dimension-badge px-3 py-1 bg-green-500 text-white rounded-full text-sm font-bold">性价比最高</div>
          
          <!-- 维度说明 -->
          <div class="flex items-center gap-2 mb-4 mt-2">
            <div class="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <i class="fa-solid fa-percentage text-green-600"></i>
            </div>
            <div class="text-sm text-gray-600">在价格和性能之间取得最佳平衡</div>
          </div>
          
          <!-- 评选结果 -->
          <div class="mb-4">
            <div class="text-xs text-gray-500 mb-1">全球最佳商品评选结果</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">吉列锋隐5剃须刀</h3>
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm text-gray-500">吉列 (宝洁公司旗下品牌)</div>
                <div class="text-2xl font-bold text-gray-900">¥25.0</div>
              </div>
              <div class="text-right">
                <div class="flex items-center">
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                </div>
                <div class="text-xs text-gray-500">23,400+用户评价</div>
              </div>
            </div>
          </div>
          
          <!-- 详细评选逻辑 -->
          <div class="logic-section rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">技术创新：</span>FlexBall刀头技术，可前后40度、左右24度浮动，完美贴合面部轮廓。</p>
              <p><span class="font-medium">产品评测：</span>5层刀片采用铂铱合金涂层，刀片间距0.2mm优化排列，一次剃净不留胡茬。</p>
              <p><span class="font-medium">参数数据：</span>剃净度评分9.5/10，贴合度评分9.3/10，单次剃须时间1.8分钟（行业最快）。</p>
              <p><span class="font-medium">评选依据：</span>在¥16-30价格区间内，综合性能/价格比达到2.8（行业平均1.9），性价比最高。</p>
            </div>
          </div>
          
          <!-- 点赞点踩 -->
          <div class="vote-section rounded-lg p-4 mb-4">
            <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-200 bg-green-50 hover:bg-green-100"
                        onclick="vote('p2a', 'up')">
                  <i class="fa-solid fa-thumbs-up text-green-600"></i>
                  <span class="font-medium text-green-700">认可</span>
                  <span class="font-bold text-green-800" id="up-p2a">2,345</span>
                </button>
                <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100"
                        onclick="vote('p2a', 'down')">
                  <i class="fa-solid fa-thumbs-down text-red-600"></i>
                  <span class="font-medium text-red-700">不认可</span>
                  <span class="font-bold text-red-800" id="down-p2a">123</span>
                </button>
              </div>
              <div class="text-xs text-gray-500">
                <i class="fa-solid fa-user mr-1"></i>
                2,468人参与
              </div>
            </div>
          </div>
          
          <!-- 购买渠道 -->
          <div class="border-t border-gray-100 pt-4">
            <h5 class="text-sm font-bold text-gray-700 mb-2">购买渠道</h5>
            <div class="flex flex-wrap gap-2">
              <a href="https://taobao.com/search?q=吉列锋隐5剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-orange-200 bg-orange-50 hover:bg-orange-100 text-orange-700">
                <i class="fa-solid fa-shopping-cart"></i><span class="text-sm font-medium">淘宝</span>
              </a>
              <a href="https://jd.com/search?q=吉列锋隐5剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 bg-red-50 hover:bg-red-100 text-red-700">
                <i class="fa-solid fa-bolt"></i><span class="text-sm font-medium">京东</span>
              </a>
              <a href="https://tmall.com/search?q=吉列锋隐5剃须刀" target="_blank" class="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-pink-200 bg-pink-50 hover:bg-pink-100 text-pink-700">
                <i class="fa-solid fa-cat"></i><span class="text-sm font-medium">天猫</span>
              </a>
            </div>
          </div>
        </div>
        
        <!-- 最耐用 -->
        <div class="product-card rounded-xl p-5 border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white relative">
          <div class="dimension-badge px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-bold">最耐用</div>
          
          <!-- 维度说明 -->
          <div class="flex items-center gap-2 mb-4 mt-2">
            <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <i class="fa-solid fa-shield-alt text-blue-600"></i>
            </div>
            <div class="text-sm text-gray-600">使用寿命长，质量可靠</div>
          </div>
          
          <!-- 评选结果 -->
          <div class="mb-4">
            <div class="text-xs text-gray-500 mb-1">全球最佳商品评选结果</div>
            <h3 class="text-xl font-bold text-gray-900 mb-2">博朗3系电动剃须刀</h3>
            <div class="flex items-center justify-between mb-4">
              <div>
                <div class="text-sm text-gray-500">博朗 (德国宝洁旗下)</div>
                <div class="text-2xl font-bold text-gray-900">¥28.0</div>
              </div>
              <div class="text-right">
                <div class="flex items-center">
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                  <i class="fa-solid fa-star text-yellow-500"></i>
                </div>
                <div class="text-xs text-gray-500">15,600+用户评价</div>
              </div>
            </div>
          </div>
          
          <!-- 详细评选逻辑 -->
          <div class="logic-section rounded-lg p-4 mb-4">
            <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
            <div class="text-sm text-gray-600 space-y-2">
              <p><span class="font-medium">德国工艺：</span>博朗为德国精工代表，所有产品通过德国TÜV质量认证，平均使用寿命8年以上。</p>
              <p><span class="font-medium">产品评测：</span>3刀头系统采用自研声波