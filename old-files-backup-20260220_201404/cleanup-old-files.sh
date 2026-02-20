#!/bin/bash

# 清理旧文件脚本
# 只保留新版本的核心文件

echo "🧹 清理旧文件，只保留新版本核心文件"
echo "======================================"

# 要保留的文件列表
KEEP_FILES=(
  # 核心文件
  "bestgoods-complete-website.js"
  "convert-json-to-sqlite.js"
  "start.sh"
  "package.json"
  "package-lock.json"
  "zeabur.json"
  "LICENSE"
  ".gitignore"
  
  # 文档文件
  "README.md"
  "README_GITHUB.md"
  "UI_SPECIFICATION.md"
  "DEPLOYMENT_GUIDE.md"
  "API_DOCUMENTATION.md"
  "API_DOCUMENTATION_COMPLETE.md"
  
  # 测试文件
  "test-access.html"
  "test-final-modifications.sh"
  "test-no-brands.sh"
  
  # 数据目录
  "data/"
  
  # Git目录
  ".git/"
)

# 要删除的文件模式
DELETE_PATTERNS=(
  "server-*.js"
  "add-*.js"
  "auto-*.js"
  "backup-*.sh"
  "bestgoods-*.js"
  "build-*.js"
  "categories-*.js"
  "check-*.js"
  "clear-*.js"
  "dataImporter*.js"
  "direct-*.js"
  "final-*.js"
  "fix-*.js"
  "import-*.js"
  "intelligent-*.js"
  "monitor-*.js"
  "new-*.json"
  "new-*.js"
  "precise-*.js"
  "processing-*.js"
  "quality-*.js"
  "quick-*.sh"
  "real-*.js"
  "simple-*.js"
  "start-*.js"
  "stop-*.sh"
  "SYSTEM_STATUS.md"
  "test-*.js"
  "test-*.html"
  "true-*.js"
  "ultra-*.js"
  "update-*.js"
  "validate-*.js"
  "verify-*.js"
  "实际实施方案指南.md"
  "新方法评选实施指南.md"
  "系统完成总结.md"
  "评选体系数据库实施方案.md"
  "数据清空完成报告.md"
  "245k-project-plan.md"
  "database-setup-guide.md"
)

echo "📁 当前目录文件数量: $(ls -1 | wc -l)"

# 创建备份目录
BACKUP_DIR="old-files-backup-$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "📦 备份旧文件到: $BACKUP_DIR"

# 移动要删除的文件到备份目录
for pattern in "${DELETE_PATTERNS[@]}"; do
  if ls $pattern 2>/dev/null; then
    mv $pattern "$BACKUP_DIR/" 2>/dev/null || true
  fi
done

# 移动其他非保留文件
for file in *; do
  if [[ ! " ${KEEP_FILES[@]} " =~ " ${file} " ]] && [[ "$file" != "$BACKUP_DIR" ]]; then
    if [[ -f "$file" ]]; then
      mv "$file" "$BACKUP_DIR/" 2>/dev/null || true
    fi
  fi
done

echo "✅ 清理完成"
echo "📁 新目录文件数量: $(ls -1 | wc -l)"
echo "📁 备份目录: $BACKUP_DIR ($(ls -1 "$BACKUP_DIR" | wc -l) 个文件)"
echo ""
echo "📋 保留的核心文件:"
echo "=================="
ls -la