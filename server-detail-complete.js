const express = require('express');
const app = express();
const PORT = 3077;

// 数据库结构
const database = {
  priceIntervals: [
    { id: 1, name: '经济型', range: '¥5-¥15', description: '适合预算有限、临时使用或学生群体', marketShare: '40%' },
    { id: 2, name: '标准型', range: '¥16-¥30', description: '性价比最高的主流选择，适合日常使用', marketShare: '45%' },
    { id: 3, name: '高端型', range: '¥31-¥50', description: '高品质体验，适合追求舒适度和性能的用户', marketShare: '12%' }
  ],
  
  evaluationDimensions: [
    { id: 1, name: '性价比最高', description: '在价格和性能之间取得最佳平衡', icon: 'percentage' },
    { id: 2, name: '最耐用', description: '使用寿命长，质量可靠', icon: 'shield-alt' },
    { id: 3, name: '最舒适', description: '使用体验最顺滑，减少皮肤刺激', icon: 'smile' }
  ],
  
  bestProducts: [
    { priceId: 1, dimensionId: 1, name: '吉列蓝II剃须刀', price: '¥8.5', brand: '吉列 (宝洁公司旗下品牌)', rating: 4, reviews: '1,600+', 
      logic: '吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。',
      likeCount: 42, dislikeCount: 8 },
    { priceId: 1, dimensionId: 2, name: '舒适X3经济装', price: '¥12.0', brand: '舒适 (Edgewell Personal Care)', rating: 5, reviews: '1,200+',
      logic: '舒适为美国Edgewell旗下品牌，专注耐用技术30年。3层刀片采用日本精工钢材，Hydrate润滑技术。在耐用性测试中，连续使用20次后刀片锋利度仍保持87%。',
      likeCount: 38, dislikeCount: 5 },
    { priceId: 1, dimensionId: 3, name: '飞利浦基础款', price: '¥10.5', brand: '飞利浦 (荷兰皇家飞利浦)', rating: 4, reviews: '760+',
      logic: '飞利浦为荷兰百年电子品牌，医疗级安全标准。安全刀网设计，刀片与皮肤间隔0.3mm。在盲测中，100位敏感肌肤用户有87位选择飞利浦为最舒适体验。',
      likeCount: 35, dislikeCount: 3 },
    
    { priceId: 2, dimensionId: 1, name: '吉列锋隐5剃须刀', price: '¥25.0', brand: '吉列 (宝洁公司旗下品牌)', rating: 5, reviews: '23,400+',
      logic: 'FlexBall刀头技术，可前后40度、左右24度浮动。5层刀片采用铂铱合金涂层。在¥16-30区间内，综合性能/价格比达到2.8，性价比最高。',
      likeCount: 156, dislikeCount: 12 },
    { priceId: 2, dimensionId: 2, name: '博朗3系电动剃须刀', price: '¥28.0', brand: '博朗 (德国宝洁旗下)', rating: 5, reviews: '15,600+',
      logic: '博朗为德国精工代表，通过TÜV质量认证。3刀头系统采用声波技术，干湿两用。在耐用性测试中，连续使用2年后性能仍保持92%。',
      likeCount: 128, dislikeCount: 9 },
    { priceId: 2, dimensionId: 3, name: '舒适水次元5', price: '¥22.0', brand: '舒适 (Edgewell Personal Care)', rating: 5, reviews: '18,200+',
      logic: '水活化润滑条专利技术，遇水释放三重保湿因子。5层刀片采用磁力悬挂系统。在1000人盲测中，在顺滑度和皮肤友好度上得分超过竞品15%。',
      likeCount: 142, dislikeCount: 8 },
    
    { priceId: 3, dimensionId: 1, name: '吉列锋隐致护', price: '¥45.0', brand: '吉列 (宝洁公司旗下品牌)', rating: 5, reviews: '8,900+',
      logic: '7层刀片为行业最高配置，微梳技术预先梳理胡须，铂金涂层减少摩擦。在高端区间内，性能/价格比达到2.1，相比竞品性价比高出35%。',
      likeCount: 89, dislikeCount: 6 },
    { priceId: 3, dimensionId: 2, name: '博朗7系电动剃须刀', price: '¥65.0', brand: '博朗 (德国宝洁旗下)', rating: 5, reviews: '6,500+',
      logic: '5刀头声波技术，剃须同时按摩皮肤，智能清洁系统自动维护刀头。德国精工制造，平均使用寿命10年以上，返修率仅0.8%。',
      likeCount: 76, dislikeCount: 4 },
    { priceId: 3, dimensionId: 3, name: '飞利浦高端系列', price: '¥55.0', brand: '飞利浦 (荷兰皇家飞利浦)', rating: 5, reviews: '5,200+',
      logic: 'V型刀片设计减少皮肤拉扯，舒适环技术最大限度减少刺激。多向浮动刀头，智能感应技术自动调节功率。舒适度评分9.8/10，行业最高。',
      likeCount: 82, dislikeCount: 5 }
  ]
};

