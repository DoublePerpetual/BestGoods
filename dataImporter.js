const fs = require('fs');
const path = require('path');

// 数据导入器
class DataImporter {
  constructor() {
    this.dataDir = path.join(__dirname, 'data');
    this.categories = [];
    this.stats = {
      totalCategories: 0,
      level1: 0,
      level2: 0,
      level3: 0,
      items: 0
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
      
      console.log(`✅ 数据加载成功，原始数据大小: ${rawData.length} 字符`);
      console.log(`📊 数据结构类型: ${Array.isArray(data) ? '数组' : '对象'}`);
      
      if (Array.isArray(data)) {
        console.log(`📈 数组长度: ${data.length}`);
        this.categories = data;
        this.analyzeData();
      } else if (typeof data === 'object') {
        console.log('📦 对象数据，尝试解析结构...');
        this.parseObjectData(data);
      }
      
      return true;
    } catch (error) {
      console.error('❌ 数据加载失败:', error.message);
      return false;
    }
  }

  // 分析数据
  analyzeData() {
    console.log('\n🔍 开始分析数据...');
    
    // 统计各级分类
    const level1Set = new Set();
    const level2Set = new Set();
    const level3Set = new Set();
    let totalItems = 0;

    this.categories.forEach(category => {
      // 提取一级分类
      if (category.level1) {
        level1Set.add(category.level1);
      }
      
      // 提取二级分类
      if (category.level2) {
        level2Set.add(`${category.level1} > ${category.level2}`);
      }
      
      // 提取三级分类
      if (category.level3) {
        level3Set.add(`${category.level1} > ${category.level2} > ${category.level3}`);
      }
      
      // 统计商品数量
      if (category.items && Array.isArray(category.items)) {
        totalItems += category.items.length;
      }
    });

    this.stats = {
      totalCategories: this.categories.length,
      level1: level1Set.size,
      level2: level2Set.size,
      level3: level3Set.size,
      items: totalItems
    };

    console.log('📊 数据分析结果:');
    console.log(`   总分类数: ${this.stats.totalCategories}`);
    console.log(`   一级分类: ${this.stats.level1}`);
    console.log(`   二级分类: ${this.stats.level2}`);
    console.log(`   三级分类: ${this.stats.level3}`);
    console.log(`   商品总数: ${this.stats.items}`);
    
    // 显示前10个一级分类
    const level1List = Array.from(level1Set).slice(0, 10);
    console.log('\n🏷️  前10个一级分类:');
    level1List.forEach((cat, index) => {
      console.log(`   ${index + 1}. ${cat}`);
    });
  }

  // 解析对象数据
  parseObjectData(data) {
    console.log('📦 解析对象数据结构...');
    
    // 尝试不同的数据结构
    if (data.categories && Array.isArray(data.categories)) {
      this.categories = data.categories;
      this.analyzeData();
    } else if (data.data && Array.isArray(data.data)) {
      this.categories = data.data;
      this.analyzeData();
    } else {
      console.log('⚠️  未知的数据结构，尝试直接使用');
      this.categories = [data];
      this.analyzeData();
    }
  }

  // 转换为前端可用的格式
  convertToFrontendFormat() {
    console.log('\n🔄 转换为前端格式...');
    
    const frontendData = {
      categories: {},
      stats: this.stats,
      lastUpdated: new Date().toISOString()
    };

    // 按一级分类分组
    this.categories.forEach(cat => {
      if (!cat.level1) return;
      
      const level1 = cat.level1;
      const level2 = cat.level2 || '未分类';
      const level3 = cat.level3 || '未分类';
      
      // 初始化一级分类
      if (!frontendData.categories[level1]) {
        frontendData.categories[level1] = {
          icon: this.getIconForCategory(level1),
          region: 'global',
          children: {}
        };
      }
      
      // 初始化二级分类
      if (!frontendData.categories[level1].children[level2]) {
        frontendData.categories[level1].children[level2] = {
          icon: this.getIconForSubCategory(level2),
          dimensions: this.getDimensionsForCategory(level1, level2),
          items: []
        };
      }
      
      // 添加三级分类作为商品
      if (cat.items && Array.isArray(cat.items)) {
        frontendData.categories[level1].children[level2].items.push(
          ...cat.items.map(item => ({
            name: item,
            description: `${level3} - ${item}`,
            priceRange: this.getPriceRange(item),
            rating: Math.random() * 5 + 3 // 随机评分 3-8
          }))
        );
      } else {
        // 如果没有items，使用三级分类作为商品
        frontendData.categories[level1].children[level2].items.push({
          name: level3,
          description: `${level2} - ${level3}`,
          priceRange: this.getPriceRange(level3),
          rating: Math.random() * 5 + 3
        });
      }
    });

    console.log(`✅ 转换完成: ${Object.keys(frontendData.categories).length} 个一级分类`);
    return frontendData;
  }

  // 根据分类获取图标
  getIconForCategory(category) {
    const iconMap = {
      '数码': 'fa-microchip',
      '电子': 'fa-microchip',
      '家电': 'fa-house-chimney',
      '家居': 'fa-couch',
      '服装': 'fa-shirt',
      '美妆': 'fa-spa',
      '护肤': 'fa-spa',
      '食品': 'fa-utensils',
      '饮料': 'fa-wine-bottle',
      '运动': 'fa-person-running',
      '户外': 'fa-person-hiking',
      '母婴': 'fa-baby',
      '宠物': 'fa-paw',
      '汽车': 'fa-car',
      '办公': 'fa-briefcase',
      '健康': 'fa-heart',
      '图书': 'fa-book',
      '玩具': 'fa-gamepad'
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
      '食品': ['口感最好', '最健康', '最新鲜', '性价比最高']
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
    const outputPath = path.join(this.dataDir, 'converted-categories.json');
    fs.writeFileSync(outputPath, JSON.stringify(data, null, 2));
    console.log(`💾 转换后的数据已保存: ${outputPath}`);
    return outputPath;
  }
}

// 导出模块
module.exports = DataImporter;