#!/bin/bash

# =============================================================================
# 生物节律应用本地调试启动脚本
# 优化版本 - 简洁高效，模块化设计
# =============================================================================

# 设置严格的错误处理
set -euo pipefail

# =============================================================================
# 配置常量
# =============================================================================
readonly SCRIPT_NAME="$(basename "$0")"
readonly SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly LOG_FILE="${SCRIPT_DIR}/debug.log"

# 服务端口配置
readonly DEFAULT_BACKEND_PORT=5020
readonly DEFAULT_FRONTEND_PORT=3000

# 虚拟环境配置
readonly VENV_NAME="biorhythm_env"
readonly VENV_PATH="${SCRIPT_DIR}/${VENV_NAME}"

# =============================================================================
# 日志模块
# =============================================================================

log() {
    local level="$1"
    local message="$2"
    local timestamp="$(date '+%Y-%m-%d %H:%M:%S')"
    
    echo "[${timestamp}] [${level}] ${message}" | tee -a "${LOG_FILE}"
}

log_info() {
    log "INFO" "$1"
}

log_warn() {
    log "WARN" "$1"
}

log_error() {
    log "ERROR" "$1"
    exit 1
}

log_success() {
    log "SUCCESS" "$1"
}

# =============================================================================
# 工具函数
# =============================================================================

# 检查命令是否存在
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# 检查端口是否被占用
is_port_occupied() {
    local port="$1"
    
    if command_exists lsof; then
        lsof -i:"${port}" >/dev/null 2>&1
    elif command_exists netstat; then
        netstat -tuln | grep -q ":${port} "
    else
        log_warn "无法检查端口 ${port}，缺少 lsof 或 netstat 命令"
        return 1
    fi
}

# 查找可用端口
find_available_port() {
    local port="$1"
    
    while is_port_occupied "${port}"; do
        log_info "端口 ${port} 已被占用，尝试端口 $((port+1))"
        port=$((port+1))
    done
    
    echo "${port}"
}

# 验证目录存在
validate_directory() {
    local dir_path="$1"
    local dir_name="$2"
    
    if [ ! -d "${dir_path}" ]; then
        log_error "${dir_name} 目录不存在: ${dir_path}"
    fi
}

# =============================================================================
# 虚拟环境管理模块
# =============================================================================

setup_virtual_env() {
    log_info "设置Python虚拟环境..."
    
    # 检测Python版本
    local python_version
    python_version="$(python3 -c 'import sys; print(f"{sys.version_info.major}.{sys.version_info.minor}")' 2>/dev/null || echo "unknown")"
    
    if [ "${python_version}" = "unknown" ]; then
        log_error "未找到可用的Python3解释器"
    fi
    
    log_info "检测到Python版本: ${python_version}"
    
    # 创建或激活虚拟环境
    if [ ! -d "${VENV_PATH}" ]; then
        log_info "创建虚拟环境: ${VENV_NAME}"
        python3 -m venv "${VENV_PATH}" || log_error "创建虚拟环境失败"
    else
        log_info "使用现有虚拟环境: ${VENV_NAME}"
    fi
    
    # 激活虚拟环境
    if [ -f "${VENV_PATH}/bin/activate" ]; then
        source "${VENV_PATH}/bin/activate"
        log_success "虚拟环境已激活"
    else
        log_error "虚拟环境激活文件不存在"
    fi
}

# =============================================================================
# 后端服务模块
# =============================================================================

start_backend_service() {
    local port="$1"
    
    log_info "启动后端服务 (端口: ${port})..."
    
    # 验证目录
    validate_directory "${SCRIPT_DIR}/backend" "后端"
    
    cd "${SCRIPT_DIR}/backend"
    
    # 安装依赖
    log_info "安装后端依赖..."
    pip install --upgrade pip
    pip install -r requirements.txt || log_error "后端依赖安装失败"
    
    # 启动服务
    log_info "启动FastAPI服务器..."
    python app.py --port "${port}" > "${SCRIPT_DIR}/backend.log" 2>&1 &
    local backend_pid=$!
    
    # 等待服务启动
    sleep 3
    
    # 验证服务状态
    if ! ps -p "${backend_pid}" > /dev/null; then
        log_error "后端服务启动失败，请检查 backend.log"
    fi
    
    cd "${SCRIPT_DIR}"
    echo "${backend_pid}"
}

