#!/bin/bash

# 定义端口
BACKEND_PORT=5020
FRONTEND_PORT=3000

# 定义后端API地址
DEFAULT_BACKEND_API="http://localhost:$BACKEND_PORT"
REMOTE_BACKEND_API="https://nice-mcp.leansoftx.com/api"

# 定义虚拟环境名称和路径
VENV_NAME="biorhythm_env"
VENV_PATH="./$VENV_NAME"

# 检查端口是否被占用并找到可用端口
find_available_port() {
  local port=$1
  while check_port $port; do
    echo "端口 $port 已被占用，尝试使用端口 $((port+1))"
    port=$((port+1))
  done
  echo $port
}

# 检查端口是否被占用
check_port() {
  if command -v lsof >/dev/null 2>&1; then
    lsof -i:$1 >/dev/null 2>&1
    return $?
  elif command -v netstat >/dev/null 2>&1; then
    netstat -tuln | grep -q ":$1 "
    return $?
  else
    echo "警告: 无法检查端口 $1 是否被占用，缺少 lsof 或 netstat 命令"
    return 1
  fi
}

# 查找可用的后端端口
BACKEND_PORT=$(find_available_port $BACKEND_PORT)
echo "后端将使用端口: $BACKEND_PORT"

# 查找可用的前端端口
FRONTEND_PORT=$(find_available_port $FRONTEND_PORT)
echo "前端将使用端口: $FRONTEND_PORT"

# 确保目录存在
if [ ! -d "backend" ]; then
  echo "错误: 找不到 backend 目录"
  exit 1
fi

if [ ! -d "frontend" ]; then
  echo "错误: 找不到 frontend 目录"
  exit 1
fi

# 检测是否使用conda环境
if [ -n "$CONDA_PREFIX" ]; then
  echo "检测到Conda环境: $CONDA_PREFIX"
  USE_CONDA=true
else
  USE_CONDA=false
fi

# 如果是conda环境，使用conda创建虚拟环境
if [ "$USE_CONDA" = true ]; then
  echo "使用Conda创建虚拟环境..."
  if ! conda env list | grep -q "$VENV_NAME"; then
    echo "创建新的Conda环境: $VENV_NAME"
    conda create -y -n $VENV_NAME python=3.9 || {
      echo "创建Conda环境失败"
      exit 1
    }
  else
    echo "使用已存在的Conda环境: $VENV_NAME"
  fi
  
  # 激活conda环境
  echo "激活Conda环境..."
  eval "$(conda shell.bash hook)"
  conda activate $VENV_NAME || {
    echo "激活Conda环境失败"
    exit 1
  }
  
  VENV_ACTIVE=true
