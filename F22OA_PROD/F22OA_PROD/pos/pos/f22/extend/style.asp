<!--#include file="inc/function.asp"-->
<html>
<head>
<meta http-equiv="Content-Type" content="text/html; charset=gb2312">
<title>�鿴��ʽ</title>
<link href="css/f22.css" rel="stylesheet" type="text/css">
<style type="text/css">
body {overflow:hidden;}
.bk {
	border: 1px solid;
}
#intra {
	line-height:20px;
}
</style>
</head>

<body>
<table width="100%" border="0">
  <tr valign="top">
    <td width="68%" height="278">  <%dim ds,id,sql,i
	id=trim(request.QueryString("id"))
	if id="" then
	  sql="select top 1 styleid,s_name,st_cloth,st_by1,isnull(dh_3,'') as dh_3,st_year,st_month,st_dl,st_xz,st_xb,x_price,comment from j_style"
	else
	  sql="select styleid,s_name,st_cloth,st_by1,isnull(dh_3,'') as dh_3,st_year,st_month,st_dl,st_xz,st_xb,x_price,comment from j_style where styleid = "&qts(id)
	end if
	set ds=server.CreateObject("ADODB.Recordset")
	ds.Activeconnection=cn
	ds.source = sql
    ds.open%>
  <table width="100%" border="1" cellpadding="0" bordercolor="#FFEFEF" class="f12">
    <tr>
      <td colspan="6"><table width="100%"  border="0" cellpadding="0" cellspacing="0" class="f12">
          <tr>
            <td width="14%">��ʽ����: </td>
            <td width="33%" class="ts"><%=ds("s_name")%></td>
            <td width="14%">��ʽ����:</td>
            <td width="39%" class="notice"><%=ds("styleid")%></td>
          </tr>
        </table></td>
      </tr>
    <tr>
      <td width="15%">��ʽ���:</td>
      <td width="21%"><%=ds("st_year")%></td>
      <td width="17%">��ʽ����:</td>
      <td width="14%"><%=ds("st_month")%></td>
      <td width="15%">ԭ��:</td>
      <td width="18%"><%=ds("st_cloth")%></td>
    </tr>
    <tr>
      <td>��ʽ����:</td>
      <td><%=ds("st_dl")%></td>
      <td>��ʽС��:</td>
      <td><%=ds("st_xz")%></td>
      <td>��ʽ�Ա�:</td>
      <td><%=ds("st_xb")%></td>
    </tr>
    <tr>
      <td>���ۼ�:</td>
      <td class="notice"><%=ds("x_price")%></td>
      <td>Ŀǰ���:</td>
      <td>&nbsp;</td>
      <td>������λ:</td>
      <td><%=ds("st_by1")%></td>
    </tr>
  </table>
  <table width="100%" border="1" bordercolor="#ECE9D8" class="f14">
    <tr>
      <td>����˵��</td>
    </tr>
  </table><textarea name="intra" cols="55" rows="11" id="intra"><%=ds("dh_3")%></textarea>
</td>
    <td width="32%" align="center"><img src="dc_showphoto.asp?id=<%=ds("styleid")%>&action=style" alt="<%=ds("s_name")%>" width="160" height="200"></td>
  </tr>
</table><%ds.close
set ds=nothing%>

<table width="100%" border="0" bordercolor="#C6AEA5" bgcolor="#FFF7F7" class="bk">
  <tr>
    <td align="center"><input type="button" name="Submit" value="ȷ��(S)" onClick="window.close();" accesskey="s">
      <input type="button" name="Submit" value="ȡ��(X)" onClick="window.close();" accesskey="x"></td>
  </tr>
</table>
</body>
</html>