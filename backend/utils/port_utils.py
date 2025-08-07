#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
端口工具模块
提供端口检测和自动分配功能
"""

import socket
import logging

logger = logging.getLogger(__name__)

def is_port_available(host: str, port: int) -> bool:
    """
    检查指定端口是否可用
    
    Args:
        host: 主机地址
        port: 端口号
        
    Returns:
        bool: 端口是否可用
    """
    try:
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as sock:
            sock.settimeout(1)
            result = sock.connect_ex((host, port))
            return result != 0
    except Exception as e:
        logger.warning(f"检查端口{port}时出错: {e}")
        return False

def find_available_port(host: str = '0.0.0.0', start_port: int = 5000, max_attempts: int = 100) -> int:
    """
    查找可用端口
    
    Args:
        host: 主机地址
        start_port: 起始端口
        max_attempts: 最大尝试次数
        
    Returns:
        int: 可用的端口号，如果找不到则返回-1
    """
    for port in range(start_port, start_port + max_attempts):
        if is_port_available(host, port):
            logger.info(f"找到可用端口: {port}")
            return port
    
    logger.error(f"在{start_port}-{start_port + max_attempts}范围内未找到可用端口")
    return -1

def get_port_info(port: int) -> dict:
    """
    获取端口信息
    
    Args:
        port: 端口号
        
    Returns:
        dict: 端口信息
    """
    import subprocess
    import re
    
    try:
        # 使用lsof命令查看端口占用情况
        result = subprocess.run(['lsof', '-i', f':{port}'], 
                              capture_output=True, text=True, timeout=5)
        
        if result.returncode == 0 and result.stdout:
            lines = result.stdout.strip().split('\n')
            if len(lines) > 1:  # 跳过标题行
                info_line = lines[1]
                parts = info_line.split()
                return {
                    'occupied': True,
                    'command': parts[0] if len(parts) > 0 else 'unknown',
                    'pid': parts[1] if len(parts) > 1 else 'unknown',
                    'user': parts[2] if len(parts) > 2 else 'unknown'
                }
        
        return {'occupied': False}
        
    except Exception as e:
        logger.warning(f"获取端口{port}信息时出错: {e}")
        return {'occupied': False, 'error': str(e)}