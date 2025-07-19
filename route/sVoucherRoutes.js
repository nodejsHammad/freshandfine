import express from "express";
const sVoucherRoute = express.Router();
import api_svoucher_control from "../controller/api_svoucher_control.js";
import api_reporting_control from "../controller/api_reporting_control.js";
import api_sales_report_control from "../controller/api_sales_report_control.js";
import api_forecast_control from "../controller/api_forecast_control.js";

sVoucherRoute.post("/getCustomerInvoice", api_reporting_control.getCustomerInvoice)
sVoucherRoute.post("/getSalesReportByCustomer", api_sales_report_control.getSalesReportByCustomer)
sVoucherRoute.post("/getSalesForecast", api_forecast_control.getSalesForecast)

export default sVoucherRoute