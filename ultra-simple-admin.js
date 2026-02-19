/**
 * 超简单品类目录管理页面
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
  
  let html = '<!DOCTYPE html><html lang="zh-CN"><head>';
  html += '<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">';
  html += '<title>最佳商品 - 品类目录管理</title>';
  html += '<link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">';
  html += '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">';
  html += '<style>.category-item:hover { background-color: #f9fafb; }</style>';
  html += '</head><body class="bg-gray-50 min-h-screen">';
  
  html += '<div class="container mx-auto px-4 py-8">';
  html += '<header class="mb-8">';
  html += '<h1 class="text-3xl font-bold text-gray-800">最佳商品 - 品类目录管理</h1>';
  html += '<p class="text-gray-600 mt-2">实时查看已评测品类，检查评选质量</p>';
  
  html += '<div class="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">';
  html += '<div class="bg-white rounded-lg shadow p-4">';
  html += '<h3 class="text-lg font-semibold text-gray-700">已评测品类</h3>';
  html += '<p class="text-2xl font-bold text-blue-600 mt-2">' + categories.length + '</p>';
  html += '<p class="text-sm text-gray-500">总品类: 245,317</p>';
  html += '</div>';
  
  html += '<div class="bg-white rounded-lg shadow p-4">';
  html += '<h3 class="text-lg font-semibold text-gray-700">今日新增</h3>';
  html += '<p class="text-2xl font-bold text-green-600 mt-2" id="today-added">计算中...</p>';
  html += '<p class="text-sm text-gray-500">24小时内新增</p>';
  html += '</div>';
  
  html += '<div class="bg-white rounded-lg shadow p-4">';
  html += '<h3 class="text-lg font-semibold text-gray-700">最后更新</h3>';
  html += '<p class="text-xl font-bold text-orange-600 mt-2">刚刚</p>';
  html += '<p class="text-sm text-gray-500">数据实时更新</p>';
  html += '</div>';
  html += '</div>';
  html += '</header>';

  // 搜索框
  html += '<div class="bg-white rounded-lg shadow mb-6 p-6">';
  html += '<div class="relative">';
  html += '<input type="text" id="search-input" placeholder="搜索品类名称..." class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500">';
  html += '<i class="fas fa-search absolute right-3 top-3 text-gray-400"></i>';
  html += '</div>';
  html += '</div>';

  // 品类表格
  html += '<div class="bg-white rounded-lg shadow overflow-hidden">';
  html += '<div class="px-6 py-4 border-b flex justify-between items-center">';
  html += '<h2 class="text-xl font-semibold text-gray-800">已评测品类列表</h2>';
  html += '<div class="text-sm text-gray-500">共 ' + categories.length + ' 个品类</div>';
  html += '</div>';
  
  html += '<div class="overflow-x-auto">';
  html += '<table class="min-w-full divide-y divide-gray-200">';
  html += '<thead class="bg-gray-50"><tr>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品类信息</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评测状态</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">访问链接</th>';
  html += '<th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>';
  html += '</tr></thead>';
  html += '<tbody id="categories-table" class="bg-white divide-y divide-gray-200">';
  
  // 生成表格行
  categories.slice(0, 100).forEach(key => {
    const data = evaluationData[key];
    const level1 = data.level1 || '';
    const level2 = data.level2 || '';
    const level3 = data.item || '';
    
    const products = data.bestProducts || [];
    const productCount = products.reduce((total, priceRange) => total + (priceRange.dimensions?.length || 0), 0);
    const processedDate = data.createdAt ? new Date(data.createdAt).toLocaleDateString('zh-CN') : '未知';
    
    html += '<tr class="category-item">';
    html += '<td class="px-6 py-4">';
    html += '<div class="flex items-center">';
    html += '<div class="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-lg flex items-center justify-center">';
    html += '<i class="fas fa-box text-blue-600"></i>';
    html += '</div>';
    html += '<div class="ml-4">';
    html += '<div class="text-sm font-medium text-gray-900">' + level3 + '</div>';
    html += '<div class="text-sm text-gray-500">' + level1 + ' > ' + level2 + '</div>';
    html += '<div class="text-xs text-gray-400 mt-1">';
    html += '<i class="fas fa-clock mr-1"></i>' + processedDate;
    html += '</div>';
    html += '</div>';
    html += '</div>';
    html += '</td>';
    
    html += '<td class="px-6 py-4">';
    html += '<div class="flex flex-col space-y-1">';
    html += '<span class="inline-flex items-center">';
    html += '<i class="fas fa-tags text-gray-400 mr-2"></i>';
    html += '<span class="text-sm">' + productCount + ' 个商品</span>';
    html += '</span>';
    html += '<span class="inline-flex items-center">';
    html += '<i class="fas fa-layer-group text-gray-400 mr-2"></i>';
    html += '<span class="text-sm">' + (products.length || 0) + ' 个价格区间</span>';
    html += '</span>';
    html += '</div>';
    html += '</td>';
    
    html += '<td class="px-6 py-4">';
    html += '<div class="space-y-2">';
    html += '<a href="http://localhost:3077/category/' + encodeURIComponent(level1) + '/' + encodeURIComponent(level2) + '/' + encodeURIComponent(level3) + '" target="_blank" class="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200">';
    html += '<i class="fas fa-external-link-alt mr-2"></i>详情页';
    html += '</a>';
    html += '<a href="http://localhost:3076?search=' + encodeURIComponent(level3) + '" target="_blank" class="inline-flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm hover:bg-green-200 ml-2">';
    html += '<i class="fas fa-search mr-2"></i>搜索';
    html += '</a>';
    html += '</div>';
    html += '</td>';
    
    html += '<td class="px-6 py-4">';
    html += '<div class="flex space-x-2">';
    html += '<button onclick="viewCategory(\'' + level1 + '\', \'' + level2 + '\', \'' + level3 + '\')" class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">';
    html += '<i class="fas fa-eye mr-1"></i>查看';
    html += '</button>';
    html += '<button onclick="provideFeedback(\'' + level3 + '\')" class="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200">';
    html += '<i class="fas fa-comment mr-1"></i>反馈';
    html += '</button>';
    html += '</div>';
    html += '</td>';
    html += '</tr>';
  });
  
  html += '</tbody></table></div>';
  
  html += '<div class="px-6 py-4 border-t text-center text-gray-500">';
  html += '<p>显示前 100 个品类，共 ' + categories.length + ' 个</p>';
  html += '<p class="text-sm mt-1">数据每30秒自动更新</p>';
  html += '</div>';
  html += '</div>';

  // 反馈面板
  html += '<div class="mt-8 bg-white rounded-lg shadow p-6">';
  html += '<h2 class="text-xl font-semibold text-gray-800 mb-4">质量反馈</h2>';
  html += '<div>';
  html += '<textarea id="feedback-text" rows="4" class="w-full border rounded-lg p-3 mb-3" placeholder="请输入质量反馈..."></textarea>';
  html += '<div class="flex justify-between">';
  html += '<div><label class="flex items-center"><input type="checkbox" id="needs-rework" class="mr-2"><span class="text-sm text-gray-700">需要重新评测</span></label></div>';
  html += '<button onclick="submitFeedback()" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">提交反馈</button>';
  html += '</div>';
  html += '</div>';
  html += '</div>';

  html += '<footer class="mt-12 pt-8 border-t text-center text-gray-500 text-sm">';
  html += '<p>最佳商品百科全书 - 品类目录管理系统 v1.0.0</p>';
  html += '<p class="mt-1">访问链接: http://localhost:' + PORT + '</p>';
  html += '</footer>';
  html += '</div>';

  // JavaScript
  html += '<script>';
  html += 'function calculateTodayAdded() {';
  html += '  const today = new Date().toDateString();';
  html += '  const rows = document.querySelectorAll("#categories-table tr");';
  html += '  let todayCount = 0;';
  html += '  rows.forEach(row => {';
  html += '    const dateText = row.querySelector(".text-xs.text-gray-400")?.textContent;';
  html += '    if (dateText && dateText.includes(today.slice(0, 4))) todayCount++;';
  html += '  });';
  html += '  document.getElementById("today-added").textContent = todayCount;';
  html += '}';
  
  html += 'function viewCategory(level1, level2, level3) {';
  html += '  const url = "http://localhost:3077/category/" + encodeURIComponent(level1) + "/" + encodeURIComponent(level2) + "/" + encodeURIComponent(level3);';
  html += '  window.open(url, "_blank");';
  html += '}';
  
  html += 'function provideFeedback(categoryName) {';
  html += '  document.getElementById("feedback-text").value = "关于【" + categoryName + "】的反馈：\\n\\n";';
  html += '  document.getElementById("feedback-text").focus();';
  html += '}';
  
  html += 'function submitFeedback() {';
  html += '  const feedback = document.getElementById("feedback-text").value;';
  html += '  const needsRework = document.getElementById("needs-rework").checked;';
  html += '  if (!feedback.trim()) { alert("请输入反馈内容"); return; }';
  html += '  const feedbacks = JSON.parse(localStorage.getItem("category-feedbacks") || "[]");';
  html += '  feedbacks.push({ feedback: feedback, needs_rework: needsRework, timestamp: new Date().toISOString() });';
  html += '  localStorage.setItem("category-feedbacks", JSON.stringify(feedbacks));';
  html += '  alert("反馈已保存到本地！");';
  html += '  document.getElementById("feedback-text").value = "";';
  html += '  document.getElementById("needs-rework").checked = false;';
  html += '}';
  
  html += 'document.getElementById("search-input").addEventListener("input", function() {';
  html += '  const searchText = this.value.toLowerCase();';
  html += '  const rows = document.querySelectorAll("#categories-table tr");';
  html += '  rows.forEach(row => {';
  html += '    const categoryName = row.querySelector(".text-sm.font-medium")?.textContent.toLowerCase() || "";';
  html += '    const categoryPath = row.querySelector(".text-sm.text-gray-500")?.textContent.toLowerCase() || "";';
  html += '    if (categoryName.includes(searchText) || categoryPath.includes(searchText)) {';
  html += '      row.style.display = "";';
  html += '    } else {';
  html += '      row.style.display = "none";';
  html += '    }';
  html += '  });';
  html += '});';
  
  html += 'document.addEventListener("DOMContentLoaded", function() {';
  html += '  calculateTodayAdded();';
  html += '  setInterval(() => { window.location.reload(); }, 30000);';
  html += '});';
  html += '</script>';
  
  html += '</body></html>';
  
  res.send(html);
});

// 启动服务器
app.listen(PORT, () => {
  console.log('品类目录管理页面运行在 http://localhost:' + PORT);
  console.log('已评测品类: ' + Object.keys(loadEvaluationData()).length);
});