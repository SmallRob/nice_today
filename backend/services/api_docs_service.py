#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API文档服务
提供API文档的生成、管理和访问功能
"""

import os
import json
from datetime import datetime
from typing import Dict, List, Any

class ApiDocsService:
    """API文档服务类"""
    
    def __init__(self):
        self.docs_dir = os.path.join(os.path.dirname(__file__), 'docs')
        self.docs_file = os.path.join(self.docs_dir, 'api_docs.json')
        self.ensure_docs_dir()
        
    def ensure_docs_dir(self):
        """确保文档目录存在"""
        if not os.path.exists(self.docs_dir):
            os.makedirs(self.docs_dir)
            
        # 如果文档文件不存在，创建默认文档
        if not os.path.exists(self.docs_file):
            self.create_default_docs()
    
    def create_default_docs(self):
        """创建默认API文档"""
        default_docs = {
            "docs": [
                {
                    "id": "main-api",
                    "title": "统一后端API服务",
                    "version": "1.0.0",
                    "description": "整合生物节律、玛雅历法和穿搭建议的统一API服务",
                    "openApiSpec": self.generate_openapi_spec(),
                    "createdAt": datetime.now().isoformat(),
                    "updatedAt": datetime.now().isoformat()
                }
            ]
        }
        
        with open(self.docs_file, 'w', encoding='utf-8') as f:
            json.dump(default_docs, f, ensure_ascii=False, indent=2)
    
    def generate_openapi_spec(self):
        """生成OpenAPI规范"""
        return {
            "openapi": "3.0.0",
            "info": {
                "title": "统一后端API服务",
                "version": "1.0.0",
                "description": "整合生物节律、玛雅历法和穿搭建议的统一API服务"
            },
            "servers": [
                {
                    "url": "http://localhost:5000",
                    "description": "开发服务器"
                }
            ],
            "paths": {
                "/health": {
                    "get": {
                        "summary": "健康检查接口",
                        "description": "检查服务是否正常运行",
                        "responses": {
                            "200": {
                                "description": "服务正常",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object",
                                            "properties": {
                                                "status": {"type": "string"},
                                                "service": {"type": "string"},
                                                "timestamp": {"type": "string", "format": "date-time"}
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                },
                "/biorhythm/today": {
                    "get": {
                        "summary": "获取今天的生物节律",
                        "description": "根据出生日期计算今天的生物节律",
                        "parameters": [
                            {
                                "name": "birth_date",
                                "in": "query",
                                "required": True,
                                "schema": {
                                    "type": "string",
                                    "format": "date",
                                    "example": "1990-01-01"
                                },
                                "description": "出生日期，格式为YYYY-MM-DD"
                            }
                        ],
                        "responses": {
                            "200": {
                                "description": "成功返回生物节律数据",
                                "content": {
                                    "application/json": {
                                        "schema": {
                                            "type": "object"
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    
    def get_all_docs(self):
        """获取所有API文档"""
        try:
            with open(self.docs_file, 'r', encoding='utf-8') as f:
                return json.load(f)
        except Exception as e:
            # 如果读取失败，返回默认文档
            return {
                "docs": [
                    {
                        "id": "main-api",
                        "title": "统一后端API服务",
                        "version": "1.0.0",
                        "description": "整合生物节律、玛雅历法和穿搭建议的统一API服务",
                        "openApiSpec": self.generate_openapi_spec(),
                        "createdAt": datetime.now().isoformat(),
                        "updatedAt": datetime.now().isoformat()
                    }
                ]
            }
    
    def get_doc_by_id(self, doc_id: str):
        """根据ID获取特定API文档"""
        docs = self.get_all_docs()
        for doc in docs.get('docs', []):
            if doc.get('id') == doc_id:
                return doc
        return None
    
    def create_doc(self, doc_data: Dict[str, Any]):
        """创建新的API文档"""
        docs = self.get_all_docs()
        doc_data['id'] = f"doc-{int(datetime.now().timestamp())}"
        doc_data['createdAt'] = datetime.now().isoformat()
        doc_data['updatedAt'] = datetime.now().isoformat()
        docs['docs'].append(doc_data)
        
        with open(self.docs_file, 'w', encoding='utf-8') as f:
            json.dump(docs, f, ensure_ascii=False, indent=2)
            
        return doc_data
    
    def update_doc(self, doc_id: str, doc_data: Dict[str, Any]):
        """更新API文档"""
        docs = self.get_all_docs()
        for i, doc in enumerate(docs.get('docs', [])):
            if doc.get('id') == doc_id:
                doc_data['id'] = doc_id
                doc_data['createdAt'] = doc.get('createdAt', datetime.now().isoformat())
                doc_data['updatedAt'] = datetime.now().isoformat()
                docs['docs'][i] = doc_data
                
                with open(self.docs_file, 'w', encoding='utf-8') as f:
                    json.dump(docs, f, ensure_ascii=False, indent=2)
                    
                return doc_data
        return None
    
    def delete_doc(self, doc_id: str):
        """删除API文档"""
        docs = self.get_all_docs()
        docs['docs'] = [doc for doc in docs.get('docs', []) if doc.get('id') != doc_id]
        
        with open(self.docs_file, 'w', encoding='utf-8') as f:
            json.dump(docs, f, ensure_ascii=False, indent=2)
            
        return True

# 创建全局实例
api_docs_service = ApiDocsService()