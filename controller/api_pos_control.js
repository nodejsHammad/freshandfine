import dotenv from "dotenv"
dotenv.config()
import { QueryTypes } from "sequelize";
import sequelize from "../config/connect_db.js";
import jsreportClient from 'jsreport-client';

class api_pos_control {
    static getPOS = async (req, resp) => {
        try {
            const { startDate, endDate } = req.body;
            let query = `
            SELECT
    allData.ItemClassId,
    ItemClass.ItemClassName,
    allData.ManufacturerId,
    Manufacturer.ManufacturerName,
    allData.BrandId,
    Brand.BrandName,
    allData.ItemId,
    Item.ItemName,
    allData.Quantity,
    allData.Total,
    allData.CostTotal,
    allData.Total - allData.CostTotal AS GrossProfit,
    CategoryTotal.CostTotal AS CategoryCostTotal,
    CategoryTotal.Total AS Total,
    CategoryTotal.Quantity AS Quantity,
    CASE WHEN CategoryTotal.Total != 0 AND allData.Total != 0 THEN allData.Total / CategoryTotal.Total * 100 ELSE 0
END AS SaleContribution
FROM
    (
    SELECT
        ItemClass.ItemClassId,
        Manufacturer.ManufacturerId,
        Brand.BrandId,
        Item.ItemId,
        SUM(SVoucherDetailQTY) AS Quantity,
        SUM(SVoucherDetailTotalAmount) AS Total,
        SUM(
            SVoucherDetailCostPrice * SVoucherDetailQTY
        ) AS CostTotal
    FROM
        SVoucherDetail
    JOIN SVoucher ON SVoucher.SVoucherId = SVoucherDetailSVoucherId
    JOIN Item ON Item.ItemId = SVoucherDetail.SVoucherDetailItemId
    JOIN Brand ON Brand.BrandId = Item.ItemBrandId
    JOIN Manufacturer ON Manufacturer.ManufacturerId = Item.ItemManufacturerId
    JOIN ItemClass ON ItemClass.ItemClassId = Item.ItemItemClassId
    WHERE
        SVoucher.SVoucherDate BETWEEN :startDate AND :endDate  AND Manufacturer.ManufacturerId = :companyId
    GROUP BY
        ItemClass.ItemClassId,
        Manufacturer.ManufacturerId,
        Brand.BrandId
    UNION ALL
SELECT
    ItemClass.ItemClassId,
    Manufacturer.ManufacturerId,
    NULL AS BrandId,
    NULL AS SVoucherDetailItemId,
    SUM(SVoucherDetailQTY) AS Quantity,
    SUM(SVoucherDetailTotalAmount) AS Total,
    SUM(
        SVoucherDetailCostPrice * SVoucherDetailQTY
    ) AS CostTotal
FROM
    SVoucherDetail
JOIN SVoucher ON SVoucher.SVoucherId = SVoucherDetailSVoucherId
JOIN Item ON Item.ItemId = SVoucherDetail.SVoucherDetailItemId
JOIN Brand ON Brand.BrandId = Item.ItemBrandId
JOIN Manufacturer ON Manufacturer.ManufacturerId = Item.ItemManufacturerId
JOIN ItemClass ON ItemClass.ItemClassId = Item.ItemItemClassId
WHERE
    SVoucher.SVoucherDate BETWEEN '2023-01-01' AND '2025-12-30' AND Manufacturer.ManufacturerId != 1
GROUP BY
    ItemClass.ItemClassId,
    Manufacturer.ManufacturerId
) AS allData
JOIN(
    SELECT ItemClass.ItemClassId,
        ItemClass.ItemClassName AS CatName,
        SUM(SVoucherDetailQTY) AS Quantity,
        SUM(SVoucherDetailTotalAmount) AS Total,
        SUM(
            SVoucherDetailCostPrice * SVoucherDetailQTY
        ) AS CostTotal
    FROM
        SVoucherDetail
    JOIN SVoucher ON SVoucher.SVoucherId = SVoucherDetailSVoucherId
    JOIN Item ON Item.ItemId = SVoucherDetail.SVoucherDetailItemId
    JOIN Brand ON Brand.BrandId = Item.ItemBrandId
    JOIN Manufacturer ON Manufacturer.ManufacturerId = Item.ItemManufacturerId
    JOIN ItemClass ON ItemClass.ItemClassId = Item.ItemItemClassId
    WHERE
        SVoucher.SVoucherDate BETWEEN '2023-01-01' AND '2025-12-30'
    GROUP BY
        CatName
) AS CategoryTotal
ON
    CategoryTotal.ItemClassId = allData.ItemClassId
JOIN Brand ON Brand.BrandId = allData.BrandId
JOIN ItemClass ON ItemClass.ItemClassId = allData.ItemClassId
JOIN Manufacturer ON Manufacturer.ManufacturerId = allData.ManufacturerId
JOIN Item ON Item.ItemId = allData.ItemId
ORDER BY
    allData.ItemClassId,
    allData.ManufacturerId,
    allData.BrandId,
    allData.ItemId
            `
            const result = await sequelize.query(query, {
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
            req.body.dataRange = `${startDate} TO ${endDate}`
            this.report(req, resp, result)
        } catch (error) {
            resp.json({
                status: "0",
                message: `getPOS function error ${error}`
            })
        }
    }

    // Use to Create Report from JS Report server
    static report = async (req, resp, result) => {
        try {
            const jsreport = jsreportClient(process.env.PCC_REPORT_SERVER);
            jsreport.render({
                template: {
                    shortid: req.body.file == "excel" ? "Byx_sKo7Hee" : "BJe1WShEwgg",
                },
                data: {
                    dateRange: req.body.dateRange,
                    data: result
                }
            }).then((response) => {
                if (req.body.file == "excel") {
                    resp.setHeader('Content-Disposition', 'attachment; filename="SalesForecast.xlsx"');
                    resp.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
                } else {
                    resp.setHeader("Content-Type", "application/pdf");
                    // resp.setHeader("Content-Disposition", "attachment; filename=report.pdf");
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




export default api_pos_control;