#!/usr/bin/env node

/**
 * 从JSON数据库重新创建SQLite数据库
 * 源数据: /Users/surferboy/.openclaw/workspace/bestgoods-github/data/raw-categories.json
 * 目标: /Users/surferboy/.openclaw/workspace/bestgoods-final-complete-backup-20260220_1522/data/bestgoods.db
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

// 路径配置
const jsonPath = '/Users/surferboy/.openclaw/workspace/bestgoods-github/data/raw-categories.json';
const dbPath = path.join(__dirname, 'data/bestgoods.db');

// 备份原数据库
const backupPath = dbPath + '.backup-' + new Date().toISOString().replace(/[:.]/g, '-');
if (fs.existsSync(dbPath)) {
  console.log(`备份原数据库到: ${backupPath}`);
  fs.copyFileSync(dbPath, backupPath);
}

// 读取JSON数据
console.log('读取JSON数据...');
const rawData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
const categories = rawData.categories;

// 统计信息
let totalLevel1 = 0;
let totalLevel2 = 0;
let totalLevel3 = 0;

// 计算总数
for (const level1 in categories) {
  totalLevel1++;
  for (const level2 in categories[level1]) {
    totalLevel2++;
    totalLevel3 += categories[level1][level2].length;
  }
}

console.log(`统计数据:`);
console.log(`  一级分类: ${totalLevel1}`);
console.log(`  二级分类: ${totalLevel2}`);
console.log(`  三级分类: ${totalLevel3}`);

// 创建数据库
console.log('创建SQLite数据库...');
const db = new sqlite3.Database(dbPath);

// 创建表
db.serialize(() => {
  // 删除旧表
  db.run('DROP TABLE IF EXISTS categories');
  db.run('DROP TABLE IF EXISTS products');
  db.run('DROP VIEW IF EXISTS v_product_details');
  
  // 创建分类表
  db.run(`
    CREATE TABLE categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level1 TEXT NOT NULL,
      level2 TEXT NOT NULL,
      level3 TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(level1, level2, level3)
    )
  `);
  
  // 创建产品表（模拟数据）
  db.run(`
    CREATE TABLE products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      level1 TEXT NOT NULL,
      level2 TEXT NOT NULL,
      level3 TEXT NOT NULL,
      product_name TEXT NOT NULL,
      price DECIMAL(10, 2),
      confidence_score INTEGER DEFAULT 0,
      selection_reason TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);
  
  // 创建索引
  db.run('CREATE INDEX idx_categories_level1 ON categories(level1)');
  db.run('CREATE INDEX idx_categories_level2 ON categories(level1, level2)');
  db.run('CREATE INDEX idx_categories_level3 ON categories(level1, level2, level3)');
  db.run('CREATE INDEX idx_products_level1 ON products(level1)');
  db.run('CREATE INDEX idx_products_level2 ON products(level1, level2)');
  db.run('CREATE INDEX idx_products_level3 ON products(level1, level2, level3)');
  
  // 插入分类数据
  console.log('插入分类数据...');
  const insertStmt = db.prepare('INSERT OR IGNORE INTO categories (level1, level2, level3) VALUES (?, ?, ?)');
  
  let insertedCount = 0;
  for (const level1 in categories) {
    for (const level2 in categories[level1]) {
      for (const level3 of categories[level1][level2]) {
        insertStmt.run(level1, level2, level3);
        insertedCount++;
        
        if (insertedCount % 10000 === 0) {
          console.log(`已插入 ${insertedCount} 个分类...`);
        }
      }
    }
  }
  
  insertStmt.finalize();
  console.log(`分类数据插入完成，共 ${insertedCount} 条记录`);
  
  // 插入产品数据（模拟数据）
  console.log('生成模拟产品数据...');
  const productStmt = db.prepare(`
    INSERT INTO products (level1, level2, level3, product_name, price, confidence_score, selection_reason)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  const reasons = [
    '性价比最高，用户评价优秀',
    '质量可靠，使用寿命长',
    '设计人性化，使用体验好',
    '技术创新，功能领先',
    '环保材料，安全健康',
    '外观设计精美，符合现代审美',
    '操作简单，适合各年龄段用户'
  ];
  
  let productCount = 0;
  const maxProducts = 4580; // 目标产品数量
  
  // 从分类中随机选择来创建产品
  db.each('SELECT level1, level2, level3 FROM categories ORDER BY RANDOM() LIMIT 5000', (err, row) => {
    if (productCount >= maxProducts) return;
    
    const price = (Math.random() * 1000 + 10).toFixed(2);
    const score = Math.floor(Math.random() * 40 + 60); // 60-99分
    const reason = reasons[Math.floor(Math.random() * reasons.length)];
    
    productStmt.run(
      row.level1,
      row.level2,
      row.level3,
      `${row.level3} 评选产品`,
      price,
      score,
      reason
    );
    
    productCount++;
    
    if (productCount % 500 === 0) {
      console.log(`已生成 ${productCount} 个产品...`);
    }
  }, () => {
    productStmt.finalize();
    console.log(`产品数据生成完成，共 ${productCount} 个产品`);
    
    // 创建视图
    console.log('创建视图...');
    db.run(`
      CREATE VIEW v_product_details AS
      SELECT 
        p.id,
        p.level1,
        p.level2,
        p.level3,
        p.product_name,
        p.price,
        p.confidence_score,
        p.selection_reason,
        p.created_at
      FROM products p
      ORDER BY p.confidence_score DESC
    `);
    
    // 验证数据
    console.log('\n验证数据库数据...');
    db.get('SELECT COUNT(DISTINCT level1) as level1, COUNT(DISTINCT level2) as level2, COUNT(DISTINCT level3) as level3 FROM categories', (err, row) => {
      console.log(`分类统计:`);
      console.log(`  一级分类: ${row.level1}`);
      console.log(`  二级分类: ${row.level2}`);
      console.log(`  三级分类: ${row.level3}`);
    });
    
    db.get('SELECT COUNT(*) as count FROM products', (err, row) => {
      console.log(`产品总数: ${row.count}`);
    });
    
    console.log('\n✅ 数据库创建完成!');
    console.log(`数据库位置: ${dbPath}`);
    console.log(`备份位置: ${backupPath}`);
    
    // 关闭数据库
    db.close();
  });
});

// 错误处理
db.on('error', (err) => {
  console.error('数据库错误:', err);
});