"""
最佳商品百科全书 - 价格区间生成引擎
"""
import json
import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime

from config import DEEPSEEK_API_KEY, DEEPSEEK_API_BASE, DEEPSEEK_MODEL, DEEPSEEK_MAX_TOKENS, DEEPSEEK_TEMPERATURE
from database import get_db, Category, PriceRange, APICallLog
import requests

logger = logging.getLogger(__name__)

class PriceRangeEngine:
    """价格区间生成引擎"""
    
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
            cost = ((input_tokens + output_tokens) / 1_000_000) * 2.0  # 假设每百万tokens 2元
            
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
    
    def generate_price_ranges(self, category_name: str, category_id: int) -> Dict[str, Any]:
        """为指定品类生成价格区间"""
        
        system_prompt = """你是一位资深商品分析师，擅长根据商品品类特性设置合理的价格区间。

## 任务
根据给定的商品品类，分析该品类的市场价格分布特点，设置合理的价格区间。

## 价格区间设置规则
1. **价格波动小的品类**：设置3个区间（低端、中端、高端）
2. **价格波动大的品类**：设置4-5个区间（入门、低端、中端、高端、旗舰）
3. **奢侈品/特殊品类**：可设置更多区间

## 输出要求
- 必须输出有效的JSON格式
- 价格单位：人民币（CNY）
- 价格必须是合理的整数
- 区间之间不能有重叠
- 必须包含区间描述

## JSON输出格式
{
  "category_name": "品类名称",
  "range_count": 区间数量,
  "price_ranges": [
    {
      "level": "区间名称",
      "min_price": 最低价格,
      "max_price": 最高价格,
      "order": 排序,
      "description": "区间描述"
    },
    ...
  ],
  "reasoning": "设置这些区间的理由"
}
"""
        
        user_prompt = f"""请为以下商品品类设置价格区间：

**品类名称**: {category_name}

请分析该品类的市场价格特点，设置合理的价格区间。

考虑因素：
1. 该品类商品的一般价格范围
2. 市场上是否存在明显的价格分层
3. 消费者对该品类的价格敏感度
4. 是否有奢侈品/入门级等特殊定位

输出JSON格式的价格区间配置。"""
        
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
                    if "price_ranges" not in data or "range_count" not in data:
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
    
    def save_price_ranges(self, category_id: int, category_name: str, price_data: Dict) -> bool:
        """保存价格区间到数据库"""
        try:
            with get_db() as db:
                # 删除旧的区间数据
                db.query(PriceRange).filter(PriceRange.category_id == category_id).delete()
                
                # 创建新的价格区间
                for i, range_item in enumerate(price_data["price_ranges"]):
                    price_range = PriceRange(
                        category_id=category_id,
                        range_name=range_item["level"],
                        min_price=range_item["min_price"],
                        max_price=range_item["max_price"],
                        range_order=range_item.get("order", i + 1),
                        description=range_item.get("description", "")
                    )
                    db.add(price_range)
                
                # 更新品类状态
                category = db.query(Category).filter(Category.id == category_id).first()
                if category:
                    category.price_ranges_generated = True
                    category.updated_at = datetime.now()
                
                logger.info(f"保存价格区间成功: {category_name} ({len(price_data['price_ranges'])}个区间)")
                return True
                
        except Exception as e:
            logger.error(f"保存价格区间失败: {e}")
            return False
    
    def process_category(self, category: Category) -> Dict[str, Any]:
        """处理单个品类的价格区间"""
        logger.info(f"处理品类价格区间: {category.level3} (ID: {category.id})")
        
        try:
            # 生成价格区间
            result = self.generate_price_ranges(category.level3, category.id)
            
            if result["success"]:
                # 保存到数据库
                saved = self.save_price_ranges(category.id, category.level3, result["data"])
                
                if saved:
                    return {
                        "success": True,
                        "category_id": category.id,
                        "category_name": category.level3,
                        "range_count": result["data"]["range_count"],
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
            logger.error(f"处理品类价格区间异常: {category.level3} - {e}")
            
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