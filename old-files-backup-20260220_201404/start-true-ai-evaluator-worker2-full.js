/**
 * 真正的AI评选系统 - 从0开始真实评选
 * 使用DeepSeek API进行高质量商品评选
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');
const { QualityValidator } = require('./quality-validator.js');

// 用户提供的API密钥
const DEEPSEEK_API_KEY = 'sk-73ae194bf6b74d0abfad280635bde8e5';

// 配置
const CONFIG = {
  apiKey: DEEPSEEK_API_KEY,
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  
  // 质量控制参数
  maxRetries: 3,
  batchSize: 5,  // 每批处理数量（从5个开始测试）
  delayBetweenBatches: 3000,  // 批次间延迟(ms)
  delayBetweenRequests: 1000,  // 请求间延迟(ms),
  
  // 质量验证配置
  qualityValidationInterval: 20,  // 每处理20个品类进行一次批量质量验证
  minReasonLength: 200,  // 最小评选理由长度
  minConfidence: 70,     // 最小置信度
  requireRealBrands: true, // 必须真实品牌
  
  // 数据文件 - Worker2使用不同文件
  categoriesFile: path.join(__dirname, 'data/global-categories-expanded.json'),
  outputFile: path.join(__dirname, 'data/best-answers-worker2.json'),  // Worker2输出文件
  logFile: path.join(__dirname, 'logs/true-ai-processing-worker2.log'),
  statusFile: path.join(__dirname, 'data/automation-status-worker2.json')
};

// 初始化OpenAI客户端
const client = new OpenAI({
  apiKey: CONFIG.apiKey,
  baseURL: CONFIG.baseURL,
});

// 品类-品牌匹配数据库（确保品牌合理性）
const CATEGORY_BRAND_MAPPING = {
  // 个护健康
  '个护健康': {
    '剃须用品': ['吉列', '舒适', '飞利浦', '博朗', '松下'],
    '口腔保健': ['高露洁', '佳洁士', '舒适达', '欧乐B', '云南白药'],
    '护肤': ['欧莱雅', '雅诗兰黛', '资生堂', 'SK-II', '海蓝之谜'],
    '洗发护发': ['潘婷', '海飞丝', '施华蔻', '欧莱雅'],
    '卫生用品': ['维达', '心相印', '清风', '洁柔'],
  },
  // 数码电子
  '数码电子': {
    '手机': ['苹果', '三星', '华为', '小米', 'OPPO', 'vivo'],
    '电脑': ['苹果', '戴尔', '惠普', '联想', '华硕', '微软'],
    '相机': ['佳能', '尼康', '索尼', '富士', '松下'],
    '耳机': ['苹果', '索尼', '博士', '森海塞尔', 'JBL'],
  },
  // 家居生活
  '家居生活': {
    '家具': ['宜家', 'Ashley', 'La-Z-Boy'],
    '厨具': ['双立人', 'WMF', '菲仕乐', '苏泊尔', '美的'],
    '清洁': ['戴森', '美的', '海尔', '小米'],
  },
  // 食品饮料
  '食品饮料': {
    '零食': ['三只松鼠', '良品铺子', '百草味', '洽洽'],
    '饮料': ['可口可乐', '百事可乐', '农夫山泉', '康师傅'],
    '乳制品': ['伊利', '蒙牛', '光明', '君乐宝'],
  }
};

class TrueAIEvaluator {
  constructor() {
    this.categories = [];  // 扁平化的品类列表
    this.processedCount = 0;
    this.failedCount = 0;
    this.totalCost = 0;
    this.startTime = new Date();
    this.results = [];
    this.qualityValidator = new QualityValidator(); // 质量验证器
    this.sinceLastBatchValidation = 0; // 自上次批量验证以来处理的品类数
    
    // 确保日志目录存在
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.log(`🚀 真正的AI评选系统启动 - ${this.startTime.toISOString()}`);
    this.log(`API密钥: ${CONFIG.apiKey.substring(0, 10)}...`);
    this.log(`批次大小: ${CONFIG.batchSize}, 最大重试: ${CONFIG.maxRetries}`);
    this.log(`质量验证间隔: 每${CONFIG.qualityValidationInterval}个品类进行一次批量验证`);
  }
  
  log(message) {
    const timestamp = new Date().toISOString();
    const logMessage = `[${timestamp}] ${message}`;
    console.log(logMessage);
    fs.appendFileSync(CONFIG.logFile, logMessage + '\n');
  }
  
  async loadCategories() {
    try {
      this.log(`📂 加载品类数据: ${CONFIG.categoriesFile}`);
      const data = JSON.parse(fs.readFileSync(CONFIG.categoriesFile, 'utf8'));
      
      // 扁平化品类数据结构
      this.categories = [];
      
      for (const [level1, level2Data] of Object.entries(data.categories || {})) {
        for (const [level2, items] of Object.entries(level2Data)) {
          for (const item of items) {
            this.categories.push({
              level1: level1,
              level2: level2,
              level3: item,
              fullPath: `${level1} > ${level2} > ${item}`
            });
          }
        }
      }
      
      this.log(`✅ 加载完成: ${this.categories.length} 个品类`);
      
      // 处理命令行参数
      const args = process.argv.slice(2);
      if (args.includes('--test') || args.includes('-t')) {
        this.categories = this.categories.slice(0, 3);
        this.log(`🧪 测试模式: 仅处理前 ${this.categories.length} 个品类`);
      } else if (args.includes('--small')) {
        this.categories = this.categories.slice(0, 20);
        this.log(`🔧 小规模模式: 仅处理前 ${this.categories.length} 个品类`);
      }
      
      // 跳过已经处理过的品类（除非指定了--force）
      if (!args.includes('--force') && !args.includes('-f')) {
        try {
          let existingCategories = [];
          if (fs.existsSync(CONFIG.outputFile)) {
            const existingData = JSON.parse(fs.readFileSync(CONFIG.outputFile, 'utf8'));
            if (Array.isArray(existingData)) {
              existingCategories = existingData.map(item => 
                `${item.level1} > ${item.level2} > ${item.item}`
              );
            }
          }
          
          const initialCount = this.categories.length;
          this.categories = this.categories.filter(cat => 
            !existingCategories.includes(cat.fullPath)
          );
          
          const skippedCount = initialCount - this.categories.length;
          if (skippedCount > 0) {
            this.log(`⏭️  跳过 ${skippedCount} 个已处理的品类`);
            this.log(`📊 剩余待处理: ${this.categories.length} 个品类`);
          }
        } catch (error) {
          this.log(`⚠️ 检查已处理品类时出错: ${error.message}`);
        }
      } else {
        this.log(`🔨 强制模式: 将重新处理所有品类`);
      }
      
    } catch (error) {
      this.log(`❌ 加载品类数据失败: ${error.message}`);
      throw error;
    }
  }
  
  getBrandsForCategory(level1, level2, level3) {
    // 优先从映射中获取
    if (CATEGORY_BRAND_MAPPING[level1] && CATEGORY_BRAND_MAPPING[level1][level2]) {
      return CATEGORY_BRAND_MAPPING[level1][level2];
    }
    
    // 通用品牌（作为后备）
    const genericBrands = {
      '个护健康': ['强生', '宝洁', '联合利华', '资生堂'],
      '数码电子': ['华为', '小米', '三星', '索尼'],
      '家居生活': ['宜家', '无印良品', '海尔', '美的'],
      '食品饮料': ['康师傅', '统一', '雀巢', '达能'],
    };
    
    return genericBrands[level1] || ['知名品牌A', '知名品牌B', '知名品牌C'];
  }
  
  async callDeepSeekAPI(messages, categoryInfo) {
    for (let attempt = 1; attempt <= CONFIG.maxRetries; attempt++) {
      try {
        this.log(`📡 API调用尝试 ${attempt}/${CONFIG.maxRetries}: ${categoryInfo.level3}`);
        
        const response = await client.chat.completions.create({
          model: CONFIG.model,
          messages: messages,
          temperature: 0.3,  // 低温度确保稳定性
          max_tokens: 2000,
          response_format: { type: "json_object" }
        });
        
        const content = response.choices[0].message.content;
        const usage = response.usage;
        
        // 估算成本（假设每百万tokens 2元）
        const cost = ((usage.prompt_tokens + usage.completion_tokens) / 1000000) * 2;
        this.totalCost += cost;
        
        this.log(`✅ API调用成功: ${usage.total_tokens} tokens, 成本 ¥${cost.toFixed(4)}`);
        
        return {
          success: true,
          content: JSON.parse(content),
          tokens: usage.total_tokens,
          cost: cost
        };
        
      } catch (error) {
        this.log(`❌ API调用失败 (尝试 ${attempt}): ${error.message}`);
        
        if (attempt < CONFIG.maxRetries) {
          // 指数退避
          const delay = Math.pow(2, attempt) * 1000;
          this.log(`⏳ 等待 ${delay}ms 后重试...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        } else {
          return {
            success: false,
            error: error.message
          };
        }
      }
    }
  }
  
  async processPriceRanges(category) {
    const systemPrompt = `Please respond in JSON format. 你是一位资深商品分析师，请为商品品类设置科学合理的价格区间。请用JSON格式回复。

## 核心要求
1. **科学性**：基于市场实际价格分布
2. **合理性**：区间设置符合消费者认知
3. **完整性**：覆盖从入门到高端的全范围

## 品类信息
- 一级分类：${category.level1}
- 二级分类：${category.level2}
- 品类名称：${category.level3}

## 输出格式（必须是JSON）
{
  "price_ranges": [
    {
      "level": "区间名称（如：入门级、主流级、旗舰级）",
      "min_price": 最低价格（整数）,
      "max_price": 最高价格（整数）,
      "description": "区间详细说明（50-100字）"
    }
  ],
  "reasoning": "价格区间设置的科学依据（200-300字）"
}`;

    const userPrompt = `Please respond in JSON format. 请为【${category.level3}】设置3个合理的价格区间（只设置3个，不要4个），请用JSON格式回复。
考虑因素：
1. 该品类在市场上的实际价格范围
2. 不同价位段的产品特点
3. 消费者的价格敏感度
4. 是否有明显的价格分层
重要：只设置3个价格区间，分别是：入门级、主流级、高端级`;

    return await this.callDeepSeekAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], category);
  }
  
  async processEvaluationDimensions(category) {
    const systemPrompt = `Please respond in JSON format. 你是一位商品评测专家，请为商品品类设置科学合理的评价维度。请用JSON格式回复。

## 核心原则
1. **品类特异性**：维度必须针对该品类特点
2. **消费者视角**：必须是消费者真正关心的
3. **可比较性**：能在同类商品间有效比较
4. **完整性**：覆盖主要决策因素

## 品类信息
- 一级分类：${category.level1}
- 二级分类：${category.level2}
- 品类名称：${category.level3}

## 输出格式（必须是JSON）
{
  "dimensions": [
    {
      "name": "维度名称（如：性价比最高、质量最可靠）",
      "code": "维度代码（英文小写_下划线）",
      "weight": 权重（1.0-2.0）,
      "description": "维度详细说明（50-100字）",
      "evaluation_criteria": "具体的评价标准（100-150字）"
    }
  ],
  "reasoning": "维度设置的科学依据（200-300字）"
}`;

    const userPrompt = `Please respond in JSON format. 请为【${category.level3}】设置3个核心评价维度（只设置3个，不要更多），请用JSON格式回复。
要求：
1. 维度必须针对该品类特有
2. 避免通用维度（如"质量好"要具体化）
3. 考虑消费者真实决策过程
4. 维度之间要有区分度
重要：只设置3个评价维度，这是硬性要求`;

    return await this.callDeepSeekAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], category);
  }
  
  async selectBestProduct(category, priceRange, dimension) {
    // 获取适合该品类的品牌
    const suitableBrands = this.getBrandsForCategory(
      category.level1, 
      category.level2, 
      category.level3
    );
    
    const systemPrompt = `Please respond in JSON format. 你是一位极其严谨的商品评测专家，你的评选结果将被数十万消费者参考。请用JSON格式回复。

## 绝对要求
1. **真实性**：商品必须真实存在，严禁虚构
2. **合理性**：品牌必须生产该品类商品
3. **专业性**：评选理由必须基于事实和数据
4. **详细性**：评选理由至少200字，包含具体参数

## 品类信息
- 品类：${category.level3}
- 价格区间：${priceRange.level} (¥${priceRange.min_price}-${priceRange.max_price})
- 评价维度：${dimension.name}

## 适合品牌参考
${suitableBrands.map(brand => `- ${brand}`).join('\n')}

## 输出格式（必须是JSON）
{
  "product_name": "商品完整名称",
  "brand_name": "品牌名称（必须来自适合品牌列表）",
  "company_name": "公司全称",
  "company_intro": "公司介绍（成立时间、总部、规模等，100字）",
  "product_model": "具体型号",
  "price": 价格（必须在指定区间内）,
  "selection_reason": "详细评选理由（至少200字）",
  "confidence_score": 置信度评分（0-100，基于信息可靠性）,
  "data_sources": "数据来源（官网/电商平台/评测机构等）",
  "quality_validation": "质量验证说明"
}`;

    const userPrompt = `Please respond in JSON format. 请为【${category.level3}】在【${priceRange.level}】价格区间内，
针对【${dimension.name}】这一维度，评选出一款最佳商品。请用JSON格式回复。

## 特别注意
1. 品牌必须真实生产该品类商品
2. 价格必须在 ¥${priceRange.min_price}-${priceRange.max_price} 范围内
3. 评选理由必须详细、具体、有说服力
4. 如果找不到符合条件的商品，请说明原因`;

    return await this.callDeepSeekAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], category);
  }
  
  async processCategory(category) {
    const startTime = Date.now();
    this.log(`\n🔍 开始处理品类: ${category.fullPath}`);
    
    try {
      // Step 1: 生成价格区间
      this.log(`   1/4 分析价格区间...`);
      const priceResult = await this.processPriceRanges(category);
      
      if (!priceResult.success) {
        throw new Error(`价格区间分析失败: ${priceResult.error}`);
      }
      
      const priceRanges = priceResult.content.price_ranges;
      
      // Step 2: 生成评价维度
      this.log(`   2/4 设置评价维度...`);
      const dimensionResult = await this.processEvaluationDimensions(category);
      
      if (!dimensionResult.success) {
        throw new Error(`评价维度设置失败: ${dimensionResult.error}`);
      }
      
      const dimensions = dimensionResult.content.dimensions;
      
      // Step 3: 为每个组合评选最佳商品 (并行处理)
      this.log(`   3/4 评选最佳商品... (并行处理)`);
      const bestProducts = [];
      let successCount = 0;
      
      // 创建所有价格区间和维度的组合
      const productSelectionPromises = [];
      
      for (const priceRange of priceRanges) {
        for (const dimension of dimensions) {
          this.log(`     准备并行评选: ${priceRange.level} - ${dimension.name}`);
          
          // 创建promise但稍后执行，避免立即启动所有API调用
          const promise = (async () => {
            try {
              const productResult = await this.selectBestProduct(category, priceRange, dimension);
              
              if (productResult.success) {
                const productData = productResult.content;
                
                // 验证质量
                if (productData.confidence_score >= CONFIG.minConfidence && 
                    productData.selection_reason.length >= CONFIG.minReasonLength) {
                  
                  return {
                    priceRange: priceRange.level,
                    priceMin: priceRange.min_price,
                    priceMax: priceRange.max_price,
                    dimension: dimension.name,
                    dimensionCode: dimension.code,
                    productName: productData.product_name,
                    brand: productData.brand_name,
                    company: productData.company_name,
                    model: productData.product_model,
                    price: productData.price,
                    selectionReason: productData.selection_reason,
                    confidenceScore: productData.confidence_score,
                    dataSources: productData.data_sources,
                    qualityValidation: productData.quality_validation
                  };
                } else {
                  this.log(`     质量验证失败: 置信度${productData.confidence_score}/理由${productData.selection_reason.length}字`);
                  return null;
                }
              }
              return null;
            } catch (error) {
              this.log(`     评选出错: ${error.message}`);
              return null;
            }
          })();
          
          productSelectionPromises.push(promise);
        }
      }
      
      // 控制并发度 - 每次处理8个API调用
      const CONCURRENT_LIMIT = 8;
      const results = [];
      
      for (let i = 0; i < productSelectionPromises.length; i += CONCURRENT_LIMIT) {
        const batchPromises = productSelectionPromises.slice(i, i + CONCURRENT_LIMIT);
        const batchResults = await Promise.all(batchPromises);
        
        // 处理批次结果
        for (const result of batchResults) {
          if (result) {
            bestProducts.push(result);
            successCount++;
          }
        }
        
        // 批次间延迟
        if (i + CONCURRENT_LIMIT < productSelectionPromises.length) {
          await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests * 2));
        }
      }
      
      // Step 4: 生成最终结果
      const result = {
        level1: category.level1,
        level2: category.level2,
        item: category.level3,
        title: `${category.level3} · 最佳商品智能评选`,
        subtitle: '基于多维度AI智能评测体系',
        bestProducts: bestProducts,
        priceRanges: priceRanges,
        dimensions: dimensions,
        analysis: {
          priceReasoning: priceResult.content.reasoning,
          dimensionReasoning: dimensionResult.content.reasoning,
          totalEvaluations: priceRanges.length * dimensions.length,
          successfulEvaluations: successCount,
          successRate: ((successCount / (priceRanges.length * dimensions.length)) * 100).toFixed(1) + '%'
        },
        evaluationDate: new Date().toISOString(),
        evaluationMethod: 'true-ai-deepseek',
        version: '1.0.0'
      };
      
      // 质量验证
      this.log(`   4/4 质量验证...`);
      const validationResult = this.qualityValidator.validateCategory(result);
      
      if (validationResult.isValid) {
        // 验证通过，添加到结果集
        this.results.push(result);
        
        const duration = (Date.now() - startTime) / 1000;
        this.log(`✅ 品类处理完成: ${successCount}/${priceRanges.length * dimensions.length} 成功 | 耗时: ${duration.toFixed(2)}s`);
        this.log(`✅ 质量验证通过: ${result.level1} > ${result.level2} > ${result.item}`);
        
        this.processedCount++;
        return { success: true, result };
      } else {
        // 质量验证失败
        const duration = (Date.now() - startTime) / 1000;
        this.log(`❌ 质量验证失败: ${validationResult.issues.length}个问题`);
        validationResult.issues.forEach(issue => this.log(`   - ${issue}`));
        
        // 记录失败但不增加processedCount
        this.failedCount++;
        
        // 保存失败信息用于分析
        const failedRecord = {
          ...result,
          validationFailed: true,
          validationIssues: validationResult.issues,
          failedAt: new Date().toISOString()
        };
        
        // 保存到失败记录文件
        const failedFilePath = path.join(__dirname, 'data', 'failed-categories.json');
        let failedRecords = [];
        if (fs.existsSync(failedFilePath)) {
          failedRecords = JSON.parse(fs.readFileSync(failedFilePath, 'utf8'));
        }
        failedRecords.push(failedRecord);
        fs.writeFileSync(failedFilePath, JSON.stringify(failedRecords, null, 2));
        
        return { 
          success: false, 
          error: '质量验证失败',
          issues: validationResult.issues,
          result: result 
        };
      }
      
    } catch (error) {
      this.log(`❌ 品类处理失败: ${error.message}`);
      this.failedCount++;
      return { success: false, error: error.message };
    }
  }
  
  async processBatch(startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, this.categories.length);
    const batch = this.categories.slice(startIndex, endIndex);
    
    this.log(`\n🌀 处理批次: ${startIndex + 1}-${endIndex} (共 ${batch.length} 个)`);
    
    for (let i = 0; i < batch.length; i++) {
      const category = batch[i];
      const result = await this.processCategory(category);
      
      // 更新计数器（只统计成功处理的品类）
      if (result.success) {
        this.sinceLastBatchValidation++;
        
        // 检查是否需要批量质量验证
        if (this.sinceLastBatchValidation >= CONFIG.qualityValidationInterval) {
          await this.performBatchQualityValidation();
          this.sinceLastBatchValidation = 0;
        }
      }
      
      // 每处理一个品类保存一次进度
      await this.saveProgress();
    }
  }
  
  async saveProgress() {
    try {
      // 保存结果到标准文件
      fs.writeFileSync(CONFIG.outputFile, JSON.stringify(this.results, null, 2));
      
      // 计算质量统计
      const qualityStats = this.qualityValidator.getStats();
      
      // 更新自动化状态（包含质量统计）
      const status = {
        totalCategories: this.categories.length,
        completedCategories: this.processedCount,
        bestProductsCount: this.results.length,
        lastUpdated: new Date().toISOString(),
        automationProgress: {
          startedAt: this.startTime.toISOString(),
          lastProcessed: new Date().toISOString(),
          processingSpeed: this.processedCount > 0 ? 
            (this.processedCount / ((new Date() - this.startTime) / 1000 / 60 / 60)).toFixed(2) : 0,
          estimatedCompletion: null
        },
        totalCost: this.totalCost,
        qualityMetrics: {
          totalValidations: qualityStats.totalValidations,
          passedValidations: qualityStats.passedValidations,
          failedValidations: qualityStats.failedValidations,
          passRate: qualityStats.passRate.toFixed(2) + '%',
          qualityIssues: qualityStats.qualityIssues.length,
          lastValidation: new Date().toISOString()
        }
      };
      
      fs.writeFileSync(CONFIG.statusFile, JSON.stringify(status, null, 2));
      
      this.log(`💾 进度已保存: ${this.processedCount}/${this.categories.length} (${((this.processedCount / this.categories.length) * 100).toFixed(2)}%)`);
      this.log(`📊 质量统计: ${qualityStats.passedValidations}/${qualityStats.totalValidations} 通过 (${qualityStats.passRate.toFixed(2)}%)`);
      
    } catch (error) {
      this.log(`❌ 保存进度失败: ${error.message}`);
    }
  }
  
  /**
   * 执行批量质量验证
   */
  async performBatchQualityValidation() {
    try {
      if (this.results.length === 0) {
        return;
      }
      
      this.log(`\n🔍 执行批量质量验证 (每${CONFIG.qualityValidationInterval}个品类)`);
      this.log(`📊 当前已处理品类: ${this.results.length}个`);
      
      // 获取最近处理的一批品类进行验证（最近20个或更少）
      const recentCategories = this.results.slice(-CONFIG.qualityValidationInterval);
      
      // 执行批量验证
      const validationReport = this.qualityValidator.validateAllCategories(recentCategories);
      
      // 记录验证结果
      const validationStatsPath = path.join(__dirname, 'data', 'batch-validation-stats.json');
      let validationHistory = [];
      
      if (fs.existsSync(validationStatsPath)) {
        validationHistory = JSON.parse(fs.readFileSync(validationStatsPath, 'utf8'));
      }
      
      validationHistory.push({
        timestamp: new Date().toISOString(),
        categoriesValidated: recentCategories.length,
        passed: validationReport.summary.passed,
        failed: validationReport.summary.failed,
        passRate: validationReport.summary.passRate,
        issuesCount: validationReport.details.filter(d => !d.isValid).length
      });
      
      // 保持历史记录不超过100条
      if (validationHistory.length > 100) {
        validationHistory = validationHistory.slice(-50);
      }
      
      fs.writeFileSync(validationStatsPath, JSON.stringify(validationHistory, null, 2));
      
      this.log(`✅ 批量质量验证完成: ${validationReport.summary.passed}/${validationReport.summary.total} 通过 (${validationReport.summary.passRate.toFixed(2)}%)`);
      
      // 如果有大量质量问题，可能需要调整参数或暂停
      if (validationReport.summary.passRate < 70) {
        this.log(`⚠️  警告: 质量通过率低于70%，可能需要检查API配置或验证标准`);
        
        // 记录警告
        const warningLog = path.join(__dirname, 'logs', 'quality-warnings.log');
        fs.appendFileSync(warningLog, `${new Date().toISOString()} - 批量验证通过率: ${validationReport.summary.passRate.toFixed(2)}%\n`);
      }
      
    } catch (error) {
      this.log(`❌ 批量质量验证失败: ${error.message}`);
    }
  }
  
  async run() {
    try {
      // 加载品类数据
      await this.loadCategories();
      
      if (this.categories.length === 0) {
        this.log('❌ 没有可处理的品类');
        return;
      }
      
      // Worker2: 跳过前100个品类（由主进程处理）
      const START_OFFSET = 100;
      if (this.categories.length > START_OFFSET) {
        this.categories = this.categories.slice(START_OFFSET);
        this.log(`🔄 Worker2: 跳过前${START_OFFSET}个品类，从第${START_OFFSET + 1}个开始处理`);
      }
      
      this.log(`🎯 Worker2开始处理 ${this.categories.length} 个品类`);
      
      // 分批处理
      const totalBatches = Math.ceil(this.categories.length / CONFIG.batchSize);
      
      for (let batchIndex = 0; batchIndex < totalBatches; batchIndex++) {
        const startIndex = batchIndex * CONFIG.batchSize;
        
        this.log(`\n🌀 批次 ${batchIndex + 1}/${totalBatches}`);
        this.log(`⏰ 开始时间: ${new Date().toISOString()}`);
        
        await this.processBatch(startIndex, CONFIG.batchSize);
        
        // 批次间延迟
        if (batchIndex < totalBatches - 1) {
          this.log(`⏳ 批次间延迟 ${CONFIG.delayBetweenBatches}ms...`);
          await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenBatches));
        }
      }
      
      // 最终报告
      const endTime = new Date();
      const duration = (endTime - this.startTime) / 1000 / 60; // 分钟
      const qualityStats = this.qualityValidator.getStats();
      
      this.log('\n🎉 真正的AI评选完成！');
      this.log(`📈 统计信息:`);
      this.log(`  总品类数: ${this.categories.length}`);
      this.log(`  成功处理: ${this.processedCount}`);
      this.log(`  处理失败: ${this.failedCount}`);
      this.log(`  成功率: ${(this.processedCount / this.categories.length * 100).toFixed(2)}%`);
      this.log(`  总成本: ¥${this.totalCost.toFixed(2)}`);
      this.log(`  总耗时: ${duration.toFixed(2)} 分钟`);
      this.log(`  平均速度: ${(this.processedCount / duration).toFixed(2)} 品类/分钟`);
      
      this.log(`\n🔍 质量统计:`);
      this.log(`  总验证品类: ${qualityStats.totalValidations}`);
      this.log(`  质量验证通过: ${qualityStats.passedValidations} (${qualityStats.passRate.toFixed(2)}%)`);
      this.log(`  质量验证失败: ${qualityStats.failedValidations}`);
      this.log(`  质量问题数量: ${qualityStats.qualityIssues.length}`);
      
      if (qualityStats.failedValidations > 0) {
        this.log(`\n⚠️  质量问题摘要:`);
        qualityStats.qualityIssues.slice(0, 5).forEach(issue => {
          this.log(`   - ${issue.category}: ${issue.issues.length}个问题`);
        });
        if (qualityStats.qualityIssues.length > 5) {
          this.log(`   ... 还有 ${qualityStats.qualityIssues.length - 5} 个质量问题`);
        }
        
        // 生成最终质量报告
        const qualityReport = {
          timestamp: new Date().toISOString(),
          summary: {
            totalCategories: this.processedCount,
            qualityPassRate: qualityStats.passRate,
            totalQualityIssues: qualityStats.qualityIssues.length
          },
          qualityIssues: qualityStats.qualityIssues,
          qualityStats: qualityStats
        };
        
        const reportPath = path.join(__dirname, 'data', 'final-quality-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(qualityReport, null, 2));
        this.log(`📄 最终质量报告已保存: ${reportPath}`);
      }
      
      this.log(`\n📁 输出文件: ${CONFIG.outputFile}`);
      this.log(`🌐 前端访问: http://localhost:3076/`);
      
    } catch (error) {
      this.log(`💥 处理过程发生错误: ${error.message}`);
      this.log(error.stack);
    }
  }
}

// 主程序
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 真正的AI评选系统 - 从0开始真实评选');
  console.log('🎯 核心理念: 真实性、高质量、科学性、合理性');
  console.log('🔑 API密钥已配置');
  console.log('='.repeat(60));
  
  const evaluator = new TrueAIEvaluator();
  await evaluator.run();
}

// 启动
if (require.main === module) {
  main().catch(error => {
    console.error('💥 程序异常终止:', error);
    process.exit(1);
  });
}

module.exports = { TrueAIEvaluator };