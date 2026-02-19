const express = require('express');
const app = express();
const PORT = 3060;

// 模拟三级目录数据
const CATEGORY_TREE = {
  '个护健康': {
    icon: 'fa-heart',
    region: 'china',
    children: {
      '剃须用品': {
        icon: 'fa-razor',
        dimensions: ['性价比最高', '最耐用', '最舒适'],
        items: ['一次性剃须刀', '电动剃须刀', '剃须膏', '剃须刷', '剃须刀片', '剃须套装']
      },
      '护肤品': {
        icon: 'fa-spa',
        dimensions: ['最保湿', '最温和', '最有效'],
        items: ['面霜', '精华液', '面膜', '爽肤水', '眼霜', '防晒霜']
      },
      '口腔护理': {
        icon: 'fa-tooth',
        dimensions: ['最清洁', '最美白', '最舒适'],
        items: ['牙膏', '牙刷', '漱口水', '牙线', '电动牙刷', '牙贴']
      }
    }
  },
  '家居生活': {
    icon: 'fa-home',
    region: 'china',
    children: {
      '厨房用品': {
        icon: 'fa-utensils',
        dimensions: ['最耐用', '最安全', '最易清洁'],
        items: ['不粘锅', '菜刀', '砧板', '炒锅', '汤锅', '厨房剪刀']
      },
      '清洁工具': {
        icon: 'fa-broom',
        dimensions: ['最有效', '最耐用', '最环保'],
        items: ['拖把', '扫帚', '垃圾桶', '清洁剂', '抹布', '清洁刷']
      },
      '家具': {
        icon: 'fa-couch',
        dimensions: ['最舒适', '最耐用', '最美观'],
        items: ['沙发', '床', '桌子', '椅子', '书架', '衣柜']
      }
    }
  },
  '数码电子': {
    icon: 'fa-laptop',
    region: 'global',
    children: {
      '手机配件': {
        icon: 'fa-mobile',
        dimensions: ['最兼容', '最耐用', '最快速'],
        items: ['充电宝', '手机壳', '数据线', '充电器', '耳机', '屏幕保护膜']
      },
      '电脑外设': {
        icon: 'fa-keyboard',
        dimensions: ['最舒适', '最灵敏', '最耐用'],
        items: ['键盘', '鼠标', '显示器', '音箱', '摄像头', '麦克风']
      },
      '智能设备': {
        icon: 'fa-robot',
        dimensions: ['最智能', '最稳定', '最易用'],
        items: ['智能音箱', '智能手表', '智能灯泡', '智能插座', '智能门锁', '智能摄像头']
      }
    }
  },
  '服装鞋帽': {
    icon: 'fa-tshirt',
    region: 'global',
    children: {
      '运动服饰': {
        icon: 'fa-running',
        dimensions: ['最舒适', '最透气', '最耐用'],
        items: ['跑步鞋', '运动T恤', '运动裤', '运动外套', '运动袜', '运动内衣']
      },
      '男女装': {
        icon: 'fa-user-tie',
        dimensions: ['最时尚', '最舒适', '最耐穿'],
        items: ['衬衫', '裤子', '外套', '裙子', '毛衣', '大衣']
      },
      '鞋类': {
        icon: 'fa-shoe-prints',
        dimensions: ['最舒适', '最耐用', '最时尚'],
        items: ['皮鞋', '运动鞋', '拖鞋', '凉鞋', '靴子', '帆布鞋']
      }
    }
  },
  '食品饮料': {
    icon: 'fa-utensils',
    region: 'china',
    children: {
      '零食': {
        icon: 'fa-cookie',
        dimensions: ['最美味', '最健康', '最实惠'],
        items: ['薯片', '巧克力', '饼干', '坚果', '糖果', '果冻']
      },
      '饮料': {
        icon: 'fa-glass-whiskey',
        dimensions: ['最解渴', '最健康', '最美味'],
        items: ['矿泉水', '果汁', '茶饮料', '碳酸饮料', '功能饮料', '咖啡']
      },
      '调味品': {
        icon: 'fa-pepper-hot',
        dimensions: ['最美味', '最健康', '最实用'],
        items: ['酱油', '醋', '盐', '糖', '味精', '辣椒酱']
      }
    }
  },
  '运动户外': {
    icon: 'fa-basketball-ball',
    region: 'global',
    children: {
      '健身器材': {
        icon: 'fa-dumbbell',
        dimensions: ['最安全', '最有效', '最耐用'],
        items: ['瑜伽垫', '哑铃', '跑步机', '健身车', '拉力器', '跳绳']
      },
      '户外装备': {
        icon: 'fa-campground',
        dimensions: ['最耐用', '最轻便', '最安全'],
        items: ['帐篷', '睡袋', '登山杖', '背包', '头灯', '水壶']
      },
      '运动服饰': {
        icon: 'fa-running',
        dimensions: ['最舒适', '最透气', '最专业'],
        items: ['运动服', '运动鞋', '运动帽', '运动手套', '运动护具', '运动袜']
      }
    }
  }
};

