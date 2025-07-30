import express from "express";
const sVoucherRoute = express.Router();
import api_reporting_control from "../controller/api_reporting_control.js";
import api_sales_report_control from "../controller/api_sales_report_control.js";
import api_forecast_control from "../controller/api_forecast_control.js";
import api_pos_control from "../controller/api_pos_control.js";

sVoucherRoute.post("/getCustomerInvoice", api_reporting_control.getCustomerInvoice)
sVoucherRoute.post("/getSalesReportByCustomer", api_sales_report_control.getSalesReportByCustomer)
sVoucherRoute.post("/getSalesForecast", api_forecast_control.getSalesForecast)

sVoucherRoute.post("/getData", api_pos_control.get_data)

export default sVoucherRoute