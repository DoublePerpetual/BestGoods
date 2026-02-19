const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3021;

// 加载数据
let CATEGORY_TREE = {};
let STATS = { level1: 0, level2: 0, level3: 0 };

function loadData() {
  try {
    const dataPath = path.join(__dirname, 'data', 'global-categories-expanded.json');
    const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
    
    if (rawData.categories) {
      CATEGORY_TREE = rawData.categories;
      STATS.level1 = Object.keys(CATEGORY_TREE).length;
      
      // 计算二级和三级数量
      let level2 = 0, level3 = 0;
      Object.values(CATEGORY_TREE).forEach(l2Categories => {
        Object.values(l2Categories).forEach(l3Items => {
          if (Array.isArray(l3Items)) {
            level2++;
            level3 += l3Items.length;
          }
        });
      });
      
      STATS.level2 = level2;
      STATS.level3 = level3;
      
      console.log(`✅ 数据加载成功: 一级${STATS.level1} · 二级${STATS.level2} · 三级${STATS.level3}`);
    }
  } catch (error) {
    console.error('❌ 数据加载失败:', error.message);
    loadDefaultData();
  }
}

function loadDefaultData() {
  CATEGORY_TREE = {
    "数码电子": {
      "智能手机": ["5G手机", "游戏手机", "拍照手机"],
      "笔记本电脑": ["轻薄本", "游戏本"]
    },
    "家用电器": {
      "冰箱": ["对开门冰箱", "十字门冰箱"],
      "洗衣机": ["滚筒洗衣机", "波轮洗衣机"]
    }
  };
  
  STATS.level1 = Object.keys(CATEGORY_TREE).length;
  STATS.level2 = Object.values(CATEGORY_TREE).reduce((acc, l2) => acc + Object.keys(l2).length, 0);
  STATS.level3 = Object.values(CATEGORY_TREE).reduce((acc, l2) => 
    acc + Object.values(l2).reduce((acc2, l3) => acc2 + l3.length, 0), 0);
}

// 首页
app.get('/', (req, res) => {
  const view = req.query.view || 'grid';
  const level1 = req.query.level1 || '';
  const level2 = req.query.level2 || '';
  
  if (view === 'grid') {
    res.send(renderGrid(level1, level2));
  } else {
    res.send(renderList());
  }
});

