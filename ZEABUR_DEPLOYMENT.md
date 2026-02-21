# 🚀 BestGoods Zeabur部署指南

## 📋 部署要求

### 环境要求
- Node.js >= 16.0.0
- SQLite3数据库
- 至少100MB磁盘空间

### 文件结构
```
bestgoods-github/
├── bestgoods-complete-website.js    # 主程序（已修复）
├── package.json                     # 依赖配置
├── data/
│   └── bestgoods.db                 # 数据库文件（需上传）
└── ZEABUR_DEPLOYMENT.md            # 本文件
```

## ⚙️ Zeabur配置

### 环境变量
在Zeabur环境变量中设置：
```
DATABASE_PATH=/data/bestgoods.db
PORT=3076
NODE_ENV=production
```

### 数据库文件
1. 将 `bestgoods.db` 文件上传到 `/data/` 目录
2. 确保文件权限正确
3. 文件大小：约62MB

### 构建命令
```
npm install
```

### 启动命令
```
node bestgoods-complete-website.js
```

## 🔍 部署验证

### 步骤1: 检查部署日志
查看Zeabur部署日志，确保：
- ✅ Node.js依赖安装成功
- ✅ 应用启动成功
- ✅ 数据库连接正常

### 步骤2: 测试健康检查
访问健康检查接口：
```
https://你的域名.zeabur.app/health
```
预期返回：
```json
{
  "status": "healthy",
  "database": {
    "connected": true
  }
}
```

### 步骤3: 测试数据库
访问数据库测试接口：
```
https://你的域名.zeabur.app/api/db-test
```
预期返回数据库连接信息。

### 步骤4: 访问首页
访问网站首页：
```
https://你的域名.zeabur.app/
```
预期显示商品统计信息。

## 🛠️ 故障排除

### 问题1: 数据库连接失败
**症状**: `ENOENT: no such file or directory`
**解决方案**:
1. 检查数据库文件是否上传到 `/data/` 目录
2. 检查环境变量 `DATABASE_PATH` 设置
3. 检查文件权限

### 问题2: 依赖安装失败
**症状**: `Cannot find module 'sqlite3'`
**解决方案**:
1. 确保package.json包含sqlite3依赖
2. 检查构建日志
3. 尝试手动安装: `npm install sqlite3`

### 问题3: 应用启动失败
**症状**: 应用崩溃或无响应
**解决方案**:
1. 查看详细错误日志
2. 检查端口配置
3. 检查内存使用

## 📊 监控和维护

### 健康监控
定期检查：
1. 健康检查接口状态
2. 数据库连接状态
3. 应用响应时间

### 数据备份
建议定期备份数据库文件：
1. 下载 `/data/bestgoods.db` 文件
2. 存储到安全位置
3. 建立备份计划

### 性能优化
1. 启用缓存
2. 优化数据库查询
3. 监控资源使用

## 📞 支持信息

### 日志位置
- 应用日志: Zeabur控制台
- 错误日志: 应用启动输出
- 访问日志: HTTP请求日志

### 问题报告
报告问题时请提供：
1. 错误信息全文
2. 部署日志片段
3. 访问的URL
4. 环境信息

### 紧急恢复
如果需要恢复：
1. 重新上传数据库文件
2. 重启应用
3. 检查环境变量

---

**最后更新**: $(date)
**版本**: Zeabur修复版 v1.0
**状态**: 已修复数据库连接问题
