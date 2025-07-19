import dotenv from "dotenv"
dotenv.config()
import { QueryTypes } from "sequelize";
import sequelize from "../config/connect_db.js";
import jsreportClient from 'jsreport-client';


class api_reporting_control {

    // Get Data and create PDF
    static getCustomerInvoice = async (req, resp) => {
        try {
            const result = await sequelize.query("SELECT SVoucherId, SVoucherNo, SVoucherDate, SVoucherQTYTotal, SVoucherNetAmount, SVoucherCustomerId, SVdetails.SVoucherDetailId ,SVdetails.SVoucherDetailItemParticulars, SVdetails.SVoucherDetailSalePrice, SVdetails.SVoucherDetailQTY, SVdetails.SVoucherDetailTotalAmount, SVdetails.SVoucherDetailNetAmount, Customer.CustomerName FROM `SVoucher` JOIN `SVoucherDetail` AS SVdetails ON SVoucherId = SVoucherDetailSVoucherId JOIN `Customer` ON CustomerId = SVoucherCustomerId WHERE SVoucherId = :SVoucherId;",
                {
                    replacements: req.body,
                    type: QueryTypes.SELECT
                }
            )
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
            const response = await jsreport.render({
                template: { shortid: "zT~F0g3" },
                data: { data: result }
            });
            resp.setHeader("Content-Type", "application/pdf");
            response.pipe(resp);
        } catch (error) {
            resp.json({
                status: "0",
                message: `report function error: ${error.message}`
            });
        }
    }
}

export default api_reporting_control;