// 生成最佳评选结果表格
function generateBestResultsTable(priceIntervals, evaluationDimensions, bestProducts) {
  let tableHTML = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead><tr><th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>';
  
  evaluationDimensions.forEach(dim => {
    tableHTML += '<th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">' + dim.name + '</th>';
  });
  
  tableHTML += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
  
  priceIntervals.forEach(price => {
    tableHTML += '<tr>';
    tableHTML += '<td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">' + price.name + '<br><span class="text-xs text-gray-500">' + price.range + '</span></td>';
    
    evaluationDimensions.forEach(dim => {
      const product = bestProducts.find(p => p.priceId === price.id && p.dimensionId === dim.id);
      if (product) {
        tableHTML += '<td class="px-4 py-3"><div class="text-sm font-medium text-gray-900">' + product.name + '</div><div class="text-xs text-gray-500">' + product.brand + '</div><div class="text-sm font-bold text-gray-900 mt-1">' + product.price + '</div><div class="flex items-center mt-1">';
        
        for (let i = 0; i < product.rating; i++) {
          tableHTML += '<i class="fa-solid fa-star text-yellow-500 text-xs"></i>';
        }
        
        tableHTML += '<span class="text-xs text-gray-500 ml-1">' + product.reviews + '</span></div></td>';
      } else {
        tableHTML += '<td class="px-4 py-3 text-sm text-gray-500">-</td>';
      }
    });
    
    tableHTML += '</tr>';
  });
  
  tableHTML += '</tbody></table></div>';
  return tableHTML;
}

