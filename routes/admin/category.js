const express = require('express');
const router = express.Router();
const { Category } = require('../../models');
const { Op } = require('sequelize');
const { generateId } = require('../../utils/generateId');
const { NotFoundError, success, fail } = require('../../utils/response');

// 查询分类列表-模糊搜索
router.get('/', async function(req, res, next) {
  try {
    const query = req.query;
    const { current, pageSize, offset } = getPagination(query);

    const condition = {
      order: [['id', 'DESC']],
      limit: pageSize,
      offset
    }
    if (query.categoryName) {
      condition.where = vague(query)
    }
    const { count, rows } = await Category.findAndCountAll(condition);
    success(res, { list: rows, total: count, current, pageSize })
  } catch (error) {
    fail(res, error)
  }
});

// 查询分类详情
router.get('/:id', async function(req, res, next) {
  try{
    const category = await getCategory(req);
    success(res, category, '查询成功')
  }catch(error) {
    fail(res, error)
  }
})

// 新增分类
router.post('/', async function(req, res, next) {
  try{
    const body = filterBody(req);
    const category = await Category.create(body);
    if(category) {
      success(res, category, '查询成功')
    } else {
      fail(res, error)
    }

  }catch(error) {
    fail(res, error)
  }
})

// 删除分类
router.delete('/:id', async function(req, res, next) {
  try{
    const category = await getCategory(req);
    await category.destroy();
    success(res, category)
  }catch(error) {
    fail(res, error)
  }
})

// 更新分类
router.put('/:id', async function(req, res, next) {
  try{
    const category = await getCategory(req);
    const body = filterBody(req);
    await category.update(body);
    success(res, category, '更新分类成功')
  }catch(error) {
    fail(res, error)
  }
})

async function getCategory(req) {
  const { id } = req.params;

  const category = await Category.findByPk(id);

  if (!category) {
    throw new NotFoundError(`ID: ${id}的分类未找到`)
  }
  return category;
}

function filterBody(req) {
  return {
    categoryCode: generateId('category_'),
    categoryName: req.body.categoryName
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

// 模糊搜索条件
function vague(query) {

  return {
    categoryName: {
      [Op.like]: `%${query.categoryName}%`
    }
  }
}


module.exports = router;
