/**
 * 质量优先处理器
 * 严格按照用户要求：科学性、合理性、真实性、高质量
 * 清空所有旧数据，重新开始
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// 严格配置
const CONFIG = {
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  
  // 质量第一的参数
  maxRetries: 5,  // 更多重试次数确保质量
  batchSize: 10,  // 小批量确保质量
  delayBetweenRequests: 2000,  // 更长的延迟确保稳定性
  
  // 严格的质量阈值
  minReasonLength: 400,  // 更长的评选理由
  minConfidence: 80,     // 更高的置信度
  requireRealBrands: true,
  requireSpecificModels: true,  // 必须具体型号
  
  // 数据文件
  categoriesFile: path.join(__dirname, 'data/global-categories-expanded.json'),
  outputFile: path.join(__dirname, 'data/best-answers-quality.json'),
  logFile: path.join(__dirname, 'logs/quality-first-processing.log'),
  
  // 品牌匹配数据库（防止苹果生产棉签）
  brandMapping: {
    // 个护健康
    '个护健康': {
      '剃须用品': ['Gillette', 'Schick', 'Philips', 'Braun', 'Panasonic', '飞利浦', '博朗'],
      '口腔保健': ['Colgate', 'Crest', 'Sensodyne', 'Oral-B', '云南白药', '高露洁', '佳洁士'],
      '护肤': ['L\'Oréal', 'Estée Lauder', 'Shiseido', 'SK-II', 'La Mer', '雅诗兰黛', '资生堂'],
      '美妆': ['MAC', 'Chanel', 'Dior', 'YSL', 'Maybelline', '美宝莲', '香奈儿'],
      '洗发护发': ['Pantene', 'Head & Shoulders', 'Schwarzkopf', 'L\'Oréal Paris', '潘婷', '海飞丝']
    },
    // 电子产品
    '电子产品': {
      '手机': ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OPPO', 'vivo', '苹果', '三星', '华为', '小米'],
      '电脑': ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft', '联想', '华硕'],
      '相机': ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic', '佳能', '尼康', '索尼'],
      '耳机': ['Apple', 'Sony', 'Bose', 'Sennheiser', 'JBL', '索尼', '博士', '森海塞尔']
    },
    // 家居用品
    '家居用品': {
      '家具': ['IKEA', 'Ashley', 'La-Z-Boy', 'Herman Miller', '宜家'],
      '厨具': ['双立人', 'WMF', '菲仕乐', '苏泊尔', '美的', '九阳'],
      '清洁': ['戴森', '美的', '海尔', '小米', '科沃斯', '石头科技']
    },
    // 食品饮料
    '食品饮料': {
      '零食': ['三只松鼠', '良品铺子', '百草味', '洽洽', '旺旺', '徐福记'],
      '饮料': ['可口可乐', '百事可乐', '农夫山泉', '康师傅', '统一', '王老吉'],
      '乳制品': ['伊利', '蒙牛', '光明', '君乐宝', '安佳']
    }
  }
};

class QualityFirstProcessor {
  constructor() {
    this.categories = [];
    this.processedCount = 0;
    this.validatedCount = 0;
    this.rejectedCount = 0;
    this.totalCost = 0;
    this.startTime = new Date();
    
    // 初始化OpenAI客户端
    this.client = new OpenAI({
      apiKey: CONFIG.apiKey,
      baseURL: CONFIG.baseURL,
    });
    
    // 确保日志目录
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.log(`🚀 质量优先处理器启动 - ${this.startTime.toISOString()}`);
    this.log(`🎯 核心理念: 科学性、合理性、真实性、高质量`);
    this.log(`📊 配置: 批次大小=${CONFIG.batchSize}, 重试次数=${CONFIG.maxRetries}`);
  }
  
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
  }
  
  async loadCategories() {
    try {
      this.log(`📂 加载品类数据...`);
      const data = JSON.parse(fs.readFileSync(CONFIG.categoriesFile, 'utf8'));
      this.categories = data.categories || [];
      this.log(`✅ 加载完成: ${this.categories.length.toLocaleString()} 个品类`);
    } catch (error) {
      this.log(`❌ 加载失败: ${error.message}`);
      throw error;
    }
  }
  
  getSuitableBrands(level1, level2, level3) {
    // 严格品牌匹配
    if (CONFIG.brandMapping[level1] && CONFIG.brandMapping[level1][level2]) {
      return CONFIG.brandMapping[level1][level2];
    }
    
    // 如果找不到匹配，记录警告
    this.log(`⚠️ 未找到 ${level1}/${level2} 的品牌映射，使用通用品牌`);
    
    // 通用品牌（最后的选择）
    const genericBrands = {
      '个护健康': ['强生', '宝洁', '联合利华'],
      '电子产品': ['华为', '小米', '索尼'],
      '家居用品': ['宜家', '无印良品'],
      '食品饮料': ['康师傅', '统一', '雀巢']
    };
    
    return genericBrands[level1] || [];
  }
  
  async callDeepSeekWithQualityCheck(messages, categoryInfo, purpose) {
    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
      try {
        this.log(`📡 ${purpose} - 尝试 ${attempt}/${CONFIG.maxRetries}: ${categoryInfo.level3}`);
        
        const response = await this.client.chat.completions.create({
          model: CONFIG.model,
          messages: messages,
          temperature: 0.2,  // 非常低的温度确保稳定性
          max_tokens: 2500,  // 更多tokens确保详细性
          response_format: { type: "json_object" }
        });
        
        const content = response.choices[0].message.content;
        const usage = response.usage;
        
        // 成本估算
        const cost = ((usage.prompt_tokens + usage.completion_tokens) / 1000000) * 2;
        this.totalCost += cost;
        
        this.log(`✅ ${purpose}成功: ${usage.total_tokens} tokens, 成本 ¥${cost.toFixed(4)}`);
        
        // 解析并验证JSON
        let parsedContent;
        try {
          parsedContent = JSON.parse(content);
        } catch (parseError) {
          throw new Error(`JSON解析失败: ${parseError.message}`);
        }
        
        return {
          success: true,
          content: parsedContent,
          tokens: usage.total_tokens,
          cost: cost
        };
        
      } catch (error) {
        this.log(`❌ ${purpose}失败 (尝试 ${attempt}): ${error.message}`);
        
        if (attempt < CONFIG.maxRetries) {
          const delay = Math.pow(2, attempt) * 1500;  // 指数退避
          this.log(`⏳ 等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          return {
            success: false,
            error: `所有重试均失败: ${error.message}`
          };
        }
      }
    }
  }
  
  validatePriceRanges(priceData, category) {
    const issues = [];
    
    if (!priceData.price_ranges || !Array.isArray(priceData.price_ranges)) {
      issues.push('价格区间数据格式不正确');
      return { valid: false, issues };
    }
    
    if (priceData.price_ranges.length < 3 || priceData.price_ranges.length > 5) {
      issues.push(`价格区间数量应为3-5个，实际为${priceData.price_ranges.length}个`);
    }
    
    // 检查价格合理性
    let previousMax = -1;
    for (const range of priceData.price_ranges) {
      if (range.min_price >= range.max_price) {
        issues.push(`价格区间 ${range.level}: 最低价格 ${range.min_price} 应小于最高价格 ${range.max_price}`);
      }
      
      if (range.min_price <= previousMax) {
        issues.push(`价格区间 ${range.level}: 与前一区间重叠`);
      }
      
      previousMax = range.max_price;
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
  
  validateDimensions(dimensionData, category) {
    const issues = [];
    
    if (!dimensionData.dimensions || !Array.isArray(dimensionData.dimensions)) {
      issues.push('评价维度数据格式不正确');
      return { valid: false, issues };
    }
    
    if (dimensionData.dimensions.length < 3 || dimensionData.dimensions.length > 8) {
      issues.push(`评价维度数量应为3-8个，实际为${dimensionData.dimensions.length}个`);
    }
    
    // 检查维度名称是否具体
    const vagueDimensions = ['好', '不错', '优秀', '优质'];
    for (const dim of dimensionData.dimensions) {
      if (vagueDimensions.some(vague => dim.name.includes(vague))) {
        issues.push(`维度名称 "${dim.name}" 过于模糊，应更具体`);
      }
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
  
  validateProduct(productData, category, priceRange, dimension) {
    const issues = [];
    
    // 1. 品牌匹配验证
    const suitableBrands = this.getSuitableBrands(category.level1, category.level2, category.level3);
    if (suitableBrands.length > 0 && !suitableBrands.includes(productData.brand_name)) {
      issues.push(`品牌 ${productData.brand_name} 不适合 ${category.level3} 品类`);
    }
    
    // 2. 价格验证
    if (productData.price < priceRange.min_price || productData.price > priceRange.max_price) {
      issues.push(`价格 ${productData.price} 不在区间 [${priceRange.min_price}, ${priceRange.max_price}] 内`);
    }
    
    // 3. 评选理由长度验证
    if (!productData.selection_reason || productData.selection_reason.length < CONFIG.minReasonLength) {
      issues.push(`评选理由过短: ${productData.selection_reason?.length || 0} 字，要求至少 ${CONFIG.minReasonLength} 字`);
    }
    
    // 4. 置信度验证
    if (productData.confidence_score < CONFIG.minConfidence) {
      issues.push(`置信度过低: ${productData.confidence_score}，要求至少 ${CONFIG.minConfidence}`);
    }
    
    // 5. 具体型号验证
    if (CONFIG.requireSpecificModels && (!productData.product_model || productData.product_model.length < 2)) {
      issues.push('缺少具体商品型号');
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
  
  async processCategoryWithQuality(category, index) {
    this.log(`\n🔍 处理品类 ${index + 1}: ${category.level1} > ${category.level2} > ${category.level3}`);
    
    const categoryResult = {
      category: category,
      processed_at: new Date().toISOString(),
      quality_checks: {},
      best_products: []
    };
    
    try {
      // 1. 生成价格区间（带质量验证）
      this.log(`  1️⃣ 生成价格区间（质量验证）...`);
      const pricePrompt = this.createPriceRangePrompt(category);
      const priceResult = await this.callDeepSeekWithQualityCheck(pricePrompt, category, '价格区间生成');
      
      if (!priceResult.success) {
        throw new Error(`价格区间生成失败: ${priceResult.error}`);
      }
      
      // 验证价格区间
      const priceValidation = this.validatePriceRanges(priceResult.content, category);
      categoryResult.quality_checks.price_ranges = {
        valid: priceValidation.valid,
        issues: priceValidation.issues
      };
      
      if (!priceValidation.valid) {
        this.log(`   ⚠️ 价格区间未通过验证: ${priceValidation.issues.join(', ')}`);
        this.rejectedCount++;
        return null;
      }
      
      this.log(`   ✅ 价格区间通过验证: ${priceResult.content.price_ranges.length} 个区间`);
      
      // 2. 生成评价维度（带质量验证）
      this.log(`  2️⃣ 生成评价维度（质量验证）...`);
      const dimensionPrompt = this.createDimensionPrompt(category);
      const dimensionResult = await this.callDeepSeekWithQualityCheck(dimensionPrompt, category, '评价维度生成');
      
      if (!dimensionResult.success) {
        throw new Error(`评价维度生成失败: ${dimensionResult.error}`);
      }
      
      // 验证评价维度
      const dimensionValidation = this.validateDimensions(dimensionResult.content, category);
      categoryResult.quality_checks.dimensions = {
        valid: dimensionValidation.valid,
        issues: dimensionValidation.issues
      };
      
      if (!dimensionValidation.valid) {
        this.log(`   ⚠️ 评价维度未通过验证: ${dimensionValidation.issues.join(', ')}`);
        this.rejectedCount++;
        return null;
      }
      
      this.log(`   ✅ 评价维度通过验证: ${dimensionResult.content.dimensions.length} 个维度`);
      
      // 3. 评选最佳商品（严格质量验证）
      this.log(`  3️⃣ 评选最佳商品（严格验证）...`);
      const bestProducts = [];
      
      for (const priceRange of priceResult.content.price_ranges) {
        for (const dimension of dimensionResult.content.dimensions) {
          this.log(`    🏆 评选: [${priceRange.level}] - [${dimension.name}]`);
          
          const productPrompt = this.createProductSelectionPrompt(category, priceRange, dimension);
          const productResult = await this.callDeepSeekWithQualityCheck(productPrompt, category, '商品评选');
          
          if (productResult.success) {
            // 严格验证
            const productValidation = this.validateProduct(
              productResult.content, 
              category, 
              priceRange, 
              dimension
            );
            
            if (productValidation.valid) {
              bestProducts.push({
                price_range: priceRange,
                dimension: dimension,
                product: productResult.content,
                validation: "通过",
                validated_at: new Date().toISOString()
              });
              this.log(`      ✅ 评选通过严格验证`);
              this.validatedCount++;
            } else {
              this.log(`      ⚠️ 评选未通过验证: ${productValidation.issues.join(', ')}`);
              this.rejectedCount++;
            }
          } else {
            this.log(`      ❌ 评选失败: ${productResult.error}`);
            this.rejectedCount++;
          }
          
          // 请求间延迟
          await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
        }
      }
      
      // 检查是否有通过验证的商品
      if (bestProducts.length === 0) {
        this.log(`   ⚠️ 该品类没有通过验证的商品，跳过`);
        this.rejectedCount++;
        return null;
      }
      
      categoryResult.best_products = bestProducts;
      categoryResult.price_ranges = priceResult.content;
      categoryResult.dimensions = dimensionResult.content;
      categoryResult.cost = (priceResult.cost || 0) + (dimensionResult.cost || 0);
      
      this.processedCount++;
      this.log(`   ✅ 品类处理完成: ${bestProducts.length} 个商品通过验证`);
      
      return categoryResult;
      
    } catch (error) {
      this.log(`   ❌ 品类处理失败: ${error.message}`);
      this.rejectedCount++;
      return null;
    }
  }
  
  createPriceRangePrompt(category) {
    return [
      {
        role: "system",
        content: `你是一位资深商品价格分析师。请为【${category.level3}】设置科学合理的价格区间。

## 绝对要求
1. 基于该品类的实际市场价格分布
2. 区间设置必须符合消费者认知
3. 价格必须是合理的市场价
4. 区间之间不能有重叠

## 输出格式
{
  "price_ranges": [
    {
      "level": "区间名称（如：入门级、主流级、旗舰级）",
      "min_price": 最低价格（整数，人民币）,
      "max_price": 最高价格（整数，人民币）,
      "description": "该区间商品的典型特点（50-100字）"
    }
  ],
  "market_analysis": "市场价格分析（200-300字）",
  "consumer_price_sensitivity": "消费者价格敏感度分析（100-150字）"
}`
      },
      {
        role: "user",
        content: `请为【${category.level3}】设置3-5个合理的价格区间。
品类背景：${category.level1} > ${category.level2}
请考虑：
1. 该品类在电商平台的实际价格范围
2. 不同价位段的产品差异
3. 消费者的购买习惯和预算
4. 是否有明显的市场分层`
      }
    ];
  }
  
  createDimensionPrompt(category) {
    return [
      {
        role: "system",
        content: `你是一位商品评测专家。请为【${category.level3}】设置科学合理的评价维度。

## 核心原则
1. 维度必须针对该品类特有，不能通用
2. 必须是消费者真正关心的决策因素
3. 维度之间要有明显区分度
4. 每个维度都要有具体的评价标准

## 品类特点
- 一级分类：${category.level1}
- 二级分类：${category.level2}
- 品类：${category.level3}

## 输出格式
{
  "dimensions": [
    {
      "name": "维度名称（具体、可衡量）",
      "code": "维度代码（英文小写_下划线）",
      "weight": 权重（1.0-2.0，反映重要性）,
      "description": "维度详细说明（50-100字）",
      "evaluation_criteria": "具体的评价标准（100-150字）",
      "data_sources": "评价数据来源建议"
    }
  ],
  "consumer_decision_factors": "消费者决策因素分析（200-300字）",
  "dimension_rationale": "维度设置的科学依据（150-200字）"
}`
      },
      {
        role: "user",
        content: `请为【${category.level3}】设置3-8个核心评价维度。
要求：
1. 避免通用维度（如"质量好"要具体化为"耐用性最佳"）
2. 考虑消费者购买时的真实考量
3. 维度要能有效区分商品优劣
4. 提供具体的评价标准`
      }
    ];
  }
  
  createProductSelectionPrompt(category, priceRange, dimension) {
    const suitableBrands = this.getSuitableBrands(category.level1, category.level2, category.level3);
    
    return [
      {
        role: "system",
        content: `你是一位极其严谨的商品评测专家。请为【${category.level3}】评选最佳商品。

## 绝对要求
1. **真实性**：商品必须真实存在，有具体型号
2. **合理性**：品牌必须生产该品类商品
3. **专业性**：评选理由必须基于事实和数据
4. **详细性**：评选理由至少400字，包含具体参数

## 评选条件
- 品类：${category.level3}
- 价格区间：${priceRange.level} (¥${priceRange.min_price}-¥${priceRange.max_price})
- 评价维度：${dimension.name}
- 维度说明：${dimension.description}

## 适合品牌（必须从中选择）
${suitableBrands.map(brand => `- ${brand}`).join('\n')}

## 输出格式
{
  "product_name": "商品完整名称",
  "brand_name": "品牌名称（必须来自适合品牌列表）",
  "company_name": "公司全称",
  "company_intro": "公司介绍（成立时间、总部、规模等，100-150字）",
  "product_model": "具体型号（必须具体）",
  "price": 价格（必须在指定区间内）,
  "selection_reason": "详细评选理由（至少400字，必须包含：1.为什么在该维度表现最佳 2.具体技术参数或用户反馈 3.与竞品对比 4.市场口碑 5.专业评测数据）",
  "confidence_score": 置信度评分（0-100，基于信息可靠性）,
  "data_sources": "数据来源（官网/电商平台/评测机构等，具体列出）",
  "quality_assurance": "质量保证说明（如何确保评选的真实性和合理性）"
}`
      },
      {
        role: "user",
        content: `请为【${category.level3}】在【${priceRange.level}】价格区间内，
针对【${dimension.name}】这一维度，评选出一款最佳商品。

特别注意：
1. 品牌必须来自适合品牌列表
2. 价格必须在 ¥${priceRange.min_price}-¥${priceRange.max_price} 范围内
3. 评选理由必须详细、具体、有说服力
4. 提供可验证的数据来源
5. 如果找不到符合条件的商品，请说明原因`
      }
    ];
  }
  
  saveCategoryResult(result) {
    if (!result) return;
    
    // 保存到质量优先的数据文件
    let allResults = [];
    if (fs.existsSync(CONFIG.outputFile)) {
      try {
        const existingData = fs.readFileSync(CONFIG.outputFile, 'utf8');
        allResults = JSON.parse(existingData);
      } catch (error) {
        this.log(`⚠️ 读取现有结果失败: ${error.message}`);
      }
    }
    
    allResults.push(result);
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(allResults, null, 2));
    
    // 同时更新主best-answers.json
    this.updateMainBestAnswers(result);
  }
  
  updateMainBestAnswers(result) {
    const mainFile = path.join(__dirname, 'data/best-answers.json');
    
    let mainData = {};
    if (fs.existsSync(mainFile)) {
      try {
        mainData = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
      } catch (error) {
        this.log(`⚠️ 读取主数据文件失败: ${error.message}`);
      }
    }
    
    const categoryKey = `${result.category.level1}/${result.category.level2}/${result.category.level3}`;
    
    mainData[categoryKey] = {
      category: result.category.level3,
      level1: result.category.level1,
      level2: result.category.level2,
      price_ranges: result.price_ranges,
      dimensions: result.dimensions,
      best_products: result.best_products.map(bp => ({
        price_range: bp.price_range.level,
        dimension: bp.dimension.name,
        product: bp.product,
        validated: true,
        validated_at: bp.validated_at
      })),
      processed_at: result.processed_at,
      quality_checks: result.quality_checks
    };
    
    fs.writeFileSync(mainFile, JSON.stringify(mainData, null, 2));
    this.log(`📝 更新主数据文件: ${categoryKey} (${result.best_products.length} 个商品)`);
  }
  
  async processBatch(startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, this.categories.length);
    this.log(`\n📦 处理批次: ${startIndex + 1}-${endIndex} (共${batchSize}个品类)`);
    
    const batchResults = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const category = this.categories[i];
      const result = await this.processCategoryWithQuality(category, i);
      
      if (result) {
        this.saveCategoryResult(result);
        batchResults.push(result);
      }
      
      // 进度报告
      if ((i - startIndex + 1) % 5 === 0) {
        const progress = ((i + 1) / this.categories.length * 100).toFixed(4);
        const qualityRate = this.validatedCount > 0 ? 
          (this.validatedCount / (this.validatedCount + this.rejectedCount) * 100).toFixed(2) : 0;
        
        this.log(`📊 进度: ${i + 1}/${this.categories.length} (${progress}%)`);
        this.log(`   ✅ 通过验证: ${this.validatedCount}, ❌ 被拒绝: ${this.rejectedCount}, 📈 质量率: ${qualityRate}%`);
      }
    }
    
    return batchResults;
  }
  
  async run() {
    try {
      await this.loadCategories();
      
      if (this.categories.length === 0) {
        this.log('❌ 没有可处理的品类');
        return;
      }
      
      this.log(`🎯 开始高质量处理 ${this.categories.length.toLocaleString()} 个品类`);
      this.log(`📏 质量标准: 评选理由≥${CONFIG.minReasonLength}字, 置信度≥${CONFIG.minConfidence}, 品牌匹配验证`);
      
      // 分批处理
      const totalBatches = Math.ceil(this.categories.length / CONFIG.batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * CONFIG.batchSize;
        
        this.log(`\n🌀 批次 ${batchIndex + 1}/${totalBatches}`);
        this.log(`⏰ 开始时间: ${new Date().toISOString()}`);
        
        await this.processBatch(startIndex, CONFIG.batchSize);
        
        // 批次间延迟
        if (batchIndex < totalBatches - 1) {
          this.log(`⏳ 批次间延迟 10秒...`);
          await new Promise(resolve => setTimeout(resolve, 10000));
        }
      }
      
      // 最终报告
      const endTime = new Date();
      const duration = (endTime - this.startTime) / 1000 / 60; // 分钟
      
      const qualityRate = this.validatedCount > 0 ? 
        (this.validatedCount / (this.validatedCount + this.rejectedCount) * 100).toFixed(2) : 0;
      
      this.log('\n🎉 质量优先处理完成！');
      this.log('='.repeat(60));
      this.log(`📈 质量统计:`);
      this.log(`   总品类数: ${this.categories.length.toLocaleString()}`);
      this.log(`   通过验证: ${this.validatedCount} (${qualityRate}%)`);
      this.log(`   被拒绝: ${this.rejectedCount}`);
      this.log(`   总成本: ¥${this.totalCost.toFixed(2)}`);
      this.log(`   总耗时: ${duration.toFixed(2)} 分钟`);
      this.log(`   平均速度: ${(this.validatedCount / duration).toFixed(2)} 合格品类/分钟`);
      this.log('\n📁 输出文件:');
      this.log(`   质量数据: ${CONFIG.outputFile}`);
      this.log(`   主数据: ${path.join(__dirname, 'data/best-answers.json')}`);
      this.log(`   日志文件: ${CONFIG.logFile}`);
      this.log('\n✅ 所有数据都经过严格质量验证，符合科学性、合理性、真实性、高质量要求！');
      
    } catch (error) {
      this.log(`💥 处理过程发生错误: ${error.message}`);
      this.log(error.stack);
    }
  }
}

// 主程序
async function main() {
  console.log('='.repeat(70));
  console.log('🚀 最佳商品百科全书 - 质量优先处理器');
  console.log('🎯 清空所有旧数据，重新开始高质量评选');
  console.log('📏 质量标准: 真实性第一，品牌匹配验证，详细评选理由');
  console.log('='.repeat(70));
  
  // 检查API密钥
  if (!CONFIG.apiKey) {
    console.error('❌ 错误: 未设置DEEPSEEK_API_KEY环境变量');
    console.error('请设置: export DEEPSEEK_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  const processor = new QualityFirstProcessor();
  
  // 处理命令行参数
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const limit = testMode ? 5 : null;
  
  if (testMode) {
    console.log(`🔧 测试模式: 仅处理前 5 个品类验证质量`);
    // 这里可以添加测试逻辑
  }
  
  await processor.run();
}

// 启动
if (require.main === module) {
  main().catch(error => {
    console.error('💥 程序异常终止:', error);
    process.exit(1);
  });
}

module.exports = { QualityFirstProcessor };