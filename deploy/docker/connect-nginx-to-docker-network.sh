#!/bin/bash

# 确保外部Nginx容器可以连接到Docker网络
# 假设外部Nginx容器名为external-nginx

# 获取外部Nginx容器ID
NGINX_CONTAINER_ID=$(docker ps -qf "name=external-nginx")

if [ -z "$NGINX_CONTAINER_ID" ]; then
  echo "错误: 未找到外部Nginx容器"
  exit 1
fi

# 将外部Nginx容器连接到tcd-front-nginx-network网络
docker network connect tcd-front-nginx-network $NGINX_CONTAINER_ID

echo "已将外部Nginx容器连接到tcd-front-nginx-network网络"

# 检查网络连接
docker network inspect tcd-front-nginx-network

echo "完成! 现在外部Nginx可以通过容器名称访问Docker网络中的服务"