// 统计数据
let stats = {
  totalCategories: 245317,
  completedCategories: 7,
  bestProductsCount: 63,
  lastUpdated: new Date().toISOString()
};

// 首页 - 包含完整一二三级目录结构的版本
app.get('/', (req, res) => {
  const { level1 = 'all', level2 = 'all', search = '', view = 'grid', region = 'all' } = req.query;
  
  // 计算总商品数量
  let totalItems = 0;
  Object.values(CATEGORY_TREE).forEach(l1Data => {
    Object.values(l1Data.children).forEach(l2Data => {
      totalItems += l2Data.items.length;
    });
  });
  
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>全球最佳商品百科全书</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 md:px-6 py-8">
    <!-- 顶部统计 -->
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <h1 class="text-3xl font-bold text-gray-900 mb-4">全球最佳商品百科全书</h1>
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">${stats.totalCategories.toLocaleString()}</div>
          <div class="text-gray-600">个总品类</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">${Object.keys(CATEGORY_TREE).length}</div>
          <div class="text-gray-600">个一级分类</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900">${Object.values(CATEGORY_TREE).reduce((sum, l1) => sum + Object.keys(l1.children).length, 0)}</div>
          <div class="text-gray-600">个二级分类</div>
        </div>
        <div class="p-4 bg-gray-50 rounded-lg">
          <div class="text-2xl font-bold text-gray-900" id="bestProductsCount">${stats.bestProductsCount}</div>
          <div class="text-gray-600">款最佳商品</div>
        </div>
      </div>
    </div>
    
    <!-- 搜索框 -->
    <div class="mb-8">
      <div class="relative">
        <input type="text" id="searchInput" placeholder="搜索${totalItems}个商品..." 
               class="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
               value="${search}">
        <i class="fa-solid fa-search absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
      </div>
    </div>
    
    <!-- 一级目录导航 -->
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-4">一级分类</h2>
      <div class="flex flex-wrap gap-3">
        <a href="/?level1=all&level2=all&search=${search}" 
           class="px-4 py-2.5 rounded-lg text-sm font-medium ${level1 === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}">
          全部一级
        </a>
        ${Object.keys(CATEGORY_TREE).map(l1 => {
          const l1Data = CATEGORY_TREE[l1];
          return `
            <a href="/?level1=${encodeURIComponent(l1)}&level2=all&search=${search}" 
               class="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${level1 === l1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}">
              <i class="fa-solid ${l1Data.icon}"></i>${l1}
              <span class="text-xs opacity-75">${Object.keys(l1Data.children).length}个二级</span>
            </a>
          `;
        }).join('')}
      </div>
    </div>
    
    <!-- 二级目录导航 -->
    ${level1 !== 'all' && CATEGORY_TREE[level1] ? `
      <div class="mb-6">
        <h2 class="text-xl font-bold text-gray-900 mb-4">二级分类</h2>
        <div class="flex flex-wrap gap-3">
          <a href="/?level1=${level1}&level2=all&search=${search}" 
             class="px-4 py-2.5 rounded-lg text-sm font-medium ${level2 === 'all' ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}">
            全部二级
          </a>
          ${Object.keys(CATEGORY_TREE[level1].children).map(l2 => {
            const l2Data = CATEGORY_TREE[level1].children[l2];
            return `
              <a href="/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(l2)}&search=${search}" 
                 class="px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 ${level2 === l2 ? 'bg-purple-600 text-white' : 'bg-white text-gray-700 border border-gray-200'}">
                <i class="fa-solid ${l2Data.icon || 'fa-folder'}"></i>${l2}
                <span class="text-xs opacity-75">${l2Data.items.length}个商品</span>
              </a>
            `;
          }).join('')}
        </div>
      </div>
    ` : ''}
    
    <!-- 三级目录内容 -->
    <div class="mt-8">
      <h2 class="text-xl font-bold text-gray-900 mb-4">三级商品目录</h2>
      
      ${(() => {
        const level1s = level1 === 'all' ? Object.keys(CATEGORY_TREE) : [level1];
        let content = '';
        
        level1s.forEach(l1 => {
          const l1Data = CATEGORY_TREE[l1];
          const level2s = level2 === 'all' ? Object.keys(l1Data.children) : [level2];
          
          level2s.forEach(l2 => {
            const l2Data = l1Data.children[l2];
            if (!l2Data) return;
            
            // 过滤搜索
            let items = l2Data.items;
            if (search) {
              items = items.filter(item => item.toLowerCase().includes(search.toLowerCase()));
            }
            if (items.length === 0) return;
            
            content += `
              <div class="mb-8 bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div class="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 class="text-lg font-bold text-gray-800 flex items-center gap-3">
                    <i class="fa-solid ${l1Data.icon} text-blue-500"></i>
                    <span>${l1}</span>
                    <i class="fa-solid fa-chevron-right text-gray-400"></i>
                    <i class="fa-solid ${l2Data.icon || 'fa-folder'} text-purple-500"></i>
                    <span>${l2}</span>
                    <span class="text-sm font-normal text-gray-500 ml-auto">${items.length}个商品</span>
                  </h3>
                </div>
                <div class="p-6">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            `;
            
            items.forEach(item => {
              const hasData = ['一次性剃须刀', '不粘锅', '充电宝'].includes(item);
              
              content += `
                <div onclick="${hasData ? `location.href='/category/${encodeURIComponent(l1)}/${encodeURIComponent(l2)}/${encodeURIComponent(item)}'` : ''}" 
                     class="p-4 bg-white rounded-lg border ${hasData ? 'border-green-200 cursor-pointer hover:shadow-md' : 'border-gray-200 opacity-70'}">
                  <div class="flex justify-between items-start mb-2">
                    <span class="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">${l2Data.dimensions?.length || 0}个维度</span>
                    ${hasData ? '<span class="text-xs text-green-600">✅ 有数据</span>' : '<span class="text-xs text-gray-400">⏳ 准备中</span>'}
                  </div>
                  <h4 class="font-bold text-gray-900">${item}</h4>
                  <p class="text-xs text-gray-500 mt-1">${l1} > ${l2} > ${item}</p>
                  <div class="mt-3 flex flex-wrap gap-1">
                    ${(l2Data.dimensions || []).slice(0, 3).map(d => `<span class="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">${d}</span>`).join('')}
                  </div>
                </div>
              `;
            });
            
            content += `
                  </div>
                </div>
              </div>
            `;
          });
        });
        
        return content || '<div class="text-center py-12 text-gray-500">没有找到相关商品</div>';
      })()}
    </div>
  </div>
  
  <script>
    // 实时更新统计数字
    function updateStats() {
      fetch('/api/stats')
        .then(response => response.json())
        .then(data => {
          document.getElementById('bestProductsCount').textContent = data.bestProductsCount;
        });
    }
    
    // 每10秒更新一次
    setInterval(updateStats, 10000);
    
    // 搜索功能
    document.getElementById('searchInput').addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        const query = this.value.trim();
        const urlParams = new URLSearchParams(window.location.search);
        urlParams.set('search', query);
        window.location.href = '/?' + urlParams.toString();
      }
    });
  </script>
</body>
</html>`;
  
  res.send(html);
});

// API：获取统计数据
app.get('/api/stats', (req, res) => {
  // 模拟数据增长
  if (Math.random() > 0.9) {
    stats.completedCategories += 1;
    stats.bestProductsCount = stats.completedCategories * 9;
  }
  stats.lastUpdated = new Date().toISOString();
  
  res.json(stats);
});

// 详情页
app.get('/category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  // 检查是否是可访问的品类
  const hasData = ['一次性剃须刀', '不粘锅', '充电宝'].includes(item);
  
  if (!hasData) {
    // 不可访问的品类
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item} · 数据准备中</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
</head>
<body class="bg-gray-50 min-h-screen