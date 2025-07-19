import dotenv from "dotenv"
dotenv.config()
import { QueryTypes } from "sequelize";
import sequelize from "../config/connect_db.js";
import jsreportClient from 'jsreport-client';


class api_sales_report_control {
    static getSalesReportByCustomer = async (req, resp) => {
        console.log(req.body)
        try {
            const result = await sequelize.query("SELECT Customer.CustomerName, SVdetails.SVoucherDetailItemParticulars, SVdetails.SVoucherDetailSalePrice,  SVdetails.SVoucherDetailUOMName, SUM(SVdetails.SVoucherDetailQTY) AS SVoucherDetailQTY, SUM(SVdetails.SVoucherDetailTotalAmount) AS SVoucherDetailTotalAmount, SVoucherDate FROM `SVoucher` JOIN `SVoucherDetail` AS SVdetails ON SVoucherId = SVoucherDetailSVoucherId JOIN `Customer` ON CustomerId = SVoucherCustomerId WHERE SVoucherCustomerId = :customer_id GROUP BY SVdetails.SVoucherDetailItemParticulars", {
                replacements: req.body,
                type: QueryTypes.SELECT
            })
            if (result.length == 0) {
                resp.json({
                    status: "0",
                    message: `Data does not exist, ${result.length} records`
                })
            }
            this.report(req, resp, result)
        } catch (error) {
            resp.json({
                status: "0",
                message: `getSaleDetailByCustomer function error ${error}`
            })
        }
    }

    // Use to Create PDF from jsReport localserver
    static report = async (req, resp, result) => {
        try {
            const jsreport = jsreportClient(process.env.PCC_REPORT_SERVER);
            jsreport.render({
                template: {
                    shortid: "BJen4M1JHle",
                },
                data: {
                    data: result
                }
            }).then((response) => {
                resp.setHeader("Content-Type", "application/pdf");
                response.pipe(resp)
            }).catch((err) => {
                console.error("while report process function error:", err);
                resp.json({
                    status: "0",
                    message: `while report process function error: ${err.message}`
                });
            })
        } catch (error) {
            console.error("report function error:", error);
            resp.json({
                status: "0",
                message: `report function error: ${error.message}`
            });
        }
    }
}

export default api_sales_report_control;