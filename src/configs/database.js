import { Sequelize } from 'sequelize';

const sequelize = new Sequelize(
  'api_basic',
  'root',
  '',

  {
    host: 'localhost',
    dialect: 'mysql'
  }
);

export default sequelize;
