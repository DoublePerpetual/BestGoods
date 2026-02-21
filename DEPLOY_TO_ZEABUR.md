# BestGoods 部署到 Zeabur 指南

## 📦 准备部署文件

### 必需文件清单
```
bestgoods-complete-final-backup-20260220_2359/
├── bestgoods-complete-website.js    # 主程序文件（原始备份，UI零修改）
├── data/bestgoods.db                # 数据库文件（4,580个产品）
├── Dockerfile                       # Docker配置
├── package.json                     # 依赖配置
├── ZEABUR_FIXES_APPLIED.md          # 修复文档
└── DEPLOY_TO_ZEABUR.md              # 本指南
```

### 文件说明
1. **bestgoods-complete-website.js** - 100%按照备份文件还原，UI零修改
2. **bestgoods.db** - 包含49个一级分类、3,270个二级分类、195,651个三级分类、4,580个产品
3. **Dockerfile** - Zeabur生产环境配置
4. **package.json** - Node.js依赖配置

## 🚀 部署步骤

### 方法1: 直接上传到Zeabur
1. 登录 Zeabur 控制台
2. 创建新项目 "BestGoods"
3. 选择 "从代码仓库部署" 或 "上传文件"
4. 上传整个 `bestgoods-complete-final-backup-20260220_2359` 目录
5. Zeabur会自动检测并构建Docker镜像

### 方法2: 通过Git仓库
1. 创建Git仓库
2. 将文件推送到仓库
3. 在Zeabur中连接Git仓库
4. 设置构建路径为 `/`
5. 部署

## 🔧 Zeabur配置

### 环境变量
```
PORT=3076
NODE_ENV=production
```

### 健康检查
Zeabur会自动使用Dockerfile中的健康检查配置：
```
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3076/health || exit 1
```

### 资源分配
- **内存**: 至少512MB
- **CPU**: 至少0.5核
- **存储**: 至少100MB（数据库文件约50MB）

## ✅ 部署后验证

### 1. 检查部署状态
- 在Zeabur控制台查看部署日志
- 确保状态显示为"运行中"

### 2. 功能测试
访问Zeabur提供的域名：
- **首页**: `https://your-project.zeabur.app/`
- **健康检查**: `https://your-project.zeabur.app/health`
- **详情页示例**: `https://your-project.zeabur.app/category/个护健康/剃须用品/一次性剃须刀`

### 3. 验证修复内容
检查日志中是否包含：
```
✅ Zeabur修复内容验证:
   1. 异步/await 处理完整 ✓
   2. 完善的错误处理 ✓
   3. 内存泄漏防护 ✓
   4. 数据库优雅关闭 ✓
   5. 安全头和 CORS 配置 ✓
```

## 🐛 故障排除

### 常见问题1: 端口冲突
**症状**: 部署失败，日志显示端口被占用
**解决**: 确保Zeabur配置中使用PORT环境变量

### 常见问题2: 数据库连接失败
**症状**: 服务器启动失败，数据库连接错误
**解决**: 
1. 检查data/bestgoods.db文件是否存在
2. 确保文件权限正确
3. 检查存储空间是否足够

### 常见问题3: 内存不足
**症状**: 容器频繁重启
**解决**: 在Zeabur中增加内存分配

### 常见问题4: 构建失败
**症状**: Docker构建失败
**解决**:
1. 检查Dockerfile语法
2. 确保package.json中的依赖正确
3. 检查网络连接

## 📊 监控和维护

### 监控指标
1. **响应时间**: 健康检查端点响应时间
2. **内存使用**: 评论数量限制为1000条，防止内存泄漏
3. **错误率**: API错误响应统计

### 定期维护
1. **日志检查**: 定期查看服务器日志
2. **数据库备份**: 定期备份bestgoods.db文件
3. **版本更新**: 更新依赖包版本

## 🔄 更新部署

### 更新步骤
1. 修改代码后推送到Git仓库
2. Zeabur会自动检测并重新部署
3. 验证新版本功能正常

### 回滚步骤
1. 在Zeabur控制台选择之前的部署版本
2. 点击"回滚"
3. 验证回滚后功能正常

## 📞 技术支持

### 获取帮助
1. **Zeabur文档**: https://docs.zeabur.com
2. **错误日志**: 在Zeabur控制台查看部署日志
3. **健康检查**: 访问 `/health` 端点

### 紧急问题
如果生产环境出现问题：
1. 立即回滚到上一个稳定版本
2. 检查服务器日志
3. 验证数据库连接

## 🎉 部署成功标志

### 功能正常
- [ ] 首页可以正常访问
- [ ] 详情页可以点击打开
- [ ] 投票系统工作正常（初始值0）
- [ ] 评论系统工作正常（初始为空）

### 生产就绪
- [ ] 健康检查返回"healthy"
- [ ] 错误处理完善
- [ ] 内存泄漏防护生效
- [ ] 安全头配置正确

### UI验证
- [ ] 首页UI 100%备份还原
- [ ] 详情页UI 100%备份还原
- [ ] 零设计修改

## 💡 最佳实践

1. **定期备份**: 定期备份数据库文件
2. **监控告警**: 设置健康检查告警
3. **版本控制**: 使用Git进行版本控制
4. **测试环境**: 先部署到测试环境验证
5. **渐进部署**: 使用Zeabur的渐进部署功能

---

**重要提醒**: 此版本已应用Zeabur所有生产修复建议，同时保持UI设计100%按照备份文件还原，零修改。可以安全部署到生产环境。