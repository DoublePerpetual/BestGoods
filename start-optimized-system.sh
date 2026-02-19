#!/bin/bash

echo "🚀 启动优化后的AI创新平台系统"
echo "=========================================="

# 检查是否已有进程在运行
echo "🔍 检查现有进程..."
pkill -f "node.*server-ultra-narrow-homepage.js" 2>/dev/null
pkill -f "node.*server-perfect-detail-optimized.js" 2>/dev/null
sleep 2

# 启动首页服务器（3076端口）
echo ""
echo "📱 启动首页服务器（端口3076）..."
node server-ultra-narrow-homepage.js &
HOME_PID=$!
sleep 3

# 启动详情页服务器（3077端口）
echo ""
echo "📄 启动详情页服务器（端口3077）..."
node server-simple-detail-optimized.js &
DETAIL_PID=$!
sleep 3

echo ""
echo "✅ 系统启动完成！"
echo "=========================================="
echo ""
echo "🔗 访问链接："
echo "   1. 超窄宽度首页: http://localhost:3076/"
echo "   2. 优化详情页示例: http://localhost:3076/category/个护健康/剃须用品/一次性剃须刀"
echo ""
echo "🎯 优化功能："
echo "   1. ✅ 首页进一步缩窄宽度（1000-1200px）"
echo "   2. ✅ 详情页删除了'返回上级目录：剃须用品'"
echo "   3. ✅ 当前位置导航可点击（个护健康、剃须用品）"
echo "   4. ✅ '最佳评选结果'标题放在大边框之上"
echo "   5. ✅ 投票功能优化：认可/不认可按钮显示总数量"
echo "   6. ✅ 投票逻辑：用户只能选一个，点击另一个会取消之前的"
echo ""
echo "📊 系统状态："
echo "   首页服务器PID: $HOME_PID"
echo "   详情页服务器PID: $DETAIL_PID"
echo ""
echo "🛑 停止系统：按 Ctrl+C 或运行 ./stop-optimized-system.sh"
echo ""

# 等待用户中断
wait $HOME_PID $DETAIL_PID