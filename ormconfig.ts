const SnakeNamingStrategy =
  require('typeorm-naming-strategies').SnakeNamingStrategy;
const databaseConfig = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'P@ssword',
  database: 'wmsx_sell_lock',
  entities: ['dist/src/entities/*.entity.js'],
  migrations: ['dist/src/migrations/*.js'],
  synchronize: false,
  cli: {
    entitiesDir: 'src/entities',
    migrationsDir: 'src/migrations',
  },
  logging: true,
  namingStrategy: new SnakeNamingStrategy(),
};
module.exports = databaseConfig;
// module.exports = {
//   type: 'postgres',
//   host: 'localhost',
//   port: 5432,
//   username: 'postgres',
//   password: 'P@ssword', //Em thay password cảu em vào đây nhé
//   database: 'sell_locks', //Tạo thêm cho anh 1 cái databasse như này nhé
//   entities: ['dist/src/entities/*.entity.js'],
//   migrations: ['dist/src/migrations/*.js'],
//   synchronize: false,
//   cli: {
//     entitiesDir: 'src/entities',
//     migrationsDir: 'src/migrations',
//   },
//   logging: true,
//   namingStrategy: new SnakeNamingStrategy(),
// };