// 卡片折叠式
function renderGrid(level1, level2) {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>全球最佳商品百科全书 · 三级目录</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    .category-card { transition: all 0.2s; }
    .category-card:hover { transform: translateY(-2px); }
    .collapsible { max-height: 0; overflow: hidden; transition: max-height 0.3s; }
    .collapsible.open { max-height: 5000px; }
  </style>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">全球最佳商品百科全书 · 三级目录</h1>
    <p class="text-gray-600 mb-6">一级${STATS.level1} · 二级${STATS.level2} · 三级${STATS.level3}</p>
    
    <div class="flex gap-2 mb-6">
      <a href="/?view=grid" class="px-4 py-2 bg-blue-600 text-white rounded">卡片折叠</a>
      <a href="/?view=list" class="px-4 py-2 bg-gray-200 rounded">列表分页</a>
    </div>
    
    ${!level1 ? renderLevel1Grid() : (level1 && !level2 ? renderLevel2Grid(level1) : renderLevel3Grid(level1, level2))}
  </div>
  
  <script>
    function toggleCollapse(id) {
      document.getElementById(id).classList.toggle('open');
    }
    function selectLevel1(l1) {
      window.location.href = '/?view=grid&level1=' + encodeURIComponent(l1);
    }
    function selectLevel2(l1, l2) {
      window.location.href = '/?view=grid&level1=' + encodeURIComponent(l1) + '&level2=' + encodeURIComponent(l2);
    }
  </script>
</body>
</html>`;
  return html;
}

function renderLevel1Grid() {
  let html = '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
  
  Object.entries(CATEGORY_TREE).forEach(([l1, l2Categories]) => {
    const l2Count = Object.keys(l2Categories).length;
    const l3Count = Object.values(l2Categories).reduce((acc, l3) => acc + l3.length, 0);
    
    html += `
      <div onclick="selectLevel1('${l1}')" class="category-card bg-white p-4 rounded-lg shadow border cursor-pointer">
        <h3 class="text-lg font-bold mb-2">${l1}</h3>
        <p class="text-sm text-gray-600">二级: ${l2Count} · 三级: ${l3Count}</p>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

function renderLevel2Grid(level1) {
  const l2Categories = CATEGORY_TREE[level1];
  if (!l2Categories) return '<div class="text-center py-8">分类不存在</div>';
  
  let html = `<div class="mb-4">
    <a href="/?view=grid" class="text-blue-600">← 返回一级</a>
    <h2 class="text-2xl font-bold mt-2">${level1}</h2>
  </div>`;
  
  html += '<div class="space-y-4">';
  
  Object.entries(l2Categories).forEach(([l2, l3Items]) => {
    const collapsedId = 'collapse-' + l2.replace(/[^a-z0-9]/gi, '-');
    
    html += `
      <div class="bg-white rounded-lg shadow border">
        <div class="p-4 flex justify-between items-center cursor-pointer" onclick="toggleCollapse('${collapsedId}')">
          <h3 class="font-bold">${l2} (${l3Items.length}个品类)</h3>
          <span>▼</span>
        </div>
        <div id="${collapsedId}" class="collapsible">
          <div class="p-4 border-t">
            <div class="grid grid-cols-2 gap-2">
              ${l3Items.map(item => `
                <div class="p-2 border rounded hover:bg-gray-50">${item}</div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

function renderLevel3Grid(level1, level2) {
  const l3Items = CATEGORY_TREE[level1]?.[level2] || [];
  
  let html = `<div class="mb-4">
    <a href="/?view=grid&level1=${encodeURIComponent(level1)}" class="text-blue-600">← 返回二级</a>
    <h2 class="text-2xl font-bold mt-2">${level1} › ${level2}</h2>
  </div>`;
  
  html += '<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">';
  
  l3Items.forEach(item => {
    html += `
      <div class="bg-white p-4 rounded-lg shadow border">
        <h4 class="font-bold">${item}</h4>
        <p class="text-sm text-gray-600 mt-1">${level2} - ${item}</p>
      </div>
    `;
  });
  
  html += '</div>';
  return html;
}

// 列表分页式
function renderList() {
  // 收集所有三级分类
  let allItems = [];
  Object.entries(CATEGORY_TREE).forEach(([l1, l2Categories]) => {
    Object.entries(l2Categories).forEach(([l2, l3Items]) => {
      l3Items.forEach(l3 => {
        allItems.push({ l1, l2, l3 });
      });
    });
  });
  
  const page = parseInt(req.query.page) || 1;
  const pageSize = 20;
  const totalPages = Math.ceil(allItems.length / pageSize);
  const start = (page - 1) * pageSize;
  const items = allItems.slice(start, start + pageSize);
  
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>列表分页 · 第${page}页</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50">
  <div class="max-w-7xl mx-auto p-4">
    <h1 class="text-3xl font-bold mb-6">列表分页浏览</h1>
    <p class="text-gray-600 mb-6">共 ${allItems.length} 个品类 · 第 ${page}/${totalPages} 页</p>
    
    <div class="flex gap-2 mb-6">
      <a href="/?view=grid" class="px-4 py-2 bg-gray-200 rounded">卡片折叠</a>
      <a href="/?view=list" class="px-4 py-2 bg-blue-600 text-white rounded">列表分页</a>
    </div>
    
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="w-full">
        <thead class="bg-gray-100">
          <tr>
            <th class="p-3 text-left">三级品类</th>
            <th class="p-3 text-left">一级分类</th>
            <th class="p-3 text-left">二级分类</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr class="border-t">
              <td class="p-3">${item.l3}</td>
              <td class="p-3">${item.l1}</td>
              <td class="p-3">${item.l2}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      
      <!-- 分页 -->
      <div class="p-4 border-t flex justify-center gap-2">
        ${page > 1 ? `<a href="/?view=list&page=${page-1}" class="px-3 py-1 border rounded">上一页</a>` : ''}
        ${Array.from({length: Math.min(5, totalPages)}, (_, i) => {
          const p = i + 1;
          return p === page ? 
            `<span class="px-3 py-1 bg-blue-600 text-white rounded">${p}</span>` :
            `<a href="/?view=list&page=${p}" class="px-3 py-1 border rounded">${p}</a>`;
        }).join('')}
        ${page < totalPages ? `<a href="/?view=list&page=${page+1}" class="px-3 py-1 border rounded">下一页</a>` : ''}
      </div>
    </div>
  </div>
</body>
</html>`;
  
  return html;
}

// 启动服务器
loadData();
app.listen(PORT, () => {
  console.log(`🚀 三级目录服务已启动: http://localhost:${PORT}/`);
  console.log(`📊 数据统计: 一级${STATS.level1} · 二级${STATS.level2} · 三级${STATS.level3}`);
});
