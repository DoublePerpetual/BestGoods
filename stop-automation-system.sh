#!/bin/bash

echo "🛑 停止AI创新平台 · 自动化数据填充系统"
echo "=========================================="

echo "🔍 停止首页服务器（3076端口）..."
pkill -f "node.*server-ultra-narrow-homepage.js" 2>/dev/null

echo "🔍 停止详情页服务器（3077端口）..."
pkill -f "node.*server-detail-complete.js" 2>/dev/null

echo "🔍 停止自动化系统（3078端口）..."
pkill -f "node.*server-automation-system.js" 2>/dev/null

sleep 2

echo ""
echo "✅ 系统已停止"
echo ""
echo "📊 检查进程状态："
ps aux | grep -E "server-ultra-narrow-homepage|server-detail-complete|server-automation-system" | grep -v grep