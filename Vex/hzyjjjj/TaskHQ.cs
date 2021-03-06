﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Data;
using System.Text;
using System.Collections;
using System.Web;

using HZY.COM;
using HZY.COM.Common;
using HZY.COM.Common.Base;
using HZY.COM.Common.DBAccess;
using HZY.COM.WS.DataSets;
using HZY.COM.ST1005A;
//using HZY.COM.ST1005A;

///WSID:57a51159-4710-42cd-bca3-32fdaeacc616

namespace hzyjjjj
{
    public class TaskHQ: HZYLogicBase,ILogicGetData
    {
        #region 构造函数
        public TaskHQ()
        {
            this.m_SessionCheck = true;
        }
        #endregion

        #region 内部变量
        private Dbconn conn = new Dbconn("HZY_JorealCMT");
        private Dbconn conn_mdm = new Dbconn("MDM_Market2");
        private DataSet m_ReturnData = new DataSet();
        private DataTable dt_EditResult = new dsCommon.dtResultDataTable();
        private DataTable dt_MainList = new dsCommon.dtResultDataTable();
        DateTime now = new DateTime();
        #endregion

        #region 内部函数

        #region GetTaskData
                private void GetTaskData(string pstrWhere) {

                string strOwnerPower = OwnerPower();      
                int iPowerLength = strOwnerPower.Length;
                if (iPowerLength > 0)
                {
                    strOwnerPower += @" AND EXISTS(
                                           SELECT 1 FROM 
                                           M02_BPM.TK2_TaskDetail AS T3 WITH(NOLOCK) 
                                           WHERE T1.ID= T3.TK1_ID AND T3.Depotid IN ('" + strOwnerPower + "'))";
                }
                else {
                    strOwnerPower = " ";
                };
                string strSQL = @"SELECT DISTINCT
                                       [TK1_ID]
                                      ,[Code]
                                      ,[JobName]
                                      ,[TaskType]
                                      ,[Desp]
                                      ,[ValidateState]
                                      ,[ValidateFrom]
                                      ,[ValidateTo]
                                      ,[CustomerNum]
                                      ,[BespeakNum]
                                      ,[Batch]
                                      ,[Rgdt]
                                      ,[RgUser]
                                      ,[LmDt]
                                      ,[LmUser]
                                FROM [dbo].[View_JobMain] WITH (NOLOCK) WHERE 1=1 " + strOwnerPower + pstrWhere;
                m_ReturnData = conn.GetDataSetForPageList(strSQL, new string[0], m_hzyPageInfo);
            }
            #endregion

