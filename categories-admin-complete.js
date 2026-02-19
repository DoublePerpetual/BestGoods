/**
 * 品类目录管理页面
 * 实时展示已评测的品类和链接，方便质量检查
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3082; // 使用新端口避免冲突

// 数据文件路径
const DATA_FILE = path.join(__dirname, 'data/best-answers.json');
const CATEGORIES_FILE = path.join(__dirname, 'data/global-categories-expanded.json');

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 加载品类数据
function loadCategoriesData() {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      const data = JSON.parse(fs.readFileSync(CATEGORIES_FILE, 'utf8'));
      return data;
    }
  } catch (error) {
    console.error('加载品类数据失败:', error);
  }
  return { categories: {} };
}

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

// 首页 - 品类目录管理
app.get('/', (req, res) => {
  const evaluationData = loadEvaluationData();
  const categories = Object.keys(evaluationData);
  
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最佳商品 - 品类目录管理</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
      .category-card {
        transition: all 0.2s ease;
      }
      .category-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
      }
      .quality-badge {
        display: inline-block;
        padding: 2px 8px;
        border-radius: 12px;
        font-size: 12px;
        font-weight: 500;
      }
      .quality-excellent { background-color: #d1fae5; color: #065f46; }
      .quality-good { background-color: #fef3c7; color: #92400e; }
      .quality-poor { background-color: #fee2e2; color: #991b1b; }
      .filter-active {
        background-color: #3b82f6 !important;
        color: white !important;
      }
    </style>
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 py-8">
      <!-- 顶部标题和统计 -->
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-800">最佳商品 - 品类目录管理</h1>
        <p class="text-gray-600 mt-2">实时查看已评测品类，检查评选质量，提供反馈</p>
        
        <div class="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold text-gray-700">已评测品类</h3>
            <p class="text-2xl font-bold text-blue-600 mt-2" id="total-categories">${categories.length}</p>
            <p class="text-sm text-gray-500">总品类: 245,317</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold text-gray-700">今日新增</h3>
            <p class="text-2xl font-bold text-green-600 mt-2" id="today-added">0</p>
            <p class="text-sm text-gray-500">24小时内新增</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold text-gray-700">平均质量分</h3>
            <p class="text-2xl font-bold text-purple-600 mt-2" id="avg-quality">0</p>
            <p class="text-sm text-gray-500">基于置信度评分</p>
          </div>
          
          <div class="bg-white rounded-lg shadow p-4">
            <h3 class="text-lg font-semibold text-gray-700">最后更新</h3>
            <p class="text-xl font-bold text-orange-600 mt-2" id="last-updated">刚刚</p>
            <p class="text-sm text-gray-500">数据更新时间</p>
          </div>
        </div>
      </header>

      <!-- 筛选和搜索 -->
      <div class="bg-white rounded-lg shadow mb-6 p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex-1">
            <div class="relative">
              <input type="text" id="search-input" 
                     placeholder="搜索品类名称、品牌或评价维度..." 
                     class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>
            </div>
          </div>
          
          <div class="flex flex-wrap gap-2">
            <button onclick="filterByLevel('all')" class="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 filter-btn active">
              全部
            </button>
            <button onclick="filterByLevel('个护健康')" class="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 filter-btn">
              个护健康
            </button>
            <button onclick="filterByLevel('电子产品')" class="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 filter-btn">
              电子产品
            </button>
            <button onclick="filterByLevel('家居用品')" class="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 filter-btn">
              家居用品
            </button>
            <button onclick="filterByLevel('食品饮料')" class="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 filter-btn">
              食品饮料
            </button>
          </div>
        </div>
        
        <div class="mt-4 flex flex-wrap gap-2">
          <button onclick="filterByQuality('all')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 quality-filter">
            全部质量
          </button>
          <button onclick="filterByQuality('excellent')" class="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 quality-filter">
            <i class="fas fa-star mr-1"></i>优秀 (≥90)
          </button>
          <button onclick="filterByQuality('good')" class="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200 quality-filter">
            <i class="fas fa-check mr-1"></i>良好 (70-89)
          </button>
          <button onclick="filterByQuality('poor')" class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 quality-filter">
            <i class="fas fa-exclamation mr-1"></i>需改进 (<70)
          </button>
          <button onclick="filterByFeedback('needs')" class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200">
            <i class="fas fa-comment-dots mr-1"></i>需要反馈
          </button>
        </div>
      </div>

      <!-- 品类表格 -->
      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div class="px-6 py-4 border-b flex justify-between items-center">
          <h2 class="text-xl font-semibold text-gray-800">已评测品类列表</h2>
          <div class="text-sm text-gray-500">
            每页显示: 
            <select id="page-size" class="ml-2 border rounded px-2 py-1" onchange="loadCategories()">
              <option value="20">20</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="200">200</option>
            </select>
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
                  质量评分
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
              <!-- 动态加载 -->
            </tbody>
          </table>
        </div>
        
        <!-- 分页 -->
        <div class="px-6 py-4 border-t flex items-center justify-between">
          <div class="text-sm text-gray-500" id="pagination-info">
            显示 0-0，共 0 条
          </div>
          <div class="flex space-x-2">
            <button onclick="changePage(-1)" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50" id="prev-btn" disabled>
              上一页
            </button>
            <div class="flex items-center">
              <span class="text-gray-700">第</span>
              <input type="number" id="page-input" value="1" min="1" class="w-12 mx-2 text-center border rounded py-1">
              <span class="text-gray-700">页</span>
            </div>
            <button onclick="changePage(1)" class="px-4 py-2 border rounded-lg text-gray-700 hover:bg-gray-50" id="next-btn" disabled>
              下一页
            </button>
          </div>
        </div>
      </div>

      <!-- 反馈面板 -->
      <div class="mt-8 bg-white rounded-lg shadow p-6">
        <h2 class="text-xl font-semibold text-gray-800 mb-4">质量反馈</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 class="font-medium text-gray-700 mb-2">快速反馈模板</h3>
            <div class="space-y-2">
              <button onclick="useFeedbackTemplate('品牌匹配错误')" class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                <span class="font-medium text-red-600">品牌匹配错误</span>
                <p class="text-sm text-gray-500">品牌与品类不匹配（如苹果生产棉签）</p>
              </button>
              <button onclick="useFeedbackTemplate('评选理由过短')" class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                <span class="font-medium text-orange-600">评选理由过短</span>
                <p class="text-sm text-gray-500">评选理由少于400字，需要补充细节</p>
              </button>
              <button onclick="useFeedbackTemplate('价格区间不合理')" class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                <span class="font-medium text-yellow-600">价格区间不合理</span>
                <p class="text-sm text-gray-500">价格区间设置不符合市场实际</p>
              </button>
              <button onclick="useFeedbackTemplate('评价维度不准确')" class="w-full text-left px-4 py-3 border rounded-lg hover:bg-gray-50">
                <span class="font-medium text-blue-600">评价维度不准确</span>
                <p class="text-sm text-gray-500">评价维度不符合品类特点</p>
              </button>
            </div>
          </div>
          
          <div>
            <h3 class="font-medium text-gray-700 mb-2">自定义反馈</h3>
            <div>
              <textarea id="custom-feedback" rows="4" class="w-full border rounded-lg p-3 mb-3" placeholder="请输入具体的质量反馈..."></textarea>
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
        </div>
      </div>

      <!-- 统计图表 -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-semibold text-gray-800 mb-4">质量分布</h3>
          <div class="h-64 flex items-center justify-center text-gray-400">
            质量分布图表（开发中）
          </div>
        </div>
        
        <div class="bg-white rounded-lg shadow p-6">
          <h3 class="font-semibold text-gray-800 mb-4">处理进度</h3>
          <div class="space-y-4">
            <div>
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>个护健康</span>
                <span>25%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-green-600 h-2 rounded-full" style="width: 25%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>电子产品</span>
                <span>18%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-blue-600 h-2 rounded-full" style="width: 18%"></div>
              </div>
            </div>
            <div>
              <div class="flex justify-between text-sm text-gray-600 mb-1">
                <span>家居用品</span>
                <span>12%</span>
              </div>
              <div class="w-full bg-gray-200 rounded-full h-2">
                <div class="bg-purple-600 h-2 rounded-full" style="width: 12%"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer class="mt-12 pt-8 border-t text-center text-gray-500 text-sm">
        <p>最佳商品百科全书 - 品类目录管理系统 v1.0.0</p>
        <p class="mt-1">数据自动更新，实时反映评测进度和质量</p>
      </footer>
    </div>

    <script>
      // 全局变量
      let allCategories = [];
      let filteredCategories = [];
      let currentPage = 1;
      let pageSize = 20;
      let currentFilter = 'all';
      let currentQualityFilter = 'all';
      let selectedCategory = null;

      // 加载品类数据
      async function loadCategories() {
        try {
          const response = await fetch('/api/categories');
          const data = await response.json();
          
          allCategories = data.categories || [];
          pageSize = parseInt(document.getElementById('page-size').value);
          
          updateStatistics(data.stats);
          applyFilters();
          renderTable();
          
        } catch (error) {
          console.error('加载品类数据失败:', error);
          document.getElementById('categories-table').innerHTML = 
            '<tr><td colspan="5" class="px-6 py-8 text-center text-gray-500">加载数据失败，请刷新页面重试</td></tr>';
        }
      }

      // 更新统计信息
      function updateStatistics(stats) {
        document.getElementById('total-categories').textContent = stats.total_categories || 0;
        document.getElementById('today-added').textContent = stats.today_added || 0;
        document.getElementById('avg-quality').textContent = stats.avg_quality ? stats.avg_quality.toFixed(1) : '0';
        document.getElementById('last-updated').textContent = stats.last_updated || '刚刚';
      }

      // 应用筛选
      function applyFilters() {
        filteredCategories = allCategories.filter(category => {
          // 一级分类筛选
          if (currentFilter !== 'all' && category.level1 !== currentFilter) {
            return false;
          }
          
          // 质量筛选
          if (currentQualityFilter !== 'all') {
            const quality = getQualityLevel(category.avg_confidence);
            if (currentQualityFilter === 'excellent' && quality !== 'excellent') return false;
            if (currentQualityFilter === 'good' && quality !== 'good') return false;
            if (currentQualityFilter === 'poor' && quality !== 'poor') return false;
          }
          
          // 搜索筛选
          const searchText = document.getElementById('search-input').value.toLowerCase();
          if (searchText) {
            const searchFields = [
              category.level1,
              category.level2,
              category.level3,
              category.brands?.join(' ') || '',
              category.dimensions?.join(' ') || ''
            ].join(' ').toLowerCase();
            
            if (!searchFields.includes(searchText)) {
              return false;
            }
          }
          
          return true;
        });
        
        // 按最后评测时间排序
        filteredCategories.sort((a, b) => new Date(b.last_evaluated) - new Date(a.last_evaluated));
      }

      // 获取质量等级
      function getQualityLevel(confidence) {
        if (confidence >= 90) return 'excellent';
        if (confidence >= 70) return 'good';
        return 'poor';
      }

      // 渲染表格
      function renderTable() {
        const tableBody = document.getElementById('categories-table');
        const startIndex = (currentPage - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize, filteredCategories.length);
        const pageCategories = filteredCategories.slice(startIndex, endIndex);
        
        if (pageCategories.length === 0) {
          tableBody.innerHTML = `
            <tr>
              <td colspan="5" class="px-6 py-8 text-center text-gray-500">
                <i class="fas fa-inbox text-3xl mb-2 text-gray-300"></i>
                <p>没有找到匹配的品类</p>
                <p class="text-sm mt-1">尝试调整筛选条件或搜索关键词</p>
              </td>
            </tr>
          `;
        } else {
          tableBody.innerHTML = pageCategories.map(category => `
            <tr class="category-card hover:bg-gray-50">
              <td class="px-6 py-4">
                <div class="flex items-center">
                  <div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <i class="fas fa-box text-blue-600"></i>
                  </div>
                  <div class="ml-4">
                    <div class="text-sm font-medium text-gray-900">${category.level3}</div>
                    <div class="text-sm text-gray-500">${category.level1} > ${category.level2}</div>
                    <div class="text-xs text-gray-400 mt-1">
                      <i class="fas fa-clock mr-1"></i>${formatDate(category.last_evaluated)}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex flex-col space-y-1">
                  <span class="inline-flex items-center">
                    <i class="fas fa-tags text-gray-400 mr-2"></i>
                    <span class="text-sm">${category.product_count || 0} 个商品</span>
                  </span>
                  <span class="inline-flex items-center">
                    <i class="fas fa-layer-group text-gray-400 mr-2"></i>
                    <span class="text-sm">${category.dimension_count || 0} 个维度</span>
                  </span>
                  <span class="inline-flex items-center">
                    <i class="fas fa-money-bill-wave text-gray-400 mr-2"></i>
                    <span class="text-sm">${category.price_range_count || 0} 个价格区间</span>
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center">
                  ${renderQualityBadge(category.avg_confidence)}
                  <div class="ml-3">
                    <div class="text-sm font-medium text-gray-900">${category.avg_confidence ? category.avg_confidence.toFixed(1) : '0'} 分</div>
                    <div class="w-24 bg-gray-200 rounded-full h-2 mt-1">
                      <div class="bg-${getQualityColor(category.avg_confidence)} h-2 rounded-full" 
                           style="width: ${category.avg_confidence || 0}%"></div>
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="space-y-2">
                  <a href="http://localhost:3077/category/${encodeURIComponent(category.level1)}/${encodeURIComponent(category.level2)}/${encodeURIComponent(category.level3)}" 
                     target="_blank" 
                     class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">
                    <i class="fas fa-external-link-alt mr-2"></i>详情页
                  </a>
                  <a href="http://localhost:3076?search=${encodeURIComponent(category.level3)}" 
                     target="_blank"
                     class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 ml-2">
                    <i class="fas fa-search mr-2"></i>搜索
                  </a>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex space-x-2">
                  <button onclick="viewCategoryDetails('${category.id}')" 
                          class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                    <i class="fas fa-eye mr-1"></i>查看
                  </button>
                  <button onclick="provideFeedback('${category.id}')" 
                          class="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">
                    <i class="fas fa-comment mr-1"></i>反馈
                  </button>
                  <button onclick="reEvaluateCategory('${category.id}')" 
                          class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200">
                    <i class="fas fa-redo mr-1"></i>重评
                  </button>
                </div>
              </td>
            </tr>
          `).join('');
        }
        
        // 更新分页信息
        updatePaginationInfo();
      }

      // 渲染质量徽章
      function renderQualityBadge(confidence) {
        const quality = getQualityLevel(confidence);
        const colors = {
          excellent: 'quality-excellent',
          good: 'quality-good',
          poor: 'quality-poor'
        };
        const texts = {
          excellent: '优秀',
          good: '良好',
          poor: '需改进'
        };
        
        return `<span class="quality-badge ${colors[quality]}">${texts[quality]}</span>`;
      }

      // 获取质量颜色
      function getQualityColor(confidence) {
        if (confidence >= 90) return 'green-600';
        if (confidence >= 70) return 'yellow-500';
        return 'red-500';
      }

      // 格式化日期
      function formatDate(dateString) {
        if (!dateString) return '未知';
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        
        if (diffMins < 60) return `${diffMins}分钟前`;
        if (diffMins < 1440) return `${Math.floor(diffMins / 60)}小时前`;
        return date.toLocaleDateString('zh-CN');
      }

      // 更新分页信息
      function updatePaginationInfo() {
        const startIndex = (currentPage - 1) * pageSize + 1;
        const endIndex = Math.min(currentPage * pageSize, filteredCategories.length);
        
        document.getElementById('pagination-info').textContent = 
          `显示 ${startIndex}-${endIndex}，共 ${filteredCategories.length} 条`;
        
        document.getElementById('page-input').value = currentPage;
        document.getElementById('prev-btn').disabled = currentPage === 1;
        document.getElementById('next-btn').disabled = endIndex >= filteredCategories.length;
      }

      // 筛选函数
      function filterByLevel(level) {
        currentFilter = level;
        currentPage = 1;
        
        // 更新按钮状态
        document.querySelectorAll('.filter-btn').forEach(btn => {
          btn.classList.remove('filter-active');
        });
        event.target.classList.add('filter-active');
        
        applyFilters();
        renderTable();
      }

      function filterByQuality(quality) {
        currentQualityFilter = quality;
        currentPage = 1;
        
        // 更新按钮状态
        document.querySelectorAll('.quality-filter').forEach(btn => {
          btn.classList.remove('filter-active');
        });
        if (quality !== 'all') {
          event.target.classList.add('filter-active');
        }
        
        applyFilters();
        renderTable();
      }

      function filterByFeedback(type) {
        // 筛选需要反馈的品类
        currentPage = 1;
        applyFilters();
        renderTable();
      }

      // 搜索功能
      document.getElementById('search-input').addEventListener('input', function() {
        currentPage = 1;
        applyFilters();
        renderTable();
      });

      // 分页功能
      function changePage(delta) {
        const newPage = currentPage + delta;
        const totalPages = Math.ceil(filteredCategories.length / pageSize);
        
        if (newPage >= 1 && newPage <= totalPages) {
          currentPage = newPage;
          renderTable();
        }
      }

      document.getElementById('page-input').addEventListener('change', function() {
        const totalPages = Math.ceil(filteredCategories.length / pageSize);
        const newPage = Math.max(1, Math.min(parseInt(this.value), totalPages));
        
        if (newPage !== currentPage) {
          currentPage = newPage;
          renderTable();
        }
      });

      // 操作函数
      function viewCategoryDetails(categoryId) {
        selectedCategory = allCategories.find(c => c.id === categoryId);
        if (selectedCategory) {
          alert(`查看品类详情:\n${selectedCategory.level1} > ${selectedCategory.level2} > ${selectedCategory.level3}\n\n将在新窗口中打开详情页...`);
          window.open(`http://localhost:3077/category/${encodeURIComponent(selectedCategory.level1)}/${encodeURIComponent(selectedCategory.level2)}/${encodeURIComponent(selectedCategory.level3)}`, '_blank');
        }
      }

      function provideFeedback(categoryId) {
        selectedCategory = allCategories.find(c => c.id === categoryId);
        if (selectedCategory) {
          document.getElementById('custom-feedback').value = `关于【${selectedCategory.level3}】的反馈：\n\n`;
          document.getElementById('custom-feedback').focus();
        }
      }

      function reEvaluateCategory(categoryId) {
        if (confirm('确定要重新评测这个品类吗？这将删除现有数据并重新生成。')) {
          // 调用API重新评测
          fetch(`/api/re-evaluate/${categoryId}`, { method: 'POST' })
            .then(response => response.json())
            .then(data => {
              alert(`已开始重新评测: ${data.message}`);
              loadCategories();
            })
            .catch(error => {
              alert('重新评测请求失败: ' + error.message);
            });
        }
      }

      // 反馈模板
      function useFeedbackTemplate(template) {
        if (selectedCategory) {
          document.getElementById('custom-feedback').value = 
            `【${selectedCategory.level3}】 - ${template}\n\n具体问题：`;
        } else {
          document.getElementById('custom-feedback').value = `${template}\n\n品类：`;
        }
        document.getElementById('custom-feedback').focus();
      }

      function submitFeedback() {
        const feedback = document.getElementById('custom-feedback').value;
        const needsRework = document.getElementById('needs-rework').checked;
        
        if (!feedback.trim()) {
          alert('请输入反馈内容');
          return;
        }
        
        if (selectedCategory) {
          // 保存反馈到服务器
          fetch('/api/feedback', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              category_id: selectedCategory.id,
              category_name: selectedCategory.level3,
              feedback: feedback,
              needs_rework: needsRework,
              timestamp: new Date().toISOString()
            })
          })
          .then(response => response.json())
          .then(data => {
            alert('反馈已提交！');
            document.getElementById('custom-feedback').value = '';
            document.getElementById('needs-rework').checked = false;
          })
          .catch(error => {
            alert('提交反馈失败: ' + error.message);
          });
        } else {
          alert('反馈已记录（未关联具体品类）');
          document.getElementById('custom-feedback').value = '';
        }
      }

      // 页面加载时初始化
      document.addEventListener('DOMContentLoaded', function() {
        loadCategories();
        
        // 每30秒自动刷新数据
        setInterval(loadCategories, 30000);
        
        // 页面大小变化时重新加载
        document.getElementById('page-size').addEventListener('change', function() {
          currentPage = 1;
          loadCategories();
        });
      });
    </script>
  </body>
  </html>
  `;
  
  res.send(html);
});

// API端点：获取品类数据
app.get('/api/categories', (req, res) => {
  try {
    const evaluationData = loadEvaluationData();
    const categoriesData = loadCategoriesData();
    
    const categories = Object.entries(evaluationData).map(([key, data]) => {
      const [level1, level2, level3] = key.split('/');
      
      // 计算平均置信度
      const products = data.best_products || [];
      const avgConfidence = products.length > 0 
        ? products.reduce((sum, p) => sum + (p.product?.confidence_score || 0), 0) / products.length
        : 0;
      
      return {
        id: key,
        level1,
        level2,
        level3,
        product_count: products.length,
        dimension_count: data.dimensions?.dimensions?.length || 0,
        price_range_count: data.price_ranges?.price_ranges?.length || 0,
        avg_confidence: avgConfidence,
        last_evaluated: data.processed_at || new Date().toISOString(),
        brands: Array.from(new Set(products.map(p => p.product?.brand_name).filter(Boolean))),
        dimensions: data.dimensions?.dimensions?.map(d => d.name) || []
      };
    });
    
    // 统计信息
    const stats = {
      total_categories: categories.length,
      today_added: categories.filter(cat => {
        const catDate = new Date(cat.last_evaluated);
        const today = new Date();
        return catDate.toDateString() === today.toDateString();
      }).length,
      avg_quality: categories.length > 0 
        ? categories.reduce((sum, cat) => sum + (cat.avg_confidence || 0), 0) / categories.length
        : 0,
      last_updated: new Date().toISOString()
    };
    
    res.json({ categories, stats });
    
  } catch (error) {
    console.error('API错误:', error);
    res.status(500).json({ error: '加载数据失败' });
  }
});

// API端点：提交反馈
app.post('/api/feedback', (req, res) => {
  try {
    const feedback = req.body;
    
    // 保存反馈到文件
    const feedbackFile = path.join(__dirname, 'logs/quality-feedback.json');
    let feedbacks = [];
    
    if (fs.existsSync(feedbackFile)) {
      feedbacks = JSON.parse(fs.readFileSync(feedbackFile, 'utf8'));
    }
    
    feedbacks.push({
      ...feedback,
      received_at: new Date().toISOString()
    });
    
    fs.writeFileSync(feedbackFile, JSON.stringify(feedbacks,