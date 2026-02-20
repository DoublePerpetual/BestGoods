// ==========================================
// 全球最佳商品百科全书 · 最终完整版
// 端口：3040
// 功能：24万品类 + 价格区间 + 评测维度 + 最佳商品推荐
// ==========================================

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3040;

// 加载数据库
console.log('🚀 启动全球最佳商品百科全书系统...');
console.log('📦 加载数据库...');

// 价格区间数据库
const PRICE_INTERVALS_DB = require('./data/price-intervals-db.js').PRICE_INTERVALS_DB;
console.log(`✅ 价格区间数据库加载完成: ${Object.keys(PRICE_INTERVALS_DB).length} 个一级分类`);

// 评测维度数据库
const EVALUATION_DIMENSIONS_DB = require('./data/evaluation-dimensions-db.js');
console.log(`✅ 评测维度数据库加载完成`);

// 最佳商品数据库
const BEST_PRODUCTS_DB = require('./data/best-products-db.js').BEST_PRODUCTS_DB;
console.log(`✅ 最佳商品数据库加载完成: ${BEST_PRODUCTS_DB.length} 个商品推荐`);

// 加载24万品类数据
let categoriesData = [];
try {
  const rawData = fs.readFileSync(path.join(__dirname, 'data', 'global-categories-expanded.json'), 'utf8');
  categoriesData = JSON.parse(rawData);
  console.log(`✅ 品类数据加载成功: ${categoriesData.length.toLocaleString()} 个品类`);
} catch (error) {
  console.error('❌ 品类数据加载失败:', error.message);
}

// 统计信息
const STATS = {
  totalCategories: categoriesData.length,
  totalLevel1: new Set(categoriesData.map(item => item.level1)).size,
  totalLevel2: new Set(categoriesData.map(item => item.level2)).size,
  totalLevel3: categoriesData.length,
  
  priceIntervals: {
    totalLevel1: Object.keys(PRICE_INTERVALS_DB).length,
    totalCategories: Object.values(PRICE_INTERVALS_DB).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
    totalIntervals: Object.values(PRICE_INTERVALS_DB).reduce((sum1, cat) => 
      sum1 + Object.values(cat).reduce((sum2, intervals) => sum2 + intervals.length, 0), 0)
  },
  
  evaluationDimensions: {
    totalLevel1: Object.keys(EVALUATION_DIMENSIONS_DB).length,
    totalCategories: Object.values(EVALUATION_DIMENSIONS_DB).reduce((sum, cat) => sum + Object.keys(cat).length, 0)
  },
  
  bestProducts: {
    totalProducts: BEST_PRODUCTS_DB.length
  }
};

