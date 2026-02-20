# BestGoods 部署指南

## 📋 概述

本文档提供BestGoods系统的完整部署指南，包括本地开发环境、测试环境和生产环境的部署步骤。

## 🛠️ 系统要求

### 硬件要求
- **内存**: 最低2GB，推荐4GB+
- **存储**: 最低100MB可用空间（数据库68MB）
- **CPU**: 现代双核处理器

### 软件要求
- **操作系统**: macOS, Linux, Windows (WSL2)
- **Node.js**: >= 18.0.0
- **npm**: >= 8.0.0
- **SQLite3**: 系统自带或单独安装

### 网络要求
- **端口**: 3076（可配置）
- **防火墙**: 允许3076端口访问

## 🚀 快速开始

### 1. 下载项目
```bash
# 克隆项目或下载压缩包
git clone <repository-url>
cd bestgoods-final-complete-documentation-20260220_1917
```

### 2. 安装依赖
```bash
npm install
```

### 3. 启动服务器
```bash
node bestgoods-complete-website.js
```

### 4. 验证启动
```bash
# 检查服务器状态
curl http://localhost:3076/health

# 或在浏览器中访问
# http://localhost:3076/
```

## 📦 完整部署流程

### 步骤1：环境准备
```bash
# 1.1 检查Node.js版本
node --version  # 需要 >= 18.0.0

# 1.2 检查npm版本
npm --version   # 需要 >= 8.0.0

# 1.3 创建项目目录
mkdir -p /opt/bestgoods
cd /opt/bestgoods
```

### 步骤2：部署项目文件
```bash
# 2.1 复制所有文件到部署目录
cp -r /path/to/bestgoods-final-complete-documentation-20260220_1917/* /opt/bestgoods/

# 2.2 设置文件权限
chmod +x /opt/bestgoods/start.sh
chmod +x /opt/bestgoods/stop.sh
chmod +x /opt/bestgoods/test-final-modifications.sh
```

### 步骤3：安装依赖
```bash
cd /opt/bestgoods
npm install --production
```

### 步骤4：配置环境变量
```bash
# 创建环境配置文件
cat > .env << EOF
PORT=3076
NODE_ENV=production
LOG_LEVEL=info
DATABASE_PATH=./data/bestgoods.db
EOF
```

### 步骤5：使用PM2管理进程
```bash
# 5.1 全局安装PM2
npm install -g pm2

# 5.2 使用PM2启动应用
pm2 start bestgoods-complete-website.js --name "bestgoods"

# 5.3 设置开机自启
pm2 startup
pm2 save

# 5.4 查看应用状态
pm2 status
pm2 logs bestgoods
```

### 步骤6：配置Nginx反向代理（可选）
```nginx
# /etc/nginx/sites-available/bestgoods
server {
    listen 80;
    server_name bestgoods.yourdomain.com;
    
    location / {
        proxy_pass http://localhost:3076;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 步骤7：配置SSL证书（可选）
```bash
# 使用Certbot获取SSL证书
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d bestgoods.yourdomain.com
```

## 🔧 配置说明

### 端口配置
```javascript
// 在bestgoods-complete-website.js中修改
const PORT = process.env.PORT || 3076;
```

### 数据库配置
```javascript
// 数据库文件路径
const dbPath = path.join(__dirname, 'data/bestgoods.db');
```

### 日志配置
```javascript
// 日志级别
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';

// 日志目录
const LOG_DIR = './logs';
```

## 📊 监控与维护

### 健康检查
```bash
# 手动检查
curl http://localhost:3076/health

# 自动监控脚本
#!/bin/bash
response=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3076/health)
if [ "$response" != "200" ]; then
    echo "BestGoods服务异常，正在重启..."
    pm2 restart bestgoods
fi
```

### 日志管理
```bash
# 查看实时日志
pm2 logs bestgoods

# 查看历史日志
tail -f /opt/bestgoods/logs/app.log

# 日志轮转配置
cat > /etc/logrotate.d/bestgoods << EOF
/opt/bestgoods/logs/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 644 root root
}
EOF
```

### 性能监控
```bash
# 查看内存使用
pm2 monit

# 查看CPU使用
top -p $(pgrep -f bestgoods-complete-website.js)

# 数据库性能
sqlite3 data/bestgoods.db "ANALYZE;"
```

## 🔄 数据库管理

### 数据库备份
```bash
#!/bin/bash
# backup-database.sh
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/bestgoods_$DATE.db"

mkdir -p $BACKUP_DIR
cp data/bestgoods.db $BACKUP_FILE
echo "数据库备份完成: $BACKUP_FILE"

# 保留最近7天的备份
find $BACKUP_DIR -name "bestgoods_*.db" -mtime +7 -delete
```

### 数据库恢复
```bash
#!/bin/bash
# restore-database.sh
BACKUP_FILE="./backups/bestgoods_20260220_1917.db"

if [ -f "$BACKUP_FILE" ]; then
    cp $BACKUP_FILE data/bestgoods.db
    echo "数据库恢复完成"
else
    echo "备份文件不存在: $BACKUP_FILE"
