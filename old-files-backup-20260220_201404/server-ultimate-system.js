// ==========================================
// 全球最佳商品百科全书 · 终极完整系统
// ==========================================
// 端口：3040
// 功能：24万品类 + 价格区间 + 评测维度 + 最佳商品推荐

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3040;

// 加载所有数据库
console.log('📦 加载数据库...');
const PRICE_INTERVALS_DB = require('./data/price-intervals-db.js').PRICE_INTERVALS_DB;
const EVALUATION_DIMENSIONS_DB = require('./data/evaluation-dimensions-db.js');
const BEST_PRODUCTS_DB = require('./data/best-products-db.js').BEST_PRODUCTS_DB;

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
  
  // 价格区间统计
  priceIntervals: {
    totalLevel1: Object.keys(PRICE_INTERVALS_DB).length,
    totalCategories: Object.values(PRICE_INTERVALS_DB).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
    totalIntervals: Object.values(PRICE_INTERVALS_DB).reduce((sum1, cat) => 
      sum1 + Object.values(cat).reduce((sum2, intervals) => sum2 + intervals.length, 0), 0)
  },
  
  // 评测维度统计
  evaluationDimensions: {
    totalLevel1: Object.keys(EVALUATION_DIMENSIONS_DB).length,
    totalCategories: Object.values(EVALUATION_DIMENSIONS_DB).reduce((sum, cat) => sum + Object.keys(cat).length, 0),
    totalDimensions: Object.values(EVALUATION_DIMENSIONS_DB).reduce((sum1, cat) => 
      sum1 + Object.values(cat).reduce((sum2, intervals) => 
        sum2 + Object.values(intervals).reduce((sum3, dims) => sum3 + dims.length, 0), 0), 0)
  },
  
  // 最佳商品统计
  bestProducts: {
    totalProducts: BEST_PRODUCTS_DB.length,
    sampleProducts: BEST_PRODUCTS_DB.slice(0, 10).map(p => p.productName)
  }
};

// 中间件
app.use(express.json());
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

