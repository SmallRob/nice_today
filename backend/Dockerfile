FROM python:3.9-slim

WORKDIR /app

# 安装构建依赖和curl（用于健康检查）
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    curl \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# 升级pip
RUN pip install --no-cache-dir --upgrade pip setuptools wheel

# 安装依赖
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 复制应用代码
COPY . .

# 暴露端口
EXPOSE 5000
EXPOSE 8765

# 设置环境变量
ENV PYTHONPATH=/app

# 启动命令 - 使用两个服务
CMD ["sh", "-c", "python app.py & python mcp_server.py"]