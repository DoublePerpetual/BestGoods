"""
最佳商品百科全书 - Web管理界面
"""
import json
import logging
from typing import Dict, Any, List
from datetime import datetime, timedelta

from fastapi import FastAPI, HTTPException, BackgroundTasks, Query
from fastapi.responses import HTMLResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from pydantic import BaseModel
import uvicorn

from database import get_db, Category, PriceRange, EvaluationDimension, BestProduct, APICallLog
from scheduler import SelectionScheduler
from sqlalchemy import func, desc
import os

# 创建FastAPI应用
app = FastAPI(title="最佳商品百科全书管理后台", version="1.0.0")

# 创建调度器实例
scheduler = SelectionScheduler()

# 创建模板目录
templates_dir = os.path.join(os.path.dirname(__file__), "templates")
os.makedirs(templates_dir, exist_ok=True)

# 创建静态文件目录
static_dir = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(static_dir, exist_ok=True)

# 配置模板
templates = Jinja2Templates(directory=templates_dir)

# 挂载静态文件
app.mount("/static", StaticFiles(directory=static_dir), name="static")

# 数据模型
class CategoryRequest(BaseModel):
    category_id: int
    action: str  # process_price, process_dimension, process_product, process_all

class BatchRequest(BaseModel):
    batch_size: int = 10
    stage: str  # price_range, dimension, product

# 首页
@app.get("/", response_class=HTMLResponse)
async def index():
    """管理后台首页"""
    with get_db() as db:
        # 获取统计数据
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
        
        # 最近处理的品类
        recent_categories = db.query(Category).order_by(desc(Category.updated_at)).limit(10).all()
        
        # API调用统计
        api_stats = db.query(
            func.count(APICallLog.id).label("total_calls"),
            func.sum(APICallLog.input_tokens + APICallLog.output_tokens).label("total_tokens"),
            func.sum(APICallLog.cost).label("total_cost")
        ).first()
        
        stats = {
            "total_categories": total_categories,
            "processed": processed,
            "progress": f"{processed/total_categories*100:.2f}%" if total_categories > 0 else "0%",
            "price_ranges": price_ranges,
            "dimensions": dimensions,
            "products": products,
            "today_cost": today_cost,
            "total_api_calls": api_stats.total_calls or 0,
            "total_tokens": api_stats.total_tokens or 0,
            "total_cost": api_stats.total_cost or 0
        }
        
        return templates.TemplateResponse(
            "index.html",
            {
                "request": {},
                "stats": stats,
                "recent_categories": recent_categories
            }
        )

# API端点
@app.get("/api/stats")
async def get_stats():
    """获取统计数据"""
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
        
        # 最近24小时成本
        yesterday = datetime.now() - timedelta(days=1)
        last_24h_cost = db.query(func.sum(APICallLog.cost)).filter(
            APICallLog.created_at >= yesterday
        ).scalar() or 0
        
        return {
            "total_categories": total_categories,
            "processed": processed,
            "progress": processed / total_categories if total_categories > 0 else 0,
            "price_ranges": price_ranges,
            "dimensions": dimensions,
            "products": products,
            "today_cost": today_cost,
            "last_24h_cost": last_24h_cost,
            "timestamp": datetime.now().isoformat()
        }

@app.get("/api/categories")
async def get_categories(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: str = Query(None),
    search: str = Query(None)
):
    """获取品类列表"""
    with get_db() as db:
        query = db.query(Category)
        
        # 状态过滤
        if status == "pending":
            query = query.filter(Category.is_processed == False)
        elif status == "processed":
            query = query.filter(Category.is_processed == True)
        elif status == "price_only":
            query = query.filter(
                Category.price_ranges_generated == True,
                Category.dimensions_generated == False
            )
        elif status == "dimension_only":
            query = query.filter(
                Category.dimensions_generated == True,
                Category.products_selected == False
            )
        
        # 搜索过滤
        if search:
            query = query.filter(
                Category.level3.contains(search) |
                Category.level2.contains(search) |
                Category.level1.contains(search)
            )
        
        # 分页
        total = query.count()
        offset = (page - 1) * page_size
        
        categories = query.order_by(Category.created_at.desc()).offset(offset).limit(page_size).all()
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "categories": [
                {
                    "id": cat.id,
                    "level1": cat.level1,
                    "level2": cat.level2,
                    "level3": cat.level3,
                    "full_path": cat.full_path,
                    "is_processed": cat.is_processed,
                    "price_ranges_generated": cat.price_ranges_generated,
                    "dimensions_generated": cat.dimensions_generated,
                    "products_selected": cat.products_selected,
                    "error_count": cat.error_count,
                    "last_error": cat.last_error,
                    "created_at": cat.created_at.isoformat() if cat.created_at else None,
                    "updated_at": cat.updated_at.isoformat() if cat.updated_at else None
                }
                for cat in categories
            ]
        }

