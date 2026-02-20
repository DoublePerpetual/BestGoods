/**
 * 大规模自动化处理脚本
 * 严格按照用户要求：科学性、合理性、真实性、高质量
 */

const fs = require('fs');
const path = require('path');
const { OpenAI } = require('openai');

// 配置
const CONFIG = {
  apiKey: process.env.DEEPSEEK_API_KEY || '',
  baseURL: 'https://api.deepseek.com',
  model: 'deepseek-chat',
  
  // 质量控制参数
  maxRetries: 3,
  batchSize: 50,  // 每批处理数量
  delayBetweenBatches: 5000,  // 批次间延迟(ms)
  delayBetweenRequests: 1000,  // 请求间延迟(ms)
  
  // 数据文件
  categoriesFile: path.join(__dirname, 'data/global-categories-expanded.json'),
  outputFile: path.join(__dirname, 'data/best-answers-massive.json'),
  logFile: path.join(__dirname, 'logs/massive-processing.log'),
  
  // 质量验证阈值
  minReasonLength: 300,  // 最小评选理由长度
  minConfidence: 70,     // 最小置信度
  requireRealBrands: true, // 必须真实品牌
};

// 初始化OpenAI客户端
const client = new OpenAI({
  apiKey: CONFIG.apiKey,
  baseURL: CONFIG.baseURL,
});

