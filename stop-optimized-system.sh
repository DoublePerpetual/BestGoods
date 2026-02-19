#!/bin/bash

echo "🛑 停止优化后的AI创新平台系统"
echo "=========================================="

echo "🔍 停止首页服务器（3076端口）..."
pkill -f "node.*server-ultra-narrow-homepage.js" 2>/dev/null

echo "🔍 停止详情页服务器（3077端口）..."
pkill -f "node.*server-simple-detail-optimized.js" 2>/dev/null

sleep 2

echo ""
echo "✅ 系统已停止"
echo ""
echo "📊 检查进程状态："
ps aux | grep -E "server-ultra-narrow-homepage|server-perfect-detail-optimized" | grep -v grep