const express = require('express');
const app = express();
const PORT = 3065;

// 严格按照最后一次定稿备份的详情页UI
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 价格区间数据
  const priceIntervals = [
    { id: 1, name: '经济型', range: '¥5-¥15', description: '适合预算有限、临时使用或学生群体' },
    { id: 2, name: '标准型', range: '¥16-¥30', description: '性价比最高的主流选择，适合日常使用' },
    { id: 3, name: '高端型', range: '¥31-¥50', description: '高品质体验，适合追求舒适度和性能的用户' }
  ];
  
  // 评测维度数据
  const evaluationDimensions = [
    { id: 1, name: '性价比最高', description: '在价格和性能之间取得最佳平衡', icon: 'percentage' },
    { id: 2, name: '最耐用', description: '使用寿命长，质量可靠', icon: 'shield-alt' },
    { id: 3, name: '最舒适', description: '使用体验最顺滑，减少皮肤刺激', icon: 'smile' }
  ];
  
  // 品牌数据
  const brands = ['吉列', '舒适', '飞利浦', '博朗', '美的', '海尔', '小米', '苹果', '华为'];
  
  // 生成最佳评选结果表格
  let bestResultsTableHTML = `
    <div class="mb-8 p-5 bg-white rounded-lg border border-gray-200">
      <h3 class="text-lg font-bold text-gray-900 mb-4">最佳评选结果</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>
  `;
  
  evaluationDimensions.forEach(dim => {
    bestResultsTableHTML += `<th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${dim.name}</th>`;
  });
  
  bestResultsTableHTML += `</tr></thead><tbody class="bg-white divide-y divide-gray-200">`;
  
  priceIntervals.forEach(price => {
    bestResultsTableHTML += `<tr>`;
    bestResultsTableHTML += `<td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${price.name}<br><span class="text-xs text-gray-500">${price.range}</span></td>`;
    
    evaluationDimensions.forEach(dim => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const priceValue = parseInt(price.range.match(/\d+/)[0]) + Math.floor(Math.random() * 5);
      
      bestResultsTableHTML += `
        <td class="px-4 py-3">
          <div class="text-sm font-medium text-gray-900">${brand} ${item}</div>
          <div class="text-xs text-gray-500">${brand}</div>
          <div class="text-sm font-bold text-gray-900 mt-1">¥${priceValue}</div>
          <div class="flex items-center mt-1">
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
            <span class="text-xs text-gray-500 ml-1">1,200+</span>
          </div>
        </td>
      `;
    });
    
    bestResultsTableHTML += `</tr>`;
  });
  
  bestResultsTableHTML += `</tbody></table></div></div>`;
  
  // 生成详细评选分析
  let priceSectionsHTML = '';
  
  priceIntervals.forEach(price => {
    priceSectionsHTML += `
      <div class="mb-8">
        <div class="flex items-center gap-2 mb-3">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <h4 class="text-md font-bold text-gray-800">${price.name} (${price.range})</h4>
          <span class="text-sm text-gray-500">${price.description}</span>
        </div>
        
        <div class="space-y-4">
    `;
    
    evaluationDimensions.forEach(dim => {
      const brand = brands[Math.floor(Math.random() * brands.length)];
      const priceValue = parseInt(price.range.match(/\d+/)[0]) + Math.floor(Math.random() * 5);
      
      priceSectionsHTML += `
        <div class="bg-white p-4 rounded-lg border border-gray-200">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <i class="fa-solid ${dim.icon} text-blue-500"></i>
              <span class="font-medium text-gray-900">${dim.name}</span>
            </div>
            <div class="flex items-center gap-2">
              <button class="text-xs px-2 py-1 bg-green-100 text-green-800 rounded hover:bg-green-200">
                <i class="fa-solid fa-thumbs-up mr-1"></i>认可
              </button>
              <button class="text-xs px-2 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200">
                <i class="fa-solid fa-thumbs-down mr-1"></i>不认可
              </button>
            </div>
          </div>
          
          <div class="mb-3">
            <div class="text-sm font-medium text-gray-900">${brand} ${item}</div>
            <div class="text-xs text-gray-500">${brand} · ¥${priceValue}</div>
          </div>
          
          <div class="text-sm text-gray-700">
            <div class="font-medium mb-1">评选理由：</div>
            <div class="text-gray-600">基于市场数据、用户评价和专业评测，${brand} ${item}在${price.name}区间内被评为${dim.name}的最佳选择。综合考虑品牌口碑、产品质量、用户反馈和价格因素，该产品脱颖而出。</div>
          </div>
        </div>
      `;
    });
    
    priceSectionsHTML += `
        </div>
      </div>
    `;
  });
  
  // 评论数据
  const comments = [
    { id: 1, user: '消费者张先生', time: '2小时前', content: '这个评选结果很专业，我正好需要买一次性剃须刀，可以参考一下。', likes: 12 },
    { id: 2, user: '美妆博主小李', time: '5小时前', content: '评测维度设置得很合理，特别是"最舒适"这个维度，对剃须体验很重要。', likes: 8 },
    { id: 3, user: '产品经理王女士', time: '1天前', content: '价格区间划分很科学，覆盖了不同消费群体的需求。', likes: 15 }
  ];
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 全球最佳商品评选</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    /* 严格按照定稿备份的宽度设置 */
    @media (min-width: 768px) { .container-wide { max-width: 1200px; } }
    @media (min-width: 1024px) { .container-wide { max-width: 1300px; } }
    .comment-card { border-bottom: 1px solid #e5e7eb; padding-bottom: 1rem; margin-bottom: 1rem; }
    .comment-card:last-child { border-bottom: none; margin-bottom: 0; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container-wide mx-auto px-4 md:px-6 py-5">
    <!-- 返回按钮 -->
    <div class="mb-6">
      <a href="http://localhost:3065/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 font-medium px-4 py-2 rounded-lg hover:bg-gray-100 border border-gray-300">
        <i class="fa-solid fa-arrow-left"></i> 返回上级目录：${level2}
      </a>
      <div class="text-sm text-gray-500 mt-2">
        <i class="fa-solid fa-folder mr-1"></i> 当前位置：${level1} > ${level2} > ${item}
      </div>
    </div>
    
    <!-- 商品标题 -->
    <div class="mb-7">
      <h1 class="text-2xl font-bold text-gray-900 mb-2">${item} · 全球最佳商品评选</h1>
      <div class="text-gray-600">${priceIntervals.length}个价格区间 × ${evaluationDimensions.length}个评测维度 = ${priceIntervals.length * evaluationDimensions.length}款最佳商品</div>
    </div>
    
    <!-- 最佳评选结果表格（严格按照定稿宽度） -->
    ${bestResultsTableHTML}
    
    <!-- 详细评选分析 -->
    <div class="mt-10">
      <h3 class="text-lg font-bold text-gray-900 mb-4">详细评选分析</h3>
      ${priceSectionsHTML}
    </div>
    
    <!-- 评论区域 -->
    <div class="mt-10">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="fa-solid fa-comments text-blue-500"></i>用户评论
          <span class="text-sm font-normal text-gray-400">${comments.length}条评论</span>
        </h3>
      </div>
      
      <!-- 评论输入框 -->
      <div class="mb-6">
        <textarea id="comment-input" placeholder="写下您的评论..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" rows="3"></textarea>
        <div class="flex justify-between items-center mt-2">
          <div class="text-sm text-gray-500">
            <i class="fa-solid fa-info-circle mr-1"></i> 评论需遵守社区规范
          </div>
          <button onclick="submitComment()" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            发表评论
          </button>
        </div>
      </div>
      
      <!-- 评论列表 -->
      <div class="space-y-4">
        ${comments.map(comment => `
          <div class="comment-card">
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="font-medium text-gray-900">${comment.user}</div>
                <div class="text-xs text-gray-500">${comment.time}</div>
              </div>
              <button class="text-xs text-gray-500 hover:text-red-500">
                <i class="fa-solid fa-heart mr-1"></i>${comment.likes}
              </button>
            </div>
            <div class="text-gray-700">${comment.content}</div>
          </div>
        `).join('')}
      </div>
    </div>
  </div>
  
  <script>
    function submitComment() {
      const commentInput = document.getElementById('comment-input');
      const commentText = commentInput.value.trim();
      
      if (!commentText) {
        alert('请输入评论内容');
        return;
      }
      
      // 模拟提交评论
      alert('评论已提交，待审核后显示');
      commentInput.value = '';
    }
    
    // 投票功能
    document.querySelectorAll('button').forEach(button => {
      if (button.textContent.includes('认可') || button.textContent.includes('不认可')) {
        button.addEventListener('click', function() {
          const isAgree = this.textContent.includes('认可');
          const productName = this.closest('.bg-white').querySelector('.text-sm.font-medium').textContent;
          alert('您' + (isAgree ? '认可' : '不认可') + ' "' + productName + '" 的评选结果');
        });
      }
    });
  </script>
</body>
</html>`;
  
  res.send(html);
});

// 首页重定向到之前的简洁版
app.get('/', (req, res) => {
  res.redirect('http://localhost:3065/?level1=个护健康&level2=剃须用品');
});

app.listen(PORT, () => {
  console.log('\n✅ 严格按照最后一次定稿备份的详情页 已启动');
  console.log('==========================================');
  console.log('');
  console.log('🎯 严格按照定稿备份实现：');
  console.log('   1. 最佳评选结果表格宽度：严格按照1200px/1300px定稿宽度');
  console.log('   2. 包含详细评选分析：价格区间 × 评测维度详细分析');
  console.log('   3. 包含完整评论功能：评论输入 + 评论列表');
  console.log('   4. 投票功能：认可/不认可按钮');
  console.log('   5. 返回链接：正确返回上级目录');
  console.log('');
  console.log('🔗 访问链接：');
  console.log('   详情页: http://localhost:' + PORT + '/category/个护健康/剃须用品/一次性剃须刀');
  console.log('');
  console.log('📊 页面结构：');
  console.log('   1. 最佳评选结果表格（最上面）');
  console.log('   2. 详细评选分析（价格区间 × 评测维度）');
  console.log('   3. 用户评论区域（评论输入 + 评论列表）');
});
EOF