        #region SaveTask
            private void SaveTask()
            {
                DataSet dsBasic = CreateTable();

                string strCode = AutoCode("TaskCode");
                string strBatch = dt_MainList.Rows[0]["Batch"].ToString();//前台传
                string strJobId = dsBasic.Tables["dtTH"].Rows[0]["ID"].ToString();

                ////TaskHead
                dsBasic.Tables["dtTH"].Rows[0]["TKT_ID"] = dt_MainList.Rows[0]["JobType"];
                dsBasic.Tables["dtTH"].Rows[0]["Code"] = strCode;
                dsBasic.Tables["dtTH"].Rows[0]["Name"] = dt_MainList.Rows[0]["JobName"];
                dsBasic.Tables["dtTH"].Rows[0]["Desp"] = dt_MainList.Rows[0]["Remark"];
                dsBasic.Tables["dtTH"].Rows[0]["Dist_ID"] = dt_MainList.Rows[0]["Deliver"];
                dsBasic.Tables["dtTH"].Rows[0]["ValidateState"] = "未审核";
                //dsBasic.Tables["dtTH"].Rows[0]["ImportPath"] = dt_MainList.Rows[0]["Route"];
                dsBasic.Tables["dtTH"].Rows[0]["ValidateFrom"] = dt_MainList.Rows[0]["Start"];
                dsBasic.Tables["dtTH"].Rows[0]["ValidateTo"] = dt_MainList.Rows[0]["End"];
                dsBasic.Tables["dtTH"].Rows[0]["Batch"] = strBatch;
                dsBasic.Tables["dtTH"].Rows[0]["Rgdt"] = now;
                dsBasic.Tables["dtTH"].Rows[0]["RgUser"] = this.hzyMessage.User_Name_CN;
                dsBasic.Tables["dtTH"].Rows[0]["LmDt"] = now;
                dsBasic.Tables["dtTH"].Rows[0]["LmUser"] = this.hzyMessage.User_Name;

                ////TaskSchedule
                dsBasic.Tables["dtTS"].Rows[0]["TK1_ID"] = strJobId;
                dsBasic.Tables["dtTS"].Rows[0]["BatchNo"] = strBatch;
                dsBasic.Tables["dtTS"].Rows[0]["Dist_ID"] = dt_MainList.Rows[0]["Deliver"];
                dsBasic.Tables["dtTS"].Rows[0]["State"] = "已导入";
                dsBasic.Tables["dtTS"].Rows[0]["Rgdt"] = now;
                dsBasic.Tables["dtTS"].Rows[0]["RgUser"] = this.hzyMessage.User_Name_CN;
                dsBasic.Tables["dtTS"].Rows[0]["LmDt"] = now;
                dsBasic.Tables["dtTS"].Rows[0]["LmUser"] = this.hzyMessage.User_Name_CN;

                bool bResult;

                conn.BeginTransaction(); // 开启事务
                bResult = conn.Insert("[M02_BPM].[TK1_TaskHead]", dsBasic.Tables["dtTH"]);
                bResult = conn.Insert("[M02_BPM].[TK3_TaskSchedule]", dsBasic.Tables["dtTS"]);
                conn.CommitTransaction();//提交事务

                if (bResult)
                {
                    dt_EditResult.Rows.Add(new object[] { true, "上传成功" });
                }
                else
                {
                    dt_EditResult.Rows.Add(new object[] { false, "上传失败" });
                };
                m_ReturnData.Tables.Add(dt_EditResult);
            }
        #endregion
            
        #region OwnerPower
		 private string OwnerPower(){
                string strOwnerName = m_hzyMessage.User_Name_CN,
                       strReturn = "";
                
                string strSQL = @"SELECT 店铺ID 
                                  FROM [MDM_Market2].dbo.V_L0013
                                  WHERE 督导姓名 = '"+strOwnerName+"'";

                DataTable dtGetDepID = conn_mdm.GetDataTable(strSQL);
                int iGetDtRowsCount = dtGetDepID.Rows.Count;

                while(iGetDtRowsCount > 0){
                    string strDepID = dtGetDepID.Rows[iGetDtRowsCount - 1]["店铺ID"].ToString();
                    
                    if (iGetDtRowsCount - 1 != 0)
                    {
                        strReturn += strDepID + "','";
                    }
                    else if (iGetDtRowsCount - 1 == 0) {
                        strReturn += strDepID;
                        break;
                    };
                };

                return strReturn;
            }
	    #endregion

