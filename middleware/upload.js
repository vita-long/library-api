// 进度中间件
module.exports = async function(req, res, next) {
  try{
    const io = req.io;
    const socketId = req.headers['x-socket-id'];
    if (!socketId) return next();
    let uploadedBytes = 0;
    const totalBytes = parseInt(req.headers['content-length'], 10);
  
    req.on('data', (chunk) => {
      uploadedBytes += chunk.length;
      const progress = Math.round((uploadedBytes / totalBytes) * 100);
      io.to(socketId).emit('upload-progress', progress);
    });
  
    next();
  } catch(error){
    console.log(error);
  }
}
