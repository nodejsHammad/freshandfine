import dotenv from "dotenv"
dotenv.config()
import { QueryTypes } from "sequelize";
import sequelize from "../config/connect_db.js";
import jsreportClient from 'jsreport-client';

class api_forecast_control {
    static getSalesForecast = async (req, resp) => {
        try {
            req.body.year = req.body.year + '-%'
            const result = await sequelize.query("SELECT Customer.CustomerName ,DATE_FORMAT(SVoucherDate, '%Y-%m') AS newDate ,SVdetails.SVoucherDetailItemParticulars, COUNT(SVdetails.SVoucherDetailItemParticulars) AS orderByPerson, SVdetails.SVoucherDetailSalePrice, SVdetails.SVoucherDetailUOMName, SUM(SVdetails.SVoucherDetailQTY) AS SVoucherDetailQTY , SUM(SVdetails.SVoucherDetailTotalAmount) AS SVoucherDetailTotalAmount FROM `SVoucher` JOIN `SVoucherDetail` AS SVdetails ON SVoucherId = SVoucherDetailSVoucherId JOIN Customer ON CustomerId = SVoucherCustomerId WHERE SVdetails.SVoucherDetailItemParticulars = :item AND SVoucherDate LIKE :year AND SVoucherCustomerId = :customer_id GROUP BY newDate, SVdetails.SVoucherDetailSalePrice;",
                {
                    replacements: req.body,
                    type: QueryTypes.SELECT
                }
            )
            this.report(req, resp, result)
        } catch (error) {
            resp.json({
                status: "0",
                message: `getSalesForecast function error ${error}`
            })
        }
    }

    // Use to Create Report from JS Report server
    static report = async (req, resp, result) => {
        try {
            const jsreport = jsreportClient(process.env.PCC_REPORT_SERVER);
            jsreport.render({
                template: {
                    shortid: req.body.file == "excel" ? "Byx_sKo7Hee" : "Sygo-j4MIex",
                },
                data: {
                    data: result
                }
            }).then((response) => {
                if (req.body.file == "excel") {
                    resp.setHeader('Content-Disposition', 'attachment; filename="SalesForecast.xlsx"');
                    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                } else {
                    resp.setHeader("Content-Type", "application/pdf");
                    resp.setHeader("Content-Disposition", "attachment; filename=report.pdf");
                }
                response.pipe(resp)
            }).catch((err) => {
                resp.json({
                    status: "0",
                    message: `while report process function error: ${err.message}`
                });
            })
        } catch (error) {
            resp.json({
                status: "0",
                message: `report function error: ${error.message}`
            });
        }
    }
}

export default api_forecast_control;