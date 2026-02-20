#!/bin/bash

# BestGoods 启动脚本
# 用于本地开发和Zeabur部署

set -e

echo "🚀 启动 BestGoods 全球最佳商品评选系统"
echo "======================================"

# 检查Node.js版本
NODE_VERSION=$(node --version | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)

if [ "$NODE_MAJOR" -lt 18 ]; then
    echo "❌ 错误: Node.js 版本需要 >= 18.0.0，当前版本: $NODE_VERSION"
    exit 1
fi

echo "✅ Node.js 版本: $NODE_VERSION"

# 检查端口是否被占用
PORT=${PORT:-3076}
if lsof -ti:$PORT > /dev/null 2>&1; then
    echo "⚠️  端口 $PORT 已被占用，尝试停止占用进程..."
    lsof -ti:$PORT | xargs kill -9 2>/dev/null || true
    sleep 2
fi

# 安装依赖
echo "📦 安装依赖..."
npm install --production

# 检查数据库文件
if [ ! -f "data/bestgoods.db" ]; then
    echo "🗃️  数据库文件不存在，正在从JSON重新创建..."
    if [ -f "convert-json-to-sqlite.js" ]; then
        node convert-json-to-sqlite.js
    else
        echo "❌ 错误: 数据库转换脚本不存在"
        exit 1
    fi
fi

# 检查数据库大小
DB_SIZE=$(stat -f%z data/bestgoods.db 2>/dev/null || stat -c%s data/bestgoods.db 2>/dev/null)
if [ "$DB_SIZE" -lt 1000000 ]; then
    echo "⚠️  数据库文件可能不完整，大小: $DB_SIZE 字节"
    echo "正在重新创建数据库..."
    node convert-json-to-sqlite.js
fi

echo "✅ 数据库检查完成，大小: $(($DB_SIZE/1024/1024))MB"

# 启动服务器
echo "🚀 启动服务器..."
echo "🌐 访问地址: http://localhost:$PORT"
echo "📊 健康检查: http://localhost:$PORT/health"
echo ""
echo "📋 服务器日志:"
echo "=============="

# 设置环境变量并启动
NODE_ENV=production PORT=$PORT node bestgoods-complete-website.js