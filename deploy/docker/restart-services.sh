#!/bin/bash

echo "===== 创建Docker网络 ====="
./create-docker-network.sh

echo "===== 连接外部Nginx到Docker网络 ====="
bash ./connect-nginx-to-docker-network-fixed.sh

echo "===== 停止现有服务 ====="
docker-compose -f docker-compose-prod.yml down

echo "===== 复制最新的Nginx配置 ====="
cp nginx.conf ./frontend/nginx.conf

echo "===== 检查环境变量 ====="
if grep -q "REACT_APP_API_DOMAI=" .env; then
  echo "修复环境变量拼写错误..."
  sed -i 's/REACT_APP_API_DOMAI=/REACT_APP_API_DOMAIN=/g' .env
fi

echo "===== 设置API域名 ====="
if grep -q "REACT_APP_API_DOMAIN=" .env; then
  sed -i 's|REACT_APP_API_DOMAIN=.*|REACT_APP_API_DOMAIN=https://nice-mcp.leansoftx.com|g' .env
else
  echo "REACT_APP_API_DOMAIN=https://nice-mcp.leansoftx.com" >> .env
fi

echo "===== 启动服务 ====="
docker-compose -f docker-compose-prod.yml up -d

echo "===== 检查服务状态 ====="
docker-compose -f docker-compose-prod.yml ps

echo "===== 检查网络连接 ====="
docker network inspect tcd-front-nginx-network

echo "===== 服务已重启 ====="
echo "现在可以通过 nice-mcp.leansoftx.com 访问服务"
