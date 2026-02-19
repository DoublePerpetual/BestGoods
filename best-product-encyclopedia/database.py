"""
最佳商品百科全书 - 数据库连接
"""
from sqlalchemy import create_engine, Column, Integer, String, Text, Float, DateTime, ForeignKey, Boolean, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.sql import func
from contextlib import contextmanager
from config import DATABASE_URL, DATA_DIR
import logging

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False},
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# 数据库模型
class Category(Base):
    """商品品类表"""
    __tablename__ = "categories"
    
    id = Column(Integer, primary_key=True)
    level1 = Column(String(200), nullable=False)  # 一级分类
    level2 = Column(String(200), nullable=False)  # 二级分类
    level3 = Column(String(500), nullable=False)  # 三级分类（品类名称）
    full_path = Column(String(1000), nullable=False)  # 完整路径
    
    # 处理状态
    is_processed = Column(Boolean, default=False)
    price_ranges_generated = Column(Boolean, default=False)
    dimensions_generated = Column(Boolean, default=False)
    products_selected = Column(Boolean, default=False)
    
    # 错误处理
    error_count = Column(Integer, default=0)
    last_error = Column(Text)
    
    # 时间戳
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    price_ranges = relationship("PriceRange", back_populates="category", cascade="all, delete-orphan")
    dimensions = relationship("EvaluationDimension", back_populates="category", cascade="all, delete-orphan")
    best_products = relationship("BestProduct", back_populates="category", cascade="all, delete-orphan")

class PriceRange(Base):
    """价格区间表"""
    __tablename__ = "price_ranges"
    
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # 价格区间信息
    range_name = Column(String(100), nullable=False)  # 区间名称（如：低端、中端、高端）
    min_price = Column(Float, nullable=False)  # 最低价格
    max_price = Column(Float, nullable=False)  # 最高价格
    range_order = Column(Integer, nullable=False)  # 排序顺序
    description = Column(Text)  # 区间描述
    
    # 时间戳
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    category = relationship("Category", back_populates="price_ranges")
    best_products = relationship("BestProduct", back_populates="price_range")

class EvaluationDimension(Base):
    """评价维度表"""
    __tablename__ = "evaluation_dimensions"
    
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    
    # 维度信息
    dimension_name = Column(String(200), nullable=False)  # 维度名称
    dimension_code = Column(String(100), nullable=False)  # 维度代码
    dimension_order = Column(Integer, nullable=False)  # 排序顺序
    description = Column(Text)  # 维度说明
    weight = Column(Float, default=1.0)  # 权重
    
    # 时间戳
    created_at = Column(DateTime, default=func.now())
    
    # 关系
    category = relationship("Category", back_populates="dimensions")
    best_products = relationship("BestProduct", back_populates="dimension")

class BestProduct(Base):
    """最佳商品表"""
    __tablename__ = "best_products"
    
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    price_range_id = Column(Integer, ForeignKey("price_ranges.id"), nullable=False)
    dimension_id = Column(Integer, ForeignKey("evaluation_dimensions.id"), nullable=False)
    
    # 商品信息
    product_name = Column(String(500), nullable=False)  # 商品名称
    brand_name = Column(String(200), nullable=False)  # 品牌名称
    company_name = Column(String(300))  # 公司名称
    product_model = Column(String(200))  # 具体型号
    price = Column(Float)  # 价格
    
    # 评选信息
    selection_reason = Column(Text, nullable=False)  # 评选理由（核心）
    confidence_score = Column(Float, default=0.0)  # 置信度评分 0-100
    data_sources = Column(Text)  # 数据来源
    
    # 公司信息
    company_intro = Column(Text)  # 公司介绍
    company_founded_year = Column(Integer)  # 成立年份
    company_headquarters = Column(String(300))  # 公司总部
    
    # 状态
    status = Column(String(50), default="pending")  # pending/reviewed/approved/rejected
    reviewer_id = Column(Integer)  # 审核人ID
    reviewed_at = Column(DateTime)  # 审核时间
    
    # 时间戳
    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # 关系
    category = relationship("Category", back_populates="best_products")
    price_range = relationship("PriceRange", back_populates="best_products")
    dimension = relationship("EvaluationDimension", back_populates="best_products")

class APICallLog(Base):
    """API调用日志表"""
    __tablename__ = "api_call_logs"
    
    id = Column(Integer, primary_key=True)
    category_id = Column(Integer, ForeignKey("categories.id"))
    
    # API信息
    api_provider = Column(String(50))  # deepseek/openclaw
    model_name = Column(String(100))  # 模型名称
    input_tokens = Column(Integer)  # 输入tokens
    output_tokens = Column(Integer)  # 输出tokens
    cost = Column(Float)  # 成本
    response_time_ms = Column(Integer)  # 响应时间
    
    # 状态
    status = Column(String(50))  # success/failed
    error_message = Column(Text)  # 错误信息
    
    # 时间戳
    created_at = Column(DateTime, default=func.now())

@contextmanager
def get_db():
    """数据库会话上下文管理器"""
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()

def init_db():
    """初始化数据库表"""
    Base.metadata.create_all(bind=engine)
    logging.info("数据库初始化完成")

def reset_db():
    """重置数据库（开发用）"""
    Base.metadata.drop_all(bind=engine)
    init_db()
    logging.info("数据库重置完成")