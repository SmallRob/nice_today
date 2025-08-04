#!/bin/bash

# 检查网络是否已存在
if docker network ls | grep -q tcd-front-nginx-network; then
  echo "网络 tcd-front-nginx-network 已存在"
else
  # 创建外部网络
  echo "创建网络 tcd-front-nginx-network"
  docker network create tcd-front-nginx-network
fi

# 显示网络信息
docker network inspect tcd-front-nginx-network

echo "网络配置完成，现在可以启动 Docker Compose 服务"