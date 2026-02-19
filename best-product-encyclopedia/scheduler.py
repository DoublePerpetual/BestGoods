"""
最佳商品百科全书 - 任务调度器
"""
import logging
import time
import logging.config
from typing import List, Dict, Any
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed

from database import get_db, Category, init_db, APICallLog
from sqlalchemy import func
from engines.price_range_engine import PriceRangeEngine
from engines.dimension_engine import DimensionEngine
from engines.product_selection_engine import ProductSelectionEngine
from config import BATCH_SIZE, WORKERS, LOG_CONFIG

# 配置日志
logging.config.dictConfig(LOG_CONFIG)
logger = logging.getLogger(__name__)

class SelectionScheduler:
    """评选任务调度器"""
    
    def __init__(self):
        self.price_engine = PriceRangeEngine()
        self.dimension_engine = DimensionEngine()
        self.product_engine = ProductSelectionEngine()
        self.executor = ThreadPoolExecutor(max_workers=WORKERS)
        
        # 初始化数据库
        init_db()
    
    def get_pending_categories(self, limit: int = None) -> List[Category]:
        """获取待处理的品类"""
        with get_db() as db:
            query = db.query(Category).filter(Category.is_processed == False)
            if limit:
                query = query.limit(limit)
            return query.all()
    
    def get_categories_by_stage(self, stage: str, limit: int = None) -> List[Category]:
        """按阶段获取品类"""
        with get_db() as db:
            if stage == "price_range":
                # 未生成价格区间的
                query = db.query(Category).filter(
                    Category.price_ranges_generated == False,
                    Category.error_count < 3
                )
            elif stage == "dimension":
                # 已生成价格区间但未生成维度的
                query = db.query(Category).filter(
                    Category.price_ranges_generated == True,
                    Category.dimensions_generated == False,
                    Category.error_count < 3
                )
            elif stage == "product":
                # 已生成维度但未评选商品的
                query = db.query(Category).filter(
                    Category.dimensions_generated == True,
                    Category.products_selected == False,
                    Category.error_count < 3
                )
            else:
                query = db.query(Category).filter(Category.is_processed == False)
            
            query = query.order_by(Category.created_at.asc())
            
            if limit:
                query = query.limit(limit)
            
            return query.all()
    
    def process_price_range_batch(self, categories: List[Category]) -> Dict:
        """批量处理价格区间生成"""
        results = []
        total_cost = 0.0
        
        def process_single(category):
            return self.price_engine.process_category(category)
        
        with ThreadPoolExecutor(max_workers=min(WORKERS, len(categories))) as executor:
            futures = {executor.submit(process_single, cat): cat for cat in categories}
            
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                if result.get("success"):
                    total_cost += result.get("cost", 0)
        
        return {
            "stage": "price_range",
            "total": len(categories),
            "success": sum(1 for r in results if r.get("success")),
            "failed": sum(1 for r in results if not r.get("success")),
            "total_cost": total_cost
        }
    
    def process_dimension_batch(self, categories: List[Category]) -> Dict:
        """批量处理评价维度生成"""
        results = []
        total_cost = 0.0
        
        def process_single(category):
            return self.dimension_engine.process_category(category)
        
        with ThreadPoolExecutor(max_workers=min(WORKERS, len(categories))) as executor:
            futures = {executor.submit(process_single, cat): cat for cat in categories}
            
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                if result.get("success"):
                    total_cost += result.get("cost", 0)
        
        return {
            "stage": "dimension",
            "total": len(categories),
            "success": sum(1 for r in results if r.get("success")),
            "failed": sum(1 for r in results if not r.get("success")),
            "total_cost": total_cost
        }
    
    def process_product_batch(self, categories: List[Category]) -> Dict:
        """批量处理最佳商品评选"""
        results = []
        total_cost = 0.0
        
        def process_single(category):
            return self.product_engine.process_category_selection(category)
        
        # 商品评选更耗资源，减少并发
        max_workers = max(1, WORKERS // 2)
        
        with ThreadPoolExecutor(max_workers=min(max_workers, len(categories))) as executor:
            futures = {executor.submit(process_single, cat): cat for cat in categories}
            
            for future in as_completed(futures):
                result = future.result()
                results.append(result)
                if result.get("success"):
                    total_cost += result.get("total_cost", 0)
        
        return {
            "stage": "product",
            "total": len(categories),
            "success": sum(1 for r in results if r.get("success")),
            "failed": sum(1 for r in results if not r.get("success")),
            "total_cost": total_cost
        }
    
    def run_full_pipeline(self, batch_size: int = None):
        """运行完整评选流程"""
        logger.info("=" * 60)
        logger.info("开始运行完整评选流程")
        logger.info("=" * 60)
        
        batch_size = batch_size or BATCH_SIZE
        
        # 阶段1: 生成价格区间
        logger.info("阶段1: 生成价格区间")
        categories = self.get_categories_by_stage("price_range", batch_size)
        
        if categories:
            result = self.process_price_range_batch(categories)
            logger.info(f"价格区间生成完成: {result}")
        else:
            logger.info("没有待处理的价格区间任务")
        
        time.sleep(2)
        
        # 阶段2: 生成评价维度
        logger.info("阶段2: 生成评价维度")
        categories = self.get_categories_by_stage("dimension", batch_size)
        
        if categories:
            result = self.process_dimension_batch(categories)
            logger.info(f"评价维度生成完成: {result}")
        else:
            logger.info("没有待处理的评价维度任务")
        
        time.sleep(2)
        
        # 阶段3: 评选最佳商品
        logger.info("阶段3: 评选最佳商品")
        categories = self.get_categories_by_stage("product", batch_size // 2)  # 商品评选更慢
        
        if categories:
            result = self.process_product_batch(categories)
            logger.info(f"最佳商品评选完成: {result}")
        else:
            logger.info("没有待处理的商品评选任务")
        
        logger.info("=" * 60)
        logger.info("本轮评选流程完成")
        logger.info("=" * 60)
    
    def run_continuous(self, interval_minutes: int = 60):
        """持续运行（生产环境）"""
        logger.info("启动持续运行模式")
        
        while True:
            try:
                self.run_full_pipeline()
                
                # 检查是否还有未完成的任务
                with get_db() as db:
                    pending = db.query(Category).filter(
                        Category.is_processed == False,
                        Category.error_count < 3
                    ).count()
                    
                    if pending == 0:
                        logger.info("所有任务完成，进入休眠")
                        time.sleep(interval_minutes * 60)
                    else:
                        logger.info(f"还有 {pending} 个待处理品类")
                        time.sleep(60)
                        
            except Exception as e:
                logger.error(f"运行错误: {e}")
                time.sleep(300)  # 错误后等待5分钟
    
    def get_progress_report(self) -> Dict[str, Any]:
        """获取进度报告"""
        with get_db() as db:
            total_categories = db.query(Category).count()
            processed = db.query(Category).filter(Category.is_processed == True).count()
            
            price_ranges = db.query(Category).filter(Category.price_ranges_generated == True).count()
            dimensions = db.query(Category).filter(Category.dimensions_generated == True).count()
            products = db.query(Category).filter(Category.products_selected == True).count()
            
            # 今日成本
            today = datetime.now().date()
            today_cost = db.query(func.sum(APICallLog.cost)).filter(
                func.date(APICallLog.created_at) == today
            ).scalar() or 0
            
            failed_categories = db.query(Category).filter(Category.error_count >= 3).count()
            
            return {
                "total_categories": total_categories,
                "processed": processed,
                "progress": f"{processed/total_categories*100:.2f}%" if total_categories > 0 else "0%",
                "price_ranges": price_ranges,
                "dimensions": dimensions,
                "products": products,
                "today_cost": today_cost,
                "failed_categories": failed_categories
            }

def main():
    """主入口"""
    scheduler = SelectionScheduler()
    
    # 首次运行：处理全部24万品类
    # scheduler.run_full_pipeline(batch_size=100)
    
    # 生产环境：持续运行
    scheduler.run_continuous(interval_minutes=60)

if __name__ == "__main__":
    main()