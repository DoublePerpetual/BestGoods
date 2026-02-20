const fs = require('fs');
const path = require('path');

// 修复版数据导入器
class DataImporterFixed {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.categories = {};
    this.stats = {
      totalL1: 0,
      totalL2: 0,
      totalL3: 0,
      totalItems: 0
    };
  }

  // 加载19万多品类数据
  loadMassiveCategories() {
    try {
      const filePath = path.join(this.dataDir, 'global-categories-expanded.json');
      console.log(`📂 加载数据文件: ${filePath}`);
      
      if (!fs.existsSync(filePath)) {
        console.error('❌ 数据文件不存在');
        return false;
      }

      const rawData = fs.readFileSync(filePath, 'utf8');
      const data = JSON.parse(rawData);
      
      console.log(`✅ 数据加载成功，文件大小: ${(rawData.length / 1024 / 1024).toFixed(2)} MB`);
      
      // 检查数据结构
      if (data.metadata && data.categories) {
        console.log('📦 检测到标准数据结构');
        this.categories = data.categories;
        this.stats.totalL1 = data.metadata.stats.totalL1 || Object.keys(data.categories).length;
        this.stats.totalL2 = data.metadata.stats.totalL2 || 0;
        this.stats.totalL3 = data.metadata.stats.totalL3 || 0;
        
        // 计算实际的二级和三级数量
        this.calculateActualStats();
        
        return true;
      } else {
        console.log('⚠️  非标准数据结构，尝试解析');
        return this.parseAlternativeStructure(data);
      }
    } catch (error) {
      console.error('❌ 数据加载失败:', error.message);
      return false;
    }
  }

  // 计算实际统计数据
  calculateActualStats() {
    let totalL2 = 0;
    let totalL3 = 0;
    let totalItems = 0;

    Object.values(this.categories).forEach(l2Categories => {
      Object.values(l2Categories).forEach(l3Items => {
        if (Array.isArray(l3Items)) {
          totalL2++;
          totalL3 += l3Items.length;
          totalItems += l3Items.length;
        }
      });
    });

    this.stats.totalL2 = totalL2;
    this.stats.totalL3 = totalL3;
    this.stats.totalItems = totalItems;

    console.log('📊 实际统计数据:');
    console.log(`   一级分类: ${this.stats.totalL1}`);
    console.log(`   二级分类: ${this.stats.totalL2}`);
    console.log(`   三级分类: ${this.stats.totalL3}`);
    console.log(`   商品总数: ${this.stats.totalItems}`);
    
    // 显示前10个一级分类
    const level1List = Object.keys(this.categories).slice(0, 10);
    console.log('\n🏷️  前10个一级分类:');
    level1List.forEach((cat, index) => {
      const l2Count = Object.keys(this.categories[cat] || {}).length;
      console.log(`   ${index + 1}. ${cat} (${l2Count}个二级分类)`);
    });
  }

  // 解析替代数据结构
  parseAlternativeStructure(data) {
    console.log('🔄 尝试解析替代数据结构...');
    
    if (typeof data === 'object') {
      // 尝试作为一级分类处理
      this.categories = data;
      this.stats.totalL1 = Object.keys(data).length;
      this.calculateActualStats();
      return true;
    }
    
    return false;
  }

  // 转换为前端可用的三级目录格式
  convertToThreeLevelFormat() {
    console.log('\n🔄 转换为三级目录格式...');
    
    const result = {
      level1: {},
      stats: this.stats,
      lastUpdated: new Date().toISOString()
    };

    // 遍历一级分类
    Object.entries(this.categories).forEach(([level1, l2Categories]) => {
      if (!result.level1[level1]) {
        result.level1[level1] = {
          icon: this.getIconForCategory(level1),
          region: 'global',
          children: {}
        };
      }

      // 遍历二级分类
      Object.entries(l2Categories).forEach(([level2, l3Items]) => {
        if (Array.isArray(l3Items)) {
          result.level1[level1].children[level2] = {
            icon: this.getIconForSubCategory(level2),
            dimensions: this.getDimensionsForCategory(level1, level2),
            items: l3Items.map(item => ({
              name: item,
              description: `${level2} - ${item}`,
              priceRange: this.getPriceRange(item),
              rating: Math.random() * 5 + 3 // 随机评分 3-8
            }))
          };
        }
      });
    });

    console.log(`✅ 转换完成: ${Object.keys(result.level1).length} 个一级分类`);
    return result;
  }

  // 根据分类获取图标
  getIconForCategory(category) {
    const iconMap = {
      '个护健康': 'fa-user',
      '数码电子': 'fa-microchip',
      '家用电器': 'fa-house-chimney',
      '家居生活': 'fa-couch',
      '服装鞋帽': 'fa-shirt',
      '美妆护肤': 'fa-spa',
      '食品饮料': 'fa-utensils',
      '运动户外': 'fa-person-running',
      '母婴用品': 'fa-baby',
      '宠物用品': 'fa-paw',
      '汽车用品': 'fa-car',
      '办公用品': 'fa-briefcase',
      '图书音像': 'fa-book',
      '玩具游戏': 'fa-gamepad',
      '珠宝首饰': 'fa-gem',
      '钟表眼镜': 'fa-clock',
      '箱包皮具': 'fa-bag-shopping',
      '家居建材': 'fa-hammer',
      '农资农具': 'fa-tractor'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (category.includes(key)) {
        return icon;
      }
    }
    
    return 'fa-box';
  }

  getIconForSubCategory(subCategory) {
    const iconMap = {
      '手机': 'fa-mobile',
      '电脑': 'fa-laptop',
      '电视': 'fa-tv',
      '冰箱': 'fa-thermometer-half',
      '洗衣机': 'fa-soap',
      '空调': 'fa-wind',
      '相机': 'fa-camera',
      '耳机': 'fa-headphones',
      '手表': 'fa-clock',
      '鞋子': 'fa-shoe-prints',
      '衣服': 'fa-shirt',
      '包包': 'fa-bag-shopping',
      '化妆品': 'fa-lipstick',
      '护肤品': 'fa-spa',
      '食品': 'fa-utensils',
      '饮料': 'fa-wine-bottle',
      '玩具': 'fa-gamepad',
      '图书': 'fa-book',
      '家具': 'fa-couch'
    };
    
    for (const [key, icon] of Object.entries(iconMap)) {
      if (subCategory.includes(key)) {
        return icon;
      }
    }
    
    return 'fa-folder';
  }

  // 获取评测维度
  getDimensionsForCategory(level1, level2) {
    const dimensionsMap = {
      '数码': ['性能最强', '性价比最高', '设计最美', '功能最全'],
      '家电': ['最节能', '最静音', '功能最全', '性价比最高'],
      '美妆': ['效果最好', '最温和', '性价比最高', '口碑最好'],
      '服装': ['最舒适', '最耐穿', '设计最美', '性价比最高'],
      '食品': ['口感最好', '最健康', '最新鲜', '性价比最高'],
      '个护': ['效果最好', '最温和', '最耐用', '性价比最高'],
      '运动': ['性能最好', '最耐用', '最舒适', '性价比最高'],
      '母婴': ['最安全', '最温和', '最实用', '性价比最高'],
      '宠物': ['最安全', '最有效', '最耐用', '性价比最高']
    };
    
    for (const [key, dims] of Object.entries(dimensionsMap)) {
      if (level1.includes(key) || level2.includes(key)) {
        return dims;
      }
    }
    
    return ['质量最好', '性价比最高', '口碑最好', '最实用'];
  }

  // 获取价格区间
  getPriceRange(item) {
    const priceRanges = [
      '0-100元',
      '100-500元', 
      '500-1000元',
      '1000-3000元',
      '3000-5000元',
      '5000-10000元',
      '10000元以上'
    ];
    
    // 根据商品名称猜测价格区间
    const itemLower = item.toLowerCase();
    if (itemLower.includes('高端') || itemLower.includes('豪华') || itemLower.includes('旗舰')) {
      return priceRanges[5]; // 5000-10000元
    } else if (itemLower.includes('入门') || itemLower.includes('基础') || itemLower.includes('平价')) {
      return priceRanges[1]; // 100-500元
    } else if (itemLower.includes('中端') || itemLower.includes('主流')) {
      return priceRanges[3]; // 1000-3000元
    }
    
    // 随机返回一个价格区间
    return priceRanges[Math.floor(Math.random() * priceRanges.length)];
  }

  // 保存转换后的数据
  saveConvertedData(data) {
    const outputPath = path.join(this.dataDir, 'three-level-categories.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`💾 三级目录数据已保存: ${outputPath}`);
    return outputPath;
  }
}

// 导出模块
module.exports = DataImporterFixed;