// 中间件
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 首页
app.get('/', (req, res) => {
  res.send(`
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>全球最佳商品百科全书 · 最终完整版</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
      }
      .container {
        max-width: 1000px;
        width: 100%;
        background: rgba(255, 255, 255, 0.95);
        border-radius: 25px;
        padding: 50px;
        box-shadow: 0 30px 60px rgba(0,0,0,0.3);
        color: #333;
        text-align: center;
      }
      h1 {
        font-size: 3.5rem;
        margin-bottom: 20px;
        color: #1a2980;
        font-weight: 900;
      }
      .subtitle {
        font-size: 1.5rem;
        color: #4a5568;
        margin-bottom: 40px;
        line-height: 1.6;
      }
      .stats-container {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 25px;
        margin: 40px 0;
      }
      .stat-box {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.2);
      }
      .stat-box.big {
        grid-column: span 2;
        background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
      }
      .stat-number {
        font-size: 3.5rem;
        font-weight: 900;
        margin-bottom: 10px;
      }
      .stat-label {
        font-size: 1.2rem;
        opacity: 0.9;
      }
      .features {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 20px;
        margin: 40px 0;
      }
      .feature {
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        border: 2px solid #e2e8f0;
        transition: all 0.3s ease;
      }
      .feature:hover {
        transform: translateY(-10px);
        border-color: #667eea;
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      }
      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 15px;
      }
      .feature h3 {
        color: #2d3748;
        margin-bottom: 10px;
        font-size: 1.3rem;
      }
      .feature p {
        color: #718096;
        font-size: 0.95rem;
        line-height: 1.5;
      }
      .api-links {
        margin: 40px 0;
        padding: 30px;
        background: #f7fafc;
        border-radius: 15px;
      }
      .api-links h3 {
        color: #2d3748;
        margin-bottom: 20px;
        font-size: 1.5rem;
      }
      .api-buttons {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
      }
      .api-btn {
        background: #4299e1;
        color: white;
        padding: 12px 25px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .api-btn:hover {
        background: #3182ce;
        transform: scale(1.05);
      }
      .footer {
        margin-top: 40px;
        padding-top: 20px;
        border-top: 2px solid #e2e8f0;
        color: #718096;
      }
      @media (max-width: 768px) {
        .container { padding: 30px; }
        h1 { font-size: 2.5rem; }
        .stats-container { grid-template-columns: 1fr; }
        .stat-box.big { grid-column: span 1; }
        .features { grid-template-columns: 1fr; }
        .api-buttons { flex-direction: column; align-items: center; }
        .api-btn { width: 100%; max-width: 300px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <h1>🌍 全球最佳商品百科全书</h1>
      <div class="subtitle">
        最终完整版 · 24万品类智能分析系统<br>
        价格区间 + 评测维度 + 最佳商品推荐
      </div>
      
      <div class="stats-container">
        <div class="stat-box big">
          <div class="stat-number">${STATS.totalCategories.toLocaleString()}</div>
          <div class="stat-label">总商品品类数量</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${STATS.priceIntervals.totalIntervals.toLocaleString()}</div>
          <div class="stat-label">价格区间总数</div>
        </div>
        <div class="stat-box">
          <div class="stat-number">${STATS.bestProducts.totalProducts.toLocaleString()}</div>
          <div class="stat-label">最佳商品推荐</div>
        </div>
      </div>
      
      <div class="features">
        <div class="feature">
          <div class="feature-icon">📁</div>
          <h3>品类数据库</h3>
          <p>245,317个商品品类，49个一级分类，3,525个二级分类，完整的商品分类体系。</p>
        </div>
        <div class="feature">
          <div class="feature-icon">💰</div>
          <h3>价格区间系统</h3>
          <p>基于真实商业环境的价格区间划分，每个品类2-多个价格档位，科学合理。</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📊</div>
          <h3>评测维度系统</h3>
          <p>针对不同品类和价格区间的专业评测维度，提供全面的商品评价标准。</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🏆</div>
          <h3>最佳商品推荐</h3>
          <p>每个价格区间的每个维度评选最佳商品，提供详尽的推荐理由和介绍。</p>
        </div>
        <div class="feature">
          <div class="feature-icon">🔍</div>
          <h3>智能搜索</h3>
          <p>全局搜索所有品类、价格区间、评测维度和最佳商品，快速找到目标。</p>
        </div>
        <div class="feature">
          <div class="feature-icon">📈</div>
          <h3>数据分析</h3>
          <p>完整的数据库统计和分析报告，了解品类分布和价格区间情况。</p>
        </div>
      </div>
      
      <div class="api-links">
        <h3>📡 API 接口</h3>
        <div class="api-buttons">
          <a href="/api/categories" class="api-btn">品类数据API</a>
          <a href="/api/price-intervals" class="api-btn">价格区间API</a>
          <a href="/api/evaluation-dimensions" class="api-btn">评测维度API</a>
          <a href="/api/best-products" class="api-btn">最佳商品API</a>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2026 全球最佳商品百科全书 · 最终完整版 v1.0</p>
        <p>运行端口: ${PORT} · 数据版本: 2026-02-17 · 系统状态: ✅ 正常运行</p>
      </div>
    </div>
  </body>
  </html>
  `);
});