# =============================================================================
# 前端服务模块
# =============================================================================

start_frontend_service() {
    local port="$1"
    local backend_api="$2"
    
    log_info "启动前端服务 (端口: ${port})..."
    
    # 验证目录
    validate_directory "${SCRIPT_DIR}/frontend" "前端"
    
    cd "${SCRIPT_DIR}/frontend"
    
    # 安装依赖
    log_info "安装前端依赖..."
    if [ ! -d "node_modules" ]; then
        npm install || log_error "前端依赖安装失败"
    fi
    
    # 启动服务
    log_info "启动React开发服务器..."
    REACT_APP_BACKEND_API="${backend_api}" PORT="${port}" npm start > "${SCRIPT_DIR}/frontend.log" 2>&1 &
    local frontend_pid=$!
    
    # 等待服务启动
    sleep 5
    
    # 验证服务状态
    if ! ps -p "${frontend_pid}" > /dev/null; then
        log_error "前端服务启动失败，请检查 frontend.log"
    fi
    
    cd "${SCRIPT_DIR}"
    echo "${frontend_pid}"
}

# =============================================================================
# 服务监控模块
# =============================================================================

monitor_services() {
    local backend_pid="$1"
    local frontend_pid="$2"
    
    log_info "开始监控服务状态..."
    
    # 清理函数
    cleanup() {
        log_info "正在停止服务..."
        
        if ps -p "${backend_pid}" > /dev/null 2>&1; then
            kill "${backend_pid}" 2>/dev/null && log_info "后端服务已停止"
        fi
        
        if ps -p "${frontend_pid}" > /dev/null 2>&1; then
            kill "${frontend_pid}" 2>/dev/null && log_info "前端服务已停止"
        fi
        
        log_success "所有服务已停止"
        exit 0
    }
    
    # 注册信号处理
    trap cleanup SIGINT SIGTERM
    
    # 监控循环
    while true; do
        if ! ps -p "${backend_pid}" > /dev/null; then
            log_error "后端服务异常停止"
        fi
        
        if ! ps -p "${frontend_pid}" > /dev/null; then
            log_error "前端服务异常停止"
        fi
        
        sleep 10
    done
}

# =============================================================================
# 主函数
# =============================================================================

main() {
    log_info "启动生物节律应用调试环境..."
    
    # 初始化日志文件
    echo "=== 生物节律应用调试日志 ===" > "${LOG_FILE}"
    echo "启动时间: $(date)" >> "${LOG_FILE}"
    
    # 查找可用端口
    local backend_port
    backend_port="$(find_available_port "${DEFAULT_BACKEND_PORT}")"
    local frontend_port
    frontend_port="$(find_available_port "${DEFAULT_FRONTEND_PORT}")"
    
    log_info "后端服务端口: ${backend_port}"
    log_info "前端服务端口: ${frontend_port}"
    
    # 设置虚拟环境
    setup_virtual_env
    
    # 启动后端服务
    local backend_pid
    backend_pid="$(start_backend_service "${backend_port}")"
    
    # 配置后端API地址
    local backend_api="http://localhost:${backend_port}"
    
    # 启动前端服务
    local frontend_pid
    frontend_pid="$(start_frontend_service "${frontend_port}" "${backend_api}")"
    
    # 显示服务信息
    echo ""
    echo "=================================================="
    echo "🚀 生物节律应用调试环境已启动"
    echo ""
    echo "📊 后端服务: http://localhost:${backend_port}"
    echo "🌐 前端服务: http://localhost:${frontend_port}"
    echo ""
    echo "📝 日志文件: ${LOG_FILE}"
    echo "💡 按 Ctrl+C 停止所有服务"
    echo "=================================================="
    echo ""
    
    # 开始监控服务
    monitor_services "${backend_pid}" "${frontend_pid}"
}

# =============================================================================
# 脚本入口
# =============================================================================

# 检查是否在项目根目录运行
if [ ! -f "backend/app.py" ] || [ ! -f "frontend/package.json" ]; then
    echo "错误: 请在项目根目录运行此脚本"
    exit 1
fi

# 执行主函数
main "$@"