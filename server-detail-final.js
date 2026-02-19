const express = require('express');
const app = express();
const PORT = 3077;

// 品类详情页
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 全球最佳商品百科全书</title>
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
    
    <!-- 商品标题和当前位置 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item}</h1>
      <div class="text-gray-600">
        <span class="font-medium">当前位置：</span>
        <a href="http://localhost:3076/?level1=${encodeURIComponent(level1)}" class="nav-link">${level1}</a>
        <i class="fa-solid fa-chevron-right text-xs mx-1"></i>
        <a href="http://localhost:3076/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="nav-link">${level2}</a>
        <i class="fa-solid fa-chevron-right text-xs mx-1"></i>
        <span class="text-gray-900">${item}</span>
      </div>
    </div>
    
    <!-- 最佳评选结果标题 - 放在大边框之上 -->
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-gray-900">最佳评选结果</h2>
      <p class="text-gray-600 mt-1">基于3个价格区间和3个评测维度的综合评选</p>
    </div>
    
    <!-- 最佳评选结果表格 - 简洁美观的边框 -->
    <div class="mb-8 elegant-border p-6 bg-white">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间 / 评测维度</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">性价比最高</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最耐用</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最舒适</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">经济型<br><span class="text-xs text-gray-500">¥5-¥15</span></td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">吉列蓝II剃须刀</div>
                <div class="text-xs text-gray-500">吉列 (宝洁公司旗下品牌)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥8.5</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">1,600+</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">舒适X3经济装</div>
                <div class="text-xs text-gray-500">舒适 (Edgewell Personal Care)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥12.0</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">1,200+</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">飞利浦基础款</div>
                <div class="text-xs text-gray-500">飞利浦 (荷兰皇家飞利浦)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥10.5</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">760+</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">标准型<br><span class="text-xs text-gray-500">¥16-¥30</span></td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">吉列锋隐5剃须刀</div>
                <div class="text-xs text-gray-500">吉列 (宝洁公司旗下品牌)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥25.0</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">23,400+</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">博朗3系电动剃须刀</div>
                <div class="text-xs text-gray-500">博朗 (德国宝洁旗下)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥28.0</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">15,600+</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">舒适水次元5</div>
                <div class="text-xs text-gray-500">舒适 (Edgewell Personal Care)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥22.0</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">18,200+</span>
                </div>
              </td>
            </tr>
            <tr>
              <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">高端型<br><span class="text-xs text-gray-500">¥31-¥50</span></td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">吉列锋隐致护</div>
                <div class="text-xs text-gray-500">吉列 (宝洁公司旗下品牌)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥45.0</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">8,900+</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">博朗7系电动剃须刀</div>
                <div class="text-xs text-gray-500">博朗 (德国宝洁旗下)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥65.0</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">6,500+</span>
                </div>
              </td>
              <td class="px-4 py-3">
                <div class="text-sm font-medium text-gray-900">飞利浦高端系列</div>
                <div class="text-xs text-gray-500">飞利浦 (荷兰皇家飞利浦)</div>
                <div class="text-sm font-bold text-gray-900 mt-1">¥55.0</div>
                <div class="flex items-center mt-1">
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <i class="fa-solid fa-star text-yellow-500 text-xs"></i>
                  <span class="text-xs text-gray-500 ml-1">5,200+</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <!-- 详细评选分析 -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-6">详细评选分析</h2>
      
      <!-- 经济型 -->
      <div class="mb-8">
        <h3 class="text-lg font-bold text-gray-900 mb-4">经济型 <span class="text-sm font-normal text-gray-500">¥5-¥15</span></h3>
        <p class="text-gray-600 mb-4">适合预算有限、临时使用或学生群体</p>
        <div class="space-y-4">
          <!-- 产品1 -->
          <div class="p-5 bg-white rounded-lg border border-gray-200">
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded">性价比最高</span>
                  <span class="text-lg font-bold text-gray-900">吉列蓝II剃须刀</span>
                </div>
                <div class="text-sm text-gray-600 mb-2">吉列 (宝洁公司旗下品牌)</div>
                <div class="flex items-center gap-4">
                  <div class="text-xl font-bold text-gray-900">¥8.5</div>
                  <div class="flex items-center">
                    <i class="fa-solid fa-star text-yellow-500"></i>
                    <i class="fa-solid fa-star text-yellow-500"></i>
                    <i class="fa-solid fa-star text-yellow-500"></i>
                    <i class="fa-solid fa-star text-yellow-500"></i>
                    <span class="text-sm text-gray-500 ml-1">1,600+</span>
                  </div>
                </div>
              </div>
              <div class="flex gap-2">
                <button onclick="vote('吉列蓝II剃须刀', 'like')" 
                        class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
                  <i class="fa-solid fa-thumbs-up"></i>
                  <span>认可</span>
                  <span class="vote-count-like-吉列蓝II剃须刀">42</span>
                </button>
                <button onclick="vote('吉列蓝II剃须刀', 'dislike')" 
                        class="px-3 py-1.5 rounded-lg border text-sm font-medium flex items-center gap-1.5 bg-gray-100 text-gray-700 border-gray-200">
                  <i class="fa-solid fa-thumbs-down"></i>
                  <span>不认可</span>
                  <span class="vote-count-dislike-吉列蓝II剃须刀">8</span>
                </button>
              </div>
            </div>
            <div class="text-sm text-gray-700 leading-relaxed">吉列为宝洁旗下百年品牌，全球市场份额65%。2层刀片采用瑞典精钢，润滑条含维生素E。在¥5-15区间内，综合价格、性能、品牌口碑加权评分最高。</div>
          </div>
          
          <!-- 产品2 -->
          <div class="p-5 bg-white rounded-lg border border-gray-200">
            <div class="flex justify-between items-start mb-3">
              <div>
                <div class="flex items-center gap-2 mb-1">
                  <span class="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded">最耐用</span>
                  <span class="text-lg font-bold text-gray-900">舒适X3经济装</span>
                </div>
                <div class="text-sm text-gray-600 mb-2">舒适 (Edgewell Personal Care)</div>
                <div class="flex items-center gap-4">
                  <div class="text-xl font-bold text-gray-900">¥12.0</div>
                  <div class="flex items