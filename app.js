import express from 'express'
import sequelize from './config/connect_db.js';
import sVoucherRoute from './route/sVoucherRoutes.js';
const port = 5000;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/svoucher",sVoucherRoute)



app.listen(port, () => {
    console.log(`Server is running http://localhost:${port}`);
})   