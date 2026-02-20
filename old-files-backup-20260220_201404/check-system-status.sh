#!/bin/bash

# 系统状态监控脚本
# 实时查看最佳商品智能评测系统状态

echo "🔍 最佳商品智能评测系统 - 状态监控"
echo "=========================================="
echo "检查时间: $(date)"
echo ""

# 检查各服务状态
check_service() {
    local port=$1
    local name=$2
    local url=$3
    
    echo "📊 $name (端口$port):"
    
    # 检查端口是否监听
    if lsof -i :$port > /dev/null 2>&1; then
        echo "   ✅ 服务进程: 运行中"
        
        # 尝试访问服务
        status_code=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$port/$url" 2>/dev/null || echo "000")
        
        if [[ $status_code =~ ^(200|302|301)$ ]]; then
            echo "   ✅ HTTP访问: 正常 (状态码: $status_code)"
            
            # 获取特定服务的额外信息
            case $port in
                3076)
                    # 首页统计
                    stats=$(curl -s "http://localhost:3076/api/stats" 2>/dev/null || echo "{}")
                    if echo "$stats" | grep -q "bestProductsCount"; then
                        count=$(echo "$stats" | grep -o '"bestProductsCount":[0-9]*' | cut -d: -f2)
                        echo "   📈 最佳商品统计: ${count:-0}款"
                    fi
                    ;;
                3078)
                    # 自动化系统统计
                    stats=$(curl -s "http://localhost:3078/api/stats" 2>/dev/null || echo "{}")
                    if echo "$stats" | grep -q "processed"; then
                        processed=$(echo "$stats" | grep -o '"processed":[0-9]*' | cut -d: -f2)
                        total=$(echo "$stats" | grep -o '"total":[0-9]*' | cut -d: -f2)
                        echo "   ⚙️  处理进度: ${processed:-0}/${total:-0}"
                    fi
                    ;;
                3079)
                    # 真实数据采集统计
                    stats=$(curl -s "http://localhost:3079/api/stats" 2>/dev/null || echo "{}")
                    if echo "$stats" | grep -q "processedCategories"; then
                        processed=$(echo "$stats" | grep -o '"processedCategories":[0-9]*' | cut -d: -f2)
                        total=$(echo "$stats" | grep -o '"totalCategories":[0-9]*' | cut -d: -f2)
                        echo "   🛒 数据采集: ${processed:-0}/${total:-0}"
                    fi
                    ;;
                3080)
                    # 智能评测系统统计
                    stats=$(curl -s "http://localhost:3080/api/stats" 2>/dev/null || echo "{}")
                    if echo "$stats" | grep -q "categories_evaluated"; then
                        evaluated=$(echo "$stats" | grep -o '"categories_evaluated":[0-9]*' | cut -d: -f2)
                        echo "   🧠 智能评测: ${evaluated:-0}个品类"
                        echo "   📊 评测维度: 7大维度"
                    fi
                    ;;
            esac
            
        else
            echo "   ⚠️  HTTP访问: 异常 (状态码: $status_code)"
        fi
        
    else
        echo "   ❌ 服务进程: 未运行"
    fi
    
    echo ""
}

# 检查所有服务
check_service 3076 "首页" ""
check_service 3077 "详情页" "category/%E4%B8%AA%E6%8A%A4%E5%81%A5%E5%BA%B7/%E5%89%83%E9%A1%BB%E7%94%A8%E5%93%81/%E4%B8%80%E6%AC%A1%E6%80%A7%E5%89%83%E9%A1%BB%E5%88%80"
check_service 3078 "自动化系统" "admin"
check_service 3079 "真实数据采集" "admin"
check_service 3080 "智能评测系统" "admin"

# 检查数据文件
echo "📁 数据文件状态:"
echo "------------------------------------------"

check_file() {
    local file=$1
    local name=$2
    
    if [[ -f "$file" ]]; then
        size=$(ls -lh "$file" | awk '{print $5}')
        if [[ -s "$file" ]]; then
            if [[ "$file" == *.json ]]; then
                count=$(jq length "$file" 2>/dev/null || echo "?")
                echo "   ✅ $name: 存在 (大小: $size, 记录数: ${count})"
            else
                echo "   ✅ $name: 存在 (大小: $size)"
            fi
        else
            echo "   ⚠️  $name: 存在但为空"
        fi
    else
        echo "   ❌ $name: 不存在"
    fi
}

check_file "data/best-answers.json" "最佳商品数据库"
check_file "data/global-categories-expanded.json" "品类数据库"
check_file "data/evaluation-rules.json" "评测规则数据库"

echo ""
echo "📈 系统整体状态:"
echo "------------------------------------------"

# 统计运行中的服务数量
running_services=0
total_services=5

for port in 3076 3077 3078 3079 3080; do
    if lsof -i :$port > /dev/null 2>&1; then
        ((running_services++))
    fi
done

if [[ $running_services -eq $total_services ]]; then
    echo "   ✅ 所有服务正常运行 ($running_services/$total_services)"
    echo "   🎉 系统状态: 优秀"
elif [[ $running_services -ge 3 ]]; then
    echo "   ⚠️  部分服务运行 ($running_services/$total_services)"
    echo "   🔧 系统状态: 良好"
else
    echo "   ❌ 多数服务异常 ($running_services/$total_services)"
    echo "   🚨 系统状态: 需要检查"
fi

echo ""
echo "🔗 快速访问链接:"
echo "------------------------------------------"
echo "   1. 智能评测管理: http://localhost:3080/admin"
echo "   2. 首页: http://localhost:3076"
echo "   3. 详情页示例: http://localhost:3076/category/个护健康/剃须用品/一次性剃须刀"
echo "   4. 真实数据采集: http://localhost:3079/admin"
echo "   5. 自动化管理: http://localhost:3078/admin"

echo ""
echo "🚀 重启系统: ./start-complete-system.sh"
echo "=========================================="