// API端点：获取品类数据
app.get('/api/categories', (req, res) => {
  const { page = 1, limit = 20, level1, level2, search } = req.query;
  let filteredData = [...categoriesData];
  
  // 搜索功能
  if (search) {
    const searchLower = search.toLowerCase();
    filteredData = filteredData.filter(item => 
      item.level1.toLowerCase().includes(searchLower) ||
      item.level2.toLowerCase().includes(searchLower) ||
      item.level3.toLowerCase().includes(searchLower)
    );
  }
  
  // 筛选功能
  if (level1) {
    filteredData = filteredData.filter(item => item.level1 === level1);
  }
  if (level2) {
    filteredData = filteredData.filter(item => item.level2 === level2);
  }
  
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const startIndex = (pageNum - 1) * limitNum;
  const endIndex = startIndex + limitNum;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedData,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limitNum)
    },
    stats: {
      total: filteredData.length,
      filtered: paginatedData.length,
      hasMore: endIndex < filteredData.length
    }
  });
});

// API端点：获取价格区间
app.get('/api/price-intervals', (req, res) => {
  const { category1, category2 } = req.query;
  
  if (category1 && category2) {
    const intervals = PRICE_INTERVALS_DB[category1]?.[category2];
    if (intervals) {
      res.json({
        success: true,
        category1,
        category2,
        intervals,
        count: intervals.length
      });
    } else {
      res.json({
        success: false,
        message: '未找到该品类的价格区间数据'
      });
    }
  } else {
    res.json({
      success: true,
      data: PRICE_INTERVALS_DB,
      stats: STATS.priceIntervals
    });
  }
});

// API端点：获取评测维度
app.get('/api/evaluation-dimensions', (req, res) => {
  const { category1, category2, intervalId } = req.query;
  
  if (category1 && category2 && intervalId) {
    const dimensions = EVALUATION_DIMENSIONS_DB[category1]?.[category2]?.[intervalId];
    if (dimensions) {
      res.json({
        success: true,
        category1,
        category2,
        intervalId,
        dimensions,
        count: dimensions.length
      });
    } else {
      res.json({
        success: false,
        message: '未找到该价格区间的评测维度数据'
      });
    }
  } else {
    res.json({
      success: true,
      data: EVALUATION_DIMENSIONS_DB,
      stats: STATS.evaluationDimensions
    });
  }
});

// API端点：获取最佳商品
app.get('/api/best-products', (req, res) => {
  const { category1, category2, intervalId, dimensionId } = req.query;
  
  if (category1 && category2 && intervalId && dimensionId) {
    // 在完整数据库中查找
    const product = BEST_PRODUCTS_DB.find(p => 
      p.category1 === category1 && 
      p.category2 === category2 && 
      p.intervalId === intervalId && 
      p.dimensionId === dimensionId
    );
    
    if (product) {
      res.json({
        success: true,
        product,
        metadata: { category1, category2, intervalId, dimensionId }
      });
    } else {
      res.json({
        success: false,
        message: '未找到该维度的最佳商品数据'
      });
    }
  } else {
    // 返回所有最佳商品
    res.json({
      success: true,
      data: BEST_PRODUCTS_DB,
      stats: STATS.bestProducts
    });
  }
});

// 系统状态检查
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    system: '全球最佳商品百科全书',
    version: '1.0',
    port: PORT,
    status: 'running',
    timestamp: new Date().toISOString(),
    stats: STATS,
    endpoints: [
      { path: '/', description: '系统首页' },
      { path: '/api/categories', description: '品类数据API' },
      { path: '/api/price-intervals', description: '价格区间API' },
      { path: '/api/evaluation-dimensions', description: '评测维度API' },
      { path: '/api/best-products', description: '最佳商品API' },
      { path: '/api/status', description: '系统状态API' }
    ]
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`🚀 服务器启动成功: http://localhost:${PORT}`);
  console.log(`📊 系统统计:`);
  console.log(`   - 品类总数: ${STATS.totalCategories.toLocaleString()}`);
  console.log(`   - 一级分类: ${STATS.totalLevel1}`);
  console.log(`   - 二级分类: ${STATS.totalLevel2}`);
  console.log(`   - 价格区间: ${STATS.priceIntervals.totalIntervals.toLocaleString()}`);
  console.log(`   - 最佳商品: ${STATS.bestProducts.totalProducts.toLocaleString()}`);
  console.log(`🔗 访问地址: http://localhost:${PORT}`);
});