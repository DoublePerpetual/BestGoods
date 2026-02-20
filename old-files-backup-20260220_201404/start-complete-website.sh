#!/bin/bash

echo "🚀 启动全球最佳商品百科全书完整网站"

# 创建备份目录
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📁 创建备份: $BACKUP_DIR"

# 备份重要文件
cp server-complete-website.js "$BACKUP_DIR/"
cp server-finalized-all-categories.js "$BACKUP_DIR/"
cp auto-data-generator.js "$BACKUP_DIR/"

echo "✅ 文件备份完成"

# 初始化数据目录
mkdir -p ./data

# 启动网站服务器
echo "🌐 启动网站服务器 (端口 3060)..."
node server-complete-website.js &

# 等待服务器启动
sleep 3

# 检查服务器状态
if curl -s http://localhost:3060/ > /dev/null; then
    echo "✅ 网站服务器启动成功"
    echo "🔗 访问地址: http://localhost:3060/"
else
    echo "❌ 网站服务器启动失败"
    exit 1
fi

# 启动自动化数据生成程序（后台运行）
echo "🤖 启动自动化数据生成程序..."
node auto-data-generator.js > auto-generator.log 2>&1 &

echo "📊 自动化程序日志: auto-generator.log"

# 显示状态信息
echo ""
echo "=========================================="
echo "🎉 全球最佳商品百科全书已成功启动！"
echo "=========================================="
echo ""
echo "📊 系统功能:"
echo "   1. 完整网站架构 - 首页 + 三级目录 + 详情页"
echo "   2. 动态详情页 - 数据已完成的品类可访问，未完成的显示准备中"
echo "   3. 实时统计 - 245,317个品类 · X款最佳商品（实时更新）"
echo "   4. 自动化数据录入 - 24小时不间断为所有品类生成数据"
echo "   5. UI定稿 - 所有品类详情页使用统一优化界面"
echo ""
echo "🔗 重要链接:"
echo "   - 首页: http://localhost:3060/"
echo "   - 示例详情页: http://localhost:3060/category/个护健康/剃须用品/一次性剃须刀"
echo "   - API统计: http://localhost:3060/api/stats"
echo ""
echo "📁 备份位置: $BACKUP_DIR"
echo "📝 自动化日志: auto-generator.log"
echo ""
echo "⚠️  注意:"
echo "   - 自动化程序会持续运行，为所有品类生成数据"
echo "   - 详情页会根据数据完成状态动态显示"
echo "   - 统计数字会实时更新"
echo ""
echo "✅ 系统已就绪，开始24小时不间断工作！"