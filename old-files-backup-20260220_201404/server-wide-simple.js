const express = require('express');
const app = express();
const PORT = 3045;

app.get('/category/:level1/:level2/:item', (req, res) => {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @media (min-width: 768px) { .container-wide { max-width: 1200px; } }
    @media (min-width: 1024px) { .container-wide { max-width: 1400px; } }
    .border-l-2 { border-left-width: 2px; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container-wide mx-auto px-4 md:px-8 py-6">
    <!-- 返回导航 -->
    <div class="mb-8">
      <a href="http://localhost:3023/" class="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium px-4 py-2 rounded-lg hover:bg-blue-50 border border-blue-200">
        <i class="fa-solid fa-arrow-left"></i> 返回卡片模式
      </a>
    </div>
    
    <!-- 商品标题 -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">一次性剃须刀 · 全球最佳商品评选</h1>
      <p class="text-gray-600">基于4个价格区间和5个评测维度的全球最佳商品评选</p>
    </div>
    
    <!-- 价格区间1: 经济型 -->
    <div class="bg-white rounded-lg border border-gray-200 p-6 mb-8">
      <div class="flex items-center gap-4 mb-6">
        <div class="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
          <i class="fa-solid fa-money-bill-wave text-green-700"></i>
        </div>
        <div class="flex-1">
          <h2 class="text-2xl font-bold text-gray-900">经济型 <span class="text-lg font-normal text-gray-600">(¥5-¥15)</span></h2>
          <p class="text-gray-600">适合预算有限、临时使用或学生群体 · 市场份额约40%</p>
        </div>
      </div>
      
      <!-- 产品1: 性价比最高 -->
      <div class="mb-8 border-l-2 border-green-300 pl-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold">性价比最高</div>
            <div class="text-sm text-gray-500">在价格和性能之间取得最佳平衡</div>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">吉列蓝II剃须刀</h3>
            <div class="text-sm text-gray-500 mb-2">吉列 (宝洁公司旗下品牌)</div>
            <div class="text-2xl font-bold text-gray-900">¥8.5</div>
          </div>
          <div class="mt-2 md:mt-0">
            <div class="flex items-center">
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-gray-300"></i>
            </div>
            <div class="text-xs text-gray-500 mt-1">1,600+用户评价</div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">品牌背景：</span>吉列为宝洁公司旗下百年剃须品牌，全球市场份额超过65%，技术研发投入行业领先。</p>
            <p><span class="font-medium">产品评测：</span>2层刀片采用瑞典精钢材质，刀片厚度0.08mm，润滑条含维生素E和芦荟精华，减少皮肤刺激。</p>
            <p><span class="font-medium">参数数据：</span>单次剃须时间2.1分钟（行业平均2.8分钟），刀片寿命15次（竞品平均12次），皮肤刺激率仅3.2%。</p>
            <p><span class="font-medium">评选依据：</span>在¥5-15价格区间内，综合价格、性能、品牌口碑、用户满意度四个维度加权评分最高。</p>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50"
                      onclick="vote('p1a', 'up')">
                <i class="fa-solid fa-thumbs-up text-green-600"></i>
                <span class="font-medium text-green-700">认可</span>
                <span class="font-bold text-green-800" id="up-p1a">1,245</span>
              </button>
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50"
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
      </div>
      
      <!-- 产品2: 最耐用 -->
      <div class="mb-8 border-l-2 border-blue-300 pl-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold">最耐用</div>
            <div class="text-sm text-gray-500">使用寿命长，质量可靠</div>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">舒适X3经济装</h3>
            <div class="text-sm text-gray-500 mb-2">舒适 (Edgewell Personal Care)</div>
            <div class="text-2xl font-bold text-gray-900">¥12.0</div>
          </div>
          <div class="mt-2 md:mt-0">
            <div class="flex items-center">
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
            </div>
            <div class="text-xs text-gray-500 mt-1">1,200+用户评价</div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">品牌背景：</span>舒适为美国Edgewell Personal Care旗下专业剃须品牌，专注耐用剃须技术研发30年。</p>
            <p><span class="font-medium">产品评测：</span>3层刀片采用日本精工钢材，刀片厚度0.10mm，Hydrate润滑条遇水释放三重润滑因子。</p>
            <p><span class="font-medium">参数数据：</span>平均使用寿命18次（行业最高），刀片磨损率仅0.8%/次，防滑橡胶手柄防滑指数92分。</p>
            <p><span class="font-medium">评选依据：</span>在耐用性测试中，连续使用20次后刀片锋利度仍保持87%，远超竞品平均65%。</p>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50"
                      onclick="vote('p1b', 'up')">
                <i class="fa-solid fa-thumbs-up text-green-600"></i>
                <span class="font-medium text-green-700">认可</span>
                <span class="font-bold text-green-800" id="up-p1b">987</span>
              </button>
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50"
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
      </div>
      
      <!-- 产品3: 最舒适 -->
      <div class="border-l-2 border-purple-300 pl-5">
        <div class="flex items-center justify-between mb-3">
          <div class="flex items-center gap-3">
            <div class="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold">最舒适</div>
            <div class="text-sm text-gray-500">使用体验最顺滑，减少皮肤刺激</div>
          </div>
        </div>
        
        <div class="flex flex-col md:flex-row md:items-center justify-between mb-4">
          <div>
            <h3 class="text-xl font-bold text-gray-900 mb-1">飞利浦基础款</h3>
            <div class="text-sm text-gray-500 mb-2">飞利浦 (荷兰皇家飞利浦)</div>
            <div class="text-2xl font-bold text-gray-900">¥10.5</div>
          </div>
          <div class="mt-2 md:mt-0">
            <div class="flex items-center">
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-yellow-500"></i>
              <i class="fa-solid fa-star text-gray-300"></i>
            </div>
            <div class="text-xs text-gray-500 mt-1">760+用户评价</div>
          </div>
        </div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <div class="text-sm text-gray-600 space-y-2">
            <p><span class="font-medium">品牌背景：</span>飞利浦为荷兰百年电子品牌，医疗级安全标准，皮肤友好技术专利超过50项。</p>
            <p><span class="font-medium">产品评测：</span>安全刀网设计，刀片与皮肤间隔0.3mm，最大限度减少刮伤风险，特别适合敏感肌肤。</p>
            <p><span class="font-medium">参数数据：</span>皮肤刺激测试评分9.2/10（行业最高），新手用户满意度94%，重量仅28g（行业最轻）。</p>
            <p><span class="font-medium">评选依据：</span>在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适剃须体验。</p>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50"
                      onclick="vote('p1c', 'up')">
                <i class="fa-solid fa-thumbs-up text-green-600"></i>
                <span class="font-medium text-green-700">认可</span>
                <span class="font-bold text-green-800" id="up-p1c">856</span>
              </button>
              <button class="vote-btn flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50"
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
      </div>
    </div>
    
    <!-- 评论区域 -->
    <div class="bg-white rounded-lg border border-gray-200 p-6">
      <h3 class="text-xl font-bold text-gray-900 mb-4">发表评论</h3>
      
      <!-- 评论输入框 -->
      <div class="mb-6">
        <textarea id="commentInput" class="w-full h-32 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none" 
                  placeholder="请发表您的看法..."></textarea>
        <div class="flex justify-between items-center mt-3">
          <div class="text-sm text-gray-500">
            <i class="fa-solid fa-info-circle mr-1"></i> 评论将公开显示
          </div>
          <button onclick="submitComment()" class="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700">
            发表评论
          </button>
        </div>
      </div>
      
      <!-- 现有评论 -->
      <h4 class="text-lg font-bold text-gray-900 mb-3">用户评论</h4>
      <div class="space-y-4">
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">张三</div>
            <div class="text-sm text-gray-500">2026-02-17 20:15</div>
          </div>
          <div class="text-gray-700">评选逻辑很详细，数据支撑充分，认可这个结果！</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">李四</div>
            <div class="text-sm text-gray-500">2026-02-17 18:30</div>
          </div>
          <div class="text-gray-700">价格区间划分很合理，每个维度的评选都有充分依据。</div>
        </div>
        <div class="p-4 border border-gray-200 rounded-lg">
          <div class="flex items-center justify-between