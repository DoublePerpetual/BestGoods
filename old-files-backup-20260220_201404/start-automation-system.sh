#!/bin/bash

echo "🚀 启动AI创新平台 · 自动化数据填充系统"
echo "=========================================="

# 检查是否已有进程在运行
echo "🔍 检查现有进程..."
pkill -f "node.*server-ultra-narrow-homepage.js" 2>/dev/null
pkill -f "node.*server-detail-complete.js" 2>/dev/null
pkill -f "node.*server-automation-system.js" 2>/dev/null
sleep 2

# 创建数据目录
echo ""
echo "📁 创建数据目录..."
mkdir -p data
mkdir -p logs
mkdir -p backups

# 启动首页服务器（3076端口）
echo ""
echo "📱 启动首页服务器（端口3076）..."
node server-ultra-narrow-homepage.js > logs/homepage.log 2>&1 &
HOME_PID=$!
sleep 3

# 启动详情页服务器（3077端口）
echo ""
echo "📄 启动详情页服务器（端口3077）..."
node server-detail-complete.js > logs/detail.log 2>&1 &
DETAIL_PID=$!
sleep 3

# 启动自动化系统（3078端口）
echo ""
echo "🤖 启动自动化数据填充系统（端口3078）..."
node server-automation-system.js > logs/automation.log 2>&1 &
AUTO_PID=$!
sleep 3

echo ""
echo "✅ 系统启动完成！"
echo "=========================================="
echo ""
echo "🔗 访问链接："
echo "   1. 超窄宽度首页: http://localhost:3076/"
echo "   2. 完整详情页示例: http://localhost:3076/category/个护健康/剃须用品/一次性剃须刀"
echo "   3. 自动化系统管理界面: http://localhost:3078/admin"
echo ""
echo "🎯 系统功能："
echo "   1. ✅ 首页全局搜索24.5万个品类"
echo "   2. ✅ 详情页完整展示9个商品评选"
echo "   3. ✅ 自动化填充24万多品类数据"
echo "   4. ✅ 实时统计更新"
echo "   5. ✅ 动态品类状态检查"
echo ""
echo "📊 自动化进度："
echo "   - 每30秒处理一个品类"
echo "   - 数据实时同步到前端"
echo "   - 页面刷新即可看到更新"
echo "   - 最佳商品数量自动增加"
echo ""
echo "🔄 数据同步流程："
echo "   1. 自动化系统填充品类数据"
echo "   2. 首页实时检查品类状态"
echo "   3. 已完成数据的品类变为可点击"
echo "   4. 最佳商品数量自动更新"
echo ""
echo "📋 进程状态："
echo "   首页服务器PID: $HOME_PID"
echo "   详情页服务器PID: $DETAIL_PID"
echo "   自动化系统PID: $AUTO_PID"
echo ""
echo "📝 日志文件："
echo "   - logs/homepage.log (首页日志)"
echo "   - logs/detail.log (详情页日志)"
echo "   - logs/automation.log (自动化系统日志)"
echo ""
echo "🛑 停止系统：运行 ./stop-automation-system.sh"
echo ""

# 等待用户中断
wait $HOME_PID $DETAIL_PID $AUTO_PID