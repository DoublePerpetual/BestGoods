// ==========================================
// 全球最佳商品百科全书 · 完整系统服务器
// ==========================================
// 集成：24万品类数据 + 价格区间数据库 + 评测维度数据库 + 最佳商品数据库
// 端口：3040

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3040;

// 加载数据库
const PRICE_INTERVALS_DB = require('./data/price-intervals-db.js').PRICE_INTERVALS_DB;
const EVALUATION_DIMENSIONS_DB = require('./data/evaluation-dimensions-db.js');
const BEST_PRODUCTS_DB = require('./data/best-products-db.js').BEST_PRODUCTS_DB;
const BEST_PRODUCTS_COMPLETE_DB = require('./data/best-products-complete-db.js').BEST_PRODUCTS_COMPLETE_DB;

// 加载24万品类数据
let categoriesData = null;
try {
  const rawData = fs.readFileSync(path.join(__dirname, 'data', 'global-categories-expanded.json'), 'utf8');
  categoriesData = JSON.parse(rawData);
  console.log(`✅ 成功加载品类数据: ${categoriesData.length.toLocaleString()} 个品类`);
} catch (error) {
  console.error('❌ 加载品类数据失败:', error.message);
  categoriesData = [];
}

// 中间件
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// 首页 - 系统概览
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>全球最佳商品百科全书 · 完整系统</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: #333;
        line-height: 1.6;
        min-height: 100vh;
        padding: 20px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        overflow: hidden;
      }
      .header {
        background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        color: white;
        padding: 40px;
        text-align: center;
      }
      .header h1 {
        font-size: 2.8rem;
        margin-bottom: 10px;
        font-weight: 800;
      }
      .header .subtitle {
        font-size: 1.2rem;
        opacity: 0.9;
        margin-bottom: 20px;
      }
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 20px;
        padding: 30px;
        background: #f8f9fa;
      }
      .stat-card {
        background: white;
        padding: 25px;
        border-radius: 15px;
        box-shadow: 0 5px 15px rgba(0,0,0,0.08);
        text-align: center;
        transition: transform 0.3s ease;
      }
      .stat-card:hover {
        transform: translateY(-5px);
      }
      .stat-card .number {
        font-size: 2.5rem;
        font-weight: 800;
        color: #1e3c72;
        margin-bottom: 10px;
      }
      .stat-card .label {
        font-size: 1rem;
        color: #666;
      }
      .nav-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
        padding: 40px;
      }
      .nav-card {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
        padding: 30px;
        border-radius: 15px;
        text-decoration: none;
        transition: all 0.3s ease;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .nav-card:hover {
        transform: translateY(-8px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.3);
      }
      .nav-card h3 {
        font-size: 1.5rem;
        margin-bottom: 15px;
        font-weight: 700;
      }
      .nav-card p {
        opacity: 0.9;
        margin-bottom: 20px;
      }
      .nav-card .btn {
        display: inline-block;
        background: white;
        color: #333;
        padding: 10px 25px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .nav-card .btn:hover {
        background: #f8f9fa;
        transform: scale(1.05);
      }
      .system-info {
        padding: 30px;
        background: #f8f9fa;
        border-top: 1px solid #e9ecef;
      }
      .system-info h2 {
        color: #1e3c72;
        margin-bottom: 20px;
        font-size: 1.8rem;
      }
      .info-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 20px;
      }
      .info-item {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 3px 10px rgba(0,0,0,0.05);
      }
      .info-item h4 {
        color: #f5576c;
        margin-bottom: 10px;
        font-size: 1.2rem;
      }
      .footer {
        text-align: center;
        padding: 30px;
        background: #1e3c72;
        color: white;
      }
      @media (max-width: 768px) {
        .header h1 { font-size: 2rem; }
        .nav-grid { grid-template-columns: 1fr; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1>🌍 全球最佳商品百科全书</h1>
        <div class="subtitle">完整系统 · 24万品类 · 智能推荐引擎</div>
      </div>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="number">${categoriesData.length.toLocaleString()}</div>
          <div class="label">总品类数量</div>
        </div>
        <div class="stat-card">
          <div class="number">735,951</div>
          <div class="label">价格区间总数</div>
        </div>
        <div class="stat-card">
          <div class="number">2,207,853</div>
          <div class="label">评测维度总数</div>
        </div>
        <div class="stat-card">
          <div class="number">2.2M</div>
          <div class="label">最佳商品推荐</div>
        </div>
      </div>
      
      <div class="nav-grid">
        <a href="/categories" class="nav-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
          <h3>📁 品类浏览</h3>
          <p>浏览24万+商品品类，支持三级目录结构，智能分页展示</p>
          <span class="btn">进入浏览</span>
        </a>
        
        <a href="/price-intervals" class="nav-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
          <h3>💰 价格区间系统</h3>
          <p>查看每个品类的合理价格区间划分，基于真实商业环境</p>
          <span class="btn">查看价格</span>
        </a>
        
        <a href="/evaluation-dimensions" class="nav-card" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
          <h3>📊 评测维度系统</h3>
          <p>查看每个价格区间的专业评测维度，针对不同用户需求</p>
          <span class="btn">查看维度</span>
        </a>
        
        <a href="/best-products" class="nav-card" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
          <h3>🏆 最佳商品推荐</h3>
          <p>查看每个维度的最佳商品推荐，包含详细介绍和推荐理由</p>
          <span class="btn">查看推荐</span>
        </a>
        
        <a href="/search" class="nav-card" style="background: linear-gradient(135deg, #ff9a9e 0%, #fad0c4 100%);">
          <h3>🔍 智能搜索</h3>
          <p>全局搜索24万品类、价格区间、评测维度和最佳商品</p>
          <span class="btn">开始搜索</span>
        </a>
        
        <a href="/database-structure" class="nav-card" style="background: linear-gradient(135deg, #a3bded 0%, #6991c7 100%);">
          <h3>🗄️ 数据库结构</h3>
          <p>查看完整的数据库架构和数据结构设计</p>
          <span class="btn">查看结构</span>
        </a>
      </div>
      
      <div class="system-info">
        <h2>📈 系统架构概览</h2>
        <div class="info-grid">
          <div class="info-item">
            <h4>🎯 核心目标</h4>
            <p>为24万多个商品品类建立完整的"价格区间 + 评测维度 + 最佳商品推荐"系统，帮助消费者做出明智的购买决策。</p>
          </div>
          <div class="info-item">
            <h4>🏗️ 系统架构</h4>
            <p>四级数据库结构：品类数据库 → 价格区间数据库 → 评测维度数据库 → 最佳商品数据库。</p>
          </div>
          <div class="info-item">
            <h4>📊 数据规模</h4>
            <p>总数据量约2.2GB，包含245,317个品类、735,951个价格区间、2,207,853个评测维度和最佳商品推荐。</p>
          </div>
          <div class="info-item">
            <h4>⚡ 技术特点</h4>
            <p>基于真实商业环境的价格区间划分，针对性的评测维度设计，详尽的商品介绍和推荐理由。</p>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2026 全球最佳商品百科全书 · 完整系统 v1.0 · 端口: ${PORT}</p>
        <p style="opacity: 0.8; margin-top: 10px; font-size: 0.9rem;">
          数据最后更新: 2026-02-17 · 系统状态: ✅ 运行正常
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// API端点：获取品类数据
app.get('/api/categories', (req, res) => {
  const { level1, level2, page = 1, limit = 50 } = req.query;
  let filteredData = [...categoriesData];
  
  if (level1) {
    filteredData = filteredData.filter(item => item.level1 === level1);
  }
  if (level2) {
    filteredData = filteredData.filter(item => item.level2 === level2);
  }
  
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  const paginatedData = filteredData.slice(startIndex, endIndex);
  
  res.json({
    success: true,
    data: paginatedData,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: filteredData.length,
      totalPages: Math.ceil(filteredData.length / limit)
    }
  });
});

// API端点：获取价格区间
app.get('/api/price-intervals/:category1?/:category2?', (req, res) => {
  const { category1, category2 } = req.params;
  
  if (category1 && category2) {
    // 获取特定品类的价格区间
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
  } else if (category1) {
    // 获取一级分类下的所有价格区间
    const categoryData = PRICE_INTERVALS_DB[category1];
    if (categoryData) {
      res.json({
        success: true,
        category1,
        categories: Object.keys(categoryData),
        data: categoryData
      });
    } else {
      res.json({
        success: false,
        message: '未找到该分类的价格区间数据'
      });
    }
  } else {
    // 获取所有价格区间
    res.json({
      success: true,
      data: PRICE_INTERVALS_DB,
      stats: {
        totalLevel1: Object.keys(PRICE_INTERVALS_DB).length,
        totalCategories: Object.values(PRICE_INTERVALS_DB).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
        totalIntervals: Object.values(PRICE_INTERVALS_DB).reduce((sum1, cat) => 
          sum1 + Object.values(cat).reduce((sum2, intervals) => sum2 + intervals.length, 0), 0)
      }
    });
  }
});

// API端点：获取评测维度
app.get('/api/evaluation-dimensions/:category1?/:category2?/:intervalId?', (req, res) => {
  const { category1, category2, intervalId } = req.params;
  
  if (category1 && category2 && intervalId) {
    // 获取特定价格区间的评测维度
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
  } else if (category1 && category2) {
    // 获取特定品类的所有评测维度
    const categoryDimensions = EVALUATION_DIMENSIONS_DB[category1]?.[category2];
    if (categoryDimensions) {
      res.json({
        success: true,
        category1,
        category2,
        data: categoryDimensions,
        intervals: Object.keys(categoryDimensions)
      });
    } else {
      res.json({
        success: false,
        message: '未找到该品类的评测维度数据'
      });
    }
  } else {
    res.json({
      success: true,
      data: EVALUATION_DIMENSIONS_DB,
      stats: {
        totalLevel1: Object.keys(EVALUATION_DIMENSIONS_DB).length,
        totalCategories: Object.values(EVALUATION_DIMENSIONS_DB).reduce((sum, cat) => sum + Object.keys(cat).length, 0)
      }
    });
  }
});

// API端点：获取最佳商品
app.get('/api/best-products/:category1?/:category2?/:intervalId?/:dimensionId?', (req, res) => {
  const { category1, category2, intervalId, dimensionId } = req.params;
  
  if (category1 && category2 && intervalId && dimensionId) {
    // 获取特定维度的最佳商品
    const product = BEST_PRODUCTS_COMPLETE_DB[category1]?.[category2]?.[intervalId]?.[dimensionId];
    if (product) {
      res.json({
        success: true,
        product,
        metadata: {
          category1,
          category2,
          intervalId,
          dimensionId
        }
      });
    } else {
      // 尝试从简化数据库获取
      const simpleProduct = BEST_PRODUCTS_DB.find(p => 
        p.category1 === category1 && 
        p.category2 === category2 && 
        p.intervalId === intervalId && 
        p.dimensionId === dimensionId
      );
      
      if (simpleProduct) {
        res.json({
          success: true,
          product: simpleProduct,
          source: 'simplified-db'
        });
      } else {
        res.json({
          success: false,
          message: '未