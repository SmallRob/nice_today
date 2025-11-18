#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
API文档服务测试
"""

import unittest
import os
import sys
import json
from datetime import datetime

# 添加项目根目录到Python路径
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.api_docs_service import ApiDocsService

class TestApiDocsService(unittest.TestCase):
    """API文档服务测试类"""
    
    def setUp(self):
        """测试前准备"""
        self.service = ApiDocsService()
        
    def test_ensure_docs_dir(self):
        """测试确保文档目录存在"""
        self.assertTrue(os.path.exists(self.service.docs_dir))
        self.assertTrue(os.path.exists(self.service.docs_file))
        
    def test_get_all_docs(self):
        """测试获取所有API文档"""
        docs = self.service.get_all_docs()
        self.assertIsInstance(docs, dict)
        self.assertIn('docs', docs)
        self.assertIsInstance(docs['docs'], list)
        self.assertGreater(len(docs['docs']), 0)
        
    def test_get_doc_by_id(self):
        """测试根据ID获取特定API文档"""
        docs = self.service.get_all_docs()
        if docs['docs']:
            doc_id = docs['docs'][0]['id']
            doc = self.service.get_doc_by_id(doc_id)
            self.assertIsNotNone(doc)
            self.assertEqual(doc['id'], doc_id)
            
    def test_create_and_delete_doc(self):
        """测试创建和删除API文档"""
        # 创建新文档
        new_doc = {
            "title": "测试文档",
            "version": "1.0.0",
            "description": "测试文档描述",
            "openApiSpec": {}
        }
        
        created_doc = self.service.create_doc(new_doc)
        self.assertIsNotNone(created_doc)
        self.assertIn('id', created_doc)
        self.assertEqual(created_doc['title'], new_doc['title'])
        
        # 验证文档已创建
        doc_id = created_doc['id']
        retrieved_doc = self.service.get_doc_by_id(doc_id)
        self.assertIsNotNone(retrieved_doc)
        self.assertEqual(retrieved_doc['id'], doc_id)
        
        # 删除文档
        result = self.service.delete_doc(doc_id)
        self.assertTrue(result)
        
        # 验证文档已删除
        deleted_doc = self.service.get_doc_by_id(doc_id)
        self.assertIsNone(deleted_doc)
        
    def test_update_doc(self):
        """测试更新API文档"""
        # 创建新文档
        new_doc = {
            "title": "原始文档",
            "version": "1.0.0",
            "description": "原始文档描述",
            "openApiSpec": {}
        }
        
        created_doc = self.service.create_doc(new_doc)
        doc_id = created_doc['id']
        
        # 更新文档
        updated_data = {
            "title": "更新后的文档",
            "version": "2.0.0",
            "description": "更新后的文档描述",
            "openApiSpec": {"test": "data"}
        }
        
        updated_doc = self.service.update_doc(doc_id, updated_data)
        self.assertIsNotNone(updated_doc)
        self.assertEqual(updated_doc['title'], updated_data['title'])
        self.assertEqual(updated_doc['version'], updated_data['version'])
        self.assertEqual(updated_doc['description'], updated_data['description'])
        
        # 验证更新
        retrieved_doc = self.service.get_doc_by_id(doc_id)
        self.assertEqual(retrieved_doc['title'], updated_data['title'])
        
        # 清理测试数据
        self.service.delete_doc(doc_id)

if __name__ == '__main__':
    unittest.main()