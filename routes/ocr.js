const express = require('express');
const router = express.Router();
const { success, fail, NotFoundError } = require('../utils/response');
const { createWorker } = require('tesseract.js');

// ocr识别
router.post('/', async function(req, res, next) {
  try{

    const filePath = req.body.file;
    if (!filePath) {
      console.log(filePath);
      throw new NotFoundError('未传递文件地址');
    }
    
    const worker = await createWorker();
    try {
      const worker = await createWorker('eng+chi_sim');
      const { data: { text } } = await worker.recognize(filePath);
      success(res, { ocr: text });
    } catch (err) {
      fail(res, { message: 'OCR processing failed' })
    } finally {
      await worker.terminate();
    }
  }catch(error) {
    fail(res, error)
  }
})

module.exports = router;