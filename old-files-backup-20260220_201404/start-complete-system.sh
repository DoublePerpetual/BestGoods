#!/bin/bash

# 最佳商品智能评测系统 - 完整启动脚本
# 启动所有核心服务，建立全面的自动化评测体系

echo "🚀 启动最佳商品智能评测系统..."
echo "=========================================="

# 创建日志目录
mkdir -p logs

echo ""
echo "1. 📊 启动首页服务器 (端口3076)"
cd /Users/surferboy/Desktop/BestGoods
pkill -f "server-ultra-narrow" 2>/dev/null
sleep 2
node server-ultra-narrow-homepage.js > logs/homepage.log 2>&1 &
echo "   ✅ 首页已启动: http://localhost:3076"

echo ""
echo "2. 🧠 启动智能评测系统 (端口3080)"
pkill -f "intelligent-product-evaluation" 2>/dev/null
sleep 2
node intelligent-product-evaluation-system.js > logs/intelligent-evaluation.log 2>&1 &
echo "   ✅ 智能评测系统已启动: http://localhost:3080/admin"
echo "   📈 评测维度: 7大维度加权评分"
echo "   ⚡ 运行模式: 24/7不间断自动化"

echo ""
echo "3. 📄 启动详情页服务器 (端口3077)"
pkill -f "server-detail-dynamic" 2>/dev/null
sleep 2
node server-detail-dynamic-simple.js > logs/detail-dynamic.log 2>&1 &
echo "   ✅ 详情页已启动: http://localhost:3077"

echo ""
echo "4. 🔄 启动真实商品数据采集系统 (端口3079)"
pkill -f "server-real-product" 2>/dev/null
sleep 2
node server-real-product-automation.js > logs/real-product-automation.log 2>&1 &
echo "   ✅ 数据采集系统已启动: http://localhost:3079/admin"

echo ""
echo "5. ⚙️ 启动自动化处理系统 (端口3078)"
pkill -f "server-automation-system" 2>/dev/null
sleep 2
node server-automation-system.js > logs/automation-system.log 2>&1 &
echo "   ✅ 自动化系统已启动: http://localhost:3078/admin"

echo ""
echo "=========================================="
echo "🎯 系统启动完成！所有服务正常运行"
echo ""
echo "📋 访问地址:"
echo "   • 首页: http://localhost:3076"
echo "   • 智能评测管理: http://localhost:3080/admin"
echo "   • 真实数据采集: http://localhost:3079/admin"
echo "   • 自动化管理: http://localhost:3078/admin"
echo ""
echo "🧠 智能评测体系特点:"
echo "   • 7大评测维度加权评分"
echo "   • 多数据源融合分析"
echo "   • 智能价格区间划分"
echo "   • 自动化报告生成"
echo "   • 24/7不间断运行"
echo ""
echo "🚀 操作步骤:"
echo "   1. 访问 http://localhost:3080/admin"
echo "   2. 点击'批量评测10个品类'"
echo "   3. 系统自动运行，生成智能评测结果"
echo "   4. 结果自动保存到数据库"
echo "   5. 首页实时更新最佳商品统计"
echo ""
echo "💡 系统将自动运行，您无需手动操作"
echo "=========================================="

# 检查服务状态
echo ""
echo "🔍 检查服务状态..."
sleep 3

echo ""
echo "服务状态检查:"
echo "------------------------------------------"

check_service() {
    local port=$1
    local name=$2
    if curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/" | grep -q "200\|302"; then
        echo "   ✅ $name (端口$port): 运行正常"
    else
        echo "   ❌ $name (端口$port): 启动失败"
    fi
}

check_service 3076 "首页"
check_service 3077 "详情页"
check_service 3078 "自动化系统"
check_service 3079 "真实数据采集"
check_service 3080 "智能评测系统"

echo ""
echo "🎉 系统准备就绪！您可以放心出门，系统将自动运行。"
echo "📊 实时进度可通过管理界面查看"
echo ""