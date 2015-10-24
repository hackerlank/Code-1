﻿<%@ Page Language="C#" AutoEventWireup="true" CodeBehind="LabelDialog.aspx.cs" Inherits="Talent.Web.TalentInfo.LabelDialog" %>

<div class="pageContent">
	<form method="post" action="ajaxWebServices.ashx" class="pageForm" onsubmit="return validateCallback(this,map.replaceLabel);">
        <input type="hidden" name="webmethod" value='addLabelCompanyDialog'>
		<div class="pageFormContent" layoutH="58">
			<div class="unit">
				<label>公司坐标(X,Y)：</label>
				<label><%=Request["CB_X"] %>,<%=Request["CB_Y"] %></label>
                <input type="hidden" class="required" value='<%=Request["CB_X"] %>'  name="CB_X" />
                <input type="hidden" class="required" value='<%=Request["CB_Y"] %>'  name="CB_Y" />
			</div>
            <div class="divider">divider</div>
            <div class="unit">
				<label>公司名称：</label>
				<input type="text" class="required textInput" value=""  size=50  name="CB_Name" />
			</div>
            <div class="unit">
                <label>公司人数：</label>
				<input type="text" class="required digits textInput" value="" size=50 name="CB_Num" />
            </div>
            <div class="unit" > 
				<label>公司所在地：</label>
                <input type="text" class="required textInput" value=""  size=50  name="CB_Position" />
            </div>
            <div class="unit" > 
				<label>华之毅品牌：</label>
                <select name="CB_Province" class="required">
                    <option></option>
                    <%=Talent.Common.Constants.getArrDialog(per.PM_Province)%>
                </select>
            </div>
            <div class="unit" > 
                <label>成立时间：</label>
				<input type="text" class="required date textInput" value="" name="CB_SetUp" />
                <a class="inputDateButton" href="javascript:;">选择</a>
            </div>	
			<div class="divider">divider</div>
            <div class="unit">
                <label>竞品信息描述：</label>
			    <textarea  name="CB_Des" class="required" rows="10" cols="45" ></textarea>
		    </div>
		</div>
		<div class="formBar">
			<ul>
				<li><div class="buttonActive"><div class="buttonContent"><button type="submit">保存</button></div></div></li>
				<li><div class="button"><div class="buttonContent"><button type="reset">清空</button></div></div></li>
			</ul>
		</div>
	</form>
</div>