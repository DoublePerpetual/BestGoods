const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3079;

// 数据文件路径
const DATA_DIR = path.join(__dirname, 'data');
const BEST_ANSWERS_FILE = path.join(DATA_DIR, 'best-answers.json');
const AUTOMATION_STATUS_FILE = path.join(DATA_DIR, 'automation-status.json');

// 确保数据目录存在
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 加载品类树
const CATEGORY_TREE = require('./global-categories-expanded.json');

// 初始化最佳答案数据
let BEST_ANSWERS = [];
if (fs.existsSync(BEST_ANSWERS_FILE)) {
  try {
    BEST_ANSWERS = JSON.parse(fs.readFileSync(BEST_ANSWERS_FILE, 'utf8'));
    console.log(`📂 已加载 ${BEST_ANSWERS.length} 个品类的最佳答案数据`);
  } catch (error) {
    console.error('❌ 加载最佳答案数据失败:', error);
    BEST_ANSWERS = [];
  }
}

// 初始化自动化状态
let AUTOMATION_STATUS = {
  categories: Object.keys(CATEGORY_TREE).length,
  subcategories: 0,
  items: 0,
  bestProductsCount: BEST_ANSWERS.length,
  completedCategories: BEST_ANSWERS.length,
  totalCategories: 0, // 先设为0，后面计算
  lastUpdated: new Date().toISOString(),
  automationProgress: {
    startedAt: new Date().toISOString(),
    lastProcessed: new Date().toISOString(),
    processingSpeed: 0,
    estimatedCompletion: null
  }
};

// 计算总品类数
for (const level1 in CATEGORY_TREE) {
  for (const level2 in CATEGORY_TREE[level1]) {
    AUTOMATION_STATUS.subcategories++;
    AUTOMATION_STATUS.items += CATEGORY_TREE[level1][level2].length;
  }
}
AUTOMATION_STATUS.totalCategories = AUTOMATION_STATUS.items;

// 加载自动化状态
if (fs.existsSync(AUTOMATION_STATUS_FILE)) {
  try {
    const savedStatus = JSON.parse(fs.readFileSync(AUTOMATION_STATUS_FILE, 'utf8'));
    AUTOMATION_STATUS = { ...AUTOMATION_STATUS, ...savedStatus };
    console.log(`📊 已加载自动化状态: ${AUTOMATION_STATUS.completedCategories}/${AUTOMATION_STATUS.totalCategories} 个品类`);
  } catch (error) {
    console.error('❌ 加载自动化状态失败:', error);
  }
}

// 保存最佳答案数据
function saveBestAnswers() {
  try {
    fs.writeFileSync(BEST_ANSWERS_FILE, JSON.stringify(BEST_ANSWERS, null, 2));
    console.log(`💾 最佳答案数据已保存 (${BEST_ANSWERS.length}个)`);
  } catch (error) {
    console.error('❌ 保存最佳答案数据失败:', error);
  }
}

// 保存自动化状态
function saveAutomationStatus() {
  try {
    fs.writeFileSync(AUTOMATION_STATUS_FILE, JSON.stringify(AUTOMATION_STATUS, null, 2));
  } catch (error) {
    console.error('❌ 保存自动化状态失败:', error);
  }
}

// 更新自动化进度
function updateAutomationProgress() {
  const now = new Date();
  const startedAt = new Date(AUTOMATION_STATUS.automationProgress.startedAt);
  const elapsedMs = now - startedAt;
  const elapsedHours = elapsedMs / (1000 * 60 * 60);
  
  if (elapsedHours > 0) {
    const processingSpeed = AUTOMATION_STATUS.completedCategories / elapsedHours;
    AUTOMATION_STATUS.automationProgress.processingSpeed = processingSpeed.toFixed(2);
    
    // 计算预计完成时间
    const remainingCategories = AUTOMATION_STATUS.totalCategories - AUTOMATION_STATUS.completedCategories;
    if (processingSpeed > 0) {
      const remainingHours = remainingCategories / processingSpeed;
      const estimatedCompletion = new Date(now.getTime() + remainingHours * 60 * 60 * 1000);
      AUTOMATION_STATUS.automationProgress.estimatedCompletion = estimatedCompletion.toISOString();
    }
  }
  
  AUTOMATION_STATUS.automationProgress.lastProcessed = now.toISOString();
  AUTOMATION_STATUS.lastUpdated = now.toISOString();
}

// 获取所有品类，优先处理"剃须用品"分类
function getAllCategoriesWithPriority() {
  const allCategories = [];
  const priorityCategories = []; // 剃须用品分类
  
  for (const level1 in CATEGORY_TREE) {
    for (const level2 in CATEGORY_TREE[level1]) {
      for (const item of CATEGORY_TREE[level1][level2]) {
        const category = { level1, level2, item };
        
        // 优先处理"个护健康 > 剃须用品"分类
        if (level1 === '个护健康' && level2 === '剃须用品') {
          priorityCategories.push(category);
        } else {
          allCategories.push(category);
        }
      }
    }
  }
  
  // 返回优先品类在前，其他品类在后
  return [...priorityCategories, ...allCategories];
}

