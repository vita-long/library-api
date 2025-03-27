const express = require('express');
const router = express.Router();
const { File } = require('../models');
const { singleUpload, decodeFileName } = require('../config/upload');

// ========== 单文件上传接口 ==========
router.post('/single', singleUpload, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '未上传文件' });
    }

    // 将文件信息保存到数据库（假设有File模型）
    const fileRecord = await File.create({
      filename: req.file.filename,
      originalname: decodeFileName(req.file.originalname),
      mimetype: req.file.mimetype,
      size: req.file.size,
      path: req.file.path
    });
    res.json({
      message: '文件上传成功',
      file: fileRecord
    });

  } catch (error) {
    console.error('上传错误:', error);
    res.status(500).json({ 
      error: '服务器错误',
      details: error.message 
    });
  }
});

// ========== 多文件上传接口 ==========
// router.post('/upload/multiple', upload.array('files', 5), (req, res) => {
//   // upload.array('字段名', 最大文件数)
//   const files = req.files.map(file => ({
//     filename: file.filename,
//     originalname: file.originalname,
//     size: file.size
//   }));

//   res.json({
//     message: `${files.length} 个文件上传成功`,
//     files: files
//   });
// });

module.exports = router;