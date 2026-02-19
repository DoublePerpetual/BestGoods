/**
 * 质量验证模块 - 确保真正的AI评选结果的高质量
 * 验证标准：真实性、详细性、准确性、合理性
 */

const fs = require('fs');
const path = require('path');

// 质量验证配置
const QUALITY_CONFIG = {
  // 品牌验证
  minRealBrandPercentage: 0.8,      // 至少80%的品牌必须是真实的
  genericBrandPatterns: [
    /品牌[ABC]/,
    /示例品牌/,
    /知名品牌/,
    /test brand/i,
    /demo brand/i,
    /fake brand/i,
    /虚拟品牌/,
    /测试品牌/
  ],
  
  // 内容质量
  minReasonLength: 200,             // 最小评选理由长度
  minConfidence: 70,                // 最小置信度
  maxConfidence: 100,               // 最大置信度（检查异常值）
  
  // 价格合理性
  minPrice: 0.1,                    // 最小合理价格
  maxPriceFactor: 1000,             // 最高价格不能超过最低价格的1000倍
  
  // 数据结构完整性
  requiredFields: [
    'level1', 'level2', 'item', 'bestProducts',
    'priceRanges', 'dimensions', 'analysis'
  ],
  productRequiredFields: [
    'priceRange', 'dimension', 'productName', 'brand',
    'price', 'selectionReason', 'confidenceScore'
  ],
  
  // 语义合理性检查
  semanticChecks: {
    minUniqueWords: 20,             // 评选理由至少20个不同单词（从30降低）
    maxRepetition: 0.3,             // 最大重复率30%
    minSentences: 3                 // 至少3个句子
  }
};

// 真实品牌数据库（按品类分类）
const REAL_BRANDS_DATABASE = {
  // 个护健康
  '个护健康': {
    '剃须用品': ['吉列', '舒适', '飞利浦', '博朗', '松下', '飞科', '奔腾', '超人'],
    '口腔保健': ['高露洁', '佳洁士', '舒适达', '欧乐B', '云南白药', '狮王', '皓乐齿', '李施德林'],
    '护肤': ['欧莱雅', '雅诗兰黛', '资生堂', 'SK-II', '海蓝之谜', '兰蔻', '科颜氏', '理肤泉'],
    '洗发护发': ['潘婷', '海飞丝', '施华蔻', '欧莱雅', '资生堂', '沙宣', '清扬'],
  },
  // 数码电子
  '数码电子': {
    '智能手机': ['苹果', '华为', '小米', '三星', 'OPPO', 'vivo', '荣耀', '一加'],
    '笔记本电脑': ['苹果', '联想', '戴尔', '惠普', '华硕', '微软', '华为', '小米'],
    '平板电脑': ['苹果', '华为', '三星', '小米', '联想', '微软', '荣耀'],
  },
  // 默认通用品牌
  '_default': ['苹果', '华为', '小米', '三星', '索尼', '戴尔', '惠普', '联想', '佳能', '尼康']
};

class QualityValidator {
  constructor() {
    this.stats = {
      totalValidations: 0,
      passedValidations: 0,
      failedValidations: 0,
      qualityIssues: []
    };
  }
  
