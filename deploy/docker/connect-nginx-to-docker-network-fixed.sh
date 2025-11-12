#!/bin/bash

# 获取外部Nginx容器ID（通过更通用的方式）
NGINX_CONTAINER_ID=$(docker ps -qf "ancestor=nginx" | head -n 1)

if [ -z "$NGINX_CONTAINER_ID" ]; then
  echo "错误: 未找到外部Nginx容器"
  exit 1
fi

echo "找到外部Nginx容器: $NGINX_CONTAINER_ID"

# 将外部Nginx容器连接到tcd-front-nginx-network网络
if docker network inspect tcd-front-nginx-network | grep -q "$NGINX_CONTAINER_ID"; then
  echo "Nginx容器已连接到网络"
else
  echo "将Nginx容器连接到网络"
  docker network connect tcd-front-nginx-network $NGINX_CONTAINER_ID
fi

# 在外部Nginx容器中创建错误日志目录
echo "创建错误日志目录"
docker exec $NGINX_CONTAINER_ID mkdir -p /etc/nginx/html

# 检查网络连接
docker network inspect tcd-front-nginx-network

echo "完成! 现在外部Nginx可以通过容器名称访问Docker网络中的服务"