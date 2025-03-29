const path = require('path');

module.exports = {
  rtmpConfig: {
    rtmp: {
      app: 'live',
      port: 3001,
      chunk_size: 6000,
      gop_cache: true,
      ping: 30,
      ping_timeout: 60
    },
    http: {
      port: 3002,
      mediaroot: './media', // 媒体文件存储路径
      webroot: './media',
      allow_origin: "*"
    },
    hls: {  // 新增HLS配置
      port: 3002,
      path: '/hls', // HLS 访问路径
      chunkSize: 2, // 分片时长（秒）
      maxChunks: 5, // 最大分片数
      manifestFileExtension: '.m3u8', // 清单文件扩展名
      hlsFlags: '[hls_time=2:hls_list_size=5]',
      audioCodec: 'aac',
      videoCodec: 'libx264'
    },
    logType: 3
  }
}