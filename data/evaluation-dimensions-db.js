// ==========================================
// 全球最佳商品百科全书 · 评测维度数据库
// ==========================================

// 评测维度数据库架构
// 每个价格区间有1-多个评测维度，基于品类属性和用户需求

const EVALUATION_DIMENSIONS_DB = {
  // 数码电子类 - 注重性能、技术、体验
  "数码电子": {
    "智能手机": {
      // 入门级价格区间维度
      "phone_interval_1": [
        {
          id: "phone_low_best_value",
          name: "性价比最高",
          description: "在同价位中性能配置最均衡",
          evaluationCriteria: ["处理器性能", "内存配置", "存储空间", "电池容量", "摄像头配置"],
          weight: 40,
          targetUsers: "预算有限但追求实用性的用户"
        },
        {
          id: "phone_low_best_battery",
          name: "续航最强",
          description: "电池容量大，续航时间长",
          evaluationCriteria: ["电池容量(mAh)", "续航测试(小时)", "充电速度", "功耗控制"],
          weight: 30,
          targetUsers: "重度使用用户、出差人士"
        },
        {
          id: "phone_low_best_durability",
          name: "最耐用",
          description: "质量可靠，使用寿命长",
          evaluationCriteria: ["机身材质", "防摔测试", "防水等级", "用户口碑"],
          weight: 30,
          targetUsers: "学生、户外工作者"
        }
      ],
      // 中端级价格区间维度
      "phone_interval_2": [
        {
          id: "phone_mid_best_performance",
          name: "性能最强",
          description: "处理器和图形性能最出色",
          evaluationCriteria: ["安兔兔跑分", "游戏帧率", "多任务处理", "散热表现"],
          weight: 35,
          targetUsers: "游戏玩家、性能追求者"
        },
        {
          id: "phone_mid_best_camera",
          name: "拍照最好",
          description: "摄像头配置和成像质量最优",
          evaluationCriteria: ["主摄像头像素", "传感器尺寸", "夜景表现", "人像模式", "视频录制"],
          weight: 30,
          targetUsers: "摄影爱好者、社交媒体用户"
        },
        {
          id: "phone_mid_best_design",
          name: "设计最美",
          description: "外观设计和工艺最出色",
          evaluationCriteria: ["机身厚度", "重量控制", "材质质感", "色彩选择", "屏幕占比"],
          weight: 20,
          targetUsers: "时尚用户、外观党"
        },
        {
          id: "phone_mid_best_ecosystem",
          name: "生态最完善",
          description: "品牌生态系统最完整",
          evaluationCriteria: ["智能家居兼容", "穿戴设备联动", "云服务", "软件更新"],
          weight: 15,
          targetUsers: "品牌忠实用户、多设备用户"
        }
      ],
      // 高端级价格区间维度
      "phone_interval_3": [
        {
          id: "phone_high_best_innovation",
          name: "创新技术最多",
          description: "搭载最新技术和创新功能",
          evaluationCriteria: ["折叠屏技术", "屏下摄像头", "卫星通信", "AI能力", "新材料应用"],
          weight: 40,
          targetUsers: "科技爱好者、早期采用者"
        },
        {
          id: "phone_high_best_experience",
          name: "综合体验最佳",
          description: "软硬件结合体验最完美",
          evaluationCriteria: ["系统流畅度", "动画效果", "触控响应", "音质表现", "震动反馈"],
          weight: 35,
          targetUsers: "追求完美体验的用户"
        },
        {
          id: "phone_high_best_brand",
          name: "品牌价值最高",
          description: "品牌认可度和溢价能力最强",
          evaluationCriteria: ["品牌知名度", "用户忠诚度", "二手保值率", "社交媒体影响力"],
          weight: 25,
          targetUsers: "商务人士、品牌追求者"
        }
      ]
    },
    
    "笔记本电脑": {
      // 入门办公价格区间维度
      "laptop_interval_1": [
        {
          id: "laptop_low_best_portability",
          name: "最轻薄便携",
          description: "重量轻，厚度薄，便于携带",
          evaluationCriteria: ["重量(kg)", "厚度(mm)", "电池续航", "充电器体积"],
          weight: 50,
          targetUsers: "学生、经常移动的用户"
        },
        {
          id: "laptop_low_best_battery",
          name: "续航时间最长",
          description: "电池容量大，实际使用时间长",
          evaluationCriteria: ["电池容量(Wh)", "实际办公续航", "待机时间", "快充支持"],
          weight: 50,
          targetUsers: "图书馆学习、外出办公"
        }
      ],
      // 主流性能价格区间维度
      "laptop_interval_2": [
        {
          id: "laptop_mid_best_performance",
          name: "性能最强",
          description: "处理器和显卡性能最出色",
          evaluationCriteria: ["CPU性能", "GPU性能", "内存速度", "硬盘读写", "散热能力"],
          weight: 40,
          targetUsers: "程序员、设计师、游戏玩家"
        },
        {
          id: "laptop_mid_best_screen",
          name: "屏幕素质最好",
          description: "显示效果最出色",
          evaluationCriteria: ["分辨率", "色域覆盖", "亮度(nits)", "刷新率", "色准ΔE"],
          weight: 30,
          targetUsers: "设计师、视频编辑、影音爱好者"
        },
        {
          id: "laptop_mid_best_build",
          name: "做工质量最好",
          description: "机身做工和材料最优质",
          evaluationCriteria: ["机身材质", "铰链设计", "键盘手感", "触控板精度", "接口丰富度"],
          weight: 30,
          targetUsers: "商务人士、品质追求者"
        }
      ]
    }
  },
  
  // 服装鞋帽类 - 注重面料、设计、舒适度
  "服装鞋帽": {
    "T恤": {
      // 基础款价格区间维度
      "tshirt_interval_1": [
        {
          id: "tshirt_low_best_comfort",
          name: "最舒适",
          description: "穿着舒适度最高",
          evaluationCriteria: ["面料柔软度", "透气性", "弹性", "肤感"],
          weight: 60,
          targetUsers: "日常穿着、居家休闲"
        },
        {
          id: "tshirt_low_best_durability",
          name: "最耐穿",
          description: "耐洗耐穿，不易变形",
          evaluationCriteria: ["洗涤后变形度", "褪色程度", "起球情况", "缝线牢固度"],
          weight: 40,
          targetUsers: "实用主义者、学生"
        }
      ],
      // 品质款价格区间维度
      "tshirt_interval_2": [
        {
          id: "tshirt_mid_best_fabric",
          name: "面料最好",
          description: "使用高品质面料",
          evaluationCriteria: ["棉质等级", "纺织工艺", "功能性(吸湿排汗)", "环保认证"],
          weight: 40,
          targetUsers: "品质追求者"
        },
        {
          id: "tshirt_mid_best_design",
          name: "设计最美",
          description: "款式设计最出色",
          evaluationCriteria: ["版型剪裁", "颜色搭配", "图案设计", "细节处理"],
          weight: 35,
          targetUsers: "时尚爱好者"
        },
        {
          id: "tshirt_mid_best_brand",
          name: "品牌口碑最好",
          description: "品牌认可度最高",
          evaluationCriteria: ["品牌历史", "用户评价", "社交媒体热度", "设计师知名度"],
          weight: 25,
          targetUsers: "品牌追随者"
        }
      ]
    },
    
    "运动鞋": {
      // 入门运动价格区间维度
      "sneaker_interval_1": [
        {
          id: "sneaker_low_best_comfort",
          name: "最舒适",
          description: "穿着脚感最舒适",
          evaluationCriteria: ["鞋垫材质", "中底缓震", "包裹性", "重量控制"],
          weight: 50,
          targetUsers: "日常穿着、轻度运动"
        },
        {
          id: "sneaker_low_best_durability",
          name: "最耐磨",
          description: "鞋底和鞋面最耐用",
          evaluationCriteria: ["鞋底耐磨测试", "鞋面抗撕裂", "使用寿命", "维护难度"],
          weight: 50,
          targetUsers: "学生、户外活动"
        }
      ],
      // 专业运动价格区间维度
      "sneaker_interval_2": [
        {
          id: "sneaker_mid_best_performance",
          name: "运动性能最强",
          description: "专业运动表现最出色",
          evaluationCriteria: ["能量回馈", "稳定性", "抓地力", "透气性", "专业认证"],
          weight: 60,
          targetUsers: "运动爱好者、运动员"
        },
        {
          id: "sneaker_mid_best_tech",
          name: "科技含量最高",
          description: "采用最新运动科技",
          evaluationCriteria: ["中底科技", "鞋面技术", "智能传感器", "材料创新"],
          weight: 40,
          targetUsers: "科技爱好者、专业用户"
        }
      ]
    }
  },
  
  // 食品饮料类 - 注重口感、健康、安全
  "食品饮料": {
    "瓶装水": {
      // 普通饮用水价格区间维度
      "water_interval_1": [
        {
          id: "water_low_best_purity",
          name: "纯净度最高",
          description: "水质最纯净，杂质最少",
          evaluationCriteria: ["TDS值", "PH值", "重金属含量", "微生物检测"],
          weight: 60,
          targetUsers: "大众消费者"
        },
        {
          id: "water_low_best_value",
          name: "性价比最高",
          description: "价格最实惠，品质可靠",
          evaluationCriteria: ["单价(元/升)", "促销频率", "购买便利性", "品牌可靠性"],
          weight: 40,
          targetUsers: "价格敏感用户"
        }
      ],
      // 矿物质水价格区间维度
      "water_interval_2": [
        {
          id: "water_mid_best_minerals",
          name: "矿物质最均衡",
          description: "矿物质含量最科学合理",
          evaluationCriteria: ["钙镁含量", "微量元素", "吸收率", "口感清爽度"],
          weight: 50,
          targetUsers: "健康意识消费者"
        },
        {
          id: "water_mid_best_source",
          name: "水源地最优",
          description: "水源地环境最好",
          evaluationCriteria: ["水源地保护", "生态环境", "开采工艺", "认证标准"],
          weight: 50,
          targetUsers: "品质追求者"
        }
      ]
    },
    
    "咖啡": {
      // 速溶咖啡价格区间维度
      "coffee_interval_1": [
        {
          id: "coffee_low_best_convenience",
          name: "最方便快捷",
          description: "冲泡最方便，溶解最快",
          evaluationCriteria: ["溶解速度", "冲泡温度要求", "包装便携性", "保存期限"],
          weight: 60,
          targetUsers: "上班族、学生"
        },
        {
          id: "coffee_low_best_taste",
          name: "口感最好",
          description: "味道最接近现磨咖啡",
          evaluationCriteria: ["香气浓郁度", "苦味平衡", "酸度适中", "回味持久"],
          weight: 40,
          targetUsers: "咖啡入门者"
        }
      ],
      // 挂耳咖啡价格区间维度
      "coffee_interval_2": [
        {
          id: "coffee_mid_best_aroma",
          name: "香气最浓郁",
          description: "咖啡香气最丰富持久",
          evaluationCriteria: ["干香表现", "湿香层次", "香气持久度", "风味描述准确性"],
          weight: 40,
          targetUsers: "咖啡爱好者"
        },
        {
          id: "coffee_mid_best_bean",
          name: "咖啡豆品质最好",
          description: "使用高品质咖啡豆",
          evaluationCriteria: ["咖啡豆产地", "烘焙程度", "新鲜度", "单品/拼配"],
          weight: 35,
          targetUsers: "品质追求者"
        },
        {
          id: "coffee_mid_best_brew",
          name: "冲泡体验最佳",
          description: "冲泡过程最享受",
          evaluationCriteria: ["滤袋设计", "萃取均匀度", "油脂表现", "冲泡指导"],
          weight: 25,
          targetUsers: "仪式感追求者"
        }
      ]
    }
  },
  
  // 美妆护肤类 - 注重功效、成分、安全性
  "美妆护肤": {
    "洁面乳": {
      // 基础清洁价格区间维度
      "cleanser_interval_1": [
        {
          id: "cleanser_low_best_clean",
          name: "清洁力最强",
          description: "清洁效果最彻底",
          evaluationCriteria: ["油脂去除率", "毛孔清洁", "彩妆残留", "使用后肤感"],
          weight: 60,
          targetUsers: "油性肌肤、化妆用户"
        },
        {
          id: "cleanser_low_best_gentle",
          name: "最温和不刺激",
          description: "对皮肤刺激最小",
          evaluationCriteria: ["PH值", "刺激性测试", "敏感肌适用", "眼周安全性"],
          weight: 40,
          targetUsers: "敏感肌、干性肌肤"
        }
      ],
      // 功效型价格区间维度
      "cleanser_interval_2": [
        {
          id: "cleanser_mid_best_ingredients",
          name: "成分最优秀",
          description: "使用最有效的活性成分",
          evaluationCriteria: ["氨基酸表活", "植物提取物", "抗氧化成分", "保湿因子"],
          weight: 40,
          targetUsers: "成分党"
        },
        {
          id: "cleanser_mid_best_multifunction",
          name: "多功能性最强",
          description: "除了清洁还有额外功效",
          evaluationCriteria: ["去角质功能", "控油效果", "提亮肤色", "抗痘成分"],
          weight: 35,
          targetUsers: "问题肌肤用户"
        },
        {
          id: "cleanser_mid_best_experience",
          name: "使用体验最佳",
          description: "泡沫、香味、肤感最舒适",
          evaluationCriteria: ["泡沫绵密度", "香味宜人度", "冲洗容易度", "不紧绷感"],
          weight: 25,
          targetUsers: "体验追求者"
        }
      ]
    },
    
    "面霜": {
      // 基础保湿价格区间维度
      "cream_interval_1": [
        {
          id: "cream_low_best_hydration",
          name: "保湿效果最好",
          description: "锁水保湿能力最强",
          evaluationCriteria: ["水分保持率", "持久保湿", "干燥环境适用", "肤质改善"],
          weight: 70,
          targetUsers: "干性肌肤、秋冬季节"
        },
        {
          id: "cream_low_best_texture",
          name: "质地最舒适",
          description: "肤感最清爽不油腻",
          evaluationCriteria: ["吸收速度", "油腻感", "搓泥情况", "后续上妆"],
          weight: 30,
          targetUsers: "油性肌肤、夏季使用"
        }
      ],
      // 抗初老价格区间维度
      "cream_interval_2": [
        {
          id: "cream_mid_best_antiaging",
          name: "抗衰老效果最好",
          description: "抗皱紧致效果最明显",
          evaluationCriteria: ["皱纹改善", "皮肤弹性", "紧致度", "临床测试数据"],
          weight: 50,
          targetUsers: "25-35岁抗初老"
        },
        {
          id: "cream_mid_best_ingredients",
          name: "活性成分最有效",
          description: "使用最先进的抗老成分",
          evaluationCriteria: ["视黄醇浓度", "胜肽组合", "玻色因含量", "抗氧化复合物"],
          weight: 30,
          targetUsers: "成分研究者"
        },
        {
          id: "cream_mid_best_prevention",
          name: "预防效果最全面",
          description: "全方位预防衰老迹象",
          evaluationCriteria: ["光老化防护", "自由基清除", "胶原蛋白促进", "细胞修复"],
          weight: 20,
          targetUsers: "预防为主用户"
        }
      ]
    }
  },
  
  // 家电类 - 注重功能、能效、智能化
  "家用电器": {
    "电饭煲": {
      // 基础款价格区间维度
      "ricecooker_interval_1": [
        {
          id: "ricecooker_low_best_cook",
          name: "煮饭效果最好",
          description: "米饭口感最香软",
          evaluationCriteria: ["米饭均匀度", "软硬度控制", "香气保留", "不粘锅效果"],
          weight: 70,
          targetUsers: "家庭日常使用"
        },
        {
          id: "ricecooker_low_best_durability",
          name: "最耐用",
          description: "使用寿命最长",
          evaluationCriteria: ["内胆材质", "加热盘寿命", "密封圈耐久", "故障率"],
          weight: 30,
          targetUsers: "长期使用用户"
        }
      ]
    }
  }
};

// 导出数据库
module.exports = EVALUATION_DIMENSIONS_DB;
