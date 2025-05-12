module.exports = {
  development: {
    username: 'root',
    password: '123456',
    database: 'library',
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql',
    timezone: '+08:00',
    define: {
      underscored: true,
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3,          // 最大重试次数
      timeout: 3000     // 重试间隔(ms)
    },
    logging: process.env.NODE_ENV === 'development' ? console.log : false
  },
  production: {
    username: 'root',
    password: '6742a744d69707b8',
    database: 'library',
    host: '127.0.0.1',
    port: '3306',
    dialect: 'mysql',
    timezone: '+08:00',
    define: {
      underscored: true,
      timestamps: true
    },
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    retry: {
      max: 3,          // 最大重试次数
      timeout: 3000     // 重试间隔(ms)
    }
  },
}
