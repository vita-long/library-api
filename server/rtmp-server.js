const nodeMediaServer = require('node-media-server');
const { rtmpConfig } = require('../config/rtmp');

const nms = new nodeMediaServer(rtmpConfig);

nms.on('postHLS', (id, StreamPath, file) => {
  console.log('[HLS Generated]', file);
});

module.exports = {
  nms
}