        #region Excel to DataBase
         /// <summary>
         /// 将Excel导入后，存入[TK5_TaskExcelData]
         /// </summary>
         private void Excel()
         {
             DataTable dtInput = m_RequestBak.Tables[0];
             dtInput.Columns[0].ColumnName = "CUS1_MobileNum";
             dtInput.Columns[1].ColumnName = "ReservationDate";

             string strMaxCode = AutoCode("Excel"); //最大批次号

             //增加字段
             dtInput.Columns.Add("ID");
             dtInput.Columns.Add("M01P_ID");
             dtInput.Columns.Add("M02C_ID");
             dtInput.Columns.Add("BatchNo");
             dtInput.Columns.Add("HasDate");
             dtInput.Columns.Add("State");
             dtInput.Columns.Add("Rgdt");
             dtInput.Columns.Add("RgUser");
             dtInput.Columns.Add("LmDt");
             dtInput.Columns.Add("LmUser");

             dtInput.TableName = "dtInput";

             //取dt行数
             int iNum = dtInput.Rows.Count;

             for (int i = 0; i < iNum; i++)
             {
                 System.Guid guid = System.Guid.NewGuid();               //Guid 类型
                 string strGUID = System.Guid.NewGuid().ToString();      //直接返回字符串类型

                 //赋值
                 dtInput.Rows[i]["ID"] = strGUID;
                 dtInput.Rows[i]["M01P_ID"] = "ADDDFF05-08AF-4E51-89EB-3C7185DD7050";
                 dtInput.Rows[i]["M02C_ID"] = "D55D3D5A-57A3-4A97-87F2-1CC3DAF98C8E";
                 dtInput.Rows[i]["BatchNo"] = strMaxCode;
                 dtInput.Rows[i]["State"] = "未处理";
                 dtInput.Rows[i]["Rgdt"] = now;
                 dtInput.Rows[i]["RgUser"] = this.hzyMessage.User_Name_CN;
                 dtInput.Rows[i]["LmDt"] = now;
                 dtInput.Rows[i]["LmUser"] = this.hzyMessage.User_Name_CN;

                 string strRD = dtInput.Rows[i]["ReservationDate"].ToString();
                 if (strRD == "")
                 {
                     dtInput.Rows[i]["HasDate"] = "0";
                 }
                 else
                 {
                     dtInput.Rows[i]["HasDate"] = "1";
                 };
             }

             bool bResult;

             conn.BeginTransaction(); // 开启事务
             bResult = conn.Insert("[M02_BPM].[TK5_TaskExcelData]", dtInput);
             conn.CommitTransaction();//提交事务

             if (bResult)
             {
                 DataSet dsReturn = conn.GetDataSetBySP("[SRV_MDM].[BatchDataCheck]", new string[4] { "@InputFormat", "@OutputFormat", "@OutputContentType", "@ConditionStr" },
                     new string[4] { "AML", "DB", "RS", "【操作类型,GET】【CONO,ADDDFF05-08AF-4E51-89EB-3C7185DD7050】【DIVI,D55D3D5A-57A3-4A97-87F2-1CC3DAF98C8E】【批次号," + strMaxCode + "】" });

                 string strRetrun = dsReturn.Tables[0].Rows[0]["MSG"].ToString();
                 string strBatchInf = dsReturn.Tables[0].Rows[0]["BatchInf"].ToString();
                 string strErrorMsg = "";
                 if (strRetrun == "成功！")
                 {
                     dt_EditResult.Rows.Add(new object[] { true, "上传成功" });
                     dt_EditResult.Rows.Add(new object[] { true, strBatchInf });
                 }
                 else
                 {
                     dt_EditResult.Rows.Add(new object[] { false, "上传失败" });

                     DataSet dsError = Common.Common.GetDSByExcelXML(strBatchInf);
                     for (int i = 0; i < dsError.Tables["list"].Rows.Count; i++)
                     {
                         strErrorMsg += "电话号码:" + dsError.Tables["list"].Rows[i]["CUS1_MobileNum"] + "-";
                         strErrorMsg += dsError.Tables["list"].Rows[i]["MSG"] + "；";
                     }
                     dt_EditResult.Rows.Add(new object[] { false, strErrorMsg });
                 };
             }
             else
             {
                 dt_EditResult.Rows.Add(new object[] { false, "上传失败" });
             }
             m_ReturnData.Tables.Add(dt_EditResult);
         }
         #endregion

