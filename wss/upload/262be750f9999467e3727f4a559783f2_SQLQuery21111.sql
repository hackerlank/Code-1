/****** Script for SelectTopNRows command from SSMS  ******/
SELECT TOP 1000 [MD1_ModuleId]
      ,[UI1_UserId]
      ,[UseSign]
      ,[NewSign]
      ,[EdtSign]
      ,[DelSign]
      ,[Rgdt]
      ,[RgUser]
      ,[LmDt]
      ,[LmUser]
  FROM [DHH_USER].[F01_CERT].[MP1_ModulePower]
  where  UI1_UserId='xiaof'
  
  SELECT * FROM [F01_CERT].[MP2_ModuleSubItemPower]
  
   SELECT * FROM [M01_CONF].[MD1_ModuleInfor]
  SELECT * FROM [M01_CONF].[MD2_ModuleSubItemInfor]

  SELECT * FROM F01_CERT.MP1_ModulePower WHERE MD1_ModuleId=3002 AND UI1_UserId='xiaof'


  SELECT   TOP (200) MD1_ModuleId, UI1_UserId, UseSign, NewSign, EdtSign, DelSign, Rgdt, RgUser, LmDt, LmUser
FROM      F01_CERT.MP1_ModulePower
WHERE   (MD1_ModuleId  in ( '1001','1002')) AND (UI1_UserId in ( 'zhoulg','xiaof'))

INSERT INTO  F01_CERT.MP1_ModulePower
SELECT    MD1_ModuleId, 'xiaof', UseSign, NewSign, EdtSign, DelSign, Rgdt, RgUser, LmDt, LmUser
FROM      F01_CERT.MP1_ModulePower
WHERE   (MD1_ModuleId  in ( '1001','1002')) AND (UI1_UserId in ( 'zhoulg'))

SELECT * FROM B02_BILL.SJ1_SKCDelimitForJoin 
SELECT * FROM B02_BILL.SJ2_SKCDelimitForJoinSearch


SELECT  DHHAccountId,DHHAccountName FROM M01_CONF.DA1_DHHAccountInfor

SELECT * FROM  [B02_BILL].[IJ2_ImportantSeriesForJoinSearch] 

SELECT * FROM  B02_BILL.IJ1_ImportantSeriesForJoinNum


 SELECT  UI1_UserId, DA1_DHHAccountId, BRANDID, Series, 
 Shipmentdate, CASE WHEN ImportantSgin=1 THEN '重点' ELSE '' END ImportantSgin, XH 
 FROM  [B02_BILL].[IJ2_ImportantSeriesForJoinSearch] 
 WHERE UI1_UserId='xiaof' AND DA1_DHHAccountId='2' 

  SELECT ErpDbName,ErpLink FROM [M01_CONF].[CP1_CompanyInfor] 

  SELECT  fpp,FSeries,FShangDate ,count(*)   
  FROM ERP.elegant_prod.DBO.W_Cloth_DHH 
  WHERE ISNULL(FSeries,'')<>'取消' and ISNULL(FSeries,'')<>'' 
  and Facc IN(SELECT  CAST(DHHAcc AS VARCHAR(10)) FROM DHH_System.DBO.DHH_Brand WHERE DHHNewOld=1 and DHHTYPE=1)
  GROUP BY fpp,FSeries,FShangDate 


  SELECT *  FROM ERP.elegant_prod.DBO.W_Cloth_DHH 
  WHERE ISNULL(FSeries,'')<>'取消' and ISNULL(FSeries,'')<>'' 
  and Facc IN(SELECT  CAST(DHHAcc AS VARCHAR(10)) FROM DHH_System.DBO.DHH_Brand WHERE DHHNewOld=1 and DHHTYPE=1)

  SELECT  fpp,FSeries,FShangDate ,fbigstyleid2  
  FROM ERP.elegant_prod.DBO.W_Cloth_DHH 
  WHERE ISNULL(FSeries,'')<>'取消' and ISNULL(FSeries,'')<>''  and fseries='K2'
  and Facc IN(SELECT  CAST(DHHAcc AS VARCHAR(10)) FROM DHH_System.DBO.DHH_Brand WHERE DHHNewOld=1 and DHHTYPE=1)

  select * from  ERP.elegant_prod.DBO.W_Cloth_DHH 

   UPDATE A SET A.[SureNum]=B.SureNum
 FROM [B02_BILL].[IJ2_ImportantSeriesForJoinSearch] A,B02_BILL.[IJ1_ImportantSeriesForJoinNum] B 
 WHERE A.DA1_DHHAccountId=B.DA1_DHHAccountId AND A.BRANDID=B.BRANDID 
 AND A.Series=B.Series AND A.Shipmentdate=B.Shipmentdate  AND A.UI1_UserId='''+UserId+''' 


 SELECT * FROM  [B02_BILL].[IJ3_ImportantSeriesForJoinHistory]


 SELECT * FROM [B02_BILL].[IS2_ImportantSkcForSelfSearch]
 SELECT * FROM B02_BILL.CC1_CategoryContrastInfor
 SELECT * FROM [B02_BILL].[IS1_ImportantSkcForSelf]
 SELECT * FROM [B02_BILL].[IJ2_ImportantSkcForSelfSearch]
 SELECT * FROM [B02_BILL].[IS1_ImportantSkcForSelf]

 SELECT * FROM [B02_BILL].[IJ2_ImportantSkcForSelfSearch]
 SELECT * FROM [B02_BILL].[IJ1_ImportantSeriesForJoin]
 SELECT * FROM [B02_BILL].[IJ1_ImportantSeriesForJoin]


  SELECT * FROM  [B02_BILL].[IJ2_ImportantSkcForSelfSearch] where skc='E15PH6616aB' and DA1_DHHAccountId =2 and FID

  select * from  ERP.elegant_prod.DBO.W_Cloth_DHH  where fstyleAddColor='E15PH6616aB'
SELECT * FROM [B02_BILL].[IJ1_ImportantSeriesForJoinNum]

   SELECT * FROM [B02_BILL].[IJ1_ImportantSkcForSelf]
   SELECT * FROM M01_CONF.DA1_DHHAccountInfor  where  statesign=1

  SELECT  fstyleAddColor
  FROM ERP.elegant_prod.DBO.W_Cloth_DHH 
  WHERE ISNULL(FSeries,'')<>'取消' and ISNULL(FSeries,'')<>''  and fseries='K2'
  and Facc IN(SELECT  CAST(DHHAcc AS VARCHAR(10)) FROM DHH_System.DBO.DHH_Brand WHERE DHHNewOld=1 and DHHTYPE=1)