  /**
   * 验证单个品类数据
   */
  validateCategory(category) {
    const issues = [];
    const categoryName = `${category.level1} > ${category.level2} > ${category.item}`;
    
    // 1. 基础数据结构验证
    const structureIssues = this.validateStructure(category);
    issues.push(...structureIssues.map(issue => `[结构] ${issue}`));
    
    // 2. 品牌真实性验证
    const brandIssues = this.validateBrands(category);
    issues.push(...brandIssues.map(issue => `[品牌] ${issue}`));
    
    // 3. 内容质量验证
    const contentIssues = this.validateContent(category);
    issues.push(...contentIssues.map(issue => `[内容] ${issue}`));
    
    // 4. 价格合理性验证
    const priceIssues = this.validatePrices(category);
    issues.push(...priceIssues.map(issue => `[价格] ${issue}`));
    
    // 5. 语义合理性验证
    const semanticIssues = this.validateSemantics(category);
    issues.push(...semanticIssues.map(issue => `[语义] ${issue}`));
    
    // 更新统计
    this.stats.totalValidations++;
    if (issues.length === 0) {
      this.stats.passedValidations++;
      console.log(`✅ 品类验证通过: ${categoryName}`);
    } else {
      this.stats.failedValidations++;
      console.log(`⚠️  品类验证问题: ${categoryName} (${issues.length}个问题)`);
      issues.forEach(issue => console.log(`   - ${issue}`));
      
      // 记录问题
      this.stats.qualityIssues.push({
        category: categoryName,
        issues: issues,
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      isValid: issues.length === 0,
      issues: issues,
      categoryName: categoryName
    };
  }
  
  /**
   * 验证数据结构完整性
   */
  validateStructure(category) {
    const issues = [];
    
    // 检查必需字段
    QUALITY_CONFIG.requiredFields.forEach(field => {
      if (!category.hasOwnProperty(field)) {
        issues.push(`缺少必需字段: ${field}`);
      }
    });
    
    // 检查最佳产品数组
    if (!Array.isArray(category.bestProducts)) {
      issues.push('bestProducts必须是数组');
    } else if (category.bestProducts.length === 0) {
      issues.push('bestProducts为空');
    } else {
      // 检查每个产品的必需字段
      category.bestProducts.forEach((product, index) => {
        QUALITY_CONFIG.productRequiredFields.forEach(field => {
          if (!product.hasOwnProperty(field)) {
            issues.push(`产品${index + 1}缺少字段: ${field}`);
          }
        });
      });
    }
    
    // 检查价格区间数组
    if (!Array.isArray(category.priceRanges)) {
      issues.push('priceRanges必须是数组');
    } else if (category.priceRanges.length === 0) {
      issues.push('priceRanges为空');
    }
    
    // 检查评价维度数组
    if (!Array.isArray(category.dimensions)) {
      issues.push('dimensions必须是数组');
    } else if (category.dimensions.length === 0) {
      issues.push('dimensions为空');
    }
    
    return issues;
  }
  
  /**
   * 验证品牌真实性
   */
  validateBrands(category) {
    const issues = [];
    
    if (!category.bestProducts || !Array.isArray(category.bestProducts)) {
      return issues;
    }
    
    const products = category.bestProducts;
    let realBrandCount = 0;
    let genericBrandCount = 0;
    const problematicBrands = [];
    
    products.forEach((product, index) => {
      const brand = String(product.brand || '').trim();
      
      if (!brand) {
        issues.push(`产品${index + 1}品牌为空`);
        genericBrandCount++;
        return;
      }
      
      // 检查是否是模板品牌
      const isGeneric = QUALITY_CONFIG.genericBrandPatterns.some(pattern => 
        pattern.test(brand)
      );
      
      // 检查是否是真实品牌
      const isRealBrand = this.isRealBrand(category.level1, category.level2, brand);
      
      if (isGeneric) {
        genericBrandCount++;
        problematicBrands.push(`${brand} (产品${index + 1}: 模板品牌)`);
      } else if (!isRealBrand) {
        genericBrandCount++;
        problematicBrands.push(`${brand} (产品${index + 1}: 未识别的品牌)`);
      } else {
        realBrandCount++;
      }
    });
    
    // 计算真实品牌比例
    const totalProducts = products.length;
    const realBrandPercentage = totalProducts > 0 ? realBrandCount / totalProducts : 0;
    
    if (realBrandPercentage < QUALITY_CONFIG.minRealBrandPercentage) {
      issues.push(`真实品牌比例过低: ${(realBrandPercentage * 100).toFixed(1)}% (要求: ${QUALITY_CONFIG.minRealBrandPercentage * 100}%)`);
    }
    
    // 如果有问题品牌，添加到问题列表
    if (problematicBrands.length > 0) {
      issues.push(`问题品牌: ${problematicBrands.join(', ')}`);
    }
    
    return issues;
  }
  
  /**
   * 检查品牌是否是真实品牌
   */
  isRealBrand(level1, level2, brandName) {
    // 标准化品牌名称（去掉空格、特殊字符、转换为小写比较）
    const normalize = (str) => str.toLowerCase().replace(/[^\w\u4e00-\u9fa5]/g, '');
    const normalizedBrand = normalize(brandName);
    
    // 检查品类特定品牌
    if (REAL_BRANDS_DATABASE[level1] && REAL_BRANDS_DATABASE[level1][level2]) {
      const categoryBrands = REAL_BRANDS_DATABASE[level1][level2];
      const normalizedCategoryBrands = categoryBrands.map(normalize);
      
      if (normalizedCategoryBrands.some(brand => normalizedBrand.includes(brand) || brand.includes(normalizedBrand))) {
        return true;
      }
    }
    
    // 检查通用品牌
    const defaultBrands = REAL_BRANDS_DATABASE['_default'];
    const normalizedDefaultBrands = defaultBrands.map(normalize);
    
    if (normalizedDefaultBrands.some(brand => normalizedBrand.includes(brand) || brand.includes(normalizedBrand))) {
      return true;
    }
    
    // 启发式检查：中文品牌通常至少2个字符
    if (/^[\u4e00-\u9fa5]{2,}$/.test(brandName)) {
      // 可能是真实的中文品牌
      return true;
    }
    
    return false;
  }
  
  /**
   * 验证内容质量
   */
  validateContent(category) {
    const issues = [];
    
    if (!category.bestProducts || !Array.isArray(category.bestProducts)) {
      return issues;
    }
    
    category.bestProducts.forEach((product, index) => {
      // 检查评选理由长度
      const reason = product.selectionReason || '';
      if (reason.length < QUALITY_CONFIG.minReasonLength) {
        issues.push(`产品${index + 1}评选理由过短: ${reason.length}字符 (要求: ${QUALITY_CONFIG.minReasonLength})`);
      }
      
      // 检查置信度
      const confidence = product.confidenceScore || 0;
      if (confidence < QUALITY_CONFIG.minConfidence) {
        issues.push(`产品${index + 1}置信度过低: ${confidence}% (要求: ${QUALITY_CONFIG.minConfidence}%)`);
      }
      if (confidence > QUALITY_CONFIG.maxConfidence) {
        issues.push(`产品${index + 1}置信度过高: ${confidence}% (可能异常)`);
      }
      
      // 检查数据来源
      const dataSources = product.dataSources || '';
      if (!dataSources || dataSources.trim().length < 10) {
        issues.push(`产品${index + 1}数据来源信息不足`);
      }
    });
    
    return issues;
  }
  
  /**
   * 验证价格合理性
   */
  validatePrices(category) {
    const issues = [];
    
    if (!category.bestProducts || !Array.isArray(category.bestProducts)) {
      return issues;
    }
    
    const prices = category.bestProducts
      .map(product => parseFloat(product.price) || 0)
      .filter(price => price > 0);
    
    if (prices.length === 0) {
      issues.push('没有有效的价格数据');
      return issues;
    }
    
    // 检查价格范围
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    
    if (minPrice < QUALITY_CONFIG.minPrice) {
      issues.push(`价格过低: ¥${minPrice} (低于最小合理价格 ¥${QUALITY_CONFIG.minPrice})`);
    }
    
    if (maxPrice / minPrice > QUALITY_CONFIG.maxPriceFactor) {
      issues.push(`价格范围异常: 最高价(¥${maxPrice})是最低价(¥${minPrice})的${(maxPrice / minPrice).toFixed(1)}倍`);
    }
    
    // 检查价格区间定义
    if (category.priceRanges && Array.isArray(category.priceRanges)) {
      category.priceRanges.forEach((range, index) => {
        const min = parseFloat(range.min_price) || 0;
        const max = parseFloat(range.max_price) || 0;
        
        if (min >= max && max > 0) {
          issues.push(`价格区间${index + 1}定义错误: 最小值(¥${min})大于等于最大值(¥${max})`);
        }
      });
    }
    
    return issues;
  }
  
  /**
   * 验证语义合理性
   */
  validateSemantics(category) {
    const issues = [];
    
    if (!category.bestProducts || !Array.isArray(category.bestProducts)) {
      return issues;
    }
    
    category.bestProducts.forEach((product, index) => {
      const reason = product.selectionReason || '';
      
      // 检查句子数量
      const sentences = reason.split(/[。！？.!?]/).filter(s => s.trim().length > 0);
      if (sentences.length < QUALITY_CONFIG.semanticChecks.minSentences) {
        issues.push(`产品${index + 1}评选理由句子数量不足: ${sentences.length}句 (要求: ${QUALITY_CONFIG.semanticChecks.minSentences}句)`);
      }
      
      // 检查词汇多样性
      const words = reason.match(/[\u4e00-\u9fa5\w]+/g) || [];
      const uniqueWords = new Set(words.map(w => w.toLowerCase()));
      
      if (uniqueWords.size < QUALITY_CONFIG.semanticChecks.minUniqueWords) {
        issues.push(`产品${index + 1}词汇多样性不足: ${uniqueWords.size}个不同单词 (要求: ${QUALITY_CONFIG.semanticChecks.minUniqueWords}个)`);
      }
      
      // 检查重复率（简单启发式）
      if (words.length > 0) {
        const wordFrequency = {};
        words.forEach(word => {
          const normalizedWord = word.toLowerCase();
          wordFrequency[normalizedWord] = (wordFrequency[normalizedWord] || 0) + 1;
        });
        
        const maxFrequency = Math.max(...Object.values(wordFrequency));
        const repetitionRate = maxFrequency / words.length;
        
        if (repetitionRate > QUALITY_CONFIG.semanticChecks.maxRepetition) {
          issues.push(`产品${index + 1}词汇重复率过高: ${(repetitionRate * 100).toFixed(1)}%`);
        }
      }
    });
    
    return issues;
  }
  
  /**
   * 批量验证所有品类
   */
  validateAllCategories(categories) {
    console.log(`🔍 开始批量质量验证: ${categories.length} 个品类`);
    
    const results = {
      total: categories.length,
      passed: 0,
      failed: 0,
      details: []
    };
    
    categories.forEach((category, index) => {
      console.log(`\n[${index + 1}/${categories.length}] 验证品类: ${category.level1} > ${category.level2} > ${category.item}`);
      
      const validationResult = this.validateCategory(category);
      
      results.details.push({
        category: `${category.level1} > ${category.level2} > ${category.item}`,
        ...validationResult
      });
      
      if (validationResult.isValid) {
        results.passed++;
      } else {
        results.failed++;
      }
    });
    
    console.log('\n' + '='.repeat(60));
    console.log('📊 质量验证统计:');
    console.log(`   总品类数: ${results.total}`);
    console.log(`   通过验证: ${results.passed} (${((results.passed / results.total) * 100).toFixed(1)}%)`);
    console.log(`   未通过验证: ${results.failed} (${((results.failed / results.total) * 100).toFixed(1)}%)`);
    
    if (results.failed > 0) {
      console.log('\n⚠️  未通过验证的品类:');
      results.details.filter(d => !d.isValid).forEach(detail => {
        console.log(`   - ${detail.categoryName}`);
        detail.issues.forEach(issue => console.log(`     ${issue}`));
      });
    }
    
    // 生成质量报告
    const qualityReport = {
      timestamp: new Date().toISOString(),
      summary: {
        totalCategories: results.total,
        passed: results.passed,
        failed: results.failed,
        passRate: (results.passed / results.total) * 100
      },
      details: results.details,
      stats: this.stats
    };
    
    // 保存质量报告
    const reportPath = path.join(__dirname, 'data', 'quality-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2));
    console.log(`📄 质量报告已保存: ${reportPath}`);
    
    return qualityReport;
  }
  
  /**
   * 获取验证统计
   */
  getStats() {
    return {
      ...this.stats,
      passRate: this.stats.totalValidations > 0 ? 
        (this.stats.passedValidations / this.stats.totalValidations) * 100 : 0
    };
  }
}

// 导出模块
module.exports = {
  QualityValidator,
  QUALITY_CONFIG,
  REAL_BRANDS_DATABASE
};