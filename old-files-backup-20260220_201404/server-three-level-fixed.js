const express = require('express');
const app = express();
const PORT = 3060;

// 模拟三级目录数据
const CATEGORY_TREE = {
  '个护健康': {
    icon: 'fa-heart',
    children: {
      '剃须用品': {
        icon: 'fa-razor',
        dimensions: ['性价比最高', '最耐用', '最舒适'],
        items: ['一次性剃须刀', '电动剃须刀', '剃须膏', '剃须刷', '剃须刀片', '剃须套装']
      },
      '护肤品': {
        icon: 'fa-spa',
        dimensions: ['最保湿', '最温和', '最有效'],
        items: ['面霜', '精华液', '面膜', '爽肤水', '眼霜', '防晒霜']
      },
      '口腔护理': {
        icon: 'fa-tooth',
        dimensions: ['最清洁', '最美白', '最舒适'],
        items: ['牙膏', '牙刷', '漱口水', '牙线', '电动牙刷', '牙贴']
      }
    }
  },
  '家居生活': {
    icon: 'fa-home',
    children: {
      '厨房用品': {
        icon: 'fa-utensils',
        dimensions: ['最耐用', '最安全', '最易清洁'],
        items: ['不粘锅', '菜刀', '砧板', '炒锅', '汤锅', '厨房剪刀']
      },
      '清洁工具': {
        icon: 'fa-broom',
        dimensions: ['最有效', '最耐用', '最环保'],
        items: ['拖把', '扫帚', '垃圾桶', '清洁剂', '抹布', '清洁刷']
      },
      '家具': {
        icon: 'fa-couch',
        dimensions: ['最舒适', '最耐用', '最美观'],
        items: ['沙发', '床', '桌子', '椅子