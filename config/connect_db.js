import { Sequelize } from "sequelize";

const sequelize = new Sequelize('freshandfinedb18', 'root', '', {
    dialect: "mysql",
    host: 'localhost'
});

export default sequelize;