@app.get("/api/category/{category_id}")
async def get_category_detail(category_id: int):
    """获取品类详情"""
    with get_db() as db:
        category = db.query(Category).filter(Category.id == category_id).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="品类不存在")
        
        # 获取价格区间
        price_ranges = db.query(PriceRange).filter(
            PriceRange.category_id == category_id
        ).order_by(PriceRange.range_order).all()
        
        # 获取评价维度
        dimensions = db.query(EvaluationDimension).filter(
            EvaluationDimension.category_id == category_id
        ).order_by(EvaluationDimension.dimension_order).all()
        
        # 获取最佳商品
        best_products = db.query(BestProduct).filter(
            BestProduct.category_id == category_id
        ).all()
        
        return {
            "category": {
                "id": category.id,
                "level1": category.level1,
                "level2": category.level2,
                "level3": category.level3,
                "full_path": category.full_path,
                "is_processed": category.is_processed,
                "price_ranges_generated": category.price_ranges_generated,
                "dimensions_generated": category.dimensions_generated,
                "products_selected": category.products_selected,
                "error_count": category.error_count,
                "last_error": category.last_error,
                "created_at": category.created_at.isoformat() if category.created_at else None,
                "updated_at": category.updated_at.isoformat() if category.updated_at else None
            },
            "price_ranges": [
                {
                    "id": pr.id,
                    "range_name": pr.range_name,
                    "min_price": pr.min_price,
                    "max_price": pr.max_price,
                    "range_order": pr.range_order,
                    "description": pr.description
                }
                for pr in price_ranges
            ],
            "dimensions": [
                {
                    "id": dim.id,
                    "dimension_name": dim.dimension_name,
                    "dimension_code": dim.dimension_code,
                    "dimension_order": dim.dimension_order,
                    "description": dim.description,
                    "weight": dim.weight
                }
                for dim in dimensions
            ],
            "best_products": [
                {
                    "id": bp.id,
                    "product_name": bp.product_name,
                    "brand_name": bp.brand_name,
                    "company_name": bp.company_name,
                    "product_model": bp.product_model,
                    "price": bp.price,
                    "price_range_level": bp.price_range_level,
                    "dimension_name": bp.dimension_name,
                    "selection_reason": bp.selection_reason[:200] + "..." if bp.selection_reason and len(bp.selection_reason) > 200 else bp.selection_reason,
                    "confidence_score": bp.confidence_score,
                    "status": bp.status,
                    "created_at": bp.created_at.isoformat() if bp.created_at else None
                }
                for bp in best_products
            ]
        }

