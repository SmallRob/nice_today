# 生物节律应用

这是一个基于Docker的生物节律应用，包含前端和后端服务。

## 项目结构

- `frontend/`: React前端应用
- `backend/`: FastAPI后端服务
- `nginx/`: Nginx配置文件
- `docker-compose.yml`: Docker Compose配置文件
- `build_and_run.ps1`: Windows环境下构建和运行Docker容器的PowerShell脚本
- `build_and_run.sh`: Linux/macOS环境下构建和运行Docker容器的Bash脚本
- `start.ps1`, `start.sh`, `start.bat`: 本地开发环境启动脚本

## 系统要求

- Docker Engine 19.03.0+
- Docker Compose 1.27.0+

## 快速开始

### Windows环境

在PowerShell中运行以下命令：

```powershell
.\build_and_run.ps1
```

### Linux/macOS环境

在终端中运行以下命令：

```bash
./build_and_run.sh
```

## 服务访问

构建和启动成功后，可以通过以下URL访问服务：

- 前端服务: http://localhost:3000
- 后端API: http://localhost:5000
- WebSocket服务: ws://localhost:8765/mcp

## 查看日志

```bash
docker-compose logs -f
```

## 停止服务

```bash
docker-compose down
```

## 本地开发

如果不想使用Docker，可以使用以下脚本在本地开发环境中启动服务：

### Windows环境

```powershell
.\start.ps1
```

### Linux/macOS环境

```bash
./start.sh
```

## API文档

启动后端服务后，可以通过以下URL访问API文档：

- Swagger UI: http://localhost:5000/docs
- ReDoc: http://localhost:5000/redoc

## 主要功能

1. 生物节律计算和展示
2. 穿衣与饮食建议
3. 历史查询记录