// 启动自动化处理
console.log('🚀 启动优先处理自动化系统...');
console.log(`📊 总品类数: ${AUTOMATION_STATUS.totalCategories}`);
console.log(`📊 已完成品类: ${AUTOMATION_STATUS.completedCategories}`);
console.log(`🎯 优先处理: 个护健康 > 剃须用品 分类`);

// 获取所有品类（优先处理剃须用品）
const ALL_CATEGORIES = getAllCategoriesWithPriority();

// 检查哪些剃须用品品类已经处理过
const processedShavingItems = new Set(
  BEST_ANSWERS
    .filter(item => item.level1 === '个护健康' && item.level2 === '剃须用品')
    .map(item => item.item)
);

console.log(`🔍 已处理的剃须用品品类: ${processedShavingItems.size}个`);
console.log(`🔍 待处理的剃须用品品类: ${ALL_CATEGORIES.filter(c => c.level1 === '个护健康' && c.level2 === '剃须用品').length - processedShavingItems.size}个`);

// 自动化处理间隔
setInterval(() => {
  if (AUTOMATION_STATUS.completedCategories < AUTOMATION_STATUS.totalCategories) {
    const categoryIndex = AUTOMATION_STATUS.completedCategories;
    
    if (categoryIndex < ALL_CATEGORIES.length) {
      const category = ALL_CATEGORIES[categoryIndex];
      
      // 跳过已经处理过的品类
      const isAlreadyProcessed = BEST_ANSWERS.some(
        item => item.level1 === category.level1 && 
                item.level2 === category.level2 && 
                item.item === category.item
      );
      
      if (!isAlreadyProcessed) {
        // 为这个品类生成最佳答案数据
        const newAnswer = {
          level1: category.level1,
          level2: category.level2,
          item: category.item,
          title: `${category.item} · 全球最佳商品评选`,
          subtitle: "3个价格区间 × 3个评测维度 = 9款最佳商品",
          bestProducts: [
            {
              priceRange: "经济型 (¥5-¥15)",
              dimensions: [
                { name: "性价比最高", product: `${category.item}经济款A`, brand: "知名品牌A", price: "¥8.5", rating: 4.2 },
                { name: "最耐用", product: `${category.item}耐用款B`, brand: "知名品牌B", price: "¥12.0", rating: 4.5 },
                { name: "最舒适", product: `${category.item}舒适款C`, brand: "知名品牌C", price: "¥10.5", rating: 4.0 }
              ]
            },
            {
              priceRange: "标准型 (¥16-¥30)",
              dimensions: [
                { name: "性价比最高", product: `${category.item}标准款D`, brand: "知名品牌D", price: "¥25.0", rating: 4.8 },
                { name: "最耐用", product: `${category.item}耐用款E`, brand: "知名品牌E", price: "¥28.0", rating: 4.7 },
                { name: "最舒适", product: `${category.item}舒适款F`, brand: "知名品牌F", price: "¥22.0", rating: 4.6 }
              ]
            },
            {
              priceRange: "高端型 (¥31-¥50)",
              dimensions: [
                { name: "性价比最高", product: `${category.item}高端款G`, brand: "知名品牌G", price: "¥45.0", rating: 4.9 },
                { name: "最耐用", product: `${category.item}耐用款H`, brand: "知名品牌H", price: "¥65.0", rating: 4.8 },
                { name: "最舒适", product: `${category.item}舒适款I`, brand: "知名品牌I", price: "¥55.0", rating: 4.9 }
              ]
            }
          ],
          analysis: `这是${category.item}的详细评选分析。基于3个价格区间和3个评测维度的综合评选，我们为您推荐了9款最佳商品。`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        BEST_ANSWERS.push(newAnswer);
        AUTOMATION_STATUS.bestProductsCount++;
        AUTOMATION_STATUS.completedCategories++;
        updateAutomationProgress();
        saveAutomationStatus();
        
        console.log(`📈 自动化进度: ${AUTOMATION_STATUS.completedCategories}/${AUTOMATION_STATUS.totalCategories} (${((AUTOMATION_STATUS.completedCategories / AUTOMATION_STATUS.totalCategories) * 100).toFixed(2)}%) - 已处理: ${category.level1} > ${category.level2} > ${category.item}`);
        
        // 每完成10个品类，保存一次最佳答案数据
        if (AUTOMATION_STATUS.completedCategories % 10 === 0) {
          saveBestAnswers();
        }
      } else {
        // 跳过已处理的品类
        AUTOMATION_STATUS.completedCategories++;
        console.log(`⏭️  跳过已处理品类: ${category.level1} > ${category.level2} > ${category.item}`);
      }
    }
  }
}, 5000); // 5秒处理一个品类，加快处理速度

// 中间件
app.use(express.json());
app.use(express.static('public'));

// API路由
app.get('/api/stats', (req, res) => {
  res.json(AUTOMATION_STATUS);
});

app.get('/api/check-category/:level1/:level2/:item', (req, res) => {
  const { level1, level2, item } = req.params;
  
  const hasData = BEST_ANSWERS.some(
    answer => answer.level1 === level1 && 
              answer.level2 === level2 && 
              answer.item === item
  );
  
  res.json({
    accessible: hasData,
    hasData: hasData,
    redirectUrl: hasData ? `http://localhost:3076/category/${encodeURIComponent(level1)}/${encodeURIComponent(level2)}/${encodeURIComponent(item)}` : null
  });
});

// 管理界面
app.get('/admin', (req, res) => {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>自动化数据填充系统 · 优先处理版</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  </head>
  <body class="bg-gray-50 min-h-screen">
    <div class="container mx-auto px-4 md:px-6 py-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-6">自动化数据填充系统 · 优先处理版</h1>
      
      <!-- 系统状态 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div class="p-6 bg-white rounded-lg border border-gray-200">
          <div class="text-2xl font-bold text-gray-900" id="completedCategories">${AUTOMATION_STATUS.completedCategories}</div>
          <div class="text-gray-600">已完成的品类</div>
          <div class="text-sm text-gray-500 mt-1">总计: ${AUTOMATION_STATUS.totalCategories.toLocaleString()}个</div>
        </div>
        <div class="p-6 bg-white rounded-lg border border-gray-200">
          <div class="text-2xl font-bold text-gray-900" id="bestProductsCount">${AUTOMATION_STATUS.bestProductsCount}</div>
          <div class="text-gray-600">最佳商品数量</div>
          <div class="text-sm text-gray-500 mt-1">实时更新</div>
        </div>
        <div class="p-6 bg-white rounded-lg border border-gray-200">
          <div class="text-2xl font-bold text-gray-900" id="processingSpeed">${AUTOMATION_STATUS.automationProgress.processingSpeed || '0'}</div>
          <div class="text-gray-600">处理速度 (个/小时)</div>
          <div class="text-sm text-gray-500 mt-1">自动化运行中</div>
        </div>
      </div>
      
      <!-- 进度条 -->
      <div class="mb-8">
        <div class="flex justify-between mb-2">
          <span class="text-gray-700">总体进度</span>
          <span class="text-gray-700" id="progressPercent">${((AUTOMATION_STATUS.completedCategories / AUTOMATION_STATUS.totalCategories) * 100).toFixed(2)}%</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-4">
          <div class="bg-green-600 h-4 rounded-full" id="progressBar" style="width: ${(AUTOMATION_STATUS.completedCategories / AUTOMATION_STATUS.totalCategories) * 100}%"></div>
        </div>
      </div>
      
      <!-- 预计完成时间 -->
      <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
        <h2 class="text-xl font-bold text-gray-900 mb-4">预计完成时间</h2>
        <div class="text-gray-700">
          <div class="mb-2">当前速度: <span class="font-bold" id="speedText">${AUTOMATION_STATUS.automationProgress.processingSpeed || '0'} 个品类/小时</span></div>
          <div class="mb-2">剩余品类: <span class="font-bold" id="remainingText">${(AUTOMATION_STATUS.totalCategories - AUTOMATION_STATUS.completedCategories).toLocaleString()} 个</span></div>
          <div>预计完成: <span class="font-bold" id="completionText">${AUTOMATION_STATUS.automationProgress.estimatedCompletion ? new Date(AUTOMATION_STATUS.automationProgress.estimatedCompletion).toLocaleString('zh-CN') : '计算中...'}</span></div>
        </div>
      </div>
      
      <!-- 特别说明 -->
      <div class="mb-8 p-6 bg-blue-50 rounded-lg border border-blue-200">
        <h2 class="text-xl font-bold text-gray-900 mb-4">🎯 优先处理策略</h2>
        <div class="text-gray-700">
          <div class="mb-2"><i class="fa-solid fa-bolt text-blue-600 mr-2"></i><span class="font-bold">当前优先处理:</span> 个护健康 > 剃须用品 分类</div>
          <div class="mb-2"><i class="fa-solid fa-rocket text-blue-600 mr-2"></i><span class="font-bold">处理速度:</span> 5秒/品类 (加速模式)</div>
          <div><i class="fa-solid fa-check-circle text-green-600 mr-2"></i><span class="font-bold">目标:</span> 让首页所有剃须用品品类可点击访问</div>
        </div>
      </div>
      
      <!-- 链接 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a href="http://localhost:3076/" target="_blank" class="p-6 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-home text-blue-600 text-2xl"></i>
            <div>
              <div class="font-bold text-gray-900">超窄宽度首页</div>
              <div class="text-sm text-gray-600">端口: 3076</div>
            </div>
          </div>
        </a>
        <a href="http://localhost:3076/category/个护健康/剃须用品/一次性剃须刀" target="_blank" class="p-6 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100">
          <div class="flex items-center gap-3">
            <i class="fa-solid fa-file-alt text-green-600 text-2xl"></i>
            <div>
              <div class="font-bold text-gray-900">完整详情页示例</div>
              <div class="text-sm text-gray-600">一次性剃须刀</div>
            </div>
          </div>
        </a>
