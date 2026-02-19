#!/usr/bin/env node

/**
 * 独立质量检查脚本
 * 检查best-answers.json中的数据质量
 */

const { QualityValidator } = require('./quality-validator.js');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('='.repeat(60));
  console.log('🔍 独立质量检查工具');
  console.log('📊 检查best-answers.json中的数据质量');
  console.log('='.repeat(60));
  
  const dataFile = path.join(__dirname, 'data', 'best-answers.json');
  
  if (!fs.existsSync(dataFile)) {
    console.error('❌ 数据文件不存在:', dataFile);
    process.exit(1);
  }
  
  try {
    const rawData = fs.readFileSync(dataFile, 'utf8');
    const categories = JSON.parse(rawData);
    
    if (!Array.isArray(categories)) {
      console.error('❌ 数据格式错误: 期望数组');
      process.exit(1);
    }
    
    console.log(`📁 加载数据: ${categories.length} 个品类`);
    
    // 创建质量验证器
    const validator = new QualityValidator();
    
    // 执行批量验证
    console.log('\n' + '='.repeat(60));
    console.log('🚀 开始质量验证...');
    
    const validationReport = validator.validateAllCategories(categories);
    
    // 详细分析
    console.log('\n' + '='.repeat(60));
    console.log('📈 质量分析摘要');
    console.log('='.repeat(60));
    
    const stats = validator.getStats();
    console.log(`✅ 总验证品类: ${stats.totalValidations}`);
    console.log(`✅ 通过验证: ${stats.passedValidations} (${stats.passRate.toFixed(2)}%)`);
    console.log(`⚠️  未通过验证: ${stats.failedValidations}`);
    
    if (stats.qualityIssues.length > 0) {
      console.log(`\n🔍 质量问题分类:`);
      
      const issueTypes = {
        brand: 0,
        content: 0,
        price: 0,
        structure: 0,
        semantic: 0
      };
      
      stats.qualityIssues.forEach(issueRecord => {
        issueRecord.issues.forEach(issue => {
          if (issue.includes('[品牌]')) issueTypes.brand++;
          else if (issue.includes('[内容]')) issueTypes.content++;
          else if (issue.includes('[价格]')) issueTypes.price++;
          else if (issue.includes('[结构]')) issueTypes.structure++;
          else if (issue.includes('[语义]')) issueTypes.semantic++;
        });
      });
      
      Object.entries(issueTypes).forEach(([type, count]) => {
        if (count > 0) {
          console.log(`   - ${type}: ${count} 个问题`);
        }
      });
      
      console.log(`\n📋 前5个问题最多的品类:`);
      const sortedIssues = stats.qualityIssues
        .sort((a, b) => b.issues.length - a.issues.length)
        .slice(0, 5);
      
      sortedIssues.forEach((issueRecord, index) => {
        console.log(`   ${index + 1}. ${issueRecord.category}: ${issueRecord.issues.length}个问题`);
      });
    }
    
    // 生成建议
    console.log('\n' + '='.repeat(60));
    console.log('💡 质量改进建议');
    console.log('='.repeat(60));
    
    if (stats.passRate >= 90) {
      console.log('✅ 优秀: 数据质量很高，继续保持！');
    } else if (stats.passRate >= 70) {
      console.log('⚠️  良好: 数据质量尚可，但有改进空间');
      
      if (stats.qualityIssues.length > 0) {
        const mainIssueType = Object.entries({
          brand: stats.qualityIssues.filter(r => r.issues.some(i => i.includes('[品牌]'))).length,
          content: stats.qualityIssues.filter(r => r.issues.some(i => i.includes('[内容]'))).length
        }).sort((a, b) => b[1] - a[1])[0];
        
        if (mainIssueType && mainIssueType[1] > 0) {
          console.log(`  建议: 重点关注${mainIssueType[0]}问题的修复`);
        }
      }
    } else {
      console.log('❌ 需要改进: 数据质量有待提高');
      console.log('  建议:');
      console.log('  1. 检查品牌数据库是否完整');
      console.log('  2. 调整质量验证阈值');
      console.log('  3. 检查API提示词优化');
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('📄 质量报告已保存: data/quality-report.json');
    console.log('🎯 建议定期运行此检查监控数据质量');
    console.log('='.repeat(60));
    
  } catch (error) {
    console.error('💥 质量检查失败:', error.message);
    process.exit(1);
  }
}

// 运行主函数
main().catch(error => {
  console.error('💥 程序异常:', error);
  process.exit(1);
});