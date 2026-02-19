/**
 * 简单品类目录管理页面
 * 实时展示已评测的品类和链接
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3082;

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data/best-answers.json');

// 加载评测数据
function loadEvaluationData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('加载评测数据失败:', error);
  }
  return {};
}

// 首页
app.get('/', (req, res) => {
  const evaluationData = loadEvaluationData();
  const categories = Object.keys(evaluationData);
  
  let html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最佳商品 - 品类目录管理</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      .category-item:hover { background-color: #f9fafb; }
      .quality-excellent { background-color: #d1fae5; color: #065f46; }
      .quality-good { background-color: #fef3c7; color: #92400e; }
      .quality-poor { background-color: #fee2e2; color: #991b1b; }
    </style>
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">最佳商品 - 品类目录管理</h1>
        <p class="text-gray-600 mt-2">实时查看已评测品类，检查评选质量</p>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold text-gray-700">已评测品类</h3>
            <p class="text-2xl font-bold text-blue-600 mt-2">${categories.length}</p>
            <p class="text-sm text-gray-500">总品类: 245,317</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold text-gray-700">今日新增</h3>
            <p class="text-2xl font-bold text-green-600 mt-2" id="today-added">计算中...</p>
            <p class="text-sm text-gray-500">24小时内新增</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold text-gray-700">最后更新</h3>
            <p class="text-xl font-bold text-orange-600 mt-2">刚刚</p>
            <p class="text-sm text-gray-500">数据实时更新</p>
          </div>
        </div>
      </header>

      <!-- 搜索和筛选 -->
      <div class="bg-white rounded-lg shadow mb-6 p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex-1">
            <div class="relative">
              <input type="text" id="search-input" 
                     placeholder="搜索品类名称..." 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <button onclick="filterByLevel('all')" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
              全部
            </button>
            <button onclick="filterByLevel('个护健康')" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200">
              个护健康
            </button>
            <button onclick="filterByLevel('电子产品')" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200">
              电子产品
            </button>
          </div>
        </div>
      </div>

      <!-- 品类表格 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">已评测品类列表</h2>
          <div class="text-sm text-gray-500">
            共 ${categories.length} 个品类
          </div>
        </div>
        
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  品类信息
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  评测状态
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  访问链接
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody id="categories-table" class="bg-white divide-y divide-gray-200">
  `;
  
  // 生成表格行
  categories.slice(0, 100).forEach(key => {
    const data = evaluationData[key];
    const [level1, level2, level3] = key.split('/');
    
    const products = data.best_products || [];
    const productCount = products.length;
    
    html += `
              <tr class="category-item">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <i class="fas fa-box text-blue-600"></i>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900">${level3}</div>
                      <div class="text-sm text-gray-500">${level1} > ${level2}</div>
                      <div class="text-xs text-gray-400 mt-1">
                        <i class="fas fa-clock mr-1"></i>${data.processed_at ? new Date(data.processed_at).toLocaleDateString('zh-CN') : '未知'}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex flex-col space-y-1">
                    <span class="inline-flex items-center">
                      <i class="fas fa-tags text-gray-400 mr-2"></i>
                      <span class="text-sm">${productCount} 个商品</span>
                    </span>
                    <span class="inline-flex items-center">
                      <i class="fas fa-layer-group text-gray-400 mr-2"></i>
                      <span class="text-sm">${data.dimensions?.dimensions?.length || 0} 个维度</span>
                    </span>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="space-y-2">
                    <a href="http://localhost:3077/category/${encodeURIComponent(level1)}/${encodeURIComponent(level2)}/${encodeURIComponent(level3)}" 
                       target="_blank" 
                       class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                      <i class="fas fa-external-link-alt mr-2"></i>详情页
                    </a>
                    <a href="http://localhost:3076?search=${encodeURIComponent(level3)}" 
                       target="_blank"
                       class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 ml-2">
                      <i class="fas fa-search mr-2"></i>搜索
                    </a>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <button onclick="viewCategory('${level1}', '${level2}', '${level3}')" 
                            class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                      <i class="fas fa-eye mr-1"></i>查看
                    </button>
                    <button onclick="provideFeedback('${level3}')" 
                            class="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">
                      <i class="fas fa-comment mr-1"></i>反馈
                    </button>
                  </div>
                </td>
              </tr>
    `;
  });
  
  html += `
            </tbody>
          </table>
        </div>
        
        <div class="px-6 py-4 border-t text-center text-gray-500">
          <p>显示前 100 个品类，共 ${categories.length} 个</p>
          <p class="text-sm mt-1">数据每30秒自动更新</p>
        </div>
      </div>

      <!-- 反馈面板 -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">质量反馈</h2>
        <div>
          <textarea id="feedback-text" rows="4" class="w-full border rounded-lg p-3 mb-3" placeholder="请输入质量反馈..."></textarea>
          <div class="flex justify-between">
            <div>
              <label class="flex items-center">
                <input type="checkbox" id="needs-rework" class="mr-2">
                <span class="text-sm text-gray-700">需要重新评测</span>
              </label>
            </div>
            <button onclick="submitFeedback()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              提交反馈
            </button>
          </div>
        </div>
      </div>

      <footer class="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
        <p>最佳商品百科全书 - 品类目录管理系统 v1.0.0</p>
        <p class="mt-1">访问链接: http://localhost:${PORT}</p>
      </footer>
    </div>

    <script>
      // 计算今日新增
      function calculateTodayAdded() {
        const today = new Date().toDateString();
        const rows = document.querySelectorAll('#categories-table tr');
        let todayCount = 0;
        
        rows.forEach(row => {
          const dateText = row.querySelector('.text-xs.text-gray-400')?.textContent;
          if (dateText && dateText.includes(today.slice(0, 4))) {
            todayCount++;
          }
        });
        
        document.getElementById('today-added').textContent = todayCount;
      }
      
      // 查看品类
      function viewCategory(level1, level2, level3) {
        const url = 'http://localhost:3077/category/' + encodeURIComponent(level1) + '/' + encodeURIComponent(level2) + '/' + encodeURIComponent(level3);
        window.open(url, '_blank');
      }
      
      // 提供反馈
      function provideFeedback(categoryName) {
        document.getElementById('feedback-text').value = `关于【${categoryName}】的反馈：\n\n`;
        document.getElementById('feedback-text').focus();
      }
      
      // 提交反馈
      function submitFeedback() {
        const feedback = document.getElementById('feedback-text').value;
        const needsRework = document.getElementById('needs-rework').checked;
        
        if (!feedback.trim()) {
          alert('请输入反馈内容');
          return;
        }
        
        // 简单保存到localStorage
        const feedbacks = JSON.parse(localStorage.getItem('category-feedbacks') || '[]');
        feedbacks.push({
          feedback: feedback,
          needs_rework: needsRework,
          timestamp: new Date().toISOString()
        });
        
        localStorage.setItem('category-feedbacks', JSON.stringify(feedbacks));
        
        alert('反馈已保存到本地！');
        document.getElementById('feedback-text').value = '';
        document.getElementById('needs-rework').checked = false;
      }
      
      // 筛选功能
      function filterByLevel(level) {
        const rows = document.querySelectorAll('#categories-table tr');
        rows.forEach(row => {
          const levelText = row.querySelector('.text-sm.text-gray-500')?.textContent;
          if (level === 'all' || (levelText && levelText.includes(level))) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      }
      
      // 搜索功能
      document.getElementById('search-input').addEventListener('input', function() {
        const searchText = this.value.toLowerCase();
        const rows = document.querySelectorAll('#categories-table tr');
        
        rows.forEach(row => {
          const categoryName = row.querySelector('.text-sm.font-medium')?.textContent.toLowerCase() || '';
          const categoryPath = row.querySelector('.text-sm.text-gray-500')?.textContent.toLowerCase() || '';
          
          if (categoryName.includes(searchText) || categoryPath.includes(searchText)) {
            row.style.display = '';
          } else {
            row.style.display = 'none';
          }
        });
      });
      
      // 页面加载完成
      document.addEventListener('DOMContentLoaded', function() {
        calculateTodayAdded();
        
        // 每30秒刷新页面
        setInterval(() => {
          window.location.reload();
        }, 30000);
      });
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`品类目录管理页面运行在 http://localhost:${PORT}`);
  console.log(`已评测品类: ${Object.keys(loadEvaluationData()).length}`);
});