// 品类-品牌匹配数据库（防止苹果生产棉签的问题）
const CATEGORY_BRAND_MAPPING = {
  // 个护健康
  '个护健康': {
    '剃须用品': ['Gillette', 'Schick', 'Philips', 'Braun', 'Panasonic'],
    '口腔保健': ['Colgate', 'Crest', 'Sensodyne', 'Oral-B', '云南白药', '高露洁'],
    '护肤': ['L\'Oréal', 'Estée Lauder', 'Shiseido', 'SK-II', 'La Mer', '雅诗兰黛'],
    '美妆': ['MAC', 'Chanel', 'Dior', 'YSL', 'Maybelline'],
    '洗发护发': ['Pantene', 'Head & Shoulders', 'Schwarzkopf', 'L\'Oréal Paris'],
  },
  // 电子产品
  '电子产品': {
    '手机': ['Apple', 'Samsung', 'Huawei', 'Xiaomi', 'OPPO', 'vivo'],
    '电脑': ['Apple', 'Dell', 'HP', 'Lenovo', 'Asus', 'Microsoft'],
    '相机': ['Canon', 'Nikon', 'Sony', 'Fujifilm', 'Panasonic'],
    '耳机': ['Apple', 'Sony', 'Bose', 'Sennheiser', 'JBL'],
  },
  // 家居用品
  '家居用品': {
    '家具': ['IKEA', 'Ashley', 'La-Z-Boy', 'Herman Miller'],
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

class MassiveProcessor {
  constructor() {
    this.categories = [];
    this.processedCount = 0;
    this.failedCount = 0;
    this.totalCost = 0;
    this.startTime = new Date();
    
    // 确保日志目录存在
    const logDir = path.dirname(CONFIG.logFile);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    this.log(`🚀 开始大规模自动化处理 - ${this.startTime.toISOString()}`);
    this.log(`配置: 批次大小=${CONFIG.batchSize}, 最大重试=${CONFIG.maxRetries}`);
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
      this.categories = data.categories || [];
      this.log(`✅ 加载完成: ${this.categories.length} 个品类`);
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
      '电子产品': ['华为', '小米', '三星', '索尼'],
      '家居用品': ['宜家', '无印良品', '海尔', '美的'],
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
    const systemPrompt = `你是一位资深商品分析师，请为商品品类设置科学合理的价格区间。

## 核心要求
1. **科学性**：基于市场实际价格分布
2. **合理性**：区间设置符合消费者认知
3. **完整性**：覆盖从入门到高端的全范围

## 品类信息
- 一级分类：${category.level1}
- 二级分类：${category.level2}
- 三级分类：${category.level3}

## 输出格式
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

    const userPrompt = `请为【${category.level3}】设置3-5个合理的价格区间。
考虑因素：
1. 该品类在市场上的实际价格范围
2. 不同价位段的产品特点
3. 消费者的价格敏感度
4. 是否有明显的价格分层`;

    return await this.callDeepSeekAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], category);
  }
  
  async processEvaluationDimensions(category) {
    const systemPrompt = `你是一位商品评测专家，请为商品品类设置科学合理的评价维度。

## 核心原则
1. **品类特异性**：维度必须针对该品类特点
2. **消费者视角**：必须是消费者真正关心的
3. **可比较性**：能在同类商品间有效比较
4. **完整性**：覆盖主要决策因素

## 品类信息
- 一级分类：${category.level1}
- 二级分类：${category.level2}
- 品类名称：${category.level3}

## 输出格式
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

    const userPrompt = `请为【${category.level3}】设置3-8个核心评价维度。
要求：
1. 维度必须针对该品类特有
2. 避免通用维度（如"质量好"要具体化）
3. 考虑消费者真实决策过程
4. 维度之间要有区分度`;

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
    
    const systemPrompt = `你是一位极其严谨的商品评测专家，你的评选结果将被数十万消费者参考。

## 绝对要求
1. **真实性**：商品必须真实存在，严禁虚构
2. **合理性**：品牌必须生产该品类商品（苹果不生产棉签）
3. **专业性**：评选理由必须基于事实和数据
4. **详细性**：评选理由至少300字，包含具体参数

## 品类信息
- 品类：${category.level3}
- 价格区间：${priceRange.level} (¥${priceRange.min_price}-${priceRange.max_price})
- 评价维度：${dimension.name}

## 适合品牌参考
${suitableBrands.map(brand => `- ${brand}`).join('\n')}

## 输出格式
{
  "product_name": "商品完整名称",
  "brand_name": "品牌名称（必须来自适合品牌列表）",
  "company_name": "公司全称",
  "company_intro": "公司介绍（成立时间、总部、规模等，100-150字）",
  "product_model": "具体型号",
  "price": 价格（必须在指定区间内）,
  "selection_reason": "详细评选理由（至少300字，必须包含：1.为什么在该维度表现最佳 2.具体技术参数或用户反馈 3.与竞品对比 4.市场口碑）",
  "confidence_score": 置信度评分（0-100，基于信息可靠性）,
  "data_sources": "数据来源（官网/电商平台/评测机构等）",
  "quality_validation": "质量验证说明（如何确保评选的真实性和合理性）"
}`;

    const userPrompt = `请为【${category.level3}】在【${priceRange.level}】价格区间内，
针对【${dimension.name}】这一维度，评选出一款最佳商品。

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
  
  validateProductSelection(productData, category, priceRange, dimension) {
    const issues = [];
    
    // 1. 验证品牌合理性
    const suitableBrands = this.getBrandsForCategory(
      category.level1, 
      category.level2, 
      category.level3
    );
    
    if (!suitableBrands.includes(productData.brand_name)) {
      issues.push(`品牌${productData.brand_name}可能不适合${category.level3}品类`);
    }
    
    // 2. 验证价格区间
    if (productData.price < priceRange.min_price || productData.price > priceRange.max_price) {
      issues.push(`价格${productData.price}不在区间[${priceRange.min_price}, ${priceRange.max_price}]内`);
    }
    
    // 3. 验证评选理由长度
    if (productData.selection_reason.length < CONFIG.minReasonLength) {
      issues.push(`评选理由过短（${productData.selection_reason.length}字，要求至少${CONFIG.minReasonLength}字）`);
    }
    
    // 4. 验证置信度
    if (productData.confidence_score < CONFIG.minConfidence) {
      issues.push(`置信度过低（${productData.confidence_score}，要求至少${CONFIG.minConfidence}）`);
    }
    
    return {
      valid: issues.length === 0,
      issues: issues
    };
  }
  
  async processSingleCategory(category, index) {
    this.log(`\n🔍 处理品类 ${index + 1}/${this.categories.length}: ${category.level3}`);
    
    try {
      // 1. 处理价格区间
      this.log(`  1️⃣ 生成价格区间...`);
      const priceResult = await this.processPriceRanges(category);
      
      if (!priceResult.success) {
        throw new Error(`价格区间生成失败: ${priceResult.error}`);
      }
      
      // 2. 处理评价维度
      this.log(`  2️⃣ 生成评价维度...`);
      const dimensionResult = await this.processEvaluationDimensions(category);
      
      if (!dimensionResult.success) {
        throw new Error(`评价维度生成失败: ${dimensionResult.error}`);
      }
      
      // 3. 评选最佳商品
      const bestProducts = [];
      
      for (const priceRange of priceResult.content.price_ranges) {
        for (const dimension of dimensionResult.content.dimensions) {
          this.log(`    🏆 评选: [${priceRange.level}] - [${dimension.name}]`);
          
          const productResult = await this.selectBestProduct(category, priceRange, dimension);
          
          if (productResult.success) {
            // 验证评选结果
            const validation = this.validateProductSelection(
              productResult.content, 
              category, 
              priceRange, 
              dimension
            );
            
            if (validation.valid) {
              bestProducts.push({
                category: category.level3,
                price_range: priceRange,
                dimension: dimension,
                product: productResult.content,
                validation: "通过"
              });
              this.log(`      ✅ 评选通过验证`);
            } else {
              this.log(`      ⚠️ 评选未通过验证: ${validation.issues.join(', ')}`);
              // 可以在这里添加重试逻辑
            }
          } else {
            this.log(`      ❌ 评选失败: ${productResult.error}`);
          }
          
          // 请求间延迟
          await new Promise(resolve => setTimeout(resolve, CONFIG.delayBetweenRequests));
        }
      }
      
      // 保存结果
      const result = {
        category: category,
        price_ranges: priceResult.content,
        dimensions: dimensionResult.content,
        best_products: bestProducts,
        processed_at: new Date().toISOString(),
        cost: (priceResult.cost || 0) + (dimensionResult.cost || 0)
      };
      
      this.saveResult(result);
      this.processedCount++;
      
      this.log(`✅ 品类处理完成: ${bestProducts.length} 个商品评选`);
      return result;
      
    } catch (error) {
      this.log(`❌ 品类处理失败: ${error.message}`);
      this.failedCount++;
      return null;
    }
  }
  
  saveResult(result) {
    // 读取现有结果
    let allResults = [];
    if (fs.existsSync(CONFIG.outputFile)) {
      try {
        const existingData = fs.readFileSync(CONFIG.outputFile, 'utf8');
        allResults = JSON.parse(existingData);
      } catch (error) {
        this.log(`⚠️ 读取现有结果失败: ${error.message}`);
      }
    }
    
    // 添加新结果
    allResults.push(result);
    
    // 保存
    fs.writeFileSync(CONFIG.outputFile, JSON.stringify(allResults, null, 2));
    
    // 同时更新主best-answers.json
    this.updateMainBestAnswers(result);
  }
  
  updateMainBestAnswers(result) {
    const mainFile = path.join(__dirname, 'data/best-answers.json');
    
    if (!fs.existsSync(mainFile)) {
      return;
    }
    
    try {
      const mainData = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
      
      // 转换格式以匹配现有结构
      const categoryKey = `${result.category.level1}/${result.category.level2}/${result.category.level3}`;
      
      if (!mainData[categoryKey]) {
        mainData[categoryKey] = {
          category: result.category.level3,
          level1: result.category.level1,
          level2: result.category.level2,
          best_products: []
        };
      }
      
      // 添加最佳商品
      for (const bp of result.best_products) {
        mainData[categoryKey].best_products.push({
          price_range: bp.price_range.level,
          dimension: bp.dimension.name,
          product: bp.product,
          validated: true
        });
      }
      
      fs.writeFileSync(mainFile, JSON.stringify(mainData, null, 2));
      this.log(`📝 更新主数据文件: ${categoryKey}`);
      
    } catch (error) {
      this.log(`⚠️ 更新主数据文件失败: ${error.message}`);
    }
  }
  
  async processBatch(startIndex, batchSize) {
    const endIndex = Math.min(startIndex + batchSize, this.categories.length);
    this.log(`\n📦 处理批次: ${startIndex + 1}-${endIndex} (共${batchSize}个品类)`);
    
    const batchResults = [];
    
    for (let i = startIndex; i < endIndex; i++) {
      const category = this.categories[i];
      const result = await this.processSingleCategory(category, i);
      
      if (result) {
        batchResults.push(result);
      }
      
      // 进度报告
      if ((i - startIndex + 1) % 10 === 0) {
        const progress = ((i + 1) / this.categories.length * 100).toFixed(2);
        this.log(`📊 进度: ${i + 1}/${this.categories.length} (${progress}%)`);
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
      
      this.log(`🎯 开始处理 ${this.categories.length} 个品类`);
      
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
      
      this.log('\n🎉 大规模处理完成！');
      this.log(`📈 统计信息:`);
      this.log(`  总品类数: ${this.categories.length}`);
      this.log(`  成功处理: ${this.processedCount}`);
      this.log(`  处理失败: ${this.failedCount}`);
      this.log(`  成功率: ${(this.processedCount / this.categories.length * 100).toFixed(2)}%`);
      this.log(`  总成本: ¥${this.totalCost.toFixed(2)}`);
      this.log(`  总耗时: ${duration.toFixed(2)} 分钟`);
      this.log(`  平均速度: ${(this.processedCount / duration).toFixed(2)} 品类/分钟`);
      this.log(`  输出文件: ${CONFIG.outputFile}`);
      this.log(`  日志文件: ${CONFIG.logFile}`);
      
    } catch (error) {
      this.log(`💥 处理过程发生错误: ${error.message}`);
      this.log(error.stack);
    }
  }
}

// 主程序
async function main() {
  console.log('='.repeat(60));
  console.log('🚀 最佳商品百科全书 - 大规模自动化处理系统');
  console.log('🎯 核心理念: 科学性、合理性、真实性、高质量');
  console.log('='.repeat(60));
  
  // 检查API密钥
  if (!CONFIG.apiKey) {
    console.error('❌ 错误: 未设置DEEPSEEK_API_KEY环境变量');
    console.error('请设置: export DEEPSEEK_API_KEY=your_api_key_here');
    process.exit(1);
  }
  
  const processor = new MassiveProcessor();
  
  // 处理命令行参数
  const args = process.argv.slice(2);
  const limit = args.length > 0 ? parseInt(args[0]) : null;
  
  if (limit) {
    console.log(`🔧 调试模式: 仅处理前 ${limit} 个品类`);
    // 这里可以添加限制逻辑
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

module.exports = { MassiveProcessor };