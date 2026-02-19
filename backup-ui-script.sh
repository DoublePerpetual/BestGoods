#!/bin/bash

echo "📁 UI界面定稿备份脚本"
echo "======================"

# 创建UI定稿备份目录
UI_BACKUP_DIR="./ui-final-backup/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$UI_BACKUP_DIR"

echo "🔧 备份目录: $UI_BACKUP_DIR"

# 备份所有相关文件
echo "📋 备份文件列表:"

# 1. 服务器文件
cp server-complete-website.js "$UI_BACKUP_DIR/"
echo "   ✅ server-complete-website.js"

cp server-finalized-all-categories.js "$UI_BACKUP_DIR/"
echo "   ✅ server-finalized-all-categories.js"

# 2. 数据文件
mkdir -p "$UI_BACKUP_DIR/data"
if [ -d "./data" ]; then
    cp -r ./data/* "$UI_BACKUP_DIR/data/" 2>/dev/null || true
    echo "   ✅ 数据文件"
fi

# 3. 自动化程序
cp auto-data-generator.js "$UI_BACKUP_DIR/"
echo "   ✅ auto-data-generator.js"

# 4. 启动脚本
cp start-complete-website.sh "$UI_BACKUP_DIR/"
echo "   ✅ start-complete-website.sh"

# 5. 创建README文档
cat > "$UI_BACKUP_DIR/README.md" << 'EOF'
# UI界面定稿备份

## 备份信息
- 备份时间: $(date)
- 版本: 最终定稿版
- 端口: 3060

## 系统功能
1. **完整网站架构**
   - 首页: 显示245,317个品类统计
   - 三级目录: 分类浏览
   - 详情页: 动态数据展示

2. **UI设计特点**
   - 最佳评选结果单独线框
   - 详细评选分析无外框（避免线框太多）
   - 评论功能完整
   - 字体大小优化
   - 统一灰色调设计
   - 响应式布局

3. **动态功能**
   - 详情页数据完成状态检测
   - 实时统计更新
   - 24小时自动化数据录入

## 文件说明
- `server-complete-website.js`: 主服务器文件
- `server-finalized-all-categories.js`: 详情页UI模板
- `auto-data-generator.js`: 自动化数据生成程序
- `start-complete-website.sh`: 启动脚本
- `data/`: 数据库文件

## 启动命令
```bash
chmod +x start-complete-website.sh
./start-complete-website.sh
```

## 访问地址
- 首页: http://localhost:3060/
- API统计: http://localhost:3060/api/stats
- 示例详情页: http://localhost:3060/category/个护健康/剃须用品/一次性剃须刀

## 修改记录
此版本为UI定稿版本，除非用户明确要求，不再进行大的UI修改。
EOF

echo "   ✅ README.md"

# 创建恢复脚本
cat > "$UI_BACKUP_DIR/restore-ui.sh" << 'EOF'
#!/bin/bash

echo "🔄 恢复UI定稿版本"

# 检查当前目录
if [ ! -f "server-complete-website.js" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

# 备份当前文件
CURRENT_BACKUP="./backup_before_restore_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$CURRENT_BACKUP"
cp server-complete-website.js "$CURRENT_BACKUP/" 2>/dev/null || true
cp server-finalized-all-categories.js "$CURRENT_BACKUP/" 2>/dev/null || true
echo "✅ 当前文件已备份到: $CURRENT_BACKUP"

# 恢复文件
cp server-complete-website.js ../
cp server-finalized-all-categories.js ../
cp auto-data-generator.js ../
cp start-complete-website.sh ../

echo "✅ UI定稿版本恢复完成"
echo "🚀 启动命令: ./start-complete-website.sh"
EOF

chmod +x "$UI_BACKUP_DIR/restore-ui.sh"
echo "   ✅ restore-ui.sh"

echo ""
echo "🎉 UI界面定稿备份完成！"
echo ""
echo "📋 备份内容:"
echo "   1. 服务器文件 (主服务器 + UI模板)"
echo "   2. 数据文件 (数据库结构)"
echo "   3. 自动化程序 (24小时数据生成)"
echo "   4. 启动脚本 (一键启动)"
echo "   5. 恢复脚本 (快速恢复)"
echo ""
echo "📁 备份位置: $UI_BACKUP_DIR"
echo ""
echo "⚠️  重要提示:"
echo "   此版本为UI定稿版本，已适配所有245,317个品类详情页。"
echo "   除非用户明确要求，不再进行大的UI修改调整。"
echo ""
echo "✅ 备份完成，可以开始大规模数据生成了！"