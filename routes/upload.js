const express = require('express');
const router = express.Router();
const { File } = require('../models');
const { singleUpload, decodeFileName } = require('../config/upload');
const { success, fail } = require('../utils/response');

const { SERVER_URL } = require('../constants');

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
      path: `${SERVER_URL}/${req.file.filename}`
    });

    success(res, { file: fileRecord });

  } catch (error) {
    fail(res, error)
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