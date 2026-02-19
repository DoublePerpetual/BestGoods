"""
最佳商品百科全书 - 评价维度生成引擎
"""
import json
import time
import logging
from typing import Dict, Any, List
from datetime import datetime

from config import DEEPSEEK_API_KEY, DEEPSEEK_API_BASE, DEEPSEEK_MODEL, DEEPSEEK_MAX_TOKENS, DEEPSEEK_TEMPERATURE
from database import get_db, Category, EvaluationDimension, APICallLog
import requests

logger = logging.getLogger(__name__)

class DimensionEngine:
    """评价维度生成引擎"""
    
    def __init__(self):
        self.api_key = DEEPSEEK_API_KEY
        self.api_base = DEEPSEEK_API_BASE
        self.model = DEEPSEEK_MODEL
        self.max_tokens = DEEPSEEK_MAX_TOKENS
        self.temperature = DEEPSEEK_TEMPERATURE
        self.last_call_time = 0
        
    def _rate_limit(self):
        """速率限制"""
        current_time = time.time()
        min_interval = 60.0 / 60  # 每分钟60次
        if current_time - self.last_call_time < min_interval:
            time.sleep(min_interval - (current_time - self.last_call_time))
        self.last_call_time = time.time()
    
    def _call_deepseek_api(self, messages: List[Dict], category_id: int = None) -> Dict[str, Any]:
        """调用DeepSeek API"""
        self._rate_limit()
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": messages,
            "max_tokens": self.max_tokens,
            "temperature": self.temperature,
            "response_format": {"type": "json_object"}
        }
        
        start_time = time.time()
        status = "success"
        error_message = None
        input_tokens = 0
        output_tokens = 0
        
        try:
            response = requests.post(
                f"{self.api_base}/v1/chat/completions",
                headers=headers,
                json=payload,
                timeout=60
            )
            response.raise_for_status()
            result = response.json()
            
            input_tokens = result.get("usage", {}).get("prompt_tokens", 0)
            output_tokens = result.get("usage", {}).get("completion_tokens", 0)
            cost = ((input_tokens + output_tokens) / 1_000_000) * 2.0
            
            response_time = int((time.time() - start_time) * 1000)
            
            # 记录API调用日志
            self._log_api_call(
                category_id=category_id,
                input_tokens=input_tokens,
                output_tokens=output_tokens,
                cost=cost,
                response_time=response_time,
                status=status
            )
            
            return {
                "success": True,
                "content": result["choices"][0]["message"]["content"],
                "input_tokens": input_tokens,
                "output_tokens": output_tokens,
                "cost": cost
            }
            
        except Exception as e:
            error_message = str(e)
            response_time = int((time.time() - start_time) * 1000)
            
            self._log_api_call(
                category_id=category_id,
                input_tokens=0,
                output_tokens=0,
                cost=0,
                response_time=response_time,
                status="failed",
                error_message=error_message
            )
            
            return {
                "success": False,
                "error": error_message
            }
    
    def _log_api_call(self, category_id: int, input_tokens: int, output_tokens: int, 
                     cost: float, response_time: int, status: str, error_message: str = None):
        """记录API调用日志"""
        try:
            with get_db() as db:
                log = APICallLog(
                    category_id=category_id,
                    api_provider="deepseek",
                    model_name=self.model,
                    input_tokens=input_tokens,
                    output_tokens=output_tokens,
                    cost=cost,
                    response_time=response_time,
                    status=status,
                    error_message=error_message
                )
                db.add(log)
        except Exception as e:
            logger.error(f"记录API调用日志失败: {e}")
    
    def generate_dimensions(self, category_name: str, category_id: int) -> Dict[str, Any]:
        """为指定品类生成评价维度"""
        
        system_prompt = """你是一位资深商品评测专家，擅长根据商品品类特性设置科学合理的评价维度。

## 核心原则
1. **品类特异性**: 不同品类的评价维度必须不同，不能千篇一律
2. **用户视角**: 维度必须是消费者真正关心的，而不是技术参数堆砌
3. **可比较性**: 维度必须能在同类商品间进行有效比较
4. **完整性**: 覆盖消费者决策的主要考量因素

## 常见维度参考（根据品类选择）
- 通用维度：性价比、质量、品牌、售后服务、用户好评
- 电子类：续航、性能、音质、屏幕、智能程度、轻便性
- 食品类：口感、营养、安全性、新鲜度、副作用
- 美妆类：功效、成分安全、适用肤质、持久度、包装
- 家居类：舒适度、耐用性、设计美观、易清洁、环保
- 服装类：舒适度、版型、面料、做工、搭配性

## 维度数量规则
- 简单品类：3-5个维度
- 中等品类：5-8个维度
- 复杂品类：8-12个维度

## 输出要求
- 必须输出有效的JSON格式
- 每个维度必须有清晰的名称和代码
- 必须包含维度说明
- 可以设置权重（默认1.0）

## JSON输出格式
{
  "category_name": "品类名称",
  "dimension_count": 维度数量,
  "dimensions": [
    {
      "name": "维度名称",
      "code": "维度代码（英文小写+下划线）",
      "order": 排序,
      "description": "维度说明",
      "weight": 权重（可选，默认1.0）
    },
    ...
  ],
  "reasoning": "设置这些维度的理由"
}
"""
        
        user_prompt = f"""请为以下商品品类设置评价维度：

**品类名称**: {category_name}

请分析：
1. 消费者购买该品类商品时最关心什么？
2. 该品类商品的核心差异点在哪里？
3. 哪些维度能真正区分商品优劣？
4. 是否有该品类特有的评价标准？

参考维度（请选择适合的，不要全部使用）：
品牌最佳、质量最好、性价比最高、功效最好、续航最长、设计最美观、
副作用最小、最智能、最轻便、音质最好、最舒适、负面作用最小、
消费者好评最好、服务最好、售后最好、耐用性最好、安全性最高、
环保性最好、创新性最强、外观最时尚

输出JSON格式的评价维度配置。"""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        # 重试机制
        for attempt in range(3):
            result = self._call_deepseek_api(messages, category_id)
            if result["success"]:
                try:
                    content = result["content"]
                    data = json.loads(content)
                    
                    # 验证数据格式
                    if "dimensions" not in data or "dimension_count" not in data:
                        raise ValueError("返回数据格式不正确")
                    
                    return {
                        "success": True,
                        "data": data,
                        "tokens_used": result["input_tokens"] + result["output_tokens"],
                        "cost": result["cost"]
                    }
                    
                except json.JSONDecodeError as e:
                    logger.error(f"JSON解析失败: {e}")
                    if attempt < 2:
                        time.sleep(2)
                        continue
                    return {
                        "success": False,
                        "error": f"JSON解析失败: {str(e)}",
                        "raw_content": result["content"]
                    }
                except Exception as e:
                    logger.error(f"数据处理失败: {e}")
                    return {
                        "success": False,
                        "error": str(e)
                    }
            else:
                if attempt < 2:
                    time.sleep(2)
                    continue
        
        return result
    
    def save_dimensions(self, category_id: int, category_name: str, dimension_data: Dict) -> bool:
        """保存评价维度到数据库"""
        try:
            with get_db() as db:
                # 删除旧的维度数据
                db.query(EvaluationDimension).filter(EvaluationDimension.category_id == category_id).delete()
                
                # 创建新的评价维度
                for i, dim_item in enumerate(dimension_data["dimensions"]):
                    dimension = EvaluationDimension(
                        category_id=category_id,
                        dimension_name=dim_item["name"],
                        dimension_code=dim_item.get("code", f"dimension_{i+1}"),
                        dimension_order=dim_item.get("order", i + 1),
                        description=dim_item.get("description", ""),
                        weight=dim_item.get("weight", 1.0)
                    )
                    db.add(dimension)
                
                # 更新品类状态
                category = db.query(Category).filter(Category.id == category_id).first()
                if category:
                    category.dimensions_generated = True
                    category.updated_at = datetime.now()
                
                logger.info(f"保存评价维度成功: {category_name} ({len(dimension_data['dimensions'])}个维度)")
                return True
                
        except Exception as e:
            logger.error(f"保存评价维度失败: {e}")
            return False
    
    def process_category(self, category: Category) -> Dict[str, Any]:
        """处理单个品类的评价维度"""
        logger.info(f"处理品类评价维度: {category.level3} (ID: {category.id})")
        
        try:
            # 生成评价维度
            result = self.generate_dimensions(category.level3, category.id)
            
            if result["success"]:
                # 保存到数据库
                saved = self.save_dimensions(category.id, category.level3, result["data"])
                
                if saved:
                    return {
                        "success": True,
                        "category_id": category.id,
                        "category_name": category.level3,
                        "dimension_count": result["data"]["dimension_count"],
                        "cost": result["cost"]
                    }
                else:
                    return {
                        "success": False,
                        "category_id": category.id,
                        "error": "保存到数据库失败"
                    }
            else:
                # 失败处理
                with get_db() as db:
                    cat = db.query(Category).filter(Category.id == category.id).first()
                    if cat:
                        cat.error_count += 1
                        cat.last_error = result.get("error", "未知错误")
                
                return {
                    "success": False,
                    "category_id": category.id,
                    "error": result.get("error", "未知错误")
                }
                
        except Exception as e:
            logger.error(f"处理品类评价维度异常: {category.level3} - {e}")
            
            with get_db() as db:
                cat = db.query(Category).filter(Category.id == category.id).first()
                if cat:
                    cat.error_count += 1
                    cat.last_error = str(e)
            
            return {
                "success": False,
                "category_id": category.id,
                "error": str(e)
            }