else
  # 创建并激活虚拟环境
  echo "设置Python虚拟环境..."
  
  # 检测Python版本
  PYTHON_VERSION=$(python -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")')
  echo "检测到Python版本: $PYTHON_VERSION"
  
  # 如果是Python 3.12，使用Python 3.9
  if [[ "$PYTHON_VERSION" == "3.12" ]]; then
    echo "检测到Python 3.12，尝试使用Python 3.9..."
    if command -v python3.9 >/dev/null 2>&1; then
      PYTHON_CMD="python3.9"
    elif command -v python3.10 >/dev/null 2>&1; then
      PYTHON_CMD="python3.10"
    elif command -v python3.11 >/dev/null 2>&1; then
      PYTHON_CMD="python3.11"
    else
      echo "警告: 未找到Python 3.9/3.10/3.11，将使用当前Python版本"
      PYTHON_CMD="python3"
    fi
  else
    PYTHON_CMD="python3"
  fi
  
  echo "使用Python命令: $PYTHON_CMD"
  
  # 检测操作系统类型
  if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    ACTIVATE_PATH="bin/activate"
  elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    ACTIVATE_PATH="bin/activate"
  elif [[ "$OSTYPE" == "msys" || "$OSTYPE" == "win32" ]]; then
    # Windows
    ACTIVATE_PATH="Scripts/activate"
  else
    # 默认
    ACTIVATE_PATH="bin/activate"
  fi
  
  # 如果虚拟环境存在但可能有问题，删除它
  if [ -d "$VENV_PATH" ] && [ ! -f "$VENV_PATH/$ACTIVATE_PATH" ]; then
    echo "检测到虚拟环境可能已损坏，删除并重新创建..."
    rm -rf "$VENV_PATH"
  fi
  
  if [ ! -d "$VENV_PATH" ]; then
    echo "创建新的虚拟环境: $VENV_NAME"
    $PYTHON_CMD -m venv $VENV_PATH || { 
      echo "创建虚拟环境失败，尝试使用 virtualenv..."
      command -v virtualenv >/dev/null 2>&1 || {
        echo "virtualenv 未安装，尝试安装..."
        pip install virtualenv || {
          echo "安装 virtualenv 失败，请手动安装 virtualenv 或 venv"
          exit 1
        }
      }
      virtualenv -p $PYTHON_CMD $VENV_PATH || {
        echo "使用 virtualenv 创建虚拟环境失败"
        exit 1
      }
    }
  else
    echo "使用已存在的虚拟环境: $VENV_NAME"
  fi
  
  # 激活虚拟环境
  echo "激活虚拟环境..."
  if [ -f "$VENV_PATH/$ACTIVATE_PATH" ]; then
    source "$VENV_PATH/$ACTIVATE_PATH"
    VENV_ACTIVE=true
    echo "虚拟环境已激活"
    # 验证虚拟环境是否正确激活
    which python
    python --version
  else
    echo "警告: 无法激活虚拟环境，将使用系统Python"
    VENV_ACTIVE=false
  fi
fi

# 启动后端服务
echo "启动后端服务..."
cd backend

echo "安装后端依赖..."
if [ "$VENV_ACTIVE" = true ]; then
  # 先升级pip
  echo "升级pip..."
  pip install --upgrade pip
  
  # 安装setuptools和wheel
  echo "安装基础包..."
  pip install setuptools wheel
  
  # 安装预编译的二进制包
  echo "安装预编译的依赖包..."
  pip install fastapi==0.95.0 uvicorn==0.21.1 python-multipart==0.0.6
  
  # 尝试安装numpy和pandas的预编译版本
  echo "安装numpy和pandas..."
  pip install numpy==1.24.2 --only-binary=numpy || pip install numpy==1.24.2
  pip install pandas==1.5.3 --only-binary=pandas || pip install pandas==1.5.3
else
  pip install --user -r requirements.txt || { echo "安装后端依赖失败"; exit 1; }
fi

echo "启动 FastAPI 服务器..."
# 使用动态端口启动后端
python app.py --port $BACKEND_PORT > backend.log 2>&1 &  # 直接传递端口参数
BACKEND_PID=$!
cd ..

# 等待后端服务启动
echo "等待后端服务启动..."
sleep 3

# 检查后端服务是否成功启动
if ! ps -p $BACKEND_PID > /dev/null; then
  echo "错误: 后端服务启动失败，请查看 backend/backend.log 文件了解详情"
  cat backend/backend.log
  exit 1
fi

# 测试后端服务是否可访问
echo "测试后端服务是否可访问..."
if command -v curl >/dev/null 2>&1; then
  curl -s http://localhost:$BACKEND_PORT > /dev/null || echo "警告: 无法访问后端服务，但进程似乎在运行"
elif command -v wget >/dev/null 2>&1; then
  wget -q -O /dev/null http://localhost:$BACKEND_PORT || echo "警告: 无法访问后端服务，但进程似乎在运行"
else
  echo "无法测试后端服务可访问性，缺少 curl 或 wget 命令"
fi

# 询问用户是否使用远程后端API
echo "请选择后端API连接方式:"
echo "1) 使用本地后端 (默认)"
echo "2) 使用远程后端 (https://nice-mcp.leansoftx.com/api)"
read -p "请输入选项 [1/2]: " api_choice

# 设置API地址
if [ "$api_choice" = "2" ]; then
  BACKEND_API=$REMOTE_BACKEND_API
  echo "已选择使用远程后端API: $BACKEND_API"
else
  BACKEND_API=$DEFAULT_BACKEND_API
  echo "已选择使用本地后端API: $BACKEND_API"
fi

# 安装前端依赖并启动前端服务
echo "安装前端依赖并启动前端服务..."
cd frontend
echo "安装 npm 依赖..."
npm install || { echo "安装前端依赖失败"; kill $BACKEND_PID; exit 1; }
echo "启动 React 开发服务器..."
# 使用动态端口启动前端，并传递后端API地址给前端应用
REACT_APP_BACKEND_API=$BACKEND_API REACT_APP_BACKEND_PORT=$BACKEND_PORT PORT=$FRONTEND_PORT npm start > frontend.log 2>&1 &
FRONTEND_PID=$!
cd ..

# 等待前端服务启动
echo "等待前端服务启动..."
sleep 5

# 检查前端服务是否成功启动
if ! ps -p $FRONTEND_PID > /dev/null; then
  echo "错误: 前端服务启动失败，请查看 frontend/frontend.log 文件了解详情"
  cat frontend/frontend.log
  kill $BACKEND_PID
  exit 1
fi

# 显示服务信息
echo "=================================================="
echo "服务已成功启动！"
echo "后端服务运行在: http://localhost:$BACKEND_PORT"
echo "前端服务运行在: http://localhost:$FRONTEND_PORT"
echo ""
echo "提示: 如果无法访问服务，请检查防火墙设置"
echo "      或尝试直接在浏览器中访问上述URL"
echo ""
echo "按 Ctrl+C 停止所有服务"
echo "=================================================="

# 清理函数
function cleanup {
  echo "正在停止服务..."
  kill $BACKEND_PID 2>/dev/null || echo "后端服务已停止"
  kill $FRONTEND_PID 2>/dev/null || echo "前端服务已停止"
  echo "所有服务已停止"
  exit 0
}

# 注册清理函数
trap cleanup SIGINT SIGTERM

# 保持脚本运行并监控服务状态
while true; do
  # 检查后端服务是否仍在运行
  if ! ps -p $BACKEND_PID > /dev/null; then
    echo "警告: 后端服务已停止运行"
    kill $FRONTEND_PID 2>/dev/null
    exit 1
  fi
  
  # 检查前端服务是否仍在运行
  if ! ps -p $FRONTEND_PID > /dev/null; then
    echo "警告: 前端服务已停止运行"
    kill $BACKEND_PID 2>/dev/null
    exit 1
  fi
  
  sleep 5
done