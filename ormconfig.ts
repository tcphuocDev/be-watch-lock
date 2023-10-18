const SnakeNamingStrategy =
  require('typeorm-naming-strategies').SnakeNamingStrategy;

module.exports = {
  type: 'postgres',
  url: 'postgresql://doadmin:AVNS_9dpEJgy2snUj678@db-giay-shop-do-user-11456416-0.b.db.ondigitalocean.com:25060/postgres?sslmode=require',
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