@app.post("/api/process/batch")
async def process_batch(request: BatchRequest, background_tasks: BackgroundTasks):
    """批量处理任务"""
    
    async def process_task():
        if request.stage == "price_range":
            categories = scheduler.get_categories_by_stage("price_range", request.batch_size)
            result = scheduler.process_price_range_batch(categories)
        elif request.stage == "dimension":
            categories = scheduler.get_categories_by_stage("dimension", request.batch_size)
            result = scheduler.process_dimension_batch(categories)
        elif request.stage == "product":
            categories = scheduler.get_categories_by_stage("product", request.batch_size // 2)
            result = scheduler.process_product_batch(categories)
        else:
            result = {"error": "无效的阶段"}
        
        logging.info(f"批量处理完成: {result}")
    
    background_tasks.add_task(process_task)
    
    return {
        "message": f"已开始批量处理 {request.batch_size} 个品类的 {request.stage} 阶段",
        "batch_size": request.batch_size,
        "stage": request.stage
    }

@app.post("/api/process/category")
async def process_category(request: CategoryRequest, background_tasks: BackgroundTasks):
    """处理单个品类"""
    
    with get_db() as db:
        category = db.query(Category).filter(Category.id == request.category_id).first()
        
        if not category:
            raise HTTPException(status_code=404, detail="品类不存在")
    
    async def process_task():
        if request.action == "process_price":
            result = scheduler.price_engine.process_category(category)
        elif request.action == "process_dimension":
            result = scheduler.dimension_engine.process_category(category)
        elif request.action == "process_product":
            result = scheduler.product_engine.process_category_selection(category)
        elif request.action == "process_all":
            # 按顺序处理所有阶段
            price_result = scheduler.price_engine.process_category(category)
            if price_result.get("success"):
                dimension_result = scheduler.dimension_engine.process_category(category)
                if dimension_result.get("success"):
                    product_result = scheduler.product_engine.process_category_selection(category)
                    result = product_result
                else:
                    result = dimension_result
            else:
                result = price_result
        else:
            result = {"error": "无效的操作"}
        
        logging.info(f"处理品类完成: {result}")
    
    background_tasks.add_task(process_task)
    
    return {
        "message": f"已开始处理品类 {category.level3}",
        "category_id": request.category_id,
        "action": request.action
    }

@app.get("/api/api_logs")
async def get_api_logs(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    """获取API调用日志"""
    with get_db() as db:
        query = db.query(APICallLog)
        
        total = query.count()
        offset = (page - 1) * page_size
        
        logs = query.order_by(desc(APICallLog.created_at)).offset(offset).limit(page_size).all()
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "logs": [
                {
                    "id": log.id,
                    "category_id": log.category_id,
                    "api_provider": log.api_provider,
                    "model_name": log.model_name,
                    "input_tokens": log.input_tokens,
                    "output_tokens": log.output_tokens,
                    "cost": log.cost,
                    "response_time_ms": log.response_time_ms,
                    "status": log.status,
                    "error_message": log.error_message,
                    "created_at": log.created_at.isoformat() if log.created_at else None
                }
                for log in logs
            ]
        }

@app.get("/api/export/categories")
async def export_categories(format: str = Query("json")):
    """导出品类数据"""
    with get_db() as db:
        categories = db.query(Category).all()
        
        if format == "csv":
            import csv
            import io
            
            output = io.StringIO()
            writer = csv.writer(output)
            
            # 写入表头
            writer.writerow([
                "ID", "一级分类", "二级分类", "三级分类", "完整路径",
                "是否处理", "价格区间生成", "评价维度生成", "商品评选完成",
                "错误次数", "最后错误", "创建时间", "更新时间"
            ])
            
            # 写入数据
            for cat in categories:
                writer.writerow([
                    cat.id, cat.level1, cat.level2, cat.level3, cat.full_path,
                    cat.is_processed, cat.price_ranges_generated, cat.dimensions_generated, cat.products_selected,
                    cat.error_count, cat.last_error or "",
                    cat.created_at.isoformat() if cat.created_at else "",
                    cat.updated_at.isoformat() if cat.updated_at else ""
                ])
            
            return JSONResponse(
                content={"csv": output.getvalue()},
                media_type="application/json"
            )
        
        else:  # JSON格式
            return {
                "categories": [
                    {
                        "id": cat.id,
                        "level1": cat.level1,
                        "level2": cat.level2,
                        "level3": cat.level3,
                        "full_path": cat.full_path,
                        "is_processed": cat.is_processed,
                        "price_ranges_generated": cat.price_ranges_generated,
                        "dimensions_generated": cat.dimensions_generated,
                        "products_selected": cat.products_selected,
                        "error_count": cat.error_count,
                        "last_error": cat.last_error,
                        "created_at": cat.created_at.isoformat() if cat.created_at else None,
                        "updated_at": cat.updated_at.isoformat() if cat.updated_at else None
                    }
                    for cat in categories
                ]
            }

# 创建HTML模板
index_html = """
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>最佳商品百科全书 - 管理后台</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/htmx.org@1.9.10"></script>
</head>
<body class="bg-gray-100">
    <div class="container mx-auto px-4 py-8">
        <header class="mb-8">
            <h1 class="text-3xl font-bold text-gray-800">最佳商品百科全书 - 管理后台</h1>
            <p class="text-gray-600 mt-2">自动化评选系统监控与管理</p>
        </header>

        <!-- 统计卡片 -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div class="bg-white rounded-lg shadow p-6">
                <h3 class="text-lg font-semibold text-gray-700">总品类数</h3>
                <p class="text-3xl font-bold text-blue-600 mt-2" id="total-categories">0</p>
                <p class="text-gray-500 text-sm mt-1">24万+品类待处理</p>
            </div>
            
            <div class="bg-white rounded-lg