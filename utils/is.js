const is = {
  number: (value) => typeof value === 'number',
  string: (value) => typeof value === 'string',
  array: (value) => Array.isArray(value),
  object: (value) => Object.prototype.toString.call(value) === '[object Object]',
  function: (value) => Object.prototype.toString.call(value) === '[object Function]',
  Date: (value) => Object.prototype.toString.call(value) === '[object Date]',
  nul: (value) => Object.prototype.toString.call(value) === '[object Null]',
  undefined: (value) => Object.prototype.toString.call(value) === '[object Undefined]',
}

module.exports = is;