        #region AutoCode
         private string AutoCode(string pstrType)
         {
             string strReturn = "";

             if (pstrType == "Excel")
             {
                 string strSQL = @"
                        SELECT MAX([BatchNo]) BatchNo 
                        FROM [M02_BPM].[TK4_TaskScheduleData]
                        WHERE [BatchNo] LIKE 'J%'";

                 string strMaxCode = conn.GetDataTableFirstValue(strSQL).ToString();
                 int iCodeLen = strMaxCode.Length;
                 if (iCodeLen > 0)
                 {
                     //去掉第一位
                     strMaxCode = strMaxCode.Remove(0, 1);

                     int iNum = Convert.ToInt32(strMaxCode);
                     iNum++;
                     strReturn = "J" + iNum.ToString("00000");
                 }
                 else
                 {
                     strReturn = "J00001";
                 };
             }
             else if (pstrType == "TaskCode")
             {
                 string strSQL = @"
                        SELECT MAX([Code])
                        FROM [M02_BPM].[TK1_TaskHead]";
                 string strMaxCode = conn.GetDataTableFirstValue(strSQL).ToString();
                 if (strMaxCode != "")
                 {
                     //去掉第一位
                     strMaxCode = strMaxCode.Remove(0, 1);

                     int iNum = Convert.ToInt32(strMaxCode);
                     iNum++;
                     strReturn = "T" + iNum.ToString("000000");
                 }
                 else
                 {
                     strReturn = "T000001";
                 };
             };

             return strReturn;
         }     
        #endregion

        #region CreateTable
         private DataSet CreateTable() {
             DataSet dsReturn = new DataSet(); //返回用的表

             DataTable dtTH = new DataTable(); //表头
             DataTable dtTS = new DataTable(); //队列

             DataRow drTH = dtTH.NewRow();
             DataRow drTS = dtTS.NewRow();

             dtTH.Rows.Add(drTH);
             dtTS.Rows.Add(drTS);

             System.Guid guid = System.Guid.NewGuid();               //Guid 类型
             string strGUID = System.Guid.NewGuid().ToString();      //直接返回字符串类型


             //表头
             dtTH.Columns.Add("ID");
             dtTH.Columns.Add("M01P_ID");
             dtTH.Columns.Add("M02C_ID");
             dtTH.Columns.Add("TKT_ID");
             dtTH.Columns.Add("DIST_ID");
             dtTH.Columns.Add("Code");
             dtTH.Columns.Add("Name");
             dtTH.Columns.Add("Desp");
             dtTH.Columns.Add("ValidateState");
             dtTH.Columns.Add("ValidateFrom");
             dtTH.Columns.Add("ValidateTo");
             dtTH.Columns.Add("ImportPath");
             dtTH.Columns.Add("ImportChannel");
             dtTH.Columns.Add("Batch");
             dtTH.Columns.Add("Rgdt");
             dtTH.Columns.Add("RgUser");
             dtTH.Columns.Add("LmDt");
             dtTH.Columns.Add("LmUser");

             //表头赋值
             dtTH.Rows[0]["ID"] = strGUID;
             dtTH.Rows[0]["M01P_ID"] = "ADDDFF05-08AF-4E51-89EB-3C7185DD7050";
             dtTH.Rows[0]["M02C_ID"] = "D55D3D5A-57A3-4A97-87F2-1CC3DAF98C8E";

             //队列表
             dtTS.Columns.Add("ID");
             dtTS.Columns.Add("M01P_ID");
             dtTS.Columns.Add("M02C_ID");
             dtTS.Columns.Add("TK1_ID");
             dtTS.Columns.Add("Dist_ID");
             dtTS.Columns.Add("BatchNo");
             dtTS.Columns.Add("State");
             dtTS.Columns.Add("Rgdt");
             dtTS.Columns.Add("RgUser");
             dtTS.Columns.Add("LmDt");
             dtTS.Columns.Add("LmUser");

             //队列表赋值
             string strGUIDTs = System.Guid.NewGuid().ToString();
             dtTS.Rows[0]["ID"] = strGUIDTs;
             dtTS.Rows[0]["M01P_ID"] = "ADDDFF05-08AF-4E51-89EB-3C7185DD7050";
             dtTS.Rows[0]["M02C_ID"] = "D55D3D5A-57A3-4A97-87F2-1CC3DAF98C8E";


             //表取名
             dtTH.TableName = "dtTH";
             dtTS.TableName = "dtTS";

             dsReturn.Tables.Add(dtTH);
             dsReturn.Tables.Add(dtTS);
             return dsReturn;
         }
    	#endregion

        #endregion
    }
}
 