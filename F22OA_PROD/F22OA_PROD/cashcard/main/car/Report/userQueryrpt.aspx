﻿<%@ page language="C#" masterpagefile="~/cashcard/main/car/carmaster.master" autoeventwireup="true" inherits="car_Report_userQueryrpt, App_Web_userqueryrpt.aspx.1bbd70f" title="Untitled Page" %>

<%@ Register Assembly="CrystalDecisions.Web, Version=10.5.3700.0, Culture=neutral, PublicKeyToken=692fbea5521e1304"
    Namespace="CrystalDecisions.Web" TagPrefix="CR" %>
<asp:Content ID="Content1" ContentPlaceHolderID="ctplhder" Runat="Server">
    <cr:crystalreportviewer id="cryReportView" runat="server" autodatabind="true"></cr:crystalreportviewer>
</asp:Content>
