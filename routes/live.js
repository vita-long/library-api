const express = require('express');
const router = express.Router();
const { LiveRoom } = require('../models');
const { Op } = require('sequelize');
const { generateId } = require('../utils/generateId');
const { NotFoundError, success, fail } = require('../utils/response');
const { v4 } = require('uuid');

router.get('/', async (req, res, next) => {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    const { count, rows } = await LiveRoom.findAndCountAll(condition);
    success(res, { list: rows, total: count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
})
// 新增直播间
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const room = await LiveRoom.create(body);
    if(room) {
      success(res, room, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

function filterBody(req) {
  return {
    liveId: generateId('room_'),
    streamKey: v4(),
    liveName: req.body.liveName
  };
}

// 分页信息
function getPagination(query) {
  const current = Math.abs(Number(query.current)) || 1;
  const pageSize = Math.abs(Number(query.pageSize)) || 10;
  const offset = (current - 1) * pageSize;
  return {
    current,
    pageSize,
    offset
  }
}

module.exports = router;