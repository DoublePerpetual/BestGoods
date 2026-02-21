/**
 * BestGoods 100%严格按照备份文件还原的完整网站 - 修复版
 * 修复数据库连接和错误处理，支持Zeabur部署
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = process.env.PORT || 3076;

// ==========================================
// 数据库配置 - 修复版
// ==========================================
// 支持多种数据库路径配置
const DB_PATHS = [
  process.env.DATABASE_PATH,                    // 环境变量优先
  path.join(__dirname, 'data/bestgoods.db'),    // 本地开发路径
  '/data/bestgoods.db',                         // Zeabur部署路径
  path.join(process.cwd(), 'data/bestgoods.db') // 当前工作目录
];

let db = null;
let dbPath = null;

// 初始化数据库 - 增强错误处理
async function initDatabase() {
  console.log('🔍 初始化数据库...');
  
  // 查找可用的数据库文件
  for (const potentialPath of DB_PATHS) {
    if (potentialPath && fs.existsSync(potentialPath)) {
      dbPath = potentialPath;
      console.log(`📁 找到数据库文件: ${dbPath}`);
      break;
    }
  }
  
  if (!dbPath) {
    // 如果没有找到数据库文件，尝试创建默认路径
    dbPath = path.join(__dirname, 'data/bestgoods.db');
    console.log(`⚠️  未找到现有数据库，将使用: ${dbPath}`);
    
    // 确保目录存在
    const dir = path.dirname(dbPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 创建数据库目录: ${dir}`);
    }
  }
  
  return new Promise((resolve, reject) => {
    console.log(`🔗 连接数据库: ${dbPath}`);
    
    db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('❌ 数据库连接失败:');
        console.error('   错误信息:', err.message);
        console.error('   错误代码:', err.code);
        console.error('   数据库路径:', dbPath);
        reject(err);
      } else {
        console.log('✅ SQLite数据库连接成功');
        console.log(`📊 数据库文件: ${dbPath}`);
        console.log(`📏 文件大小: ${fs.existsSync(dbPath) ? (fs.statSync(dbPath).size / 1024 / 1024).toFixed(2) + ' MB' : '不存在'}`);
        resolve(db);
      }
    });
  });
}

// 数据库查询函数 - 增强错误处理
function query(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未初始化'));
      return;
    }
    
    console.log(`📝 执行查询: ${sql.substring(0, 100)}${sql.length > 100 ? '...' : ''}`);
    
    db.all(sql, params, (err, rows) => {
      if (err) {
        console.error('❌ 查询错误:');
        console.error('   SQL:', sql);
        console.error('   参数:', params);
        console.error('   错误:', err.message);
        reject(err);
      } else {
        console.log(`✅ 查询成功，返回 ${rows.length} 行`);
        resolve(rows);
      }
    });
  });
}

// 获取单个结果
function getOne(sql, params = []) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject(new Error('数据库未初始化'));
      return;
    }
    
    db.get(sql, params, (err, row) => {
      if (err) {
        console.error('❌ 查询错误:', err.message);
        reject(err);
      } else {
        resolve(row);
      }
    });
  });
}

// ==========================================
// 内存存储
// ==========================================
const memoryStorage = {
  votes: {},
  comments: []
};

// 投票存储
function storeVote(productId, priceId, dimensionId, voteType, currentVote) {
  const key = `${productId}_${priceId}_${dimensionId}`;
  
  if (currentVote === voteType) {
    // 取消投票
    delete memoryStorage.votes[key];
  } else {
    // 新投票或更改投票
    memoryStorage.votes[key] = {
      productId,
      priceId,
      dimensionId,
      voteType,
      timestamp: Date.now()
    };
  }
  
  return {
    success: true,
    likes: Object.values(memoryStorage.votes).filter(v => v.voteType === 'like').length,
    dislikes: Object.values(memoryStorage.votes).filter(v => v.voteType === 'dislike').length
  };
}

// 添加评论
function addComment(productId, priceId, dimensionId, comment) {
  const newComment = {
    id: Date.now().toString(),
    productId,
    priceId,
    dimensionId,
    comment,
    timestamp: Date.now()
  };
  
  memoryStorage.comments.push(newComment);
  return newComment;
}

// 获取评论
function getComments(productId, priceId, dimensionId) {
  return memoryStorage.comments.filter(c => 
    c.productId === productId && 
    c.priceId === priceId && 
    c.dimensionId === dimensionId
  );
}

// ==========================================
// 图标映射函数
// ==========================================
function getIcon(name) {
  const iconMap = {
    // 一级分类图标
    '个护健康': 'fa-heart',
    '家居生活': 'fa-home',
    '数码电子': 'fa-laptop',
    '服装鞋帽': 'fa-tshirt',
    '食品饮料': 'fa-utensils',
    '运动户外': 'fa-running',
    '美妆护肤': 'fa-spa',
    '母婴用品': 'fa-baby',
    '宠物用品': 'fa-paw',
    '办公文具': 'fa-pen',
    '汽车用品': 'fa-car',
    '玩具游戏': 'fa-gamepad',
    
    // 二级分类图标（部分示例）
    '口腔护理': 'fa-tooth',
    '剃须用品': 'fa-cut',
    '洗发护发': 'fa-shower',
    '面部护理': 'fa-smile',
    '身体护理': 'fa-spa',
    '卫生用品': 'fa-hand-sparkles',
    
    '厨房电器': 'fa-blender',
    '家居清洁': 'fa-broom',
    '床上用品': 'fa-bed',
    '家具家饰': 'fa-couch',
    '照明灯具': 'fa-lightbulb',
    '收纳整理': 'fa-box-open',
    
    '智能手机': 'fa-mobile-alt',
    '笔记本电脑': 'fa-laptop',
    '平板电脑': 'fa-tablet-alt',
    '智能手表': 'fa-clock',
    '耳机耳麦': 'fa-headphones',
    '摄影摄像': 'fa-camera',
    
    // 默认图标
    'default': 'fa-box'
  };
  
  return iconMap[name] || iconMap['default'];
}

// ==========================================
// 服务器初始化
// ==========================================
async function initializeServer() {
  console.log('🚀 初始化BestGoods服务器...');
  
  try {
    // 1. 初始化数据库
    await initDatabase();
    
    // 2. 获取统计数据
    console.log('📊 获取统计数据...');
    const stats = await getStats();
    
    console.log('✅ 服务器初始化完成');
    console.log(`📈 统计数据: ${stats.categories.level1}个一级分类, ${stats.categories.level2}个二级分类, ${stats.categories.level3}个三级分类`);
    console.log(`📦 产品数量: ${stats.products.total}个`);
    
    return stats;
    
  } catch (error) {
    console.error('❌ 服务器初始化失败:');
    console.error('   错误信息:', error.message);
    console.error('   错误堆栈:', error.stack);
    throw error;
  }
}

// 获取统计数据
async function getStats() {
  try {
    const categoryStats = await getOne(`
      SELECT 
        COUNT(DISTINCT level1) as level1,
        COUNT(DISTINCT level2) as level2,
        COUNT(DISTINCT level3) as level3
      FROM categories
    `);
    
    const productStats = await getOne(`
      SELECT 
        COUNT(*) as total,
        AVG(confidence_score) as avg_score,
        MIN(confidence_score) as min_score,
        MAX(confidence_score) as max_score
      FROM products
    `);
    
    return {
      categories: {
        level1: categoryStats?.level1 || 0,
        level2: categoryStats?.level2 || 0,
        level3: categoryStats?.level3 || 0
      },
      products: {
        total: productStats?.total || 0,
        avg_score: Math.round(productStats?.avg_score || 0),
        min_score: productStats?.min_score || 0,
        max_score: productStats?.max_score || 0
      }
    };
  } catch (error) {
    console.error('❌ 获取统计数据失败:', error.message);
    // 返回默认值而不是抛出错误
    return {
      categories: { level1: 0, level2: 0, level3: 0 },
      products: { total: 0, avg_score: 0, min_score: 0, max_score: 0 }
    };
  }
}

// ==========================================
// 中间件配置
// ==========================================
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ==========================================
// 路由定义
// ==========================================

// 首页
app.get('/', async (req, res) => {
  try {
    const stats = await getStats();
    
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>全球最佳商品百科全书 · ${stats.products.total.toLocaleString()}个评选产品</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
      <style>
        /* 样式保持不变 */
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; color: #333; }
        .container { max-width: 1200px; margin: 0 auto; padding: 20px; }
        .header { background: white; border-radius: 20px; padding: 40px; margin-bottom: 30px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); }
        h1 { color: #667eea; margin-bottom: 20px; }
        .subtitle { color: #666; margin-bottom: 30px; }
        .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 40px; }
        .stat-card { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); border-left: 5px solid #667eea; }
        .stat-card h3 { color: #666; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 10px; }
        .stat-card .value { font-size: 36px; font-weight: bold; color: #667eea; margin: 10px 0; }
        .search-box { background: white; border-radius: 15px; padding: 30px; margin-bottom: 30px; }
        .search-input { width: 100%; padding: 15px; border: 2px solid #e0e0e0; border-radius: 10px; font-size: 16px; }
        .categories-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 20px; }
        .category-card { background: white; border-radius: 15px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1); transition: transform 0.3s ease; }
        .category-card:hover { transform: translateY(-5px); }
        .category-icon { font-size: 36px; color: #667eea; margin-bottom: 15px; }
        .category-name { font-size: 18px; font-weight: bold; margin-bottom: 10px; }
        .category-path { color: #666; font-size: 14px; margin-bottom: 15px; }
        .view-btn { display: inline-block; background: #667eea; color: white; padding: 10px 20px; border-radius: 25px; text-decoration: none; font-weight: bold; }
        .footer { text-align: center; color: white; margin-top: 40px; padding: 20px; }
        .status-badge { display: inline-block; background: #4CAF50; color: white; padding: 5px 15px; border-radius: 20px; font-size: 14px; margin-left: 10px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏆 全球最佳商品百科全书 <span class="status-badge">✅ 修复版</span></h1>
          <div class="subtitle">基于真实AI评选，${stats.products.total.toLocaleString()}个最佳商品，${stats.categories.level3.toLocaleString()}个品类</div>
          
          <div class="stats-grid">
            <div class="stat-card">
              <h3>一级分类</h3>
              <div class="value">${stats.categories.level1}</div>
              <div>主要商品类别</div>
            </div>
            <div class="stat-card">
              <h3>二级分类</h3>
              <div class="value">${stats.categories.level2.toLocaleString()}</div>
              <div>细分商品类别</div>
            </div>
            <div class="stat-card">
              <h3>三级分类</h3>
              <div class="value">${stats.categories.level3.toLocaleString()}</div>
              <div>具体商品品类</div>
            </div>
            <div class="stat-card">
              <h3>评选产品</h3>
              <div class="value">${stats.products.total.toLocaleString()}</div>
              <div>最佳商品数量</div>
            </div>
          </div>
          
          <div class="search-box">
            <h3>🔍 搜索品类</h3>
            <input type="text" class="search-input" placeholder="输入品类名称，如'电动牙刷'、'智能手机'..." id="searchInput">
            <div id="searchResults" style="margin-top: 20px;"></div>
          </div>
        </div>
        
        <h2 style="color: white; margin-bottom: 20px;">📂 商品分类目录</h2>
        <div class="categories-grid" id="categoriesGrid">
          <!-- 分类将通过JavaScript动态加载 -->
          <div style="text-align: center; color: white; padding: 40px;">
            <i class="fas fa-spinner fa-spin fa-2x"></i>
            <p style="margin-top: 20px;">正在加载分类数据...</p>
          </div>
        </div>
      </div>
      
      <div class="footer">
        <p>BestGoods 全球最佳商品评选系统 • 修复版 • 数据库: ${dbPath}</p>
        <p>数据统计时间: ${new Date().toLocaleString()}</p>
      </div>
      
      <script>
        // 搜索功能
        document.getElementById('searchInput').addEventListener('input', async function(e) {
          const query = e.target.value.trim();
          const resultsDiv = document.getElementById('searchResults');
          
          if (query.length < 2) {
            resultsDiv.innerHTML = '';
            return;
          }
          
          try {
            const response = await fetch('/api/search?q=' + encodeURIComponent(query));
            const data = await response.json();
            
            if (data.success && data.results.length > 0) {
              let html = '<div style="background: #f8f9fa; padding: 15px; border-radius: 10px;">';
              html += '<h4 style="margin-bottom: 10px;">搜索结果:</h4>';
              data.results.forEach(category => {
                html += \`<div style="padding: 10px; border-bottom: 1px solid #e0e0e0;">
                  <div style="font-weight: bold;">\${category.level3}</div>
                  <div style="color: #666; font-size: 14px;">\${category.level1} > \${category.level2}</div>
                  <a href="/category/\${encodeURIComponent(category.level1)}/\${encodeURIComponent(category.level2)}/\${encodeURIComponent(category.level3)}" 
                     style="color: #