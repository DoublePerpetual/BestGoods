# 245,317个品类数据库设置指南

## 🎯 项目目标
建立完整的245,317个品类数据库，为后续的评选工作打下基础。

## 📊 品类结构
- **一级分类**: 49个
- **二级分类**: 3,525个  
- **三级品类**: 245,317个
- **最终评选数量**: 245,317 × x(价格区间) × y(评选维度)

## 🗄️ 数据库要求

### 1. 数据库选择
**推荐**: MySQL 8.0+ 或 MariaDB 10.5+
**原因**: 
- 支持大量数据的高效存储和查询
- 成熟的索引和优化机制
- 良好的Node.js支持

### 2. 硬件要求
| 资源 | 最低要求 | 推荐配置 |
|------|----------|----------|
| CPU | 4核心 | 8核心+ |
| 内存 | 8GB | 16GB+ |
| 存储 | 50GB | 100GB+ |
| 网络 | 100Mbps | 1Gbps |

### 3. 数据库配置
```sql
-- 创建数据库
CREATE DATABASE bestgoods_245k CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户
CREATE USER 'bestgoods_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON bestgoods_245k.* TO 'bestgoods_user'@'localhost';
FLUSH PRIVILEGES;

-- 优化配置 (my.cnf)
[mysqld]
innodb_buffer_pool_size = 4G
innodb_log_file_size = 512M
max_connections = 200
query_cache_size = 128M
```

## 🚀 快速开始

### 1. 安装依赖
```bash
cd /Users/surferboy/Desktop/BestGoods
npm install mysql2 sequelize dotenv
```

### 2. 配置环境变量
创建 `.env` 文件：
```env
# 数据库配置
DB_NAME=bestgoods_245k
DB_USER=bestgoods_user
DB_PASSWORD=your_secure_password
DB_HOST=localhost
DB_PORT=3306

# 运行环境
NODE_ENV=production
```

### 3. 初始化数据库
```bash
# 运行导入脚本
node import-245k-categories.js
```

### 4. 监控导入进度
脚本会自动显示进度：
```
📦 处理批次 1/50 (5000个品类)
   ✅ 成功导入 5000 个品类
   累计: 5000/245317 (2.04%)
```

## 📈 预计时间和资源

### 导入时间估算
| 批次大小 | 预计批次 | 预计时间 | 说明 |
|----------|----------|----------|------|
| 5,000个/批 | 50批 | 2-3小时 | 推荐配置 |
| 10,000个/批 | 25批 | 1-2小时 | 高性能配置 |
| 1,000个/批 | 246批 | 6-8小时 | 低配置环境 |

### 存储空间估算
| 数据 | 估算大小 | 说明 |
|------|----------|------|
| 品类数据 | 500MB-1GB | 245,317条记录 |
| 索引 | 300MB-500MB | 多字段索引 |
| 价格区间 | 1-2GB | 每个品类x个区间 |
| 评选维度 | 1-2GB | 每个品类y个维度 |
| 评选结果 | 10-20GB | 245,317×x×y条记录 |
| **总计** | **13-25GB** | 完整数据库 |

## 🔧 高级配置

### 1. 分布式导入（可选）
如果单机性能不足，可以使用分布式导入：
```javascript
// 分片导入示例
const shards = [
    { start: 0, end: 50000 },
    { start: 50000, end: 100000 },
    // ... 更多分片
];

// 在不同机器上并行运行
```

### 2. 增量导入
支持中断后继续导入：
```bash
# 检查进度
node import-245k-categories.js --verify-only

# 继续导入（如果中断）
node import-245k-categories.js --resume
```

### 3. 数据验证
```bash
# 验证数据完整性
node -e "
const { verifyImport } = require('./import-245k-categories.js');
verifyImport().then(console.log);
"
```

## 🛠️ 故障排除

### 常见问题
1. **数据库连接失败**
   ```
   Error: connect ECONNREFUSED
   ```
   **解决**: 检查MySQL服务是否运行，用户权限是否正确

2. **内存不足**
   ```
   FATAL ERROR: Ineffective mark-compacts near heap limit
   ```
   **解决**: 减小批次大小 `--batch-size 1000`

3. **导入速度慢**
   **解决**: 
   - 优化MySQL配置
   - 增加 `innodb_buffer_pool_size`
   - 使用SSD存储

4. **重复导入**
   **解决**: 脚本会自动跳过重复记录，使用唯一索引

### 监控命令
```bash
# 查看数据库状态
mysql -u bestgoods_user -p -e "SHOW PROCESSLIST;"

# 查看表大小
mysql -u bestgoods_user -p bestgoods_245k -e "
SELECT 
    table_name AS '表名',
    ROUND(((data_length + index_length) / 1024 / 1024), 2) AS '大小(MB)',
    table_rows AS '行数'
FROM information_schema.TABLES 
WHERE table_schema = 'bestgoods_245k'
ORDER BY (data_length + index_length) DESC;
"

# 查看导入进度
mysql -u bestgoods_user -p bestgoods_245k -e "
SELECT * FROM import_progress ORDER BY id DESC LIMIT 1;
"
```

## 📋 后续步骤

### 第一步完成后
1. ✅ 品类数据库建立 (245,317个品类)
2. 🔄 价格区间设置 (为每个品类设置x个区间)
3. 🔄 评选维度设置 (为每个品类设置y个维度)
4. 🔄 最佳商品评选 (245,317 × x × y个结果)

### 自动化脚本
```bash
# 完整的自动化流程
./setup-245k-database.sh    # 第一步：建立品类数据库
./setup-price-ranges.sh     # 第二步：设置价格区间
./setup-dimensions.sh       # 第三步：设置评选维度
./start-evaluation.sh       # 第四步：开始评选
```

## 🎯 成功标准

### 第一阶段成功标准
- [ ] 245,317个品类全部导入数据库
- [ ] 数据完整性验证通过
- [ ] 查询性能达标（<100ms）
- [ ] 建立完整的监控体系

### 质量检查
```sql
-- 检查数据完整性
SELECT 
    COUNT(DISTINCT level1) as level1_count,
    COUNT(DISTINCT level2) as level2_count,
    COUNT(*) as total_categories
FROM categories_245k;

-- 检查状态分布
SELECT status, COUNT(*) as count
FROM categories_245k
GROUP BY status;

-- 检查重复数据
SELECT full_path, COUNT(*) as duplicates
FROM categories_245k
GROUP BY full_path
HAVING duplicates > 1;
```

## 📞 支持

### 紧急恢复
```bash
# 1. 停止导入
按 Ctrl+C

# 2. 备份当前状态
mysqldump -u bestgoods_user -p bestgoods_245k > backup-$(date +%s).sql

# 3. 检查进度
node import-245k-categories.js --verify-only

# 4. 继续导入
node import-245k-categories.js
```

### 性能优化建议
1. **数据库优化**: 定期优化表，清理碎片
2. **索引优化**: 为常用查询字段建立索引
3. **查询优化**: 使用分页查询，避免全表扫描
4. **缓存策略**: 使用Redis缓存热点数据

---

**开始时间**: 2026年2月19日 01:06  
**目标完成**: 245,317个品类数据库建立  
**下一步**: 价格区间和评选维度设置