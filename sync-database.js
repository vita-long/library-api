const db = require('./models/index');
async function main() {
  await db.sequelize.sync({ alter: true });
}

main();