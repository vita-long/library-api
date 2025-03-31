const fs = require('fs');
const path = require('path');

function deleteFolderFile(folderPath) {
  if (fs.existsSync(folderPath)) {
    fs.readdirSync(folderPath).forEach(file => {
        const curPath = path.join(folderPath, file);
        if (fs.lstatSync(curPath).isDirectory()) { // 递归使用
            deleteFolderRecursive(curPath);
        } else { // 删除文件
            fs.unlinkSync(curPath);
        }
    });
    fs.rmdirSync(folderPath); // 删除空目录
  }
}

function isDirectory() {
  try {
    const stats = fs.statSync(path);
    return stats.isDirectory();
  } catch (err) {
    if (err.code === 'ENOENT') {
      console.log('目录不存在');
    } else {
      throw err;
    }
  }
}

module.exports = {
  deleteFolderFile,
  isDirectory
}