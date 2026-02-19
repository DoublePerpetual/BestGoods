const express = require('express');
const app = express();
const PORT = 3067;

// 完整的详情页，展示3个价格区间 × 3个评测维度 = 9款商品
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
  
  // 9款商品数据（3个价格区间 × 3个评测维度）
  const products = {
    '经济型': {
      '性价比最高': { brand: '吉列', price: 12, reason: '吉列作为剃须刀领导品牌，在经济型区间提供最佳的性价比。刀片锋利度适中，适合日常使用，替换成本低，是学生和预算有限用户的首选。' },
      '最耐用': { brand: '舒适', price: 14, reason: '舒适剃须刀采用三层刀片设计，刀头更耐用，不易生锈。手柄防滑设计，使用寿命比同类产品长30%，适合注重耐用性的用户。' },
      '最舒适': { brand: '飞利浦', price: 15, reason: '飞利浦一次性剃须刀采用弧形刀头设计，贴合面部轮廓，减少皮肤刺激。润滑条含有芦荟精华，提供最顺滑的剃须体验。' }
    },
    '标准型': {
      '性价比最高': { brand: '博朗', price: 22, reason: '博朗在标准型区间提供德国工艺品质，刀片锋利度持久，剃须效率高。综合性能和价格，是日常使用的最佳平衡选择。' },
      '最耐用': { brand: '美的', price: 25, reason: '美的一次性剃须刀采用不锈钢刀片，防腐蚀处理，使用寿命长达3个月。手柄采用环保材料，抗摔耐用，适合长期使用。' },
      '最舒适': { brand: '海尔', price: 28, reason: '海尔剃须刀采用超薄刀片设计，减少拉扯感。润滑条含有维生素E，保护皮肤，提供最舒适的剃须感受，适合敏感肌肤。' }
    },
    '高端型': {
      '性价比最高': { brand: '小米', price: 35, reason: '小米在高端区间提供智能科技体验，刀片采用日本精钢，锋利度提升50%。虽然价格较高，但性能和科技感远超同价位产品。' },
      '最耐用': { brand: '苹果', price: 45, reason: '苹果生态的一次性剃须刀，采用航空级不锈钢，刀片寿命长达6个月。一体化设计，防水防尘，是追求极致耐用性的选择。' },
      '最舒适': { brand: '华为', price: 48, reason: '华为采用纳米涂层刀片，减少摩擦力90%。智能润滑系统，根据皮肤湿度自动调节，提供顶级舒适体验，适合商务人士。' }
    }
  };
  
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
      const product = products[price.name][dim.name];
      bestResultsTableHTML += `
        <td class="px-4 py-3">
          <div class="text-sm font-medium text-gray-900">${product.brand} ${item}</div>
          <div class="text-xs text-gray-500">${product.brand}</div>
          <div class="text-sm font-bold text-gray-900 mt-1">¥${product.price}</div>
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
  
  // 生成详细评选分析 - 完整展示9款商品
  let priceSectionsHTML = '';
  
  priceIntervals.forEach(price => {
    priceSectionsHTML += `
      <div class="mb-10">
        <div class="flex items-center gap-2 mb-4">
          <div class="w-3 h-3 rounded-full bg-blue-500"></div>
          <h4 class="text-md font-bold text-gray-800">${price.name} (${price.range})</h4>
          <span class="text-sm text-gray-500">${price.description}</span>
        </div>
        
        <div class="space-y-6">
    `;
    
    evaluationDimensions.forEach(dim => {
      const product = products[price.name][dim.name];
      
      priceSectionsHTML += `
        <div class="bg-white p-5 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow">
          <div class="flex items-center justify-between mb-3">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <i class="fa-solid ${dim.icon} text-blue-500"></i>
              </div>
              <div>
                <span class="font-medium text-gray-900">${dim.name}</span>
                <div class="text-xs text-gray-500">${dim.description}</div>
              </div>
            </div>
            <div class="flex items-center gap-2">
              <button class="text-sm px-3 py-1.5 bg-green-100 text-green-800 rounded-lg hover:bg-green-200 transition-colors">
                <i class="fa-solid fa-thumbs-up mr-1"></i>认可
              </button>
              <button class="text-sm px-3 py-1.5 bg-red-100 text-red-800 rounded-lg hover:bg-red-200 transition-colors">
                <i class="fa-solid fa-thumbs-down mr-1"></i>不认可
              </button>
            </div>
          </div>
          
          <div class="mb-4 p-3 bg-gray-50 rounded-lg">
            <div class="flex items-center justify-between">
              <div>
                <div class="text-lg font-bold text-gray-900">${product.brand} ${item}</div>
                <div class="text-sm text-gray-600">${product.brand}品牌 · 专业剃须产品</div>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-blue-600">¥${product.price}</div>
                <div class="text-xs text-gray-500">${price.range}区间</div>
              </div>
            </div>
          </div>
          
          <div class="mb-4">
            <div class="flex items-center gap-2 mb-2">
              <i class="fa-solid fa-award text-yellow-500"></i>
              <span class="font-medium text-gray-900">评选理由：</span>
            </div>
            <div class="text-gray-700 pl-6">${product.reason}</div>
          </div>
          
          <div class="flex items-center justify-between pt-3 border-t border-gray-100">
            <div class="text-sm text-gray-500">
              <i class="fa-solid fa-shopping-cart mr-1"></i> 购买渠道：
              <a href="#" class="text-blue-600 hover:text-blue-800 ml-2">淘宝</a>
              <a href="#" class="text-blue-600 hover:text-blue-800 ml-2">京东</a>
              <a href="#" class="text-blue-600 hover:text-blue-800 ml-2">拼多多</a>
            </div>
            <div class="text-sm text-gray-500">
              <i class="fa-solid fa-calendar-alt mr-1"></i> 更新时间：2026-02-18
            </div>
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
    { id: 3, user: '产品经理王女士', time: '1天前', content: '价格区间划分很科学，覆盖了不同消费群体的需求。', likes: 15 },
    { id: 4, user: '剃须爱好者', time: '3小时前', content: '9款商品的对比很全面，每个价格区间都有明确的最佳选择。', likes: 6 }
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
    .product-card { transition: all 0.2s ease; }
    .product-card:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
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
      <div class="text-sm text-gray-500 mt-1 flex items-center gap-2">
        <i class="fa-solid fa-info-circle"></i>
        <span>基于市场数据、用户评价和专业评测的全面评选</span>
      </div>
    </div>
    
    <!-- 最佳评选结果表格（严格按照定稿宽度） -->
    ${bestResultsTableHTML}
    
    <!-- 详细评选分析 - 完整展示9款商品 -->
    <div class="mt-10">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-lg font-bold text-gray-900">详细评选分析</h3>
        <div class="text-sm text-gray-500">
          <i class="fa-solid fa-cube mr-1"></i> 共${priceIntervals.length * evaluationDimensions.length}款商品详细分析
        </div>
      </div>
      ${priceSectionsHTML}
    </div>
    
    <!-- 评论区域 -->
    <div class="mt-12">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-bold text-gray-900 flex items-center gap-2">
          <i class="fa-solid fa-comments text-blue-500"></i>用户评论
          <span class="text-sm font-normal text-gray-400">${comments.length}条评论</span>
        </h3>
      </div>
      
      <!-- 评论输入框 -->
      <div class="mb-6 bg-white p-5 rounded-lg border border-gray-200">
        <textarea id="comment-input" placeholder="写下您的评论..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500" rows="3"></textarea>
        <div class="flex justify-between items-center mt-3">
          <div class="text-sm text-gray-500">
            <i class="fa-solid fa-info-circle mr-1"></i> 评论需遵守社区规范
          </div>
          <button onclick="submitComment()" class="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
            <i class="fa-solid fa-paper-plane mr-2"></i>发表评论
          </button>
        </div>
      </div>
      
      <!-- 评论列表 -->
      <div class="space-y-4">
        ${comments.map(comment => `
          <div class="comment-card bg-white p-4 rounded-lg border border-gray-200">
            <div class="flex justify-between items-start mb-3">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <i class="fa-solid fa-user text-blue-500 text-sm"></i>
                </div>
                <div>
                  <div class="font-medium text-gray-900">${comment.user}</div>
                  <div class="text-xs text-gray-500">${comment.time}</div>
                </div>
              </div>
              <button class="text-sm text-gray-500 hover:text-red-500 flex items-center gap-1">
                <i class="fa-solid fa-heart"></i>
                <span>${comment.likes}</span>
              </button>
            </div>
            <div class="text-gray-700 pl-11">${comment.content}</div>
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
    
    //    // 投票功能
    document.querySelectorAll('button').forEach(button => {
      if (button.textContent.includes('认可') || button.textContent.includes('不认可')) {
        button.addEventListener('click', function() {
          const isAgree = this.textContent.includes('认可');
          const productCard = this.closest('.bg-white');
          const productName = productCard.querySelector('.text-lg.font-bold').textContent;
          const priceRange = productCard.querySelector('.text-xs.text-gray-500:last-child').textContent;
          
          alert('您' + (isAgree ? '认可' : '不认可') + ' "' + productName + '" (' + priceRange + ') 的评选结果');
          
          // 更新按钮状态
          if (isAgree) {
            this.classList.remove('bg-green-100', 'text-green-800');
            this.classList.add('bg-green-600', 'text-white');
            this.innerHTML = '<i class="fa-solid fa-check mr-1"></i>已认可';
          } else {
            this.classList.remove('bg-red-100', 'text-red-800');
            this.classList.add('bg-red-600', 'text-white');
            this.innerHTML = '<i class="fa-solid fa-times mr-1"></i>已不认可';
          }
        });
      }
    });
    
    // 购买链接点击
    document.querySelectorAll('a[href="#"]').forEach(link => {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const platform = this.textContent;
        const productCard = this.closest('.bg-white');
        const productName = productCard.querySelector('.text-lg.font-bold').textContent;
        alert('即将跳转到' + platform + '购买 "' + productName + '"');
      });
    });
  </script>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log('\n✅ 全球最佳商品评选 · 完整详情页 已启动');
  console.log('==========================================');
  console.log('');
  console.log('🎯 完整展示3个价格区间 × 3个评测维度 = 9款商品：');
  console.log('   1. 经济型 (¥5-¥15): 吉列、舒适、飞利浦');
  console.log('   2. 标准型 (¥16-¥30): 博朗、美的、海尔');
  console.log('   3. 高端型 (¥31-¥50): 小米、苹果、华为');
  console.log('');
  console.log('📊 每款商品包含：');
  console.log('   - 品牌和价格信息');
  console.log('   - 详细的评选理由');
  console.log('   - 购买渠道链接（淘宝、京东、拼多多）');
  console.log('   - 认可/不认可投票功能');
  console.log('');
  console.log('🔗 访问链接：');
  console.log('   详情页: http://localhost:' + PORT + '/category/个护健康/剃须用品/一次性剃须刀');
  console.log('');
  console.log('📋 页面结构：');
  console.log('   1. 最佳评选结果表格（3×3矩阵）');
  console.log('   2. 详细评选分析（9款商品完整展示）');
  console.log('   3. 用户评论区域（评论功能完整）');
});
