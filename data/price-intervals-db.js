// ==========================================
// 全球最佳商品百科全书 · 价格区间数据库
// ==========================================

// 价格区间数据库架构
// 每个品类有2-多个价格区间，基于品类单价范围和商业环境

const PRICE_INTERVALS_DB = {
  // 数码电子类 - 价格敏感度高，品牌丰富
  "数码电子": {
    "智能手机": [
      {
        id: "phone_interval_1",
        name: "入门级 (¥999-¥1999)",
        min: 999,
        max: 1999,
        description: "适合预算有限、基础使用需求的用户",
        targetUsers: "学生、老年人、备用机用户",
        marketShare: "35%",
        priceSensitivity: "高",
        brands: ["Redmi", "realme", "荣耀"]
      },
      {
        id: "phone_interval_2",
        name: "中端级 (¥2000-¥3999)",
        min: 2000,
        max: 3999,
        description: "性价比最高的区间，适合大多数消费者",
        targetUsers: "上班族、年轻用户、主流消费者",
        marketShare: "45%",
        priceSensitivity: "中",
        brands: ["小米", "OPPO", "vivo", "一加"]
      },
      {
        id: "phone_interval_3",
        name: "高端级 (¥4000-¥6999)",
        min: 4000,
        max: 6999,
        description: "旗舰性能，适合追求极致体验的用户",
        targetUsers: "科技爱好者、商务人士、摄影爱好者",
        marketShare: "15%",
        priceSensitivity: "低",
        brands: ["iPhone", "华为", "三星", "小米Ultra"]
      },
      {
        id: "phone_interval_4",
        name: "旗舰级 (¥7000+)",
        min: 7000,
        max: 15000,
        description: "顶级配置，奢侈品级别",
        targetUsers: "高端用户、收藏家、企业用户",
        marketShare: "5%",
        priceSensitivity: "极低",
        brands: ["iPhone Pro Max", "华为Mate RS", "三星Fold"]
      }
    ],
    "笔记本电脑": [
      {
        id: "laptop_interval_1",
        name: "入门办公 (¥2999-¥4999)",
        min: 2999,
        max: 4999,
        description: "基础办公、学习使用",
        targetUsers: "学生、文职人员",
        marketShare: "30%",
        priceSensitivity: "高"
      },
      {
        id: "laptop_interval_2",
        name: "主流性能 (¥5000-¥7999)",
        min: 5000,
        max: 7999,
        description: "平衡性能与价格，适合大多数用户",
        targetUsers: "上班族、设计师、程序员",
        marketShare: "50%",
        priceSensitivity: "中"
      },
      {
        id: "laptop_interval_3",
        name: "专业创作 (¥8000-¥14999)",
        min: 8000,
        max: 14999,
        description: "高性能配置，专业工作需求",
        targetUsers: "视频编辑、3D设计师、游戏开发者",
        marketShare: "15%",
        priceSensitivity: "低"
      },
      {
        id: "laptop_interval_4",
        name: "顶级旗舰 (¥15000+)",
        min: 15000,
        max: 50000,
        description: "工作站级别，极致性能",
        targetUsers: "企业用户、专业工作室",
        marketShare: "5%",
        priceSensitivity: "极低"
      }
    ]
  },
  
  // 服装鞋帽类 - 价格区间相对集中
  "服装鞋帽": {
    "T恤": [
      {
        id: "tshirt_interval_1",
        name: "基础款 (¥29-¥99)",
        min: 29,
        max: 99,
        description: "日常穿着，性价比高",
        targetUsers: "学生、年轻人",
        marketShare: "60%",
        priceSensitivity: "高"
      },
      {
        id: "tshirt_interval_2",
        name: "品质款 (¥100-¥299)",
        min: 100,
        max: 299,
        description: "面料更好，设计更优",
        targetUsers: "上班族、品质追求者",
        marketShare: "30%",
        priceSensitivity: "中"
      },
      {
        id: "tshirt_interval_3",
        name: "设计师款 (¥300+)",
        min: 300,
        max: 1000,
        description: "设计师品牌，独特设计",
        targetUsers: "时尚爱好者、品牌追随者",
        marketShare: "10%",
        priceSensitivity: "低"
      }
    ],
    "运动鞋": [
      {
        id: "sneaker_interval_1",
        name: "入门运动 (¥199-¥499)",
        min: 199,
        max: 499,
        description: "基础运动需求",
        targetUsers: "学生、日常运动者",
        marketShare: "40%",
        priceSensitivity: "高"
      },
      {
        id: "sneaker_interval_2",
        name: "专业运动 (¥500-¥999)",
        min: 500,
        max: 999,
        description: "专业运动性能",
        targetUsers: "运动爱好者、健身人士",
        marketShare: "40%",
        priceSensitivity: "中"
      },
      {
        id: "sneaker_interval_3",
        name: "限量潮鞋 (¥1000+)",
        min: 1000,
        max: 5000,
        description: "限量版、联名款",
        targetUsers: "收藏家、潮流人士",
        marketShare: "20%",
        priceSensitivity: "低"
      }
    ]
  },
  
  // 食品饮料类 - 价格区间小基数
  "食品饮料": {
    "瓶装水": [
      {
        id: "water_interval_1",
        name: "普通饮用水 (¥1-¥3)",
        min: 1,
        max: 3,
        description: "日常饮用，解渴需求",
        targetUsers: "大众消费者",
        marketShare: "70%",
        priceSensitivity: "极高"
      },
      {
        id: "water_interval_2",
        name: "矿物质水 (¥3-¥8)",
        min: 3,
        max: 8,
        description: "添加矿物质，口感更好",
        targetUsers: "健康意识消费者",
        marketShare: "25%",
        priceSensitivity: "高"
      },
      {
        id: "water_interval_3",
        name: "高端矿泉水 (¥8+)",
        min: 8,
        max: 30,
        description: "进口水源，特殊功效",
        targetUsers: "高端消费者、商务场合",
        marketShare: "5%",
        priceSensitivity: "中"
      }
    ],
    "咖啡": [
      {
        id: "coffee_interval_1",
        name: "速溶咖啡 (¥20-¥50)",
        min: 20,
        max: 50,
        description: "方便快捷，价格亲民",
        targetUsers: "学生、上班族",
        marketShare: "50%",
        priceSensitivity: "高"
      },
      {
        id: "coffee_interval_2",
        name: "挂耳咖啡 (¥50-¥150)",
        min: 50,
        max: 150,
        description: "品质更好，口感更佳",
        targetUsers: "咖啡爱好者",
        marketShare: "35%",
        priceSensitivity: "中"
      },
      {
        id: "coffee_interval_3",
        name: "精品咖啡豆 (¥150+)",
        min: 150,
        max: 500,
        description: "单一产地，精品烘焙",
        targetUsers: "专业咖啡师、深度爱好者",
        marketShare: "15%",
        priceSensitivity: "低"
      }
    ]
  },
  
  // 美妆护肤类 - 价格区间根据功效划分
  "美妆护肤": {
    "洁面乳": [
      {
        id: "cleanser_interval_1",
        name: "基础清洁 (¥30-¥80)",
        min: 30,
        max: 80,
        description: "基础清洁功能",
        targetUsers: "学生、年轻用户",
        marketShare: "60%",
        priceSensitivity: "高"
      },
      {
        id: "cleanser_interval_2",
        name: "功效型 (¥80-¥200)",
        min: 80,
        max: 200,
        description: "添加特殊成分，针对性功效",
        targetUsers: "护肤爱好者",
        marketShare: "30%",
        priceSensitivity: "中"
      },
      {
        id: "cleanser_interval_3",
        name: "高端护肤 (¥200+)",
        min: 200,
        max: 800,
        description: "奢侈品牌，顶级成分",
        targetUsers: "高端消费者",
        marketShare: "10%",
        priceSensitivity: "低"
      }
    ],
    "面霜": [
      {
        id: "cream_interval_1",
        name: "基础保湿 (¥50-¥150)",
        min: 50,
        max: 150,
        description: "基础保湿功能",
        targetUsers: "年轻肌肤",
        marketShare: "50%",
        priceSensitivity: "高"
      },
      {
        id: "cream_interval_2",
        name: "抗初老 (¥150-¥400)",
        min: 150,
        max: 400,
        description: "抗衰老成分，预防细纹",
        targetUsers: "25-35岁用户",
        marketShare: "35%",
        priceSensitivity: "中"
      },
      {
        id: "cream_interval_3",
        name: "奢华抗老 (¥400+)",
        min: 400,
        max: 3000,
        description: "顶级抗老科技",
        targetUsers: "成熟肌肤、高端用户",
        marketShare: "15%",
        priceSensitivity: "低"
      }
    ]
  },
  
  // 家电类 - 价格区间根据功能和技术
  "家用电器": {
    "电饭煲": [
      {
        id: "ricecooker_interval_1",
        name: "基础款 (¥100-¥300)",
        min: 100,
        max: 300,
        description: "基础煮饭功能",
        targetUsers: "学生、单身人士",
        marketShare: "40%",
        priceSensitivity: "高"
      },
      {
        id: "ricecooker_interval_2",
        name: "多功能款 (¥300-¥800)",
        min: 300,
        max: 800,
        description: "多种烹饪模式，智能控制",
        targetUsers: "家庭用户",
        marketShare: "45%",
        priceSensitivity: "中"
      },
      {
        id: "ricecooker_interval_3",
        name: "高端IH款 (¥800+)",
        min: 800,
        max: 3000,
        description: "IH加热技术，精准控温",
        targetUsers: "烹饪爱好者、品质追求者",
        marketShare: "15%",
        priceSensitivity: "低"
      }
    ],
    "空气净化器": [
      {
        id: "airpurifier_interval_1",
        name: "小型桌面 (¥300-¥800)",
        min: 300,
        max: 800,
        description: "小空间使用，基础净化",
        targetUsers: "办公室、小卧室",
        marketShare: "30%",
        priceSensitivity: "高"
      },
      {
        id: "airpurifier_interval_2",
        name: "家用标准 (¥800-¥2500)",
        min: 800,
        max: 2500,
        description: "适合家庭使用，多功能",
        targetUsers: "家庭用户",
        marketShare: "50%",
        priceSensitivity: "中"
      },
      {
        id: "airpurifier_interval_3",
        name: "专业级 (¥2500+)",
        min: 2500,
        max: 10000,
        description: "大面积覆盖，医疗级净化",
        targetUsers: "过敏人群、高端家庭",
        marketShare: "20%",
        priceSensitivity: "低"
      }
    ]
  }
};

// 价格区间生成规则
const PRICE_INTERVAL_RULES = {
  // 规则1: 根据品类平均价格设置区间数量
  intervalCountByAvgPrice: {
    "低于¥100": 2,      // 低价品类：2个区间
    "¥100-¥500": 3,     // 中低价：3个区间
    "¥500-¥2000": 4,    // 中高价：4个区间
    "¥2000+": 4         // 高价：4个区间
  },
  
  // 规则2: 根据价格敏感度设置区间宽度
  intervalWidthBySensitivity: {
    "极高": "10-30%",   // 价格敏感：区间窄
    "高": "30-50%",     // 较敏感：中等宽度
    "中": "50-100%",    // 一般敏感：较宽
    "低": "100-200%",   // 不敏感：宽区间
    "极低": "200%+"     // 极不敏感：很宽
  },
  
  // 规则3: 大众消费区间设置更多档位
  popularIntervalStrategy: {
    "大众区间": "设置3-4个档位，覆盖70%用户",
    "小众高端": "设置1-2个档位，覆盖20%用户",
    "奢侈区间": "设置1个档位，覆盖10%用户"
  }
};

// 导出数据库
module.exports = {
  PRICE_INTERVALS_DB,
  PRICE_INTERVAL_RULES
};