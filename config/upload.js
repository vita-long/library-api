const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// 修复文件名编码问题
const decodeFileName = (fileName) => {
  // 处理不同浏览器编码差异
  try {
    return decodeURIComponent(fileName);
  } catch {
    return Buffer.from(fileName, 'latin1').toString('utf8');
  }
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: (req, file, cb) => {
    // 解码原始文件名
    const decodedName = decodeFileName(file.originalname);
    // 获取扩展名
    const ext = path.extname(decodedName);
    cb(null, `${uuidv4()}${ext}`);
  }
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
  allowedTypes.includes(file.mimetype) ? cb(null, true) : cb(new Error('上传类型错误'));
};

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

module.exports = {
  singleUpload: upload.single('file'),
  arrayUpload: upload.array('files', 5),
  decodeFileName
};