fi
```

### 数据库优化
```bash
# 优化数据库性能
sqlite3 data/bestgoods.db "VACUUM;"
sqlite3 data/bestgoods.db "ANALYZE;"
sqlite3 data/bestgoods.db "PRAGMA optimize;"
```

## 🚨 故障排除

### 常见问题

#### 1. 端口被占用
```bash
# 检查端口占用
lsof -i :3076

# 停止占用进程
kill -9 <PID>

# 或修改端口
PORT=3080 node bestgoods-complete-website.js
```

#### 2. 数据库连接失败
```bash
# 检查数据库文件
ls -la data/bestgoods.db

# 检查文件权限
chmod 644 data/bestgoods.db

# 修复数据库
sqlite3 data/bestgoods.db ".recover" | sqlite3 data/bestgoods_fixed.db
```

#### 3. 内存不足
```bash
# 查看内存使用
free -h

# 优化Node.js内存限制
NODE_OPTIONS="--max-old-space-size=4096" node bestgoods-complete-website.js
```

#### 4. 服务无法启动
```bash
# 查看错误日志
pm2 logs bestgoods --err

# 手动启动查看错误
node bestgoods-complete-website.js

# 检查依赖
npm list
```

### 错误代码说明

| 错误代码 | 说明 | 解决方案 |
|---------|------|----------|
| ECONNREFUSED | 数据库连接拒绝 | 检查数据库文件是否存在和可读 |
| EADDRINUSE | 端口被占用 | 修改端口或停止占用进程 |
| ENOMEM | 内存不足 | 增加内存或优化代码 |
| ENOENT | 文件不存在 | 检查文件路径和权限 |

## 🔄 更新与升级

### 版本更新
```bash
# 1. 备份当前版本
cp -r /opt/bestgoods /opt/bestgoods_backup_$(date +%Y%m%d)

# 2. 停止服务
pm2 stop bestgoods

# 3. 更新文件
cp -r /path/to/new-version/* /opt/bestgoods/

# 4. 更新依赖
cd /opt/bestgoods
npm install --production

# 5. 重启服务
pm2 start bestgoods
```

### 数据库迁移
```bash
# 如果数据库结构有变化
sqlite3 data/bestgoods.db < migration.sql
```

## 📈 性能优化

### 前端优化
```javascript
// 启用Gzip压缩
const compression = require('compression');
app.use(compression());

// 设置缓存头
app.use(express.static('public', {
    maxAge: '1d'
}));
```

### 后端优化
```javascript
// 数据库连接池
const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READONLY, (err) => {
    if (err) console.error('数据库连接失败:', err);
});

// 查询缓存
const cache = new Map();
```

### 数据库优化
```sql
-- 创建索引
CREATE INDEX idx_categories_level1 ON categories(level1);
CREATE INDEX idx_categories_level2 ON categories(level1, level2);
CREATE INDEX idx_categories_level3 ON categories(level1, level2, level3);

-- 定期优化
VACUUM;
ANALYZE;
```

## 🔒 安全配置

### 基本安全
```bash
# 设置文件权限
chmod 600 .env
chmod 755 start.sh
chmod 644 data/bestgoods.db

# 创建专用用户
useradd -r -s /bin/false bestgoods
chown -R bestgoods:bestgoods /opt/bestgoods
```

### 防火墙配置
```bash
# 只允许必要端口
ufw allow 3076/tcp
ufw allow 22/tcp
ufw enable
```

### 定期安全更新
```bash
# 更新依赖包
npm audit
npm audit fix

# 更新系统
apt-get update && apt-get upgrade
```

## 📋 部署检查清单

### 部署前检查
- [ ] 系统要求满足（Node.js >= 18）
- [ ] 端口3076可用
- [ ] 数据库文件存在且可读
- [ ] 依赖包已安装
- [ ] 环境变量已配置

### 部署后验证
- [ ] 服务正常启动（`pm2 status`）
- [ ] 健康检查通过（`/health`）
- [ ] 首页可访问（`/`）
- [ ] 详情页可访问（`/category/...`）
- [ ] 搜索功能正常
- [ ] 投票功能正常
- [ ] 评论功能正常

### 监控配置
- [ ] 日志系统已配置
- [ ] 监控脚本已设置
- [ ] 备份策略已实施
- [ ] 告警机制已建立

## 🆘 紧急恢复

### 服务崩溃恢复
```bash
# 1. 查看崩溃原因
pm2 logs bestgoods --err

# 2. 恢复数据库
./restore-database.sh

# 3. 重启服务
pm2 restart bestgoods

# 4. 验证恢复
curl http://localhost:3076/health
```

### 数据丢失恢复
```bash
# 从最新备份恢复
cp ./backups/latest.db data/bestgoods.db

# 或从JSON重新生成
node convert-json-to-sqlite.js
```

### 完全重新部署
```bash
# 1. 停止服务
pm2 delete bestgoods

# 2. 清理目录
rm -rf /opt/bestgoods/*

# 3. 重新部署
cp -r /path/to/bestgoods-final-complete-documentation-20260220_1917/* /opt/bestgoods/
cd /opt/bestgoods
npm install --production
pm2 start bestgoods-complete-website.js --name "bestgoods"
```

---

**文档版本**: v1.2  
**最后更新**: 2026-02-20 19:17  
**适用环境**: 生产环境、测试环境、开发环境