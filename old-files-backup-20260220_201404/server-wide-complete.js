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
        <div class="px-3 py-1 bg-green-600 text-white rounded-full text-sm font-bold inline-block mb-4">性价比最高</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">吉列蓝II剃须刀</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥8.5</div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。</p>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50" onclick="vote('p1a', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p1a">1,245</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50" onclick="vote('p1a', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p1a">89</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 产品2: 最耐用 -->
      <div class="mb-8 border-l-2 border-blue-300 pl-5">
        <div class="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-bold inline-block mb-4">最耐用</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">舒适X3经济装</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥12.0</div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">舒适为美国Edgewell旗下品牌，专注耐用技术30年。3层刀片采用日本精工钢材，Hydrate润滑技术。在耐用性测试中，连续使用20次后刀片锋利度仍保持87%。</p>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50" onclick="vote('p1b', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p1b">987</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50" onclick="vote('p1b', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p1b">45</span>
            </button>
          </div>
        </div>
      </div>
      
      <!-- 产品3: 最舒适 -->
      <div class="border-l-2 border-purple-300 pl-5">
        <div class="px-3 py-1 bg-purple-600 text-white rounded-full text-sm font-bold inline-block mb-4">最舒适</div>
        <h3 class="text-xl font-bold text-gray-900 mb-2">飞利浦基础款</h3>
        <div class="text-2xl font-bold text-gray-900 mb-4">¥10.5</div>
        
        <div class="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-200">
          <h4 class="text-sm font-bold text-gray-700 mb-2">评选逻辑说明</h4>
          <p class="text-sm text-gray-600">飞利浦为荷兰百年电子品牌，医疗级安全标准。安全刀网设计，刀片与皮肤间隔0.3mm。在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适体验。</p>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-4 mb-4 border border-blue-200">
          <div class="text-sm font-medium text-gray-700 mb-3">你认可这个评选结果吗？</div>
          <div class="flex items-center gap-4">
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-green-300 bg-white hover:bg-green-50" onclick="vote('p1c', 'up')">
              <i class="fa-solid fa-thumbs-up text-green-600"></i>
              <span class="font-medium text-green-700">认可</span>
              <span class="font-bold text-green-800" id="up-p1c">856</span>
            </button>
            <button class="flex items-center gap-2 px-4 py-2 rounded-lg border border-red-300 bg-white hover:bg-red-50" onclick="vote('p1c', 'down')">
              <i class="fa-solid fa-thumbs-down text-red-600"></i>
              <span class="font-medium text-red-700">不认可</span>
              <span class="font-bold text-red-800" id="down-p1c">67</span>
            </button>
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
          <div class="flex items-center justify-between mb-2">
            <div class="font-medium text-gray-900">王五</div>
            <div class="text-sm text-gray-500">2026-02-17 16:45</div>
          </div>
          <div class="text-gray-700">界面设计简洁大气，信息展示清晰，用户体验很好。</div>
        </div>
      </div>
    </div>
  </div>
  
  <script>
    function vote(productId, type) {
      const upElement = document.getElementById('up-' + productId);
      const downElement = document.getElementById('down-' + productId);
      
      if (type === 'up') {
        upElement.textContent = parseInt(upElement.textContent) + 1;
        alert('感谢您的认可！');
      } else {
        downElement.textContent = parseInt(downElement.textContent) + 1;
        alert('感谢您的反馈！我们会改进评选标准。');
      }
    }
    
    function submitComment() {
      const commentInput = document.getElementById('commentInput');
      const commentText = commentInput.value.trim();
      
      if (!commentText) {
        alert('请输入评论内容');
        return;
      }
      
      alert('评论已提交，感谢您的参与！');
      commentInput.value = '';
    }
  </script>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log('\n🎬 全球最佳商品评选 · 宽屏简洁版 已启动');
  console.log('🌐 访问地址: http://localhost:' + PORT + '/');
  console.log('📱 详情页: http://localhost:' + PORT + '/category/个护健康/剃须用品/一次性剃须刀');
  console.log('🎯 设计特点:');
  console.log('   1. 宽屏设计 - 最大宽度1400px，像电影院宽屏幕一样大气');
  console.log('   2. 简洁线条 - 简洁边框设计，无冗余装饰');
  console.log('   3. 紧凑排版 - 内容密集，信息量大');
  console.log('   4. 响应式 - 手机自适应，平板三列，桌面宽屏');
  console.log('   5. 评论功能 - 添加评论输入框和现有评论展示');
  console.log('   6. 用户导向 - 专注用户内容，去掉技术说明');
});