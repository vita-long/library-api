const is = require('./is');

function formatParams(params) {
  if (!is.object(params)) {
    return params;
  }

  const filtered = Array.isArray(params) ? [] : {};
  
  for (const [key, value] of Object.entries(params)) {
    // 递归处理子属性
    const filteredValue = formatParams(value);

    // 跳过 null 和 undefined
    if (is.nul(filteredValue) || is.undefined(filteredValue)) continue;

    // 处理数组或对象
    if (typeof filteredValue === 'object') {
      filtered[key] = filteredValue;
    } else {
      filtered[key] = value;
    }
  }

  return filtered;
}

module.exports = {
  formatParams
}