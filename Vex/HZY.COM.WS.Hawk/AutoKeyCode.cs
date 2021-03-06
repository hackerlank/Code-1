﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Text;
using HZY.COM;
using HZY.COM.Common;
using HZY.COM.Common.DBAccess;
using HZY.COM.WS.DataSets;
using System.Collections;
using System.Web;


// 类名：AutoKeyCode
// 类说明：自动生成最大编号
// 创建人： 郭琦琦
// 创建日期：2014-11-19
// 修改人：
// 修改日期：
namespace HZY.COM.WS.Hawk
{
    public class AutoKeyCode
    {
        /// <summary>
        /// 按照传过来的参数确定最大号
        /// </summary>
        /// <param name="pstrCodeType">类型</param>
        /// <param name="pstrParam0">参数0</param>
        /// <param name="pstrParam1">参数1</param>
        /// <param name="pstrParam2">参数2</param>
        /// <param name="m_conn">参数3,连接</param>
        /// <returns></returns>
        public static string GetMaxKeyCode(string pstrCodeType, string pstrParam0, string pstrParam1, string pstrParam2, Dbconn m_conn)
        {
            try
            {
                DataSet ds_Return = new DataSet();
                DataTable resultTable = new DataTable();
                string strMaxPurchaseCode = "";//最大采购单号为空
                int nMaxPurchaseCode = 0;//采购单号int

                string MaxDeliveryplanDataCode = "";
                string strMaxDeliveryplanDataCode = "0";
                if (pstrCodeType == "采购单编号生成")
                {
                    strMaxPurchaseCode = m_conn.GetDataTableFirstValue(@"
                        SELECT  
                                MAX(PO1_POCode) PO1_POCode
                        FROM    [B02_BILL].[PO1_POHead]
                                where PO1_POCode like '2" + pstrParam0 + "%' AND PO1_DIVI='" + pstrParam1 + "'").ToString();
                    //如果最大号为空，放默认值2400000
                    if (strMaxPurchaseCode == "")
                    {
                        nMaxPurchaseCode = Convert.ToInt32("2" + pstrParam0 + "00000");
                    }
                    else
                    {
                        //取最大号，加1
                        nMaxPurchaseCode = Convert.ToInt32(strMaxPurchaseCode) + 1;
                    }
                    return nMaxPurchaseCode.ToString("0000000");
                }

                else if (pstrCodeType == "新增合同编号")
                {
                    string strMaxContractCode = "";
                    string strYear = DateTime.Now.Year.ToString().Substring(2, 2);
                    string strMonth = DateTime.Now.Month.ToString("00");
                    strMaxContractCode = m_conn.GetDataTableFirstValue(@"
                    SELECT  
                            MAX(PC1_ContractCode)
                    FROM    [B02_BILL].[PC1_POContractHead]
                            where PC1_RegionCode = '" + pstrParam0 + "' AND PC1_POTypeCode = '" + pstrParam1 + "' AND PC1_DIVI='" + pstrParam2 + "'").ToString();
                    if (strMaxContractCode == "")
                    {
                        strMaxContractCode = pstrParam0 + pstrParam1 + strYear + strMonth + "0001";
                    }
                    else
                    {
                        string strRight = strMaxContractCode.Substring(6, 4);      //取流水号
                        string strOldYear = strMaxContractCode.Substring(2, 2);    //取年份
                        string strOldMonth = strMaxContractCode.Substring(4, 2);   //取月份
                        if (Convert.ToInt32(strYear) == Convert.ToInt32(strOldYear) && Convert.ToInt32(strMonth) == Convert.ToInt32(strOldMonth))
                        {
                            int ContractNo = Convert.ToInt32(strRight) + 1;
                            if (ContractNo.ToString().Length == 1)
                            {
                                strMaxContractCode = pstrParam0 + pstrParam1 + strYear + strMonth + "000" + ContractNo.ToString();
                            }
                            else if (ContractNo.ToString().Length == 2)
                            {
                                strMaxContractCode = pstrParam0 + pstrParam1 + strYear + strMonth + "00" + ContractNo.ToString();
                            }
                            else if (ContractNo.ToString().Length == 3)
                            {
                                strMaxContractCode = pstrParam0 + pstrParam1 + strYear + strMonth + "0" + ContractNo.ToString();
                            }

                            else
                            {
                                strMaxContractCode = pstrParam0 + pstrParam1 + strYear + strMonth + ContractNo.ToString();
                            }
                        }
                        else
                        {
                            strMaxContractCode = pstrParam0 + pstrParam1 + strYear + strMonth + "0001";
                        }
                    }
                    return strMaxContractCode;
                }
                else if (pstrCodeType == "新增收货单编号")
                {
                    string strMaxReceiptCode = m_conn.GetDataTableFirstValue(@"
                    SELECT  
                            MAX(RP1_ReceiptCode)
                    FROM    [B02_BILL].[RP1_POReceiptHead]
                            where RP1_PO1_POCode = '" + pstrParam0 + "'").ToString();
                    if (strMaxReceiptCode != "")
                    {
                        int nNum = Convert.ToInt32(strMaxReceiptCode.Substring(9, 2)) + 1;
                        string strNum = "";
                        if (nNum < 10)
                        {
                            strNum = "0" + nNum;
                        }
                        else
                        {
                            strNum = nNum.ToString();
                        };
                        strMaxReceiptCode = "RE" + pstrParam0 + strNum;
                    }
                    else
                    {
                        strMaxReceiptCode = "RE" + pstrParam0 + "01";
                    }
                    return strMaxReceiptCode;
                }
                else if (pstrCodeType == "新增上货编号")
                {
                    //最大编号
                    string strSQL = @"SELECT 
                                        MAX([Code]) 
                                      FROM [B02_BILL].[CO1_CustomerOrderHead] WITH (NOLOCK)
                                      WHERE [Code] LIKE 'CO" + pstrParam0 + "%'";
                    string strMaxCoCode = m_conn.GetDataTableFirstValue(strSQL).ToString();

                    if (strMaxCoCode != "")
                    {
                        string strMaxNow = strMaxCoCode.Substring(2, 6);
                        string strNum = "";
                        if (pstrParam0 == strMaxNow)
                        {
                            int nNum = Convert.ToInt32(strMaxCoCode.Substring(8, 3)) + 1;

                            if (nNum < 10)
                            {
                                strNum = "00" + nNum.ToString();
                            }
                            else if (nNum >= 10 && nNum < 100)
                            {
                                strNum = "0" + nNum.ToString();
                            }
                            else
                            {
                                strNum = nNum.ToString();
                            }
                            strMaxCoCode = "CO" + pstrParam0 + strNum;
                        }
                        else
                        {
                            strMaxCoCode = "CO" + pstrParam0 + "001";
                        };
                    }
                    else
                    {
                        strMaxCoCode = "CO" + pstrParam0 + "001";
                    }
                    return strMaxCoCode;
                }
                else if (pstrCodeType == "新增退货单编号")
                {
                    string strMaxCliamCode = m_conn.GetDataTableFirstValue(@"
                    SELECT  
                            MAX(RT1_RetreatCode)
                    FROM    [B02_BILL].[RT1_RetreatHEAD]
                            where RT1_PO1_POCode = '" + pstrParam1 + "'").ToString();
                    if (strMaxCliamCode != "")
                    {
                        int nNum = Convert.ToInt32(strMaxCliamCode.Substring(9, 2)) + 1;
                        string strNum = "";
                        if (nNum < 10)
                        {
                            strNum = "0" + nNum;
                        }
                        else
                        {
                            strNum = nNum.ToString();
                        };
                        strMaxCliamCode = "RT" + pstrParam1 + strNum;
                    }
                    else
                    {
                        strMaxCliamCode = "RT" + pstrParam1 + "01";
                    }
                    return strMaxCliamCode;
                }

                else if (pstrCodeType == "新增到货计划编号")
                {
                    DateTime Newdatetime = DateTime.Now;//取本地当前时间
                    //string strDatetime = pstrParam0.Substring(2,8).ToString(); //
                    string strDateTime = pstrParam0.Substring(2, 2) + pstrParam0.Substring(5, 2) + pstrParam0.Substring(8, 2);//截取组成yymmdd格式
                    //取最大号规格是PL+yymmdd+流水号
                    MaxDeliveryplanDataCode = m_conn.GetDataTableFirstValue(@"
                                       SELECT MAX(AP1_APCode)
                                              FROM [B02_BILL].[AP1_APOHead]
                                              WHERE AP1_APCode LIKE 'PL" + strDateTime + "%' AND AP1_DIVI='" + pstrParam1 + "'").ToString();  //集团版增加环境条件
                    //如果为空，默认放置PL+yymmdd+01
                    if (MaxDeliveryplanDataCode == "")
                    {
                        strMaxDeliveryplanDataCode = "PL" + strDateTime + "01";
                    }
                    else
                    {
                        //如果不为空，先截取PL，再截取中间时间，再截取最后流水号+1。
                        strMaxDeliveryplanDataCode = MaxDeliveryplanDataCode.Substring(0, MaxDeliveryplanDataCode.Length - 2) + (Convert.ToInt32(MaxDeliveryplanDataCode.Substring(8, 2)) + 1).ToString("00");

                    }
                    return strMaxDeliveryplanDataCode;
                }
                else if (pstrCodeType == "新增付款申请单")
                {
                    //取付款申请单最大号格式PR+采购单号+流水号，默认是PR+采购单号+01
                    string MaxPR1_RequestCode = m_conn.GetDataTableFirstValue(@"
                                        SELECT  MAX(PR1_RequestCode)
                                                FROM  [B02_BILL].PR1_PaymentRequisit
                                                WHERE PR1_RequestCode LIKE 'PR" + pstrParam0 + "%' AND PR1_DIVI='" + pstrParam1 + "'").ToString();
                    if (MaxPR1_RequestCode == "")
                    {
                        MaxPR1_RequestCode = "PR" + pstrParam0 + "01";
                    }
                    else
                    {
                        MaxPR1_RequestCode = MaxPR1_RequestCode.Substring(0, MaxPR1_RequestCode.Length - 2) + (Convert.ToInt32(MaxPR1_RequestCode.Substring(9, 2)) + 1).ToString("00");
                    }
                    return MaxPR1_RequestCode;
                }
                else if (pstrCodeType == "新增付款申请单2")
                {
                    //取付款申请单最大号格式PR+采购单号+流水号，默认是PR+采购单号+01
                    string MaxPR1_RequestCode = m_conn.GetDataTableFirstValue(@"
                                        SELECT  MAX(PR1_RequestCode)
                                                FROM  [B02_BILL].PR1_PaymentRequisitHead
                                                WHERE PR1_RequestCode LIKE 'PR" + pstrParam0 + "%' AND PR1_DIVI='" + pstrParam1 + "'").ToString();
                    if (MaxPR1_RequestCode == "")
                    {
                        MaxPR1_RequestCode = "PR" + pstrParam0 + "01";
                    }
                    else
                    {
                        MaxPR1_RequestCode = MaxPR1_RequestCode.Substring(0, MaxPR1_RequestCode.Length - 2) + (Convert.ToInt32(MaxPR1_RequestCode.Substring(9, 2)) + 1).ToString("00");
                    }
                    return MaxPR1_RequestCode;
                }
                //采购子表新增项次
                else if (pstrCodeType == "新增项次")
                {
                    int nMaxPO2_LISeq = 0;//默认是0
                    //取数据库，当前采购单子行，最大项次号，如果为空，默认放置1，
                    string MaxPO2_LISeq = m_conn.GetDataTableFirstValue(@"
                                        SELECT  MAX(PO2_LISeq)
                                                FROM  [B02_BILL].[PO2_PODetail]
                                                WHERE PO2_POCode = '" + pstrParam0 + "' AND PO2_DIVI='" + pstrParam1 + "'").ToString();
                    if (MaxPO2_LISeq == "")
                    {
                        nMaxPO2_LISeq = 1;
                    }
                    else
                    {
                        nMaxPO2_LISeq = Convert.ToInt32(MaxPO2_LISeq) + 1;

                    }
                    return nMaxPO2_LISeq.ToString("0");
                }
                else if (pstrCodeType == "新增付款单")
                {
                    //取付款单最大号，规格是PY+采购单号+流水号，如果为空放默认值，PY+采购单号+流水号01开始
                    if (pstrParam1 == "")
                    {
                        pstrParam1 = "LX";
                    }
                    string MaxPB1_PaymentBill = m_conn.GetDataTableFirstValue(@"
                                        SELECT  MAX(PB1_PayBillCode)
                                                FROM  [B02_BILL].[PB1_PaymentBill]
                                                WHERE PB1_PayBillCode LIKE 'PY" + pstrParam0 + "%' AND PB1_DIVI='" + pstrParam1 + "'").ToString();
                    if (MaxPB1_PaymentBill == "")
                    {
                        MaxPB1_PaymentBill = "PY" + pstrParam0 + "01";
                    }
                    else
                    {
                        MaxPB1_PaymentBill = MaxPB1_PaymentBill.Substring(0, MaxPB1_PaymentBill.Length - 2) + (Convert.ToInt32(MaxPB1_PaymentBill.Substring(9, 2)) + 1).ToString("00");
                    }
                    return MaxPB1_PaymentBill;
                }
                else if (pstrCodeType == "新增供应商")
                {
                    if (pstrParam1 == "C")//如果是国内，取参数0、1、2 分类、币种、特征 为条件获取最大值
                    {
                        string MaxSupplierCode = m_conn.GetDataTableFirstValue(@"
                                        SELECT  MAX(SP1_SupplierCode) 
		                                        FROM   [B01_MDM].[SP1_Supplier] 
                                                WHERE  SUBSTRING(SP1_SupplierCode,2,3) = '" + pstrParam0 + pstrParam1 + pstrParam2 + "'").ToString();
                        if (MaxSupplierCode == "")
                        {
                            MaxSupplierCode = pstrParam0 + pstrParam1 + pstrParam2 + "001";
                        }
                        else
                        {
                            //如果存在，截取最后3位加1
                            MaxSupplierCode = MaxSupplierCode.Substring(1, MaxSupplierCode.Length - 4) + (Convert.ToInt32(MaxSupplierCode.Substring(4, 3)) + 1).ToString("000");
                        }
                        return MaxSupplierCode;
                    }
                    else
                    {
                        //如果是国外，直接取供应商表A开头的供应商最大号加1
                        string MaxSupplierCode = m_conn.GetDataTableFirstValue(@" SELECT MAX(SP1_SupplierCode)
                                                                                  FROM [B01_MDM].[SP1_Supplier]
                                                                                  WHERE SUBSTRING(SP1_SupplierCode,2,3) = '" + pstrParam0 + pstrParam1 + pstrParam2 + "'").ToString();
                        if (MaxSupplierCode == "")
                        {
                            MaxSupplierCode = pstrParam0 + pstrParam1 + pstrParam2 + "001";
                        }
                        else
                        {
                            int a = Convert.ToInt32(MaxSupplierCode.Substring(4, 3)) + 1;
                            //取最大号加1
                            MaxSupplierCode = MaxSupplierCode.Substring(1, MaxSupplierCode.Length - 4) + (Convert.ToInt32(MaxSupplierCode.Substring(4, 3)) + 1).ToString("000");
                        }
                        return MaxSupplierCode;
                    }
                }
                else if (pstrCodeType == "新增品牌")
                {

                    //                    string MaxBrandCode = m_conn.GetDataTableFirstValue(@"
                    //                                        SELECT MAX(BR1_BrandCode)
                    //                                                  FROM [B01_MDM].[BR1_Brand]").ToString();
                    //                    if (MaxBrandCode == "")
                    //                    {
                    //                        MaxBrandCode = "Z001";
                    //                    }
                    //                    else
                    //                    {
                    //                        MaxBrandCode = MaxBrandCode.Substring(0, MaxBrandCode.Length - 3) + (Convert.ToInt32(MaxBrandCode.Substring(1, 3)) + 1).ToString("000");
                    //                    }
                    //                    return MaxBrandCode;
                    int strMaxBrandCode = 10;
                    for (int i = 10; i < 99; i++)
                    {
                        string strMaxCode = m_conn.GetDataTableFirstValue(@"
                                        SELECT *
                                              FROM [B01_MDM].[BR1_Brand]
                                              WHERE BR1_BrandCode = '" + i + "'").ToString();
                        if (strMaxCode == "")
                        {
                            strMaxBrandCode = i;
                            break;
                        }
                    }
                    return strMaxBrandCode.ToString();
                }
                else if (pstrCodeType == "获取SKC最大号")
                {
                    string strMaxSKCCode = m_conn.GetDataTableFirstValue(@"
                                        SELECT ISNULL(MAX(ST1_StyleCode),'') maxskc
                                                FROM [B01_MDM].[ST1_Style]
                                                WHERE ST1_StyleCode LIKE '" + pstrParam0 + "%' AND ST1_DIVI='" + pstrParam1 + "'").ToString();
                    if (strMaxSKCCode == "")
                    {
                        strMaxSKCCode = pstrParam0 + "0001";
                    }
                    else
                    {
                        strMaxSKCCode = strMaxSKCCode.Substring(0, 5) + (Convert.ToInt32(strMaxSKCCode.Substring(5, 4)) + 1).ToString("0000");
                        // strMaxSKCCode = strMaxSKCCode.Substring(0, strMaxSKCCode.Length - 4) + (Convert.ToInt32(strMaxSKCCode.Substring(5, 4)) + 1).ToString("0000");

                    }
                    return strMaxSKCCode;
                }
                else if (pstrCodeType == "获取试用品最大SKC号")
                {
                    string strMaxSKCCode = m_conn.GetDataTableFirstValue(@"
                                        SELECT ISNULL(MAX(ST1_StyleCode),'') maxskc
                                                FROM [B01_MDM].[ST1_Style]
                                                WHERE ST1_StyleCode LIKE '" + pstrParam0 + "%' AND ST1_DIVI='" + pstrParam1 + "'").ToString();
                    if (strMaxSKCCode == "")
                    {
                        strMaxSKCCode = pstrParam0 + "001";
                    }
                    else
                    {
                        strMaxSKCCode = strMaxSKCCode.Substring(0, 6) + (Convert.ToInt32(strMaxSKCCode.Substring(6, 3)) + 1).ToString("000");
                    }
                    return strMaxSKCCode;
                }
                else if (pstrCodeType == "新增退仓单号")
                {
                    //SR+两位年份+两位月份+两位日+两位流水码

                    DateTime day = DateTime.Now;

                    string strYear = day.Year.ToString();
                    strYear = strYear.Substring(2, 2);
                    string strMonth = day.Month.ToString();
                    if (strMonth.Length == 1)
                    {
                        strMonth = "0" + strMonth;
                    };
                    string strDay = day.Day.ToString();
                    if (strDay.Length == 1)
                    {
                        strDay = "0" + strDay;
                    }

                    string strBill = "SR" + strYear + strMonth + strDay;


                    string strMaxBillCode = m_conn.GetDataTableFirstValue(@"
                                        SELECT  ISNULL(MAX(SR1_ShopRetreatBillCode),'') AS maxbill
                                        FROM [B02_BILL].[SR1_ShopRetreatHead]
                                        WHERE SR1_CONO = 'HYFG' AND SR1_DIVI = 'LX' AND SR1_ShopRetreatBillCode LIKE '%" + strBill + "%'").ToString();

                    if (strMaxBillCode == "")
                    {
                        strMaxBillCode = strBill + "01";
                    }
                    else
                    {
                        string maxnum = strMaxBillCode.Substring(8);
                        int num = Int32.Parse(maxnum);
                        num++;

                        maxnum = num.ToString();

                        if (maxnum.Length == 1)
                        {
                            maxnum = "0" + maxnum;
                        };

                        strMaxBillCode = strBill + maxnum;
                    }
                    return strMaxBillCode;
                }
                return "";
            }
            catch
            {
                throw;
            }
        }

        //public static string GetMaxKeyCode(string pstrCodeType)
        //{
        //    return GetMaxKeyCode(pstrCodeType, "", "", "", "", m_conn);
        //}

        internal static object GetMaxKeyCode(char p, string strRegionCode, string strPOTypeCode, char p_2, char p_3)
        {
            throw new NotImplementedException();
        }
    }
}
