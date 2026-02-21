#!/bin/bash

# Zeabur部署修复验证脚本
# 验证所有Zeabur反馈的问题是否已修复

echo "🔍 开始验证Zeabur部署修复..."
echo "=========================================="

# 检查Dockerfile修复
echo "📋 检查Dockerfile修复..."
echo "------------------------------------------"

# 1. 检查sqlite3编译依赖
if grep -q "apk add --no-cache python3 make g++ curl" Dockerfile; then
    echo "✅ sqlite3编译依赖已添加"
else
    echo "❌ sqlite3编译依赖缺失"
fi

# 2. 检查健康检查使用curl
if grep -q "curl -f http://localhost:3076/health" Dockerfile; then
    echo "✅ 健康检查使用curl (Alpine兼容)"
else
    echo "❌ 健康检查未使用curl"
fi

# 3. 检查启动延迟
if grep -q "start-period=10s" Dockerfile; then
    echo "✅ 启动延迟设置为10s"
else
    echo "❌ 启动延迟未设置"
fi

# 4. 检查启动命令
if grep -q 'CMD \["node", "bestgoods-complete-website.js"\]' Dockerfile; then
    echo "✅ 启动命令指向正确文件"
else
    echo "❌ 启动命令文件错误"
fi

echo ""
echo "📋 检查服务器代码修复..."
echo "------------------------------------------"

# 1. 检查监听地址
if grep -q "app.listen(PORT, '0.0.0.0'" bestgoods-complete-website.js; then
    echo "✅ 监听地址为'0.0.0.0' (外部可访问)"
else
    echo "❌ 监听地址不是'0.0.0.0'"
fi

# 2. 检查端口配置
if grep -q "const PORT = process.env.PORT || 3076;" bestgoods-complete-website.js; then
    echo "✅ 端口配置支持环境变量"
else
    echo "❌ 端口配置不支持环境变量"
fi

# 3. 检查数据库路径
if grep -q "mkdir -p data" Dockerfile; then
    echo "✅ 数据目录创建命令存在"
else
    echo "❌ 数据目录创建命令缺失"
fi

echo ""
echo "📋 检查zeabur.json配置..."
echo "------------------------------------------"

# 检查zeabur.json
if [ -f "zeabur.json" ]; then
    echo "✅ zeabur.json配置文件存在"
    
    # 检查端口配置
    if grep -q '"PORT": "3076"' zeabur.json; then
        echo "✅ zeabur.json端口配置正确"
    else
        echo "❌ zeabur.json端口配置错误"
    fi
    
    # 检查健康检查配置
    if grep -q '"path": "/health"' zeabur.json; then
        echo "✅ zeabur.json健康检查路径正确"
    else
        echo "❌ zeabur.json健康检查路径错误"
    fi
else
    echo "❌ zeabur.json配置文件缺失"
fi

echo ""
echo "📋 验证本地运行..."
echo "------------------------------------------"

# 测试本地运行
echo "停止当前运行的服务器..."
pkill -f "node.*bestgoods" 2>/dev/null || true

echo "启动服务器测试..."
node bestgoods-complete-website.js &
SERVER_PID=$!
sleep 3

# 检查服务器是否运行
if ps -p $SERVER_PID > /dev/null; then
    echo "✅ 服务器启动成功 (PID: $SERVER_PID)"
    
    # 测试健康检查
    if curl -s http://localhost:3076/health | grep -q "healthy"; then
        echo "✅ 健康检查端点正常"
    else
        echo "❌ 健康检查端点异常"
    fi
    
    # 测试首页访问
    if curl -s -o /dev/null -w "%{http_code}" http://localhost:3076/ | grep -q "200"; then
        echo "✅ 首页访问正常"
    else
        echo "❌ 首页访问异常"
    fi
    
    # 停止测试服务器
    kill $SERVER_PID 2>/dev/null
    echo "测试服务器已停止"
else
    echo "❌ 服务器启动失败"
fi

echo ""
echo "=========================================="
echo "📊 修复验证完成"
echo ""
echo "🚀 部署建议:"
echo "1. 在Zeabur中重新部署项目"
echo "2. 检查Zeabur控制台的'网路'设置"
echo "3. 确保端口3076已正确配置"
echo "4. 查看部署日志确认无错误"
echo ""
echo "🔧 如果仍有502错误，请检查:"
echo "   - Zeabur控制台的端口映射"
echo "   - 数据库文件权限"
echo "   - 环境变量配置"
echo ""
echo "📞 支持信息:"
echo "   - GitHub仓库: https://github.com/DoublePerpetual/BestGoods"
echo "   - 所有修复已提交到main分支"
echo "   - 使用最新代码重新部署即可"