// 首页
app.get('/', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html lang="zh-CN">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>全球最佳商品百科全书 · 终极完整系统</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        background: linear-gradient(135deg, #6a11cb 0%, #2575fc 100%);
        color: #333;
        min-height: 100vh;
        padding: 20px;
      }
      .container {
        max-width: 1200px;
        margin: 0 auto;
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 25px 50px rgba(0,0,0,0.25);
      }
      .hero {
        background: linear-gradient(135deg, #1a2980 0%, #26d0ce 100%);
        color: white;
        padding: 60px 40px;
        text-align: center;
      }
      .hero h1 {
        font-size: 3rem;
        margin-bottom: 15px;
        font-weight: 900;
      }
      .hero .subtitle {
        font-size: 1.3rem;
        opacity: 0.9;
        max-width: 800px;
        margin: 0 auto 30px;
      }
      .stats {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 20px;
        padding: 40px;
        background: #f8fafc;
      }
      .stat-item {
        background: white;
        padding: 25px;
        border-radius: 15px;
        text-align: center;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        transition: transform 0.3s ease;
      }
      .stat-item:hover {
        transform: translateY(-10px);
      }
      .stat-number {
        font-size: 2.8rem;
        font-weight: 900;
        color: #1a2980;
        margin-bottom: 10px;
      }
      .stat-label {
        font-size: 1rem;
        color: #64748b;
      }
      .features {
        padding: 60px 40px;
      }
      .features h2 {
        text-align: center;
        font-size: 2.2rem;
        color: #1a2980;
        margin-bottom: 50px;
      }
      .feature-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 30px;
      }
      .feature-card {
        background: white;
        border-radius: 15px;
        padding: 30px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        border: 2px solid transparent;
        transition: all 0.3s ease;
      }
      .feature-card:hover {
        border-color: #3b82f6;
        transform: translateY(-5px);
      }
      .feature-icon {
        font-size: 2.5rem;
        margin-bottom: 20px;
      }
      .feature-card h3 {
        font-size: 1.5rem;
        color: #1e293b;
        margin-bottom: 15px;
      }
      .feature-card p {
        color: #475569;
        line-height: 1.6;
        margin-bottom: 20px;
      }
      .feature-btn {
        display: inline-block;
        background: #3b82f6;
        color: white;
        padding: 12px 25px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .feature-btn:hover {
        background: #2563eb;
        transform: scale(1.05);
      }
      .database-structure {
        padding: 60px 40px;
        background: #f1f5f9;
      }
      .database-structure h2 {
        text-align: center;
        font-size: 2.2rem;
        color: #1a2980;
        margin-bottom: 40px;
      }
      .structure-diagram {
        max-width: 800px;
        margin: 0 auto;
        background: white;
        padding: 40px;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      }
      .structure-item {
        margin-bottom: 30px;
        padding-bottom: 30px;
        border-bottom: 2px dashed #e2e8f0;
      }
      .structure-item:last-child {
        border-bottom: none;
      }
      .structure-item h4 {
        font-size: 1.3rem;
        color: #3b82f6;
        margin-bottom: 10px;
      }
      .structure-item ul {
        list-style: none;
        padding-left: 20px;
      }
      .structure-item li {
        margin-bottom: 8px;
        color: #475569;
        position: relative;
      }
      .structure-item li:before {
        content: "✓";
        color: #10b981;
        position: absolute;
        left: -20px;
      }
      .quick-access {
        padding: 40px;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        text-align: center;
      }
      .quick-access h3 {
        font-size: 1.8rem;
        margin-bottom: 30px;
      }
      .quick-buttons {
        display: flex;
        justify-content: center;
        gap: 20px;
        flex-wrap: wrap;
      }
      .quick-btn {
        background: white;
        color: #3b82f6;
        padding: 15px 30px;
        border-radius: 50px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
      }
      .quick-btn:hover {
        background: #f8fafc;
        transform: scale(1.05);
      }
      .footer {
        text-align: center;
        padding: 30px;
        background: #1e293b;
        color: white;
      }
      @media (max-width: 1024px) {
        .stats { grid-template-columns: repeat(2, 1fr); }
        .feature-grid { grid-template-columns: repeat(2, 1fr); }
      }
      @media (max-width: 768px) {
        .hero h1 { font-size: 2.2rem; }
        .stats { grid-template-columns: 1fr; }
        .feature-grid { grid-template-columns: 1fr; }
        .quick-buttons { flex-direction: column; align-items: center; }
        .quick-btn { width: 100%; max-width: 300px; }
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="hero">
        <h1>🌍 全球最佳商品百科全书</h1>
        <div class="subtitle">终极完整系统 · 24万品类智能分析 · 价格区间 + 评测维度 + 最佳商品推荐</div>
      </div>
      
      <div class="stats">
        <div class="stat-item">
          <div class="stat-number">${STATS.totalCategories.toLocaleString()}</div>
          <div class="stat-label">总商品品类</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${STATS.priceIntervals.totalIntervals.toLocaleString()}</div>
          <div class="stat-label">价格区间总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${STATS.evaluationDimensions.totalDimensions.toLocaleString()}</div>
          <div class="stat-label">评测维度总数</div>
        </div>
        <div class="stat-item">
          <div class="stat-number">${STATS.bestProducts.totalProducts.toLocaleString()}</div>
          <div class="stat-label">最佳商品推荐</div>
        </div>
      </div>
      
      <div class="features">
        <h2>✨ 核心功能系统</h2>
        <div class="feature-grid">
          <div class="feature-card">
            <div class="feature-icon">📁</div>
            <h3>品类浏览系统</h3>
            <p>浏览245,317个商品品类，支持三级目录结构，智能分页和搜索功能，快速找到目标商品类别。</p>
            <a href="/categories" class="feature-btn">浏览品类</a>
          </div>
          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>价格区间系统</h3>
            <p>为每个品类设置2-多个合理的价格区间，基于真实商业环境和消费者购买力，科学划分价格档位。</p>
            <a href="/price-intervals" class="feature-btn">查看价格</a>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📊</div>
            <h3>评测维度系统</h3>
            <p>为每个价格区间设计针对性的评测维度，根据不同品类属性和用户需求，提供专业的评价标准。</p>
            <a href="/evaluation-dimensions" class="feature-btn">查看维度</a>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🏆</div>
            <h3>最佳商品推荐</h3>
            <p>为每个维度的每个价格区间评选最佳商品，提供详尽的介绍和推荐理由，帮助消费者做出明智选择。</p>
            <a href="/best-products" class="feature-btn">查看推荐</a>
          </div>
          <div class="feature-card">
            <div class="feature-icon">🔍</div>
            <h3>智能搜索系统</h3>
            <p>全局搜索所有品类、价格区间、评测维度和最佳商品，支持关键词搜索和高级筛选功能。</p>
            <a href="/search" class="feature-btn">开始搜索</a>
          </div>
          <div class="feature-card">
            <div class="feature-icon">📈</div>
            <h3>数据分析报告</h3>
            <p>生成详细的数据分析报告，包括品类分布、价格区间统计、维度分析和商品推荐效果评估。</p>
            <a href="/analytics" class="feature-btn">查看报告</a>
          </div>
        </div>
      </div>
      
      <div class="database-structure">
        <h2>🏗️ 数据库架构设计</h2>
        <div class="structure-diagram">
          <div class="structure-item">
            <h4>📦 品类数据库 (Level 1)</h4>
            <ul>
              <li>一级分类：${STATS.totalLevel1} 个</li>
              <li>二级分类：${STATS.totalLevel2} 个</li>
              <li>三级分类：${STATS.totalLevel3.toLocaleString()} 个</li>
              <li>数据来源：DeepSeek AI 自动生成 + 人工审核</li>
            </ul>
          </div>
          <div class="structure-item">
            <h4>💰 价格区间数据库 (Level 2)</h4>
            <ul>
              <li>覆盖品类：${STATS.priceIntervals.totalCategories} 个</li>
              <li>价格区间：${STATS.priceIntervals.totalIntervals.toLocaleString()} 个</li>
              <li>划分原则：基于真实商业环境、消费者购买力、价格敏感度</li>
              <li>区间数量：每个品类2-多个区间，大众消费区间设置更多档位</li>
            </ul>
          </div>
          <div class="structure-item">
            <h4>📊 评测维度数据库 (Level 3)</h4>
            <ul>
              <li>维度总数：${STATS.evaluationDimensions.totalDimensions.toLocaleString()} 个</li>
              <li>设计原则：针对不同品类属性、用户需求、价格区间</li>
              <li>维度类型：性价比、性能、质量、设计、品牌、创新等</li>
              <li>权重分配：根据不同维度的重要性设置不同权重</li>
            </ul>
          </div>
          <div class="structure-item">
            <h4>🏆 最佳商品数据库 (Level 4)</h4>
            <ul>
              <li>商品总数：${STATS.bestProducts.totalProducts.toLocaleString()} 款</li>
              <li>评选标准：每个价格区间的每个维度评选1款最佳商品</li>
              <li>商品介绍：详尽的商品介绍、推荐理由、技术参数</li>
              <li>推荐逻辑：基于真实评测数据、用户评价、市场表现</li>
            </ul>
          </div>
        </div>
      </div>
      
      <div class="quick-access">
        <h3>🚀 快速开始</h3>
        <div class="quick-buttons">
          <a href="/api/categories?page=1&limit=20" class="quick-btn">查看品类数据API</a>
          <a href="/api/price-intervals" class="quick-btn">查看价格区间API</a>
          <a href="/api/evaluation-dimensions" class="quick-btn">查看评测维度API</a>
          <a href="/api/best-products" class="quick-btn">查看最佳商品API</a>
        </div>
      </div>
      
      <div class="footer">
        <p>© 2026 全球最佳商品百科全书 · 终极完整系统 v1.0</p>
        <p style="opacity: 0.8; margin-top: 10px;">端口: ${PORT} · 数据版本: 2026-02-17 · 系统状态: ✅ 运行中</p>
      </div>
    </div>
  </body>
  </html>
  `;
  res.send(html);
});

// API端点：获取品类数据
app.get('/api/categories', (req, res) => {
  const { page = 1, limit = 20, level1, level2, search } = req.query;
  let filteredData = [...categoriesData];
  
  // 搜索功能
  if (search) {
    const