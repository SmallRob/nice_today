# 部署指南

## 环境变量配置

### 必需的环境变量

在部署前，请确保以下环境变量已正确配置：

```bash
# 后端服务配置
FLASK_RUN_PORT=5000          # 后端API服务端口
MCP_PORT=8765                # MCP WebSocket服务端口

# 前端服务配置
REACT_APP_BACKEND_PORT=5000  # 前端连接后端的端口
REACT_APP_API_DOMAIN=        # API域名（生产环境使用）
WDS_SOCKET_PORT=0            # WebSocket端口（开发环境）

# Docker配置
DOCKER_BUILDKIT=1           # 启用Docker BuildKit
COMPOSE_DOCKER_CLI_BUILD=1   # 启用Docker Compose构建

# 生产环境配置
NODE_ENV=production          # Node.js环境
```

### 环境变量说明

1. **FLASK_RUN_PORT**: 后端API服务端口，默认5000
2. **MCP_PORT**: MCP WebSocket服务端口，默认8765
3. **REACT_APP_BACKEND_PORT**: 前端连接后端的端口，需要与后端端口一致
4. **REACT_APP_API_DOMAIN**: 生产环境中的API域名
5. **WDS_SOCKET_PORT**: 开发环境WebSocket端口，设为0禁用
6. **DOCKER_BUILDKIT**: 启用Docker BuildKit加速构建
7. **COMPOSE_DOCKER_CLI_BUILD**: 启用Docker Compose构建
8. **NODE_ENV**: 生产环境设置为production

## 部署步骤

### 1. 环境准备

确保系统已安装以下软件：
- Docker (版本 20.10+)
- Docker Compose (版本 2.0+)

### 2. 配置环境变量

复制环境变量示例文件：
```bash
cp env.example .env
```

编辑 `.env` 文件，根据实际环境修改配置：
```bash
# 开发环境
FLASK_RUN_PORT=5000
MCP_PORT=8765
REACT_APP_BACKEND_PORT=5000
NODE_ENV=development

# 生产环境
FLASK_RUN_PORT=5000
MCP_PORT=8765
REACT_APP_BACKEND_PORT=5000
REACT_APP_API_DOMAIN=your-domain.com
NODE_ENV=production
```

### 3. 运行部署检查

执行部署检查脚本：
```bash
./deployment_check.sh
```

该脚本将：
- 检查Docker环境
- 验证配置文件
- 检查环境变量
- 构建Docker镜像
- 启动服务
- 测试API接口

### 4. 手动部署

如果自动部署失败，可以手动执行以下步骤：

#### 构建镜像
```bash
# 构建后端镜像
docker-compose build biorhythm-api

# 构建前端镜像
docker-compose build biorhythm-frontend
```

#### 启动服务
```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs biorhythm-api
docker-compose logs biorhythm-frontend
```

### 5. 测试API接口

执行API测试脚本：
```bash
./test_api.sh
```

该脚本将测试所有API接口的可用性。

## 服务架构

### 服务端口

| 服务 | 端口 | 说明 |
|------|------|------|
| 后端API | 5000 | FastAPI REST服务 |
| MCP服务 | 8765 | WebSocket MCP服务 |
| 前端服务 | 3000 | React开发服务器 |
| Nginx | 80 | 生产环境前端服务 |

### API接口

#### 生物节律API
- `GET /biorhythm/today?birth_date=YYYY-MM-DD` - 获取今日生物节律
- `GET /biorhythm/date?birth_date=YYYY-MM-DD&date=YYYY-MM-DD` - 获取指定日期生物节律
- `GET /biorhythm/range?birth_date=YYYY-MM-DD&days_before=10&days_after=20` - 获取生物节律范围
- `GET /biorhythm/history` - 获取历史记录

#### 穿衣建议API
- `GET /dress/today` - 获取今日穿衣建议
- `GET /dress/date?date=YYYY-MM-DD` - 获取指定日期穿衣建议
- `GET /dress/range?days_before=1&days_after=6` - 获取穿衣建议范围

#### 系统API
- `GET /health` - 健康检查
- `GET /` - API根路径

## 故障排除

### 常见问题

1. **端口冲突**
   - 检查端口是否被占用：`lsof -i :5000`
   - 修改环境变量中的端口配置

2. **Docker构建失败**
   - 清理Docker缓存：`docker system prune -a`
   - 重新构建：`docker-compose build --no-cache`

3. **API连接失败**
   - 检查服务是否启动：`docker-compose ps`
   - 查看服务日志：`docker-compose logs biorhythm-api`
   - 测试API：`curl http://localhost:5000/health`

4. **前端无法连接后端**
   - 检查环境变量 `REACT_APP_BACKEND_PORT`
   - 确认后端服务正常运行
   - 检查CORS配置

### 日志查看

```bash
# 查看所有服务日志
docker-compose logs

# 查看特定服务日志
docker-compose logs biorhythm-api
docker-compose logs biorhythm-frontend

# 实时查看日志
docker-compose logs -f biorhythm-api
```

### 服务管理

```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 重新构建并启动
docker-compose up -d --build
```

## 生产环境部署

### 1. 域名配置

在生产环境中，需要配置域名和SSL证书：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name your-domain.com;
    
    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;
    
    location / {
        proxy_pass http://biorhythm-frontend:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
    
    location /api/ {
        proxy_pass http://biorhythm-api:5000/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### 2. 环境变量配置

生产环境的环境变量配置：

```bash
# 生产环境配置
FLASK_RUN_PORT=5000
MCP_PORT=8765
REACT_APP_BACKEND_PORT=5000
REACT_APP_API_DOMAIN=https://your-domain.com
NODE_ENV=production
DOCKER_BUILDKIT=1
COMPOSE_DOCKER_CLI_BUILD=1
```

### 3. 监控和日志

建议配置日志收集和监控：

```bash
# 配置日志轮转
docker-compose up -d --log-driver json-file --log-opt max-size=10m --log-opt max-file=3
```

## 安全建议

1. **防火墙配置**
   - 只开放必要的端口
   - 使用反向代理隐藏内部服务

2. **环境变量安全**
   - 不要在代码中硬编码敏感信息
   - 使用环境变量或密钥管理服务

3. **Docker安全**
   - 定期更新Docker镜像
   - 使用非root用户运行容器
   - 限制容器资源使用

4. **API安全**
   - 实施速率限制
   - 添加API认证
   - 使用HTTPS

## 性能优化

1. **Docker优化**
   - 使用多阶段构建
   - 优化镜像大小
   - 使用缓存层

2. **API优化**
   - 实施缓存策略
   - 优化数据库查询
   - 使用异步处理

3. **前端优化**
   - 启用Gzip压缩
   - 使用CDN
   - 优化资源加载 