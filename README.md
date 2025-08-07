# 🌟 生物节律应用 - Nice Today

一个基于生物节律理论的综合应用，提供个性化的生理状态分析和穿衣饮食建议。

## 📋 项目简介

Nice Today 是一个现代化的生物节律应用，通过分析用户的生物节律数据，提供个性化的健康建议和生活指导。项目采用前后端分离架构，支持多种部署方式。

## 🏗️ 技术栈

### 前端
- **React 18** - 现代化前端框架
- **Tailwind CSS** - 原子化CSS框架
- **Axios** - HTTP客户端
- **WebSocket** - 实时通信

### 后端
- **FastAPI** - 高性能Python Web框架
- **Pydantic** - 数据验证
- **SQLAlchemy** - ORM框架
- **WebSocket** - 实时服务

### 部署
- **Docker** - 容器化部署
- **Nginx** - 反向代理和负载均衡
- **Docker Compose** - 多容器编排

## 📁 项目结构

```
nice_today/
├── frontend/                 # React前端应用
│   ├── src/                # 源代码
│   ├── public/             # 静态资源
│   ├── package.json        # 依赖配置
│   └── Dockerfile          # 前端容器配置
├── backend/                # FastAPI后端服务
│   ├── app.py             # 主应用入口
│   ├── services/          # 业务逻辑服务
│   │   ├── biorhythm_service.py   # 生物节律服务
│   │   ├── dress_service.py       # 穿衣建议服务
│   │   └── maya_service.py        # 玛雅历法服务
│   ├── utils/             # 工具函数
│   ├── config/            # 配置文件
│   └── requirements.txt   # Python依赖
├── nginx/                 # Nginx配置
├── docs/                  # 项目文档
├── docker-compose.yml     # Docker编排配置
├── docker-compose-prod.yml # 生产环境配置
└── scripts/               # 启动和部署脚本
```

## 🚀 快速开始

### 系统要求
- Docker Engine 19.03.0+
- Docker Compose 1.27.0+
- Node.js 16+ (本地开发)
- Python 3.8+ (本地开发)

### 方式一：Docker快速部署（推荐）

#### Windows环境
```powershell
# 克隆项目
git clone [项目地址]
cd nice_today

# 一键启动
.\build_and_run.ps1

# 或使用快速部署脚本
.\quick_deploy.sh
```

#### Linux/macOS环境
```bash
# 克隆项目
git clone [项目地址]
cd nice_today

# 一键启动
./build_and_run.sh

# 或使用快速部署脚本
./quick_deploy.sh
```

### 方式二：本地开发环境

#### 1. 环境准备
```bash
# 复制环境变量模板
cp env.example .env

# 编辑配置文件
vim .env
```

#### 2. 启动后端服务
```bash
# 安装Python依赖
cd backend
pip install -r requirements.txt

# 启动后端服务
python start_service.py

# 或使用启动脚本
python start_mcp_server.py
```

#### 3. 启动前端服务
```bash
# 安装Node依赖
cd frontend
npm install

# 启动开发服务器
npm start
# 或
.\start.ps1  # Windows
./start.sh    # Linux/macOS
```

### 方式三：分步启动

#### 1. 创建Docker网络
```bash
./create-docker-network.sh
```

#### 2. 连接Nginx到Docker网络
```bash
# Linux/macOS
./connect-nginx-to-docker-network.sh

# 或使用修复版本
./connect-nginx-to-docker-network-fixed.sh
```

#### 3. 手动启动服务
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f
```

## 🔗 服务访问

服务启动成功后，可通过以下地址访问：

| 服务类型 | 地址 | 描述 |
|---------|------|------|
| 前端应用 | http://localhost:3000 | React用户界面 |
| 后端API | http://localhost:5000 | FastAPI服务 |
| API文档 | http://localhost:5000/docs | Swagger UI |
| API文档(备用) | http://localhost:5000/redoc | ReDoc |
| WebSocket | ws://localhost:8765/mcp | 实时通信 |
| Nginx代理 | http://localhost:80 | 统一入口 |

## 🧪 测试和调试

### 运行测试
```bash
# 测试API接口
./test/test_api.sh

# 测试MCP服务
./test/test_mcp_service.py

# 快速测试MCP服务
./test/quick_test_mcp.sh
```

### 调试模式
```bash
# 调试脚本
./debug.ps1          # Windows
./docker_debug.ps1   # Docker调试
./start_debug.ps1    # 开发调试
```

### 检查服务状态
```bash
# 查看运行状态
docker-compose ps

# 查看服务日志
docker-compose logs [service-name]

# 检查端口占用
python backend/check_port.py
```

## 🛠️ 常用命令

### Docker管理
```bash
# 启动服务
docker-compose up -d

# 停止服务
docker-compose down

# 重启服务
docker-compose restart

# 查看日志
docker-compose logs -f

# 重新构建
docker-compose build --no-cache
```

### 服务重启
```bash
# 使用重启脚本
./restart-services.sh
```

### 开发工具
```bash
# Windows专用脚本
./start_cn.ps1        # 中文环境启动
./start.bat          # Windows批处理启动

# 部署检查
./tools/deployment_check.sh
```

## 📊 主要功能

### 1. 生物节律分析
- 计算用户的身体、情绪和智力节律
- 可视化展示节律变化趋势
- 提供每日节律状态报告

### 2. 个性化建议
- **穿衣建议**：根据节律状态推荐适合的服装
- **饮食建议**：基于身体状况提供营养建议
- **活动建议**：推荐适合当前状态的活动类型

### 3. 历史记录
- 保存每日节律数据
- 支持历史数据查询和对比
- 生成周期性报告

### 4. 实时通知
- WebSocket实时数据推送
- 重要节点提醒功能

## 🔧 配置说明

### 环境变量配置
复制 `env.example` 为 `.env` 并配置以下参数：

```bash
# 数据库配置
DATABASE_URL=sqlite:///./biorhythm.db

# API配置
API_HOST=0.0.0.0
API_PORT=5000

# 前端配置
REACT_APP_API_URL=http://localhost:5000
```

### 自定义配置
编辑 `backend/config/app_config.json` 可调整：
- 节律计算参数
- 建议算法权重
- 通知设置

## 🐛 常见问题

### 端口冲突
如果端口被占用，修改 `.env` 文件中的端口号配置。

### 容器启动失败
```bash
# 检查日志
docker-compose logs

# 清理缓存
docker system prune -a

# 重新构建
docker-compose build --no-cache
```

### 网络连接问题
```bash
# 检查Docker网络
./create-docker-network.sh
./connect-nginx-to-docker-network.sh
```

## 📞 技术支持

### 文档资源
- [部署指南](docs/DEPLOYMENT.md)
- [部署报告](docs/DEPLOYMENT_REPORT.md)
- [MCP服务状态](docs/MCP_SERVICE_STATUS.md)
- [MCP测试指南](docs/MCP_TEST_GUIDE.md)
- [问题分析与解决方案](docs/问题分析与解决方案.md)

### 开发团队
如有问题，请联系开发团队或提交Issue。

## 📄 许可证

本项目采用MIT许可证，详见LICENSE文件。