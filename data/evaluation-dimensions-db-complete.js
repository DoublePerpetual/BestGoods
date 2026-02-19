// ==========================================
// 全球最佳商品百科全书 · 评测维度数据库（完整版）
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
          name: "