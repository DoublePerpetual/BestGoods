"""
最佳商品百科全书 - 配置文件
"""
import os
from pathlib import Path

# 项目根目录
BASE_DIR = Path(__file__).parent

# 数据目录
DATA_DIR = BASE_DIR / "data"
LOGS_DIR = BASE_DIR / "logs"

# 确保目录存在
DATA_DIR.mkdir(exist_ok=True)
LOGS_DIR.mkdir(exist_ok=True)

# 数据库配置
DATABASE_URL = f"sqlite:///{DATA_DIR}/best_products.db"

# DeepSeek API配置
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "")
DEEPSEEK_API_BASE = "https://api.deepseek.com"
DEEPSEEK_MODEL = "deepseek-chat"
DEEPSEEK_MAX_TOKENS = 8192
DEEPSEEK_TEMPERATURE = 0.3

# API调用限制
API_CALLS_PER_MINUTE = 60
API_CALLS_PER_DAY = 10000
MAX_RETRIES = 3
RETRY_DELAY_SECONDS = 5

# 任务配置
BATCH_SIZE = 10  # 每批处理的品类数
WORKERS = 3  # 并发工作线程数
PRICE_RANGE_DEFAULT = 3  # 默认价格区间数

# 成本控制
DAILY_BUDGET = 500.0  # 每日API预算（元）
COST_PER_MILLION_TOKENS = 2.0  # 每百万tokens成本

# 品类数据文件
CATEGORIES_FILE = BASE_DIR.parent / "global-categories-expanded.json"

# 日志配置
LOG_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
        },
    },
    "handlers": {
        "file": {
            "level": "INFO",
            "class": "logging.FileHandler",
            "filename": LOGS_DIR / "encyclopedia.log",
            "formatter": "standard",
        },
        "console": {
            "level": "INFO",
            "class": "logging.StreamHandler",
            "formatter": "standard",
        },
    },
    "loggers": {
        "": {
            "handlers": ["file", "console"],
            "level": "INFO",
            "propagate": True
        },
    },
}