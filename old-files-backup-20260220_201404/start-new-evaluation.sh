#!/bin/bash

# BestGoods新方法评选系统 - 快速启动脚本
# 基于Python方案的核心理念，适配到Node.js环境

echo "🚀 启动BestGoods新方法评选系统"
echo "========================================"

# 检查Node.js版本
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ 需要Node.js 16或更高版本，当前版本: $(node -v)"
    exit 1
fi
echo "✅ Node.js版本: $(node -v)"

# 检查数据文件
DATA_FILE="data/best-answers.json"
if [ ! -f "$DATA_FILE" ]; then
    echo "❌ 数据文件不存在: $DATA_FILE"
    exit 1
fi
echo "✅ 数据文件: $DATA_FILE"

# 检查API密钥配置
if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "⚠️  警告: 未设置DEEPSEEK_API_KEY环境变量"
    echo ""
    echo "💡 设置方法:"
    echo "   1. 获取DeepSeek API密钥: https://platform.deepseek.com/api_keys"
    echo "   2. 临时设置: export DEEPSEEK_API_KEY=your_key_here"
    echo "   3. 永久设置: 添加到 ~/.bashrc 或 ~/.zshrc"
    echo ""
    echo "或者直接在代码中修改:"
    echo "   编辑 new-method-evaluator.js，修改 CONFIG.DEEPSEEK_API_KEY"
    echo ""
    read -p "是否继续？(y/n): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✅ DeepSeek API密钥已设置"
fi

# 安装依赖
echo ""
echo "📦 检查依赖..."
if [ ! -f "package.json" ]; then
    echo "创建package.json..."
    cat > package.json << EOF
{
  "name": "bestgoods-new-method",
  "version": "1.0.0",
  "description": "BestGoods新方法评选系统",
  "main": "new-method-evaluator.js",
  "scripts": {
    "start": "node new-method-evaluator.js",
    "test": "node new-method-evaluator.js --test",
    "monitor": "node monitor-progress.js"
  },
  "dependencies": {
    "axios": "^1.6.0",
    "openai": "^4.0.0"
  }
}
EOF
fi

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo "安装依赖包..."
    npm install axios openai
    if [ $? -ne 0 ]; then
        echo "❌ 依赖安装失败"
        exit 1
    fi
    echo "✅ 依赖安装完成"
else
    echo "✅ 依赖已安装"
fi

# 显示系统状态
echo ""
echo "📊 系统状态检查:"
node -e "
const fs = require('fs');
try {
    const data = JSON.parse(fs.readFileSync('data/best-answers.json', 'utf8'));
    const total = data.length;
    const pending = data.filter(c => c.evaluationStatus === 'pending' || !c.evaluationStatus).length;
    const completed = data.filter(c => c.evaluationStatus === 'completed').length;
    const hasProducts = data.filter(c => c.bestProducts && c.bestProducts.length > 0).length;
    
    console.log(\`   总品类数: \${total}\`);
    console.log(\`   待评价品类: \${pending}\`);
    console.log(\`   已完成评价: \${completed}\`);
    console.log(\`   有商品数据的品类: \${hasProducts}\`);
    console.log(\`   进度: \${((completed + hasProducts) / total * 100).toFixed(1)}%\`);
} catch(e) {
    console.log('   数据读取失败:', e.message);
}
"

# 显示配置选项
echo ""
echo "⚙️  运行选项:"
echo "   1. 测试模式 (处理前3个品类)"
echo "   2. 小批量处理 (10个品类)"
echo "   3. 自定义批次处理"
echo "   4. 显示帮助信息"
echo "   5. 退出"
echo ""

read -p "请选择 (1-5): " choice

case $choice in
    1)
        echo "🧪 启动测试模式..."
        node new-method-evaluator.js --test
        ;;
    2)
        echo "📦 启动小批量处理..."
        node new-method-evaluator.js --batch-size 10 --workers 3
        ;;
    3)
        read -p "输入批次大小 (默认10): " batch_size
        read -p "输入并发数 (默认3): " workers
        batch_size=\${batch_size:-10}
        workers=\${workers:-3}
        echo "🚀 启动自定义处理: 批次大小=$batch_size, 并发数=$workers"
        node new-method-evaluator.js --batch-size $batch_size --workers $workers
        ;;
    4)
        node new-method-evaluator.js --help
        ;;
    5)
        echo "退出"
        exit 0
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac

# 显示处理结果
echo ""
echo "========================================"
echo "📋 处理完成！"
echo ""
echo "💡 下一步建议:"
echo "   1. 检查处理结果:"
echo "      node -e \"const fs=require('fs');const d=JSON.parse(fs.readFileSync('data/best-answers.json','utf8'));const c=d.filter(x=>x.bestProducts&&x.bestProducts.length>0);console.log('已评选品类:', c.length);if(c.length>0)console.log('示例:', c[0].item, '-', c[0].bestProducts.length, '个商品');\""
echo ""
echo "   2. 启动BestGoods服务器查看结果:"
echo "      node server-final-complete.js  # 或你当前使用的服务器文件"
echo ""
echo "   3. 配置自动化处理:"
echo "      编辑 cron 任务定期运行评选程序"
echo ""
echo "   4. 质量验证:"
echo "      随机抽查评选结果，验证数据准确性"
echo "========================================"