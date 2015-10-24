﻿<%@ page language="C#" masterpagefile="carmaster.master" autoeventwireup="true" inherits="cardCash1, App_Web_cardcash1.aspx.f3086b61" title="Untitled Page" %>

<%@ Register Assembly="CrystalDecisions.Web, Version=10.5.3700.0, Culture=neutral, PublicKeyToken=692fbea5521e1304"
    Namespace="CrystalDecisions.Web" TagPrefix="CR" %>
<asp:Content ID="Content1" ContentPlaceHolderID="ctplhder" Runat="Server">
<asp:UpdatePanel id="UpdatePanel1" runat="server">
   <contenttemplate>
<BR /><TABLE style="WIDTH: 562px"><TBODY><TR><TD style="WIDTH: 220px"><asp:Label id="Label6" runat="server" Text="卡号：" __designer:wfdid="w15"></asp:Label></TD><TD><asp:TextBox id="txtcardid" runat="server" Width="130px"></asp:TextBox></TD><TD><asp:Label id="Label9" runat="server" Width="60px" Text="实充金额：" __designer:wfdid="w3"></asp:Label></TD><TD style="WIDTH: 46px"><asp:TextBox id="txtsums" runat="server" Width="51px" __designer:wfdid="w4"></asp:TextBox></TD><TD style="WIDTH: 86px; TEXT-ALIGN: left">&nbsp;&nbsp;&nbsp; <asp:Label id="Label7" runat="server" Width="42px" Text="说明：" __designer:wfdid="w7"></asp:Label></TD><TD style="WIDTH: 154px">&nbsp; <asp:TextBox id="txtcomment" runat="server" Width="71px" __designer:wfdid="w8"></asp:TextBox></TD><TD style="WIDTH: 179px; TEXT-ALIGN: left">&nbsp;&nbsp;&nbsp;&nbsp; <asp:Button id="btnnext" onclick="btnnext_Click" runat="server" Width="54px" Height="24px" Text="确定"></asp:Button> </TD></TR></TBODY></TABLE>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; <asp:CustomValidator id="CVtxtcardid" runat="server" Width="50px" ErrorMessage="卡号无效" ControlToValidate="txtcardid" OnServerValidate="CVtxtcardid_ServerValidate" SetFocusOnError="True" ValidateEmptyText="True"></asp:CustomValidator> <asp:RequiredFieldValidator id="RequiredFieldValidator1" runat="server" ErrorMessage="卡号不能为空" ControlToValidate="txtcardid"></asp:RequiredFieldValidator>&nbsp; <asp:RangeValidator id="RangeValidator1" runat="server" __designer:wfdid="w41" ErrorMessage="金额不正确" ControlToValidate="txtsums" Type="Double" MinimumValue="1" MaximumValue="10000000"></asp:RangeValidator> <asp:RequiredFieldValidator id="RequiredFieldValidator2" runat="server" __designer:wfdid="w1" ErrorMessage="请填写金额" ControlToValidate="txtsums" SetFocusOnError="True"></asp:RequiredFieldValidator>&nbsp; 
</contenttemplate>    
</asp:UpdatePanel>
    <asp:Panel ID="Panel1" runat="server" Height="50px" Width="125px">
    
<asp:UpdatePanel id="UpdatePanel2"  runat="server">
   <contenttemplate>
<TABLE style="WIDTH: 509px"><TBODY><TR><TD style="WIDTH: 179px; HEIGHT: 134px; TEXT-ALIGN: center"><TABLE style="HEIGHT: 82px" width=500><TBODY><TR><TD style="WIDTH: 20%; TEXT-ALIGN: left"><asp:Label id="Label1" runat="server" Width="50px" __designer:wfdid="w54" Text="卡编号："></asp:Label></TD><TD style="TEXT-ALIGN: left" width="100%"><asp:Label id="lbcardid" runat="server" Width="57px" __designer:wfdid="w55" ForeColor="#FF0000"></asp:Label> </TD></TR><TR><TD style="WIDTH: 20%; HEIGHT: 20px; TEXT-ALIGN: left"><asp:Label id="Label2" runat="server" Width="51px" __designer:wfdid="w56" Text="客户名："></asp:Label></TD><TD style="HEIGHT: 20px; TEXT-ALIGN: left" width="100%"><asp:Label id="lbname" runat="server" __designer:wfdid="w57" ForeColor="#FF0000"></asp:Label></TD></TR><TR><TD style="WIDTH: 20%; HEIGHT: 28px; TEXT-ALIGN: left"><asp:Label id="Label8" runat="server" __designer:wfdid="w1" Text="当前金额："></asp:Label></TD><TD style="HEIGHT: 28px; TEXT-ALIGN: left" width="100%">&nbsp;<asp:Label id="lbsumold" runat="server" __designer:wfdid="w2" ForeColor="#FF3333"></asp:Label></TD></TR><TR><TD style="WIDTH: 20%; HEIGHT: 28px; TEXT-ALIGN: left"><asp:Label id="Label3" runat="server" Width="81px" __designer:wfdid="w22" Text="实充金额(元)："></asp:Label></TD><TD style="HEIGHT: 28px; TEXT-ALIGN: left" width="100%"><asp:Label id="lbsums" runat="server" Width="58px" __designer:wfdid="w59" ForeColor="#FF0000"></asp:Label></TD></TR><TR><TD style="WIDTH: 20%; HEIGHT: 19px; TEXT-ALIGN: left"><asp:Label id="Label4" runat="server" Width="84px" __designer:wfdid="w24" Text="奖励比例(% )："></asp:Label></TD><TD style="HEIGHT: 19px; TEXT-ALIGN: left" width="100%"><asp:Label id="lbrate" runat="server" Width="44px" __designer:wfdid="w61" ForeColor="#FF0000"></asp:Label></TD></TR><TR><TD style="WIDTH: 20%; TEXT-ALIGN: left"><asp:Label id="Label5" runat="server" __designer:wfdid="w26" Text="充值合计(元)："></asp:Label></TD><TD style="TEXT-ALIGN: left" width="100%">&nbsp;<asp:Label id="lbsum" runat="server" __designer:wfdid="w63" ForeColor="#FF0000"></asp:Label></TD></TR></TBODY></TABLE></TD></TR></TBODY></TABLE><asp:Button id="btnnex2" onclick="btnnex2_Click" runat="server" Width="114px" Height="35px" __designer:wfdid="w64" Text="确定充值"></asp:Button> 
</contenttemplate>
</asp:UpdatePanel>
    </asp:Panel>
    <br />
    <br />
    &nbsp;&nbsp;<br />
        <cr:crystalreportviewer id="cryReportView" runat="server" autodatabind="true"></cr:crystalreportviewer>

</asp:Content>
