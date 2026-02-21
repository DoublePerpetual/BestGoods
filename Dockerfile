# BestGoods Zeabur生产部署Dockerfile
# 基于Node.js 18 Alpine镜像，轻量级

FROM node:18-alpine

LABEL "language"="nodejs"

# 设置工作目录
WORKDIR /app

# 安装 sqlite3 编译所需的依赖
RUN apk add --no-cache python3 make g++ curl

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production

# 复制应用代码
COPY . .

# 创建数据目录
RUN mkdir -p data

# 暴露端口 - 标准端口3000
EXPOSE 3000

# 健康检查 - 使用 curl 替代 wget，curl 在 Alpine 中更常见
HEALTHCHECK --interval=30s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# 启动命令 - 使用正确的文件名
CMD ["node", "bestgoods-complete-website.js"]