// 品类详情页
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  const { priceIntervals, evaluationDimensions, bestProducts } = database;
  const bestResultsTableHTML = generateBestResultsTable(priceIntervals, evaluationDimensions, bestProducts);
  
  // 生成价格区间HTML
  let priceSectionsHTML = '';
  priceIntervals.forEach(price => {
    const products = bestProducts.filter(p => p.priceId === price.id);
    
    let productsHTML = '';
    products.forEach(product => {
      const dimension = evaluationDimensions.find(d => d.id === product.dimensionId);
      const productKey = product.name.replace(/\s+/g, '-');
      
      productsHTML += `
        <div class="p-5 bg-white rounded-lg border border-gray-200">
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">${dimension.name}</span>
                <span class="text-lg font-bold text-gray-900">${product.name}</span>
              </div>
              <div class="text-sm text-gray-600 mb-2">${product.brand}</div>
              <div class="flex items-center gap-4">
                <div class="text-xl font-bold text-gray-900">${product.price}</div>
                <div class="flex items-center">
                  ${'<i class="fa-solid fa-star text-yellow-500"></i>'.repeat(product.rating)}
                  <span class="text-sm text-gray-500 ml-1">${product.reviews}</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="vote('${product.name}', 'like')" 
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>认可</span>
                <span class="vote-count-like-${productKey}">${product.likeCount}</span>
              </button>
              <button onclick="vote('${product.name}', 'dislike')" 
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
                <i class="fa-solid fa-thumbs-down"></i>
                <span>不认可</span>
                <span class="vote-count-dislike-${productKey}">${product.dislikeCount}</span>
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-700 leading-relaxed">${product.logic}</div>
        </div>
      `;
    });
    
    priceSectionsHTML += `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4">${price.name} <span class="text-sm font-normal text-gray-500">${price.range}</span></h3>
        <p class="text-gray-600 mb-4">${price.description}</p>
        <div class="space-y-4">
          ${productsHTML}
        </div>
      </div>
    `;
  });
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .nav-link {
      color: #3b82f6;
      text-decoration: none;
      font-weight: 500;
    }
    .nav-link:hover {
      color: #1d4ed8;
      text-decoration: underline;
    }
    .elegant-border {
      border: 1px solid #e5e7eb;
      border-radius: 0.75rem;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
    <!-- 顶部导航 -->
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <a href="http://localhost:3076/" class="nav-link">首页</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <a href="http://localhost:3076/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="nav-link">${level1}</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <span class="text-gray-900 font-medium">${item}</span>
      </div>
    </div>
    
    <!-- 商品标题 - 恢复成上个版本的内容 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <p class="text-gray-600">3个价格区间 × 3个评测维度 = 9款最佳商品</p>
    </div>
    
    <!-- 最佳商品评选结果标题 - 放在大边框之上 -->
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-gray-900">最佳商品评选结果</h2>
      <p class="text-gray-600 mt-1">基于3个价格区间和3个评测维度的综合评选</p>
    </div>
    
    <!-- 最佳评选结果表格 - 简洁美观的边框 -->
    <div class="mb-8 elegant-border p-6 bg-white">
      ${bestResultsTableHTML}
    </div>
    
    <!-- 详细评选分析 -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">详细评选分析</h2>
      ${priceSectionsHTML}
    </div>
    
    <!-- 评论功能 -->
    <div class="mb-8 elegant-border p-6 bg-white">
      <h3 class="text-lg font-bold text-gray-900 mb-4">评论</h3>
      <div class="mb-4">
        <textarea id="commentInput" placeholder="分享您的使用经验或建议..." 
                  class="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500" rows="3"></textarea>
        <div class="mt-2 flex justify-end">
          <button onclick="submitComment()" class="px-4 py-2 bg-gray-800 text-white font-medium rounded-lg hover:bg-gray-900">发布评论</button>
        </div>
      </div>
      <div id="commentsContainer" class="space-y-4">
        <!-- 评论会动态加载到这里 -->
      </div>
    </div>
  </div>
  
  <script>
    // 投票功能
    const votes = JSON.parse(localStorage.getItem('votes') || '{}');
    
    function vote(productName, type) {
      const productKey = productName.replace(/\\s+/g, '-');
      const currentVote = votes[productKey];
      
      // 更新本地存储
      if (currentVote === type) {
        // 取消投票
        delete votes[productKey];
        updateCount(productName, type, -1);
      } else {
        // 如果之前有其他投票，先取消
        if (currentVote) {
          updateCount(productName, currentVote, -1);
        }
        // 添加新投票
        votes[productKey] = type;
        updateCount(productName, type, 1);
      }
      
      localStorage.setItem('votes', JSON.stringify(votes));
      updateButtonStyles(productName);
    }
    
    function updateCount(productName, type, delta) {
      const productKey = productName.replace(/\\s+/g, '-');
      const countElement = document.querySelector('.vote-count-' + type + '-' + productKey);
      if (countElement) {
        let currentCount = parseInt(countElement.textContent) || 0;
        currentCount += delta;
        countElement.textContent = currentCount;
      }
    }
    
    function updateButtonStyles(productName) {
      const productKey = productName.replace(/\\s+/g, '-');
      const currentVote = votes[productKey];
      
      // 重置所有按钮样式
      const likeBtn = document.querySelector('button[onclick*="vote(\\'' + productName + '\\', \\'like\\')"]');
      const dislikeBtn = document.querySelector('button[onclick*="vote(\\'' + productName + '\\', \\'dislike\\')"]');
      
      if (likeBtn) {
        if (currentVote === 'like') {
          likeBtn.className = likeBtn.className.replace(/bg-gray-100 text-gray-700 border-gray-200/g, 'bg-green-100 text-green-800 border-green-300');
        } else {
          likeBtn.className = likeBtn.className.replace(/bg-green-100 text-green-800 border-green-300/g, 'bg-gray-100 text-gray-700 border-gray-200');
        }
      }
      
      if (dislikeBtn) {
        if (currentVote === 'dislike') {
          dislikeBtn.className = dislikeBtn.className.replace(/bg-gray-100 text-gray-700 border-gray-200/g, 'bg-red-100 text-red-800 border-red-300');
        } else {
          dislikeBtn.className = dislikeBtn.className.replace(/bg-red-100 text-red-800 border-red-300/g, 'bg-gray-100 text-gray-700 border-gray-200');
        }
      }
    }
    
    // 初始化投票状态
    function initVotes() {
      Object.keys(votes).forEach(productKey => {
        const productName = productKey.replace(/-/g, ' ');
        updateButtonStyles(productName);
      });
    }
    
    // 评论功能
    function submitComment() {
      const commentInput = document.getElementById('commentInput');
      const comment = commentInput.value.trim();
      
      if (!comment) {
        alert('请输入评论内容');
        return;
      }
      
      const commentsContainer = document.getElementById('commentsContainer');
      const timestamp = new Date().toLocaleString('zh-CN');
      
      const commentHTML = '<div class="p-4 bg-gray-50 rounded-lg"><div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><i class="fa-solid fa-user text-blue-600"></i></div><div><div class="font-medium text-gray-900">匿名用户</div><div class="text-xs text-gray-500">' + timestamp + '</div></div></div><div class="text-gray-700">' + comment + '</div></div>';
      
      commentsContainer.insertAdjacentHTML('afterbegin', commentHTML);
      commentInput.value = '';
      
      // 保存到本地存储
      const comments = JSON.parse(localStorage.getItem('comments') || '[]');
      comments.unshift({
        text: comment,
        timestamp: timestamp,
        product: '${item}'
      });
      localStorage.setItem('comments', JSON.stringify(comments.slice(0, 50)));
    }
    
    // 加载历史评论
    function loadComments() {
      const comments = JSON.parse(localStorage.getItem('comments') || '[]');
      const commentsContainer = document.getElementById('commentsContainer');
      
      comments
        .filter(comment => comment.product === '${item}')
        .forEach(comment => {
          const commentHTML = '<div class="p-4 bg-gray-50 rounded-lg"><div class="flex items-center gap-2 mb-2"><div class="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center"><i class="fa-solid fa-user text-blue-600"></i></div><div><div class="font-medium text-gray-900">匿名用户</div><div class="text-xs text-gray-500">' + comment.timestamp + '</div></div></div><div class="text-gray-700">' + comment.text + '</div></div>';
          commentsContainer.insertAdjacentHTML('beforeend', commentHTML);
        });
    }
    
    // 页面加载时初始化
    document.addEventListener('DOMContentLoaded', function() {
      initVotes();
      loadComments();
    });
  </script>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`✅ 完整详情页服务器已启动 (端口${PORT})`);
  console.log(`🔗 访问示例: http://localhost:${PORT}/category/个护健康/剃须用品/一次性剃须刀`);
  console.log(`🎯 包含功能：`);
  console.log(`   1. ✅ 完整的最佳评选结果表（9个商品）`);
  console.log(`   2. ✅ 详细评选分析`);
  console.log(`   3. ✅ 点赞点踩功能`);
  console.log(`   4. ✅ 评论功能`);
});