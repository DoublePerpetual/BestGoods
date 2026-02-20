const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3077;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const BEST_ANSWERS_FILE = path.join(DATA_DIR, 'best-answers.json');

// 加载最佳答案数据
let BEST_ANSWERS = [];
if (fs.existsSync(BEST_ANSWERS_FILE)) {
  try {
    BEST_ANSWERS = JSON.parse(fs.readFileSync(BEST_ANSWERS_FILE, 'utf8'));
    console.log(`📂 已加载 ${BEST_ANSWERS.length} 个品类的最佳答案数据`);
  } catch (error) {
    console.error('❌ 加载最佳答案数据失败:', error);
    BEST_ANSWERS = [];
  }
}

// 生成最佳评选结果表格HTML
function generateBestResultsTable(bestProducts) {
  if (!bestProducts || bestProducts.length === 0) {
    return '<div class="p-6 bg-yellow-50 rounded-lg border border-yellow-200 text-center"><p class="text-yellow-700">暂无评选结果数据</p></div>';
  }
  
  let html = '<div class="overflow-x-auto"><table class="min-w-full divide-y divide-gray-200"><thead><tr><th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>';
  
  // 添加表头（评测维度）
  const dimensions = ['性价比最高', '最耐用', '最舒适'];
  dimensions.forEach(dim => {
    html += `<th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">${dim}</th>`;
  });
  
  html += '</tr></thead><tbody class="bg-white divide-y divide-gray-200">';
  
  // 添加表格内容
  bestProducts.forEach((priceSection, index) => {
    html += `<tr><td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">${priceSection.priceRange}</td>`;
    
    dimensions.forEach(dim => {
      const product = priceSection.dimensions.find(d => d.name === dim);
      if (product) {
        html += `<td class="px-4 py-3"><div class="text-sm font-medium text-gray-900">${product.product}</div><div class="text-xs text-gray-500">${product.brand}</div><div class="text-sm font-bold text-gray-900 mt-1">${product.price}</div><div class="flex items-center mt-1">`;
        
        // 星级评分
        const rating = product.rating || 4;
        for (let i = 0; i < 5; i++) {
          if (i < rating) {
            html += '<i class="fa-solid fa-star text-yellow-500 text-xs"></i>';
          } else {
            html += '<i class="fa-regular fa-star text-gray-300 text-xs"></i>';
          }
        }
        
        // 评论数（模拟）
        const reviews = Math.floor(Math.random() * 20000) + 1000;
        html += `<span class="text-xs text-gray-500 ml-1">${reviews.toLocaleString()}+</span></div></td>`;
      } else {
        html += '<td class="px-4 py-3 text-gray-400">-</td>';
      }
    });
    
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  return html;
}

// 生成详细评选分析HTML
function generateDetailedAnalysis(bestProducts, itemName) {
  if (!bestProducts || bestProducts.length === 0) {
    return '<div class="text-gray-600">暂无详细评选分析数据。</div>';
  }
  
  let html = '';
  
  bestProducts.forEach((priceSection, index) => {
    const priceRange = priceSection.priceRange;
    const priceDesc = priceRange.includes('经济型') ? '适合预算有限、临时使用或学生群体' : 
                     priceRange.includes('标准型') ? '性价比最高的主流选择，适合日常使用' :
                     '高品质体验，适合追求舒适度和性能的用户';
    
    html += `
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4">${priceRange.split(' ')[0]} <span class="text-sm font-normal text-gray-500">${priceRange.split('(')[1]?.replace(')', '') || ''}</span></h3>
        <p class="text-gray-600 mb-4">${priceDesc}</p>
        <div class="space-y-4">`;
    
    priceSection.dimensions.forEach(dimension => {
      const productKey = dimension.product.replace(/\s+/g, '-');
      const rating = dimension.rating || 4;
      const reviews = Math.floor(Math.random() * 20000) + 1000;
      const likeCount = Math.floor(Math.random() * 200) + 20;
      const dislikeCount = Math.floor(Math.random() * 20) + 1;
      
      html += `
        <div class="p-5 bg-white rounded-lg border border-gray-200">
          <div class="flex justify-between items-start mb-3">
            <div>
              <div class="flex items-center gap-2 mb-1">
                <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">${dimension.name}</span>
                <span class="text-lg font-bold text-gray-900">${dimension.product}</span>
              </div>
              <div class="text-sm text-gray-600 mb-2">${dimension.brand}</div>
              <div class="flex items-center gap-4">
                <div class="text-xl font-bold text-gray-900">${dimension.price}</div>
                <div class="flex items-center">`;
      
      // 星级评分
      for (let i = 0; i < 5; i++) {
        if (i < rating) {
          html += '<i class="fa-solid fa-star text-yellow-500"></i>';
        } else {
          html += '<i class="fa-regular fa-star text-gray-300"></i>';
        }
      }
      
      html += `
                  <span class="text-sm text-gray-500 ml-1">${reviews.toLocaleString()}+</span>
                </div>
              </div>
            </div>
            <div class="flex gap-2">
              <button onclick="vote('${productKey}', 'like')" 
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
                <i class="fa-solid fa-thumbs-up"></i>
                <span>认可</span>
                <span class="vote-count-like-${productKey}">${likeCount}</span>
              </button>
              <button onclick="vote('${productKey}', 'dislike')" 
                      class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
                <i class="fa-solid fa-thumbs-down"></i>
                <span>不认可</span>
                <span class="vote-count-dislike-${productKey}">${dislikeCount}</span>
              </button>
            </div>
          </div>
          <div class="text-sm text-gray-700 leading-relaxed">这是${dimension.product}的详细评选理由。基于市场调研和用户反馈，该产品在${dimension.name}方面表现优异。</div>
        </div>`;
    });
    
    html += `
        </div>
      </div>`;
  });
  
  return html;
}

// 详情页路由
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 解码URL参数
  const decodedLevel1 = decodeURIComponent(level1);
  const decodedLevel2 = decodeURIComponent(level2);
  const decodedItem = decodeURIComponent(item);
  
  console.log(`🔍 请求详情页: ${decodedLevel1} > ${decodedLevel2} > ${decodedItem}`);
  
  // 查找对应的品类数据
  const categoryData = BEST_ANSWERS.find(
    answer => answer.level1 === decodedLevel1 && 
              answer.level2 === decodedLevel2 && 
              answer.item === decodedItem
  );
  
  if (!categoryData) {
    // 如果没有找到数据，返回404页面
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${decodedItem} · 数据未找到</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    </head>
    <body class="bg-gray-50 min-h-screen">
      <div class="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
        <div class="mb-6">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <a href="http://localhost:3076/" class="text-blue-600 hover:text-blue-800">首页</a>
            <i class="fa-solid fa-chevron-right text-xs"></i>
            <span class="text-gray-900 font-medium">${decodedItem}</span>
          </div>
        </div>
        
        <div class="text-center py-16">
          <i class="fa-solid fa-exclamation-triangle text-yellow-500 text-5xl mb-4"></i>
          <h1 class="text-2xl font-bold text-gray-900 mb-2">${decodedItem} · 数据未找到</h1>
          <p class="text-gray-600 mb-6">该品类的评选数据尚未生成或正在处理中。</p>
          <a href="http://localhost:3076/" class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">返回首页</a>
        </div>
      </div>
    </body>
    </html>`;
    
    res.status(404).send(html);
    return;
  }
  
  // 生成最佳评选结果表格
  const bestResultsTableHTML = generateBestResultsTable(categoryData.bestProducts);
  
  // 生成详细评选分析
  const detailedAnalysisHTML = generateDetailedAnalysis(categoryData.bestProducts, decodedItem);
  
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${categoryData.title || `${decodedItem} · 全球最佳商品评选`}</title>
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
          <a href="http://localhost:3076/?level1=${encodeURIComponent(decodedLevel1)}&level2=${encodeURIComponent(decodedLevel2)}" class="nav-link">${decodedLevel1}</a>
          <i class="fa-solid fa-chevron-right text-xs"></i>
          <span class="text-gray-900 font-medium">${decodedItem}</span>
        </div>
      </div>
      
      <!-- 商品标题 -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">${categoryData.title || `${decodedItem} · 全球最佳商品评选`}</h1>
        <p class="text-gray-600">${categoryData.subtitle || "3个价格区间 × 3个评测维度 = 9款最佳商品"}</p>
      </div>
      
      <!-- 最佳商品评选结果标题 -->
      <div class="mb-4">
        <h2 class="text-2xl font-bold text-gray-900">最佳商品评选结果</h2>
        <p class="text-gray-600 mt-1">基于3个价格区间和3个评测维度的综合评选</p>
      </div>
      
      <!-- 最佳评选结果表格 -->
      <div class="mb-8 elegant-border p-6 bg-white">
        ${bestResultsTableHTML}
      </div>
      
      <!-- 详细评选分析 -->
      <div class="mb-8">
        <h2 class="text-2xl font-bold text-gray-900 mb-6">详细评选分析</h2>
        ${detailedAnalysisHTML}
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
      
      function vote(productKey, type) {
        const currentVote = votes[productKey];
        
        // 更新本地存储
        if (currentVote === type) {
          // 取消投票
          delete votes[productKey];
          updateCount(productKey, type, -1);
        } else {
          // 如果之前有其他投票，先取消
          if (currentVote) {
            updateCount(productKey, currentVote, -1);
          }
          // 添加新投票
          votes[productKey] = type;
          updateCount(productKey, type, 1);
        }
        
        localStorage.setItem('votes', JSON.stringify(votes));
        updateButtonStyles(productKey);
      }
      
      function updateCount(productKey, type, delta) {
        const countElement = document.querySelector('.vote-count-' + type + '-' + productKey);
        if (countElement) {
          let currentCount = parseInt(countElement.textContent) || 0;
          currentCount += delta;
          countElement.textContent = currentCount;
        }
      }
      
      function updateButtonStyles(productKey) {
        const currentVote = votes[productKey];
        
        // 重置所有按钮样式
        const likeBtn = document.querySelector('button[onclick*="vote(\\'' + productKey + '\\', \\'like\\')"]');
        const dislikeBtn = document.querySelector('button[onclick*="vote(\\'' + productKey + '\\', \\'dislike\\')"]');
        
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
          updateButtonStyles(productKey);
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
        const timestamp = new