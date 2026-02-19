// ==========================================
// 全球最佳商品百科全书 · 最佳商品数据库
// ==========================================

// 最佳商品数据库架构
// 每个品类的每个价格区间的每个维度，评选出1款最好的商品

const BEST_PRODUCTS_DB = {
  // 数码电子类
  "数码电子": {
    "智能手机": {
      // 入门级价格区间
      "phone_interval_1": {
        "phone_low_best_value": {
          id: "best_phone_low_value_001",
          productName: "Redmi Note 13 Pro",
          brand: "小米",
          price: 1599,
          priceRange: "¥999-¥1999",
          dimension: "性价比最高",
          recommendationReason: `
Redmi Note 13 Pro 在入门级价位提供了旗舰级的配置组合：
1. **处理器性能**：搭载骁龙7s Gen 2处理器，安兔兔跑分超过60万，日常使用流畅无卡顿
2. **内存配置**：8GB+256GB起步，支持内存扩展技术，多任务处理能力强
3. **屏幕素质**：6.67英寸1.5K OLED直屏，120Hz刷新率，同价位显示效果最佳
4. **摄像头系统**：2亿像素主摄，支持OIS光学防抖，夜景拍摄表现突出
5. **续航充电**：5100mAh大电池+67W快充，重度使用一天无压力

综合评分：9.2/10
推荐人群：学生、预算有限但追求实用性的用户
`,
          keyFeatures: [
            "骁龙7s Gen 2处理器",
            "2亿像素OIS主摄",
            "1.5K OLED 120Hz屏幕",
            "5100mAh + 67W快充",
            "IP54防尘防水"
          ],
          awards: ["2024年最佳性价比手机", "安兔兔性价比榜TOP3"],
          userRating: 4.7,
          reviewCount: 12500,
          availability: "全网有货",
          purchaseLink: "https://www.mi.com/redminote13pro"
        },
        "phone_low_best_battery": {
          id: "best_phone_low_battery_001",
          productName: "realme GT Neo6 SE",
          brand: "realme",
          price: 1799,
          priceRange: "¥999-¥1999",
          dimension: "续航最强",
          recommendationReason: `
realme GT Neo6 SE 在续航方面做到了极致：
1. **超大电池**：5500mAh超大容量电池，实测重度使用可达12小时
2. **能效优化**：搭载能效比极高的骁龙7+ Gen 3处理器，功耗控制出色
3. **快充技术**：100W超级闪充，26分钟充满100%，充电速度同价位最快
4. **智能省电**：AI智能调度算法，根据使用场景动态调整功耗
5. **续航测试**：PCMark续航测试成绩达到18小时，远超同价位竞品

综合评分：9.0/10
推荐人群：重度手机用户、出差人士、游戏玩家
`,
          keyFeatures: [
            "5500mAh超大电池",
            "100W超级闪充",
            "骁龙7+ Gen 3处理器",
            "6.78英寸1.5K屏幕",
            "超薄机身设计"
          ],
          awards: ["2024年最佳续航手机", "快充技术金奖"],
          userRating: 4.6,
          reviewCount: 9800,
          availability: "京东自营",
          purchaseLink: "https://www.realme.com/gtneo6se"
        },
        "phone_low_best_durability": {
          id: "best_phone_low_durability_001",
          productName: "荣耀X50",
          brand: "荣耀",
          price: 1399,
          priceRange: "¥999-¥1999",
          dimension: "最耐用",
          recommendationReason: `
荣耀X50 以军工级耐用性著称：
1. **十面抗摔**：通过瑞士SGS五星抗跌耐摔认证，1.5米高度跌落无损
2. **金刚巨犀玻璃**：第二代纳米微晶玻璃，抗摔性能提升10倍
3. **IP68防水**：同价位唯一支持IP68防尘防水的手机
4. **耐用测试**：经过100万次按键测试、10万次插拔测试
5. **用户口碑**：用户反馈故障率低于0.5%，质量可靠性行业领先

综合评分：8.8/10
推荐人群：户外工作者、学生、对耐用性要求高的用户
`,
          keyFeatures: [
            "十面抗摔设计",
            "IP68防尘防水",
            "金刚巨犀玻璃",
            "5800mAh大电池",
            "1亿像素主摄"
          ],
          awards: ["SGS五星抗摔认证", "2024年最耐用手机"],
          userRating: 4.5,
          reviewCount: 15600,
          availability: "官方商城",
          purchaseLink: "https://www.honor.com/x50"
        }
      },
      // 中端级价格区间
      "phone_interval_2": {
        "phone_mid_best_performance": {
          id: "best_phone_mid_performance_001",
          productName: "一加 Ace 3",
          brand: "一加",
          price: 2999,
          priceRange: "¥2000-¥3999",
          dimension: "性能最强",
          recommendationReason: `
一加 Ace 3 是性能旗舰的代表：
1. **顶级处理器**：搭载骁龙8 Gen 2满血版，安兔兔跑分突破165万
2. **游戏优化**：独显芯片X7，超帧超画引擎，120帧游戏稳定运行
3. **散热系统**：9140mm²超大VC散热，长时间游戏不降频
4. **内存配置**：LPDDR5X + UFS 4.0，应用启动速度提升40%
5. **性能测试**：原神60帧满帧运行3小时，温度控制在43°C以内

综合评分：9.5/10
推荐人群：游戏玩家、性能追求者、科技爱好者
`,
          keyFeatures: [
            "骁龙8 Gen 2满血版",
            "独显芯片X7",
            "9140mm² VC散热",
            "1.5K东方屏",
            "5500mAh+100W"
          ],
          awards: ["安兔兔性能榜TOP3", "最佳游戏手机"],
          userRating: 4.8,
          reviewCount: 23400,
          availability: "全网热销",
          purchaseLink: "https://www.oneplus.com/ace3"
        },
        "phone_mid_best_camera": {
          id: "best_phone_mid_camera_001",
          productName: "vivo X100",
          brand: "vivo",
          price: 3999,
          priceRange: "¥2000-¥3999",
          dimension: "拍照最好",
          recommendationReason: `
vivo X100 在影像方面达到了专业级水准：
1. **蔡司联合研发**：蔡司T*镀膜，减少眩光鬼影
2. **一英寸主摄**：IMX989一英寸大底，进光量提升76%
3. **长焦微距**：潜望式长焦支持微距拍摄，最近对焦距离15cm
4. **人像算法**：蔡司人像镜头包，模拟经典镜头虚化效果
5. **视频能力**：4K 120帧视频录制，电影级log模式

综合评分：9.3/10
推荐人群：摄影爱好者、社交媒体创作者、人像拍摄用户
`,
          keyFeatures: [
            "蔡司一英寸主摄",
            "潜望式长焦微距",
            "V3影像芯片",
            "天玑9300处理器",
            "120W闪充"
          ],
          awards: ["DXOMARK影像榜TOP5", "最佳拍照手机"],
          userRating: 4.7,
          reviewCount: 18900,
          availability: "官方旗舰店",
          purchaseLink: "https://www.vivo.com/x100"
        },
        "phone_mid_best_design": {
          id: "best_phone_mid_design_001",
          productName: "OPPO Reno11 Pro",
          brand: "OPPO",
          price: 3499,
          priceRange: "¥2000-¥3999",
          dimension: "设计最美",
          recommendationReason: `
OPPO Reno11 Pro 将美学设计做到了极致：
1. **流光宝石设计**：3D流光工艺，光线流转如宝石般璀璨
2. **超薄机身**：7.59mm厚度，184g重量，握持感极佳
3. **曲面屏设计**：3D微曲屏，视觉无边框，手感顺滑
4. **色彩美学**：月光宝石、曜石黑、松石绿三色，每种都经过精心调校
5. **细节工艺**：航空铝金属中框，AG磨砂玻璃后盖，质感出众

综合评分：9.1/10
推荐人群：时尚用户、外观党、女性用户
`,
          keyFeatures: [
            "流光宝石设计",
            "7.59mm超薄机身",
            "3D微曲屏",
            "天玑8200处理器",
            "80W超级闪充"
          ],
          awards: ["IF设计奖", "红点设计大奖"],
          userRating: 4.6,
          reviewCount: 14200,
          availability: "OPPO商城",
          purchaseLink: "https://www.oppo.com/reno11pro"
        }
      }
    },
    
    "笔记本电脑": {
      // 入门办公价格区间
      "laptop_interval_1": {
        "laptop_low_best_portability": {
          id: "best_laptop_low_portability_001",
          productName: "华为MateBook D 14 2024",
          brand: "华为",
          price: 4299,
          priceRange: "¥2999-¥4999",
          dimension: "最轻薄便携",
          recommendationReason: `
华为MateBook D 14 在便携性方面表现卓越：
1. **极致轻薄**：1.38kg重量，15.9mm厚度，轻松放入背包
2. **全面屏设计**：14英寸全面屏，90%屏占比，视觉沉浸
3. **超长续航**：56Wh大电池，本地视频播放可达13小时
4. **快充技术**：65W快充，充电15分钟办公3小时
5. **多屏协同**：华为生态互联，手机电脑无缝协作

综合评分：8.9/10
推荐人群：学生、商务人士、经常移动办公的用户
`,
          keyFeatures: [
            "1.38kg超轻机身",
            "14英寸全面屏",
            "56Wh长续航",
            "65W快充",
            "多屏协同"
          ],
          awards: ["最佳轻薄本", "学生首选笔记本"],
          userRating: 4.5,
          reviewCount: 8900,
          availability: "华为商城",
          purchaseLink: "https://www.huawei.com/matebookd14"
        },
        "laptop_low_best_battery": {
          id: "best_laptop_low_battery_001",
          productName: "联想小新Air 14 2024",
          brand: "联想",
          price: 4699,
          priceRange: "¥2999-¥4999",
          dimension: "续航时间最长",
          recommendationReason: `
联想小新Air 14 在续航方面做到了同价位最佳：
1. **超大电池**：75Wh超大容量电池，PCMark现代办公续航测试达16小时
2. **能效优化**：英特尔酷睿Ultra处理器，能效比提升40%
3. **智能省电**：联想智能引擎，根据使用场景动态调整功耗
4. **快充支持**：100W PD快充，30分钟充电50%
5. **实际测试**：实际办公使用可达12小时，满足全天需求

综合评分：9.0/10
推荐人群：图书馆学习、外出办公、对续航要求高的用户
`,
          keyFeatures: [
            "75Wh超大电池",
            "16小时长续航",
            "酷睿Ultra处理器",
            "2.8K 120Hz屏幕",
            "100W PD快充"
          ],
          awards: ["最佳续航笔记本", "PCMark续航冠军"],
          userRating: 4.6,
          reviewCount: 11200,
          availability: "联想官方",
          purchaseLink: "https://www.lenovo.com/xiaoxinair14"
        }
      }
    }
  },
  
  // 服装鞋帽类
  "服装鞋帽": {
    "T恤": {
      // 基础款价格区间
      "tshirt_interval_1": {
        "tshirt_low_best_comfort": {
          id: "best_tshirt_low_comfort_001",
          productName: "优衣库AIRism棉质圆领T恤",
          brand: "优衣库",
          price: 79,
          priceRange: "¥29-¥99",
          dimension: "最舒适",
          recommendationReason: `
优衣库AIRism棉质T恤在舒适度方面无可挑剔：
1. **面料科技**：AIRism技术，棉质触感+速干功能，透气性提升30%
2. **亲肤体验**：经过特殊处理的棉纤维，触感柔软顺滑
3. **弹性设计**：适度弹性，活动自如不束缚
4. **四季适用**：冬暖夏凉，温度调节功能
5. **用户口碑**：累计销售超1亿件，舒适度评分4.8/5

综合评分：9.2/10
推荐人群：日常穿着、居家休闲、对舒适度要求高的用户
`,
          keyFeatures: [
            "AIRism棉质面料",
            "速干透气技术",
            "亲肤柔软触感",
            "适度弹性设计",
            "多色可选"
          ],
          awards: ["最佳舒适T恤", "年度畅销单品"],
          userRating: 4.8,
          reviewCount: 256000,
          availability: "全国门店",
          purchaseLink: "https://www.uniqlo.com/airism-tshirt"
        },
        "tshirt_low_best_durability": {
          id: "best_tshirt_low_durability_001",
          productName: "李宁基础款纯棉T恤",
          brand: "李宁",
          price: 69,
          priceRange: "¥29-¥99",
          dimension: "最耐穿",
          recommendationReason: `
李宁基础款T恤以耐用性著称：
1. **高支棉纱**：32支精梳棉，密度高不易变形
2. **加固工艺**：领口、袖口、下摆三重加固，洗涤50次不变形
3. **色牢度强**：经过5级色牢度测试，洗涤不褪色
4. **抗起球**：特殊纺织工艺，有效减少起球现象
5. **耐用测试**：实验室测试可承受100次机洗仍保持良好状态

综合评分：8.7/10
推荐人群：学生、实用主义者、需要频繁洗涤的用户
`,
          keyFeatures: [
            "32支精梳棉",
            "三重加固工艺",
            "5级色牢度",
            "抗起球处理",
            "简约设计"
          ],
          awards: ["最耐穿T恤", "质量认证产品"],
          userRating: 4.5,
          reviewCount: 89000,
          availability: "李宁官方",
          purchaseLink: "https://www.lining.com/basic-tshirt"
        }
      }
    },
    
    "运动鞋": {
      // 入门运动价格区间
      "sneaker_interval_1": {
        "sneaker_low_best_comfort": {
          id: "best_sneaker_low_comfort_001",
          productName: "安踏氢跑鞋4.0",
          brand: "安踏",
          price: 399,
          priceRange: "¥199-¥499",
          dimension: "最舒适",
          recommendationReason: `
安踏氢跑鞋4.0在舒适度方面做到了极致：
1. **超轻材质**：单只鞋重仅150g，穿着如羽毛般轻盈
2. **中底科技**：FLASHLITE 4.0中底，能量回馈率75%
3. **鞋垫设计**：Ortholite鞋垫，透气吸汗，长时间穿着不闷脚
4. **包裹性**：一体织鞋面，自适应包裹，不压脚背
5. **用户反馈**：95%用户表示"最舒服的运动鞋"

综合评分：9.1/10
推荐人群：日常穿着、轻度运动、对舒适度要求高的用户
`,
          keyFeatures: [
            "150g超轻设计",
            "FLASHLITE 4.0中底",
            "Ortholite鞋垫",
            "一体织鞋面",
            "多色可选"
          ],
          awards: ["最舒适跑鞋", "设计创新奖"],
          userRating: 4.7,
          reviewCount: 67000,
          availability: "安踏官方",
          purchaseLink: "https://www.anta.com/hydrogen4"
        },
        "sneaker_low_best_durability": {
          id: "best_sneaker_low_durability_001",
          productName: "特步耐磨训练鞋",
          brand: "特步",
          price: 299,
          priceRange: "¥199-¥499",
          dimension: "最耐磨",
          recommendationReason: `
特步耐磨训练鞋在耐用性方面表现突出：
1. **耐磨大底**：高密度橡胶大底，耐磨测试达1000公里
2. **加固鞋头**：防撞鞋头设计，保护脚趾
3. **抗撕裂鞋面**：高强度网布鞋面，抗撕裂性能优秀
4. **持久缓震**：中底材料耐久性好，长时间使用不变形`
        }
      ]
    }
  }
};

// 导出数据库
module.exports = {
  BEST_PRODUCTS_DB,
  DB_STATS
};