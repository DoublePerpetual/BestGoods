# Zeabur 部署验证指南

## 🎯 验证目标
确保Zeabur部署生产版本时读取的是**新代码**，而不是老代码。

## 🔍 关键验证点

### 1. 主服务器文件验证
Zeabur部署时会执行：`node bestgoods-complete-website.js`
验证该文件包含以下修改：

#### ✅ 品牌删除验证
```bash
# 检查文件中是否包含"brands"字段（应该为0）
grep -c "brands" bestgoods-complete-website.js
# 预期结果: 0
```

#### ✅ 假数据删除验证
```bash
# 检查是否包含hasRealData逻辑
grep -c "hasRealData" bestgoods-complete-website.js
# 预期结果: >= 5
```

#### ✅ 未测评提示验证
```bash
# 检查是否包含"此品类尚未测评"提示
grep -c "此品类尚未测评" bestgoods-complete-website.js
# 预期结果: >= 1
```

### 2. 版本标识验证
新代码包含版本标识：`v1.2.1`
```bash
# 检查提交历史
git log --oneline -1
# 预期结果: 包含"v1.2.1"
```

### 3. 文档验证
新代码包含以下文档：
- ✅ `README_FINAL_MODIFICATIONS.md` - 详细修改记录
- ✅ `BACKUP_SUMMARY.md` - 备份总结
- ✅ `ZEABUR_DEPLOYMENT.md` - Zeabur部署指南

## 🚀 Zeabur 部署流程

### 1. 自动部署触发
当代码推送到GitHub main分支时，Zeabur会自动：
1. 拉取最新代码
2. 执行构建命令：`npm install --production`
3. 执行启动命令：`node bestgoods-complete-website.js`
4. 部署到生产环境

### 2. 手动触发部署
如果自动部署未触发，可在Zeabur控制台：
1. 进入BestGoods项目
2. 点击"重新部署"
3. 选择"从GitHub部署"
4. 确认部署

### 3. 部署后验证
部署完成后，访问：
1. **健康检查**: `https://your-domain.zeabur.app/health`
2. **首页**: `https://your-domain.zeabur.app/`
3. **已测评品类**: `https://your-domain.zeabur.app/category/个护健康/剃须用品/一次性剃须刀`
4. **未测评品类**: `https://your-domain.zeabur.app/category/医疗保健/按摩器材/中频按摩仪`

## ✅ 部署验证测试

### 测试1: 未测评品类显示
访问未测评品类URL，应该看到：
- ✅ "此品类尚未测评，暂无最佳商品推荐"
- ✅ 黄色提示框
- ✅ 返回首页按钮
- ❌ 不显示假数据表格

### 测试2: 已测评品类显示
访问已测评品类URL，应该看到：
- ✅ 最佳评选结果表格
- ✅ 详细评选分析
- ✅ 投票和评论功能
- ✅ 真实产品数据

### 测试3: 品牌显示验证
检查所有页面，应该：
- ✅ 不显示"品牌: 14个"
- ✅ 不单独显示品牌信息
- ✅ 产品显示"评选产品"而不是品牌名

## 🔧 故障排除

### 问题1: Zeabur部署失败
**可能原因**: 大文件限制
**解决方案**:
1. 从GitHub仓库中移除大文件（如备份的.db文件）
2. 使用`.gitignore`忽略大文件
3. 重新推送代码

### 问题2: 部署后显示老代码
**可能原因**: 缓存问题
**解决方案**:
1. 在Zeabur控制台清除构建缓存
2. 重新部署
3. 重启服务

### 问题3: 数据库连接失败
**可能原因**: 文件路径问题
**解决方案**:
1. 检查数据库文件路径：`data/bestgoods.db`
2. 确保文件存在且可读
3. 检查文件权限

## 📊 部署状态监控

### 1. Zeabur控制台监控
- 构建日志：查看构建过程
- 运行日志：查看运行时错误
- 资源使用：CPU/内存监控

### 2. 健康检查监控
- 定期访问：`/health`端点
- 响应时间：应小于500ms
- 状态码：应为200 OK

### 3. 功能测试监控
- 每日自动测试关键功能
- 监控错误率
- 记录性能指标

## 📝 版本回滚

如果新版本有问题，可以回滚到旧版本：

### 方法1: Git回滚
```bash
# 回滚到上一个版本
git revert HEAD
git push origin main
```

### 方法2: Zeabur回滚
1. 进入Zeabur控制台
2. 选择"部署历史"
3. 选择之前的稳定版本
4. 点击"回滚到此版本"

## 🎯 最终验证清单

- [ ] 代码已推送到GitHub main分支
- [ ] Zeabur自动部署已触发
- [ ] 构建过程无错误
- [ ] 服务启动成功
- [ ] 健康检查通过
- [ ] 未测评品类显示正确提示
- [ ] 已测评品类功能正常
- [ ] 无品牌信息显示
- [ ] 无假数据显示

---

**部署时间**: 2026-02-20 23:07 GMT+8  
**版本**: v1.2.1  
**状态**: ✅ 代码已推送，等待Zeabur部署