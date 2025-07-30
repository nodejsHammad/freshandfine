import { Sequelize } from "sequelize";
import dotenv from "dotenv"
dotenv.config()

const sequelize = new Sequelize(process.env.DATABASE_NAME, process.env.DATABASE_USER_NAME, '', {
    dialect: "mysql",
    host: process.env.HOST
});

export default sequelize;