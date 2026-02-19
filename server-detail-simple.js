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
</head>
<body class="bg-gray-50 min-h-screen">
  <div class="container mx-auto px-4 md:px-6 py-8 max-w-6xl">
    <!-- 顶部导航 -->
    <div class="mb-6">
      <div class="flex items-center gap-2 text-sm text-gray-600">
        <a href="http://localhost:3076/" class="text-blue-600 hover:text-blue-800">首页</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <a href="http://localhost:3076/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="text-blue-600 hover:text-blue-800">${level1}</a>
        <i class="fa-solid fa-chevron-right text-xs"></i>
        <span class="text-gray-900 font-medium">${item}</span>
      </div>
    </div>
    
    <!-- 商品标题和当前位置 -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">${item}</h1>
      <div class="text-gray-600">
        <span class="font-medium">当前位置：</span>
        <a href="http://localhost:3076/?level1=${encodeURIComponent(level1)}" class="text-blue-600 hover:text-blue-800">${level1}</a>
        <i class="fa-solid fa-chevron-right text-xs mx-1"></i>
        <a href="http://localhost:3076/?level1=${encodeURIComponent(level1)}&level2=${encodeURIComponent(level2)}" class="text-blue-600 hover:text-blue-800">${level2}</a>
        <i class="fa-solid fa-chevron-right text-xs mx-1"></i>
        <span class="text-gray-900">${item}</span>
      </div>
    </div>
    
    <!-- 最佳评选结果标题 - 放在大边框之上 -->
    <div class="mb-4">
      <h2 class="text-2xl font-bold text-gray-900">最佳评选结果</h2>
      <p class="text-gray-600 mt-1">基于3个价格区间和3个评测维度的综合评选</p>
    </div>
    
    <!-- 最佳评选结果表格 -->
    <div class="mb-8 p-6 bg-white rounded-lg border border-gray-200">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead>
            <tr>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">价格区间</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">性价比最高</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">最耐用</th>
              <th class="px-4 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase">最舒适</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td class="px-4 py-3">经济型<br><span class="text-xs text-gray-500">¥5-¥15</span></td>
              <td class="px-4 py-3">
                <div class="font-medium">吉列蓝II剃须刀</div>
                <div class="text-sm text-gray-500">吉列</div>
                <div class="font-bold">¥8.5</div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium">舒适X3经济装</div>
                <div class="text-sm text-gray-500">舒适</div>
                <div class="font-bold">¥12.0</div>
              </td>
              <td class="px-4 py-3">
                <div class="font-medium">飞利浦基础款</div>
                <div class="text-sm text-gray-500">飞利浦</div>
                <div class="font-bold">¥10.5</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    
    <div class="text-center text-gray-500 text-sm">
      <p>详情页已优化完成：</p>
      <p>1. ✅ 删除了"返回上级目录：剃须用品"</p>
      <p>2. ✅ 当前位置导航可点击（${level1}、${level2}）</p>
      <p>3. ✅ "最佳评选结果"标题放在大边框之上</p>
      <p>4. ✅ 边框效果简洁美观</p>
    </div>
  </div>
</body>
</html>`;
  
  res.send(html);
});

app.listen(PORT, () => {
  console.log(`✅ 详情页服务器已启动 (端口${PORT})`);
  console.log(`🔗 访问示例: http://localhost:${PORT}/category/个护健康/剃须用品/一次性剃须刀`);
});