"""
最佳商品百科全书 - 最佳商品评选引擎（核心）
"""
import json
import time
import logging
from typing import Dict, Any, List
from datetime import datetime

from config import DEEPSEEK_API_KEY, DEEPSEEK_API_BASE, DEEPSEEK_MODEL, DEEPSEEK_MAX_TOKENS, DEEPSEEK_TEMPERATURE
from database import get_db, Category, PriceRange, EvaluationDimension, BestProduct, APICallLog
from sqlalchemy.orm import Session
import requests

logger = logging.getLogger(__name__)

class ProductSelectionEngine:
    """最佳商品评选引擎"""
    
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
        min_interval = 60.0 / 30  # 每分钟30次（商品评选更耗资源）
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
                timeout=90  # 商品评选需要更长时间
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
    
    def select_best_product(self, category_name: str, category_id: int, 
                           price_range: Dict, dimension: Dict) -> Dict[str, Any]:
        """在指定价格区间和维度下评选最佳商品"""
        
        system_prompt = """你是一位极其严谨的商品评测专家，你的评选结果将被数十万消费者参考。

## 核心原则
1. **真实性**: 推荐的商品必须真实存在，不能虚构
2. **专业性**: 评选理由必须专业、具体、有说服力
3. **客观性**: 基于事实和数据，而非主观偏好
4. **可验证**: 用户能根据你提供的信息验证商品存在

## 评选要求
1. **商品信息必须完整**:
   - 商品名称（准确完整）
   - 品牌名称
   - 公司名称及介绍
   - 具体型号
   - 当前市场价格

2. **评选理由必须充分**:
   - 为什么这款商品在该维度上表现最佳
   - 与竞品相比的核心优势
   - 具体的技术参数或用户反馈支撑
   - 至少300字的详细理由

3. **置信度评分**:
   - 根据信息可靠性给出0-100的置信度
   - 知名大品牌+官方数据 = 高置信度
   - 小众品牌+网络信息 = 低置信度

## 输出要求
- 必须输出有效的JSON格式
- 所有信息必须具体可查
- 评选理由必须详细专业

## JSON输出格式
{
  "product_name": "商品完整名称",
  "brand_name": "品牌名称",
  "company_name": "公司名称",
  "company_intro": "公司介绍（成立时间、总部、规模等）",
  "company_founded_year": 成立年份,
  "company_headquarters": "公司总部",
  "product_model": "具体型号",
  "price": 价格,
  "price_range_level": "所属价格区间",
  "dimension_name": "评选维度",
  "selection_reason": "详细评选理由（至少300字）",
  "confidence_score": 置信度评分(0-100),
  "data_sources": "数据来源（官网/电商平台/评测机构等）"
}
"""
        
        user_prompt = f"""请为以下条件评选最佳商品：

## 品类信息
- **品类名称**: {category_name}

## 价格区间
- **区间名称**: {price_range['range_name']}
- **价格范围**: ¥{price_range['min_price']} - ¥{price_range['max_price']}
- **区间描述**: {price_range.get('description', '')}

## 评选维度
- **维度名称**: {dimension['dimension_name']}
- **维度说明**: {dimension.get('description', '')}

## 评选任务
在该价格区间内，针对"{dimension['dimension_name']}"这一维度，评选出一款最佳商品。

## 注意事项
1. 商品必须真实存在，可在电商平台或官网查到
2. 价格必须在指定区间内
3. 评选理由要具体说明为什么在该维度上表现最佳
4. 如果是电子产品，提供关键参数
5. 如果是食品/美妆，提供核心成分或功效
6. 如果是服务类，提供具体服务内容

请输出JSON格式的最佳商品评选结果。"""
        
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
                    
                    # 验证必要字段
                    required_fields = ["product_name", "brand_name", "selection_reason"]
                    for field in required_fields:
                        if field not in data:
                            raise ValueError(f"缺少必要字段: {field}")
                    
                    # 验证评选理由长度
                    if len(data.get("selection_reason", "")) < 300:
                        data["selection_reason"] += "（注：建议补充更多详细评选依据）"
                    
                    return {
                        "success": True,
                        "data": data,
                        "tokens_used": result["input_tokens"] + result["output_tokens"],
                        "cost": result["cost"]
                    }
                    
                except json.JSONDecodeError as e:
                    logger.error(f"JSON解析失败: {e}")
                    if attempt < 2:
                        time.sleep(3)
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
                    time.sleep(3)
                    continue
        
        return result
    
    def save_best_product(self, category_id: int, price_range_id: int, dimension_id: int, 
                         product_data: Dict, price_range_level: str, dimension_name: str) -> bool:
        """保存最佳商品到数据库"""
        try:
            with get_db() as db:
                product = BestProduct(
                    category_id=category_id,
                    price_range_id=price_range_id,
                    dimension_id=dimension_id,
                    product_name=product_data["product_name"],
                    brand_name=product_data["brand_name"],
                    company_name=product_data.get("company_name", ""),
                    product_model=product_data.get("product_model", ""),
                    price=product_data.get("price", 0),
                    price_range_level=price_range_level,
                    dimension_name=dimension_name,
                    selection_reason=product_data["selection_reason"],
                    confidence_score=product_data.get("confidence_score", 0),
                    data_sources=product_data.get("data_sources", ""),
                    company_intro=product_data.get("company_intro", ""),
                    company_founded_year=product_data.get("company_founded_year"),
                    company_headquarters=product_data.get("company_headquarters", ""),
                    status="pending"
                )
                db.add(product)
                
                logger.info(f"保存最佳商品成功: {product_data['product_name']}")
                return True
                
        except Exception as e:
            logger.error(f"保存最佳商品失败: {e}")
            return False
    
    def process_category_selection(self, category: Category) -> Dict[str, Any]:
        """处理单个品类的最佳商品评选"""
        logger.info(f"处理品类最佳商品评选: {category.level3} (ID: {category.id})")
        
        with get_db() as db:
            # 获取该品类的价格区间
            price_ranges = db.query(PriceRange).filter(
                PriceRange.category_id == category.id
            ).order_by(PriceRange.range_order).all()
            
            if not price_ranges:
                return {"success": False, "error": "价格区间未生成"}
            
            # 获取该品类的评价维度
            dimensions = db.query(EvaluationDimension).filter(
                EvaluationDimension.category_id == category.id
            ).order_by(EvaluationDimension.dimension_order).all()
            
            if not dimensions:
                return {"success": False, "error": "评价维度未生成"}
            
            # 统计需要评选的数量
            total_selections = len(price_ranges) * len(dimensions)
            success_count = 0
            total_cost = 0.0
            
            logger.info(f"需要评选 {total_selections} 个商品")
            
            # 遍历每个价格区间×每个维度
            for pr in price_ranges:
                for dim in dimensions:
                    logger.info(f"评选: [{pr.range_name}] - [{dim.dimension_name}]...")
                    
                    # 评选最佳商品
                    price_range_dict = {
                        "range_name": pr.range_name,
                        "min_price": pr.min_price,
                        "max_price": pr.max_price,
                        "description": pr.description
                    }
                    
                    dimension_dict = {
                        "dimension_name": dim.dimension_name,
                        "description": dim.description
                    }
                    
                    result = self.select_best_product(
                        category.level3, category.id, price_range_dict, dimension_dict
                    )
                    
                    if result["success"]:
                        saved = self.save_best_product(
                            category.id, pr.id, dim.id, result["data"], 
                            pr.range_name, dim.dimension_name
                        )
                        
                        if saved:
                            success_count += 1
                            total_cost += result["cost"]
                            logger.info(f"  -> 成功: {result['data']['product_name']}")
                        else:
                            logger.error(f"  -> 保存失败")
                    else:
                        logger.error(f"  -> 评选失败: {result.get('error')}")
                    
                    # 每次评选后暂停一下，避免API限制
                    time.sleep(1)
            
            # 更新品类状态
            if success_count > 0:
                category.products_selected = True
                category.is_processed = True
                category.updated_at = datetime.now()
                db.commit()
            
            return {
                "success": True,
                "category_id": category.id,
                "category_name": category.level3,
                "total_selections": total_selections,
                "success_count": success_count,
                "total_cost": total_cost
            }