const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const { singleUpload, decodeFileName } = require('../config/upload');
const { success, fail } = require('../utils/response');

const { createWorker } = require('tesseract.js');
const {Jimp} = require('jimp');
const sharp = require('sharp');
const { deleteFolderFile } = require('../utils/fs');

const { SERVER_URL } = require('../constants');


// 初始化Tesseract Worker（单例模式）
let worker;
(async () => {
  worker = await createWorker('chi_sim+eng');
  await worker.setParameters({
    tessedit_pageseg_mode: 7, // PSM.SINGLE_BLOCK
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNPQRSTUVWXYZ0123456789京津沪渝冀晋辽吉黑苏浙皖闽赣鲁豫鄂湘粤琼川贵云陕甘青蒙桂宁新藏港澳学警'
  });
})();

class PlateLocator {
  /**
   * 车牌定位核心方法（基于颜色空间分析）
   * @param {string} imagePath
   * @returns {Promise<{x: number, y: number, width: number, height: number}>}
   */
  static async locatePlate(imagePath) {
    const image = await Jimp.read(imagePath);
    let minX = image.bitmap.width;
    let minY = image.bitmap.height;
    let maxX = 0;
    let maxY = 0;

    // 颜色空间分析（适配蓝牌和黄牌）
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, (x, y, idx) => {
      const r = image.bitmap.data[idx];
      const g = image.bitmap.data[idx + 1];
      const b = image.bitmap.data[idx + 2];
      
      // 蓝色车牌判断条件
      const isBluePlate = r > 30 && r < 50 && g > 70 && g < 100 && b>150;
      // 黄色车牌判断条件 
      const isYellowPlate = r > 150 && g > 150 && b < 100;
      
      if (isBluePlate || isYellowPlate) {
        minX = Math.min(minX, x);
        minY = Math.min(minY, y);
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
      }
    });

    // 有效性校验
    if (maxX <= minX || maxY <= minY) {
      throw new Error('车牌定位失败');
    }

    // 扩展边界（避免边缘裁剪）
    const padding = 5;
    return {
      x: Math.max(0, minX - padding),
      y: Math.max(0, minY - padding),
      width: Math.min(image.bitmap.width, maxX - minX + padding * 2),
      height: Math.min(image.bitmap.height, maxY - minY + padding * 2)
    };
  }
}

// 图像预处理模块
class ImagePreprocessor {
  /**
   * 使用Sharp进行基础预处理
   * @param {string} inputPath 
   * @returns {Promise<string>} 返回处理后的临时文件路径
   */
  static async preprocessWithSharp(inputPath) {
    const outputPath = path.join('processed', `sharp_${Date.now()}.png`);
    await sharp(inputPath)
      .resize({ width: 800 }) // 调整宽度保持比例
      .normalise() // 自动调整对比度
      .toFormat('png')
      .toFile(outputPath);
    return outputPath;
  }

  /**
   * 使用Jimp进行精细处理
   * @param {string} inputPath 
   * @returns {Promise<string>} 返回处理后的临时文件路径
   */
  static async preprocessWithJimp(inputPath) {
    const outputPath = path.join('processed', `jimp_${Date.now()}.png`);
    const image = await Jimp.read(inputPath);
    await image
      .greyscale() // 灰度化
      .contrast(0.7) // 增强对比度
      .normalize() // 标准化颜色范围
      // .threshold({max: 180}) // 增加二值化处理
      .write(outputPath);
    return outputPath;
  }

  /**
   * 执行图像裁剪
   * @param {string} inputPath 
   * @param {Object} region 
   * @returns {Promise<string>} 裁剪后的文件路径
   */
  static async cropRegion(inputPath, region) {
    const outputPath = path.join('processed', `plate_${Date.now()}.png`);
    
    await sharp(inputPath)
      .extract({
        left: Math.round(region.x),
        top: Math.round(region.y),
        width: Math.round(region.width),
        height: Math.round(region.height)
      })
      .toFile(outputPath);

    return outputPath;
  }

  /**
   * 增强预处理流程
   * @param {string} inputPath 
   * @returns {Promise<string>} 处理后的文件路径
   */
  static async enhanceProcessing(inputPath) {
    const outputPath = path.join('processed', `enhanced_${Date.now()}.png`);
    
    await sharp(inputPath)
      .resize({ width: 1200 })  // 提高分辨率便于定位
      .sharpen({ sigma: 2 })    // 锐化边缘
      .normalise()              // 增强对比度
      .toFile(outputPath);

    return outputPath;
  }
}

// OCR识别服务模块
class OCRService {
  /**
   * 执行OCR识别
   * @param {string} imagePath 
   * @returns {Promise<string>} 识别结果
   */
  static async recognize(imagePath) {
    try {
      const { data: { text }} = await worker.recognize(imagePath);
      return text;
    } catch (error) {
      throw new Error(`OCR识别失败: ${error.message}`);
    }
  }
}

router.post('/', singleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }

    // 预处理流程
    const enhancedPath = await ImagePreprocessor.enhanceProcessing(req.file.path);
    const plateRegion = await PlateLocator.locatePlate(enhancedPath);

    // 执行裁剪
    const croppedPath = await ImagePreprocessor.cropRegion(enhancedPath, plateRegion);

    const jimpProcessed = await ImagePreprocessor.preprocessWithJimp(croppedPath);
    
    // OCR识别
    const result = await OCRService.recognize(jimpProcessed);

    await Promise.all([
      deleteFolderFile(path.join('processed'))
    ]);

    success(res, { file: result });

  } catch (error) {
    console.log(error);
    fail(res, error)
  }
});

module.exports = router;