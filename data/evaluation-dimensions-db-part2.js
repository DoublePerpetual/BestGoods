      // 多功能款价格区间维度
      "ricecooker_interval_2": [
        {
          id: "ricecooker_mid_best_function",
          name: "功能最全面",
          description: "烹饪模式最多样",
          evaluationCriteria: ["预设菜单数量", "煲汤功能", "蛋糕烘焙", "酸奶制作", "预约功能"],
          weight: 40,
          targetUsers: "烹饪爱好者"
        },
        {
          id: "ricecooker_mid_best_smart",
          name: "智能化程度最高",
          description: "智能控制最便捷",
          evaluationCriteria: ["APP控制", "语音助手", "食谱推荐", "远程操控", "能耗监测"],
          weight: 35,
          targetUsers: "科技爱好者、年轻人"
        },
        {
          id: "ricecooker_mid_best_energy",
          name: "能效最高",
          description: "最节能省电",
          evaluationCriteria: ["能效等级", "待机功耗", "加热效率", "保温耗电"],
          weight: 25,
          targetUsers: "环保意识用户"
        }
      ]
    },
    
    "空气净化器": {
      // 小型桌面价格区间维度
      "airpurifier_interval_1": [
        {
          id: "airpurifier_low_best_quiet",
          name: "最静音",
          description: "运行噪音最小",
          evaluationCriteria: ["最低档噪音", "睡眠模式", "电机质量", "震动控制"],
          weight: 60,
          targetUsers: "办公室、卧室使用"
        },
        {
          id: "airpurifier_low_best_portable",
          name: "最便携",
          description: "体积小重量轻",
          evaluationCriteria: ["尺寸大小", "重量", "电源适配", "摆放灵活性"],
          weight: 40,
          targetUsers: "小空间、移动使用"
        }
      ],
      // 家用标准价格区间维度
      "airpurifier_interval_2": [
        {
          id: "airpurifier_mid_best_purify",
          name: "净化效果最好",
          description: "空气净化能力最强",
          evaluationCriteria: ["CADR值", "PM2.5去除率", "甲醛净化", "细菌病毒清除", "过敏原过滤"],
          weight: 50,
          targetUsers: "空气质量差地区"
        },
        {
          id: "airpurifier_mid_best_smart",
          name: "智能监测最准确",
          description: "空气质量监测最精准",
          evaluationCriteria: ["传感器精度", "实时显示", "自动模式", "数据记录", "报警功能"],
          weight: 30,
          targetUsers: "科技家庭"
        },
        {
          id: "airpurifier_mid_best_filter",
          name: "滤网最耐用",
          description: "滤网使用寿命最长",
          evaluationCriteria: ["滤网寿命", "更换成本", "清洗便利性", "HEPA等级"],
          weight: 20,
          targetUsers: "长期使用、成本敏感"
        }
      ]
    }
  }
};

// 评测维度设计原则
const DIMENSION_DESIGN_PRINCIPLES = {
  // 原则1: 根据价格区间定位设计维度
  byPriceInterval: {
    "低价区间": ["性价比最高", "最耐用", "最实用"],
    "中价区间": ["性能最强", "功能最全", "体验最佳"],
    "高价区间": ["创新最多", "品牌最好", "综合最优"]
  },
  
  // 原则2: 根据品类特性设计维度
  byCategoryType: {
    "电子产品": ["性能", "技术", "体验", "生态"],
    "服装鞋帽": ["舒适", "设计", "质量", "品牌"],
    "食品饮料": ["口感", "健康", "安全", "原料"],
    "美妆护肤": ["功效", "成分", "安全", "体验"],
    "家用电器": ["功能", "能效", "智能", "耐用"]
  },
  
  // 原则3: 根据用户需求设计维度
  byUserNeeds: {
    "实用型用户": ["性价比", "耐用性", "功能性"],
    "体验型用户": ["舒适度", "设计感", "智能化"],
    "品质型用户": ["品牌价值", "材料工艺", "技术创新"],
    "专业型用户": ["性能参数", "专业认证", "精准控制"]
  }
};

// 导出数据库
module.exports = {
  EVALUATION_DIMENSIONS_DB,
  DIMENSION_DESIGN_PRINCIPLES
};