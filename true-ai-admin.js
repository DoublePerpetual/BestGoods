/**
 * 真正的AI评选系统 - Admin监控界面
 * 端口: 3090
 * 功能: 展示处理进度、检查评测效果、查看已处理品类
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3090;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const BEST_ANSWERS_FILE = path.join(DATA_DIR, 'best-answers.json');
const AUTOMATION_STATUS_FILE = path.join(DATA_DIR, 'automation-status.json');
const LOG_FILE = path.join(__dirname, 'logs/true-ai-processing.log');

// 中间件
app.use(express.json());
app.use(express.static('public'));

// 读取数据文件
function readBestAnswers() {
  try {
    if (fs.existsSync(BEST_ANSWERS_FILE)) {
      const data = JSON.parse(fs.readFileSync(BEST_ANSWERS_FILE, 'utf8'));
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.error('读取最佳答案数据失败:', error);
  }
  return [];
}

function readAutomationStatus() {
  try {
    if (fs.existsSync(AUTOMATION_STATUS_FILE)) {
      return JSON.parse(fs.readFileSync(AUTOMATION_STATUS_FILE, 'utf8'));
    }
  } catch (error) {
    console.error('读取自动化状态失败:', error);
  }
  return {
    totalCategories: 0,
    completedCategories: 0,
    bestProductsCount: 0,
    lastUpdated: new Date().toISOString(),
    automationProgress: {
      startedAt: new Date().toISOString(),
      lastProcessed: null,
      processingSpeed: 0,
      estimatedCompletion: null
    },
    totalCost: 0
  };
}

function readRecentLogs(lines = 50) {
  try {
    if (fs.existsSync(LOG_FILE)) {
      const logContent = fs.readFileSync(LOG_FILE, 'utf8');
      const logLines = logContent.split('\n').filter(line => line.trim());
      return logLines.slice(-lines);
    }
  } catch (error) {
    console.error('读取日志失败:', error);
  }
  return ['日志文件不存在或无法读取'];
}

// 分析品类数据质量
function analyzeCategoryQuality(category) {
  const analysis = {
    item: category.item,
    level1: category.level1,
    level2: category.level2,
    totalProducts: category.bestProducts?.length || 0,
    priceRanges: category.priceRanges?.length || 0,
    dimensions: category.dimensions?.length || 0,
    qualityMetrics: {
      confidenceScores: [],
      selectionReasonLengths: [],
      realBrandCount: 0,
      genericBrandCount: 0
    }
  };

  if (category.bestProducts) {
    for (const product of category.bestProducts) {
      // 置信度统计
      if (product.confidenceScore) {
        analysis.qualityMetrics.confidenceScores.push(product.confidenceScore);
      }
      
      // 评选理由长度统计
      if (product.selectionReason) {
        analysis.qualityMetrics.selectionReasonLengths.push(product.selectionReason.length);
      }
      
      // 品牌真实性检查
      const brand = product.brand || '';
      if (brand.includes('品牌A') || brand.includes('品牌B') || brand.includes('品牌C') || 
          brand.includes('示例品牌') || brand.includes('知名品牌')) {
        analysis.qualityMetrics.genericBrandCount++;
      } else {
        analysis.qualityMetrics.realBrandCount++;
      }
    }
  }

  // 计算平均置信度
  if (analysis.qualityMetrics.confidenceScores.length > 0) {
    analysis.qualityMetrics.averageConfidence = analysis.qualityMetrics.confidenceScores.reduce((a, b) => a + b, 0) / analysis.qualityMetrics.confidenceScores.length;
  }

  // 计算平均评选理由长度
  if (analysis.qualityMetrics.selectionReasonLengths.length > 0) {
    analysis.qualityMetrics.averageReasonLength = analysis.qualityMetrics.selectionReasonLengths.reduce((a, b) => a + b, 0) / analysis.qualityMetrics.selectionReasonLengths.length;
  }

  // 质量评级
  analysis.qualityRating = '待评估';
  if (analysis.totalProducts > 0) {
    if (analysis.qualityMetrics.realBrandCount === analysis.totalProducts && 
        analysis.qualityMetrics.averageConfidence >= 85 && 
        analysis.qualityMetrics.averageReasonLength >= 200) {
      analysis.qualityRating = '优秀';
    } else if (analysis.qualityMetrics.realBrandCount >= analysis.totalProducts * 0.8) {
      analysis.qualityRating = '良好';
    } else {
      analysis.qualityRating = '需要检查';
    }
  }

  return analysis;
}

// Admin首页
app.get('/', (req, res) => {
  const bestAnswers = readBestAnswers();
  const status = readAutomationStatus();
  const recentLogs = readRecentLogs(30);
  
  // 分析所有品类质量
  const qualityAnalysis = bestAnswers.map(category => analyzeCategoryQuality(category));
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>真正的AI评选系统 · Admin监控</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    .quality-excellent { background-color: #dcfce7; border-color: #22c55e; }
    .quality-good { background-color: #fef3c7; border-color: #f59e0b; }
    .quality-check { background-color: #fee2e2; border-color: #ef4444; }
  </style>
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 md:px-6 py-8">
    <h1 class="text-3xl font-bold text-gray-900 mb-2">🤖 真正的AI评选系统 · Admin监控</h1>
    <p class="text-gray-600 mb-8">监控处理进度、检查评测效果、查看已处理品类</p>
    
    <!-- 总体统计 -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="p-6 bg-white rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-gray-900">${status.totalCategories.toLocaleString()}</div>
        <div class="text-gray-600">总品类数</div>
        <div class="text-sm text-gray-500 mt-1">24.5万+品类</div>
      </div>
      
      <div class="p-6 bg-white rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-gray-900">${status.completedCategories}</div>
        <div class="text-gray-600">已处理品类</div>
        <div class="text-sm text-gray-500 mt-1">${status.totalCategories > 0 ? ((status.completedCategories / status.totalCategories) * 100).toFixed(2) + '%' : '0%'}</div>
      </div>
      
      <div class="p-6 bg-white rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-gray-900">${bestAnswers.length}</div>
        <div class="text-gray-600">最佳商品评选</div>
        <div class="text-sm text-gray-500 mt-1">已完成的品类</div>
      </div>
      
      <div class="p-6 bg-white rounded-lg border border-gray-200">
        <div class="text-2xl font-bold text-gray-900">¥${status.totalCost?.toFixed(2) || '0.00'}</div>
        <div class="text-gray-600">总成本</div>
        <div class="text-sm text-gray-500 mt-1">API调用成本</div>
      </div>
    </div>
    
    <!-- 处理进度 -->
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">📈 处理进度</h2>
      
      <div class="mb-4">
        <div class="flex justify-between mb-1">
          <span class="text-sm font-medium text-gray-700">处理进度</span>
          <span class="text-sm font-medium text-gray-700">${status.completedCategories}/${status.totalCategories} (${status.totalCategories > 0 ? ((status.completedCategories / status.totalCategories) * 100).toFixed(2) + '%' : '0%'})</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
          <div class="bg-blue-600 h-2.5 rounded-full" style="width: ${status.totalCategories > 0 ? (status.completedCategories / status.totalCategories) * 100 : 0}%"></div>
        </div>
      </div>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <i class="fa-solid fa-rocket text-blue-500"></i>
            <span class="font-medium">开始时间:</span>
            <span class="text-gray-600">${new Date(status.automationProgress.startedAt).toLocaleString('zh-CN')}</span>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <i class="fa-solid fa-clock text-green-500"></i>
            <span class="font-medium">处理速度:</span>
            <span class="text-gray-600">${status.automationProgress.processingSpeed || 0} 品类/小时</span>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-1">
            <i class="fa-solid fa-check-circle text-purple-500"></i>
            <span class="font-medium">最后更新:</span>
            <span class="text-gray-600">${new Date(status.lastUpdated).toLocaleString('zh-CN')}</span>
          </div>
          <div class="flex items-center gap-2 mb-1">
            <i class="fa-solid fa-calendar-check text-orange-500"></i>
            <span class="font-medium">预计完成:</span>
            <span class="text-gray-600">${status.automationProgress.estimatedCompletion ? new Date(status.automationProgress.estimatedCompletion).toLocaleString('zh-CN') : '计算中...'}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 已处理品类列表 -->
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">📋 已处理品类列表 (${bestAnswers.length}个)</h2>
      
      ${bestAnswers.length === 0 ? 
        '<div class="text-center py-8 text-gray-500">暂无已处理的品类</div>' : 
        `<div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead>
              <tr class="bg-gray-50">
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">品类</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">价格区间</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">评价维度</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">最佳商品数</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">质量评级</th>
                <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">操作</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              ${bestAnswers.map((category, index) => {
                const analysis = qualityAnalysis[index];
                const qualityClass = analysis.qualityRating === '优秀' ? 'quality-excellent' : 
                                   analysis.qualityRating === '良好' ? 'quality-good' : 'quality-check';
                
                return `
                <tr class="hover:bg-gray-50">
                  <td class="px-4 py-3">
                    <div class="font-medium text-gray-900">${category.item}</div>
                    <div class="text-xs text-gray-500">${category.level1} > ${category.level2}</div>
                  </td>
                  <td class="px-4 py-3 text-sm text-gray-900">${category.priceRanges?.length || 0}个区间</td>
                  <td class="px-4 py-3 text-sm text-gray-900">${category.dimensions?.length || 0}个维度</td>
                  <td class="px-4 py-3 text-sm text-gray-900">${category.bestProducts?.length || 0}个商品</td>
                  <td class="px-4 py-3">
                    <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${qualityClass}">
                      ${analysis.qualityRating}
                      ${analysis.qualityRating === '优秀' ? '✅' : analysis.qualityRating === '良好' ? '⚠️' : '❌'}
                    </span>
                  </td>
                  <td class="px-4 py-3 text-sm font-medium">
                    <button onclick="viewCategoryDetails('${index}')" class="text-blue-600 hover:text-blue-900 mr-3">查看详情</button>
                    <button onclick="checkQuality('${index}')" class="text-purple-600 hover:text-purple-900">质量检查</button>
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>`
      }
    </div>
    
    <!-- 实时日志 -->
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">📝 实时日志</h2>
      <div class="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto font-mono text-sm">
        ${recentLogs.map(log => `<div class="text-gray-700 mb-1">${log}</div>`).join('')}
      </div>
    </div>
    
    <!-- 系统信息 -->
    <div class="p-6 bg-white rounded-lg border border-gray-200">
      <h2 class="text-xl font-bold text-gray-800 mb-4">⚙️ 系统信息</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div>
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-link text-blue-500"></i>
            <span class="font-medium">前端界面:</span>
            <a href="http://localhost:3076/" target="_blank" class="text-blue-600 hover:underline">http://localhost:3076/</a>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-database text-green-500"></i>
            <span class="font-medium">数据文件:</span>
            <span class="text-gray-600">data/best-answers.json</span>
          </div>
        </div>
        <div>
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-file-alt text-purple-500"></i>
            <span class="font-medium">日志文件:</span>
            <span class="text-gray-600">logs/true-ai-processing.log</span>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <i class="fa-solid fa-bolt text-orange-500"></i>
            <span class="font-medium">当前状态:</span>
            <span class="text-gray-600">${status.completedCategories < status.totalCategories ? '处理中...' : '已完成'}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- 模态框 -->
  <div id="modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full hidden z-50">
    <div class="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 id="modal-title" class="text-xl font-bold text-gray-800">品类详情</h3>
        <button onclick="closeModal()" class="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
      </div>
      <div id="modal-content" class="text-gray-700"></div>
    </div>
  </div>
  
  <script>
    // 存储品类数据
    const categories = ${JSON.stringify(bestAnswers)};
    const qualityAnalysis = ${JSON.stringify(qualityAnalysis)};
    
    function viewCategoryDetails(index) {
      const category = categories[index];
      const analysis = qualityAnalysis[index];
      
      let content = \`
        <div class="mb-6">
          <h4 class="text-lg font-bold text-gray-900 mb-2">\${category.level1} > \${category.level2} > \${category.item}</h4>
          <p class="text-gray-600 mb-4">\${category.subtitle || ''}</p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div class="p-4 bg-blue-50 rounded-lg">
            <h5 class="font-bold text-blue-800 mb-2">📊 质量分析</h5>
            <ul class="text-sm">
              <li class="mb-1">真实品牌: \${analysis.qualityMetrics.realBrandCount} / \${analysis.totalProducts}</li>
              <li class="mb-1">平均置信度: \${analysis.qualityMetrics.averageConfidence ? analysis.qualityMetrics.averageConfidence.toFixed(1) + '%' : 'N/A'}</li>
              <li class="mb-1">平均评选理由长度: \${analysis.qualityMetrics.averageReasonLength ? analysis.qualityMetrics.averageReasonLength.toFixed(0) + '字' : 'N/A'}</li>
              <li>质量评级: <span class="font-bold \${analysis.qualityRating === '优秀' ? 'text-green-600' : analysis.qualityRating === '良好' ? 'text-yellow-600' : 'text-red-600'}">\${analysis.qualityRating}</span></li>
            </ul>
          </div>
          
          <div class="p-4 bg-green-50 rounded-lg">
            <h5 class="font-bold text-green-800 mb-2">📈 处理统计</h5>
            <ul class="text-sm">
              <li class="mb-1">价格区间: \${category.priceRanges?.length || 0}个</li>
              <li class="mb-1">评价维度: \${category.dimensions?.length || 0}个</li>
              <li class="mb-1">最佳商品数: \${category.bestProducts?.length || 0}个</li>
              <li>处理时间: \${new Date(category.evaluationDate).toLocaleString('zh-CN')}</li>
            </ul>
          </div>
        </div>
        
        <div class="mb-6">
          <h5 class="font-bold text-gray-800 mb-2">💰 价格区间</h5>
          <div class="grid grid-cols-1 md:grid-cols-\${Math.min(4, category.priceRanges?.length || 1)} gap-3">
            \${(category.priceRanges || []).map(range => \`
              <div class="p-3 bg-gray-50 rounded-lg border">
                <div class="font-medium text-gray-900">\${range.level}</div>
                <div class="text-sm text-gray-600">¥\${range.min_price} - ¥\${range.max_price}</div>
                <div class="text-xs text-gray-500 mt-1">\${range.description}</div>
              </div>
            \`).join('')}
          </div>
        </div>
        
        <div class="mb-6">
          <h5 class="font-bold text-gray-800 mb-2">📝 最佳商品示例 (前3个)</h5>
          <div class="space-y-4">
            \${(category.bestProducts || []).slice(0, 3).map(product => \`
              <div class="p-4 bg-white rounded-lg border border-gray-200">
                <div class="flex justify-between items-start mb-2">
                  <div>
                    <div class="font-bold text-gray-900">\${product.productName}</div>
                    <div class="text-sm text-gray-600">\${product.brand} - ¥\${product.price}</div>
                  </div>
                  <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    置信度 \${product.confidenceScore}%
                  </span>
                </div>
                <div class="text-sm text-gray-700 mb-2">\${product.dimension} (\${product.priceRange})</div>
                <div class="text-xs text-gray-500 line-clamp-3">\${product.selectionReason.substring(0, 200)}...</div>
              </div>
            \`).join('')}
          </div>
        </div>
        
        <div class="text-center">
          <a href="http://localhost:3076/category/\${encodeURIComponent(category.level1)}/\${encodeURIComponent(category.level2)}/\${encodeURIComponent(category.item)}" 
             target="_blank" class="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
            <i class="fa-solid fa-external-link-alt mr-2"></i>在前端查看完整详情
          </a>
        </div>
      \`;
      
      document.getElementById('modal-title').textContent = \`\${category.item} · 详情\`;
      document.getElementById('modal-content').innerHTML = content;
      document.getElementById('modal').classList.remove('hidden');
    }
    
    function checkQuality(index) {
      const category = categories[index];
      const analysis = qualityAnalysis[index];
      
      let issues = [];
      
      // 检查问题
      if (analysis.qualityMetrics.genericBrandCount > 0) {
        issues.push(\`发现 \${analysis.qualityMetrics.genericBrandCount} 个模板品牌，应为真实品牌\`);
      }
      
      if (analysis.qualityMetrics.averageConfidence < 85) {
        issues.push(\`平均置信度 \${analysis.qualityMetrics.averageConfidence.toFixed(1)}% 低于85%标准\`);
      }
      
      if (analysis.qualityMetrics.averageReasonLength < 200) {
        issues.push(\`平均评选理由长度 \${analysis.qualityMetrics.averageReasonLength.toFixed(0)}字 低于200字标准\`);
      }
      
      let content = \`
        <div class="mb-6">
          <h4 class="text-lg font-bold text-gray-900 mb-2">\${category.item} · 质量检查报告</h4>
        </div>
        
        <div class="mb-6 p-4 \${issues.length === 0 ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'} rounded-lg">
          <h5 class="font-bold \${issues.length === 0 ? 'text-green-800' : 'text-yellow-800'} mb-2">
            \${issues.length === 0 ? '✅ 通过所有质量检查' : '⚠️ 发现需要检查的问题'}
          </h5>
          \${issues.length === 0 ? 
            '<p class="text-green-700">所有质量指标均达到或超过标准要求。</p>' :
            \`<ul class="list-disc pl-5 text-yellow-700">\${issues.map(issue => '<li class="mb-1">' + issue + '</li>').join('')}</ul>\`
          }
        </div>
        
        <div class="mb-6">
          <h5 class="font-bold text-gray-800 mb-2">📊 质量指标</h5>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="p-3 \${analysis.qualityMetrics.realBrandCount === analysis.totalProducts ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg">
              <div class="font-medium \${analysis.qualityMetrics.realBrandCount === analysis.totalProducts ? 'text-green-800' : 'text-red-800'}">品牌真实性</div>
              <div class="text-sm \${analysis.qualityMetrics.realBrandCount === analysis.totalProducts ? 'text-green-700' : 'text-red-700'}}">
                \${analysis.qualityMetrics.realBrandCount} / \${analysis.totalProducts} 真实品牌
                \${analysis.qualityMetrics.genericBrandCount > 0 ? ' (' + analysis.qualityMetrics.genericBrandCount + ' 模板品牌)' : ''}
              </div>
            </div>
            
            <div class="p-3 \${analysis.qualityMetrics.averageConfidence >= 85 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg">
              <div class="font-medium \${analysis.qualityMetrics.averageConfidence >= 85 ? 'text-green-800' : 'text-red-800'}">平均置信度</div>
              <div class="text-sm \${analysis.qualityMetrics.averageConfidence >= 85 ? 'text-green-700' : 'text-red-700'}}">
                \${analysis.qualityMetrics.averageConfidence ? analysis.qualityMetrics.averageConfidence.toFixed(1) + '%' : 'N/A'}
                \${analysis.qualityMetrics.averageConfidence < 85 ? ' (低于85%标准)' : ''}
              </div>
            </div>
            
            <div class="p-3 \${analysis.qualityMetrics.averageReasonLength >= 200 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg">
              <div class="font-medium \${analysis.qualityMetrics.averageReasonLength >= 200 ? 'text-green-800' : 'text-red-800'}">评选理由长度</div>
              <div class="text-sm \${analysis.qualityMetrics.averageReasonLength >= 200 ? 'text-green-700' : 'text-red-700'}}">
                \${analysis.qualityMetrics.averageReasonLength ? analysis.qualityMetrics.averageReasonLength.toFixed(0) + '字' : 'N/A'}
                \${analysis.qualityMetrics.averageReasonLength < 200 ? ' (低于200字标准)' : ''}
              </div>
            </div>
            
            <div class="p-3 \${analysis.totalProducts > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} border rounded-lg">
              <div class="font-medium \${analysis.totalProducts > 0 ? 'text-green-800' : 'text-red-800'}">最佳商品数</div>
              <div class="text-sm \${analysis.totalProducts > 0 ? 'text-green-700' : 'text-red-700'}}">\${analysis.totalProducts} 个商品</div>
            </div>
          </div>
        </div>
      \`;
      
      document.getElementById('modal-title').textContent = \`\${category.item} · 质量检查\`;
      document.getElementById('modal-content').innerHTML = content;
      document.getElementById('modal').classList.remove('hidden');
    }
    
    function closeModal() {
      document.getElementById('modal').classList.add('hidden');
    }
    
    // 自动刷新页面（每30秒）
    setTimeout(() => {
      window.location.reload();
    }, 30000);
  </script>
</body>
</html>`;
  
  res.send(html);
});

// API端点：获取品类详情
app.get('/api/category/:index', (req, res) => {
  const index = parseInt(req.params.index);
  const bestAnswers = readBestAnswers();
  
  if (index >= 0 && index < bestAnswers.length) {
    res.json({
      success: true,
      category: bestAnswers[index],
      quality: analyzeCategoryQuality(bestAnswers[index])
    });
  } else {
    res.json({
      success: false,
      message: '品类索引无效'
    });
  }
});

// API端点：获取系统状态
app.get('/api/status', (req, res) => {
  res.json(readAutomationStatus());
});

// API端点：获取日志
app.get('/api/logs', (req, res) => {
  const lines = parseInt(req.query.lines) || 50;
  res.json({
    logs: readRecentLogs(lines)
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 真正的AI评选系统Admin界面启动: http://localhost:${PORT}`);
  console.log(`📊 监控处理进度、检查评测效果`);
  console.log(`⏰ 自动刷新: 每30秒更新一次`);
});

module.exports = app;