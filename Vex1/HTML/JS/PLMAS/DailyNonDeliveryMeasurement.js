﻿/// JS名：DailyNonDeliveryMeasurement.js
/// 说明：版师每日制版明细报表
/// 创建人：郭琦琦 
/// 创建日期：2014-07-09

var m_DDHComboxData = null;//订货会季节
var m_columns = null;//动态列
var m_data1;//订货会重加载数据
var columns;//easyui 框架自己的动态列属性
var m_cmbdhhjj = "";//订货会季节
var m_epjbs;//EP交版数
var m_epjjbs;//EPJ交版数
var m_eptbs;//ep调版数
var m_epjtbs;//epj调版数
var m_epwjbs;//ep未交版数
var m_epjwjbs;//epj未交版数
var m_eprosperbjbs; //eprosperb交版数;
var m_eprospercjbs;//eprosperc交版数;
var m_eprosperfjbs;//eprosperf交版数;
var m_eprosperbtbs; //eprosperb调版数;
var m_eprosperctbs;//eprosperc调版数;
var m_eprosperftbs; //eprosperf调版数;
var m_eprosperbwjbs; //eprosperb未交版数;
var m_eprospercwjbs; //eprosperc未交版数;
var m_eprosperfwjbs; //eprosperf未交版数;
var m_zt;
var m_DLjbs;//DL交版数;
var m_DLtbs;//DL调版数;
var m_DLwjbs;//DL未交版数;


$(function () {
    //默认附上时间今天往前面推3个月，开始时间和结束时间
    m_Username = window.m_UserID;//取登入姓名
    m_zt = $.cookie('m_zt')
    m_Nowdate = (new Date()).DateAdd('d', -0).format("yyyy-MM-dd");//今天时间
    //$("#txtBeginDate").datebox("setValue", (new Date()).DateAdd('m', -1).format("yyyy-MM-dd"));//今天往前面退一个月
    $("#txtEndDate").datebox("setValue", (new Date()).DateAdd('d', 0).format("yyyy-MM-dd"));///今天时间

    //取该人的品牌USERINFO表OwnedBrand字段判断品牌
    var xmlData = GetFormJson([{ "name": "txtzt", "value": m_zt }], 'GetOwnedBrand');
    htmlobj = $.ajax({
        url: GetWSRRURL('d763e76a-f7e0-4fbc-a2f2-9a9956ecccb9'),
        data: { "XML": xmlData },
        type: 'post',
        async: false
    });
    var result = $.parseJSON(htmlobj.responseText);


    
    //初始化品类下拉数据
    $('#txtbrand').combobox({
    url: GetComboxWSRRURL('d763e76a-f7e0-4fbc-a2f2-9a9956ecccb9', "", "cbstky", "cbstky") + "&XML=" + GetFormJson([{ "name": "txtzt", "value": m_zt }], 'GetBrand'),
    valueField: 'id',
    textField: 'text',
    width: '100',
    panelHeight: 'auto',
    editable: false,
    required: true,
    async: false,//同步
    onSelect: function (record) {
        ChangeDHHJJ();
    }
    });
    $("#txtbrand").combobox('setValue',result.rows[0].message)//把品牌赋值给HTML品牌

    //初始化订货会下拉数据
    $('#txtcmbdhhjj').combobox({
        url: GetComboxWSRRURL('bd4c0ca6-42c7-4e5c-a432-515b63f5cc16', "", "orderseason", "orderseason") + "&DIVI=" + m_zt,
        valueField: 'id',
        textField: 'text',
        panelHeight: '200',
        editable: false,
        required: true,
        async: true, //异步
        onLoadSuccess: function (data) {
            if (m_DDHComboxData == null) {
                m_DDHComboxData = data;
                changeDHHJJ();//按照品牌控制季节下拉
            }
            m_data1 = $('#txtcmbdhhjj').combobox('getData');
            $('#txtcmbdhhjj').combobox('setValue', m_data1[m_data1.length - 1].text);
        }
    });
});

//点击查询
function SearchClick() {
    initGird();//加载数据
}

//加载数据
function initGird() {
    ClearGrid("#tabList");//清除表单数据
    m_cmbdhhjj = $('#txtcmbdhhjj').combobox('getValue');//获取订货会季节
    //var beginDate = $('#txtBeginDate').combobox('getValue');//获取开始时间
    var endDate = $('#txtEndDate').combobox('getValue');//获取结束时间
    var dateNow = endDate.substr(0, 4) + endDate.substr(5, 2) + endDate.substr(8, 2)//截取时间yyyymmdd
    var brandCON = $('#txtbrand').combobox("getValue")//取品牌数据

    var data = [];
    data[data.length] = { "name": "txt操作类型", "value": "GET" };
    data[data.length] = { "name": "txt实体", "value": "DailyPatternMakingDetail" };
    data[data.length] = { "name": "txt返回内容", "value": "成功" };
    data[data.length] = { "name": "txtCONO", "value": "HFYG" };
    data[data.length] = { "name": "txtDIVI", "value": m_zt };
    data[data.length] = { "name": "txt订货会季节", "value": m_cmbdhhjj };
    data[data.length] = { "name": "txt日期", "value": dateNow };
    data[data.length] = { "name": "txt标识", "value": "1" };
    data[data.length] = { "name": "txt数据标识", "value": "1" };
    data[data.length] = { "name": "txt开始日期", "value": "" };
    data[data.length] = { "name": "txt结束日期", "value": "" };
    data[data.length] = { "name": "txt查询类型", "value": "" };
    data[data.length] = { "name": "txt品牌", "value": brandCON };
    //data[data.length] = { "name": "txt实体", "value": "" };
    //data[data.length] = { "name": "txt返回内容", "value": "成功" };
    XMLData = GetDBFrameAML(data);
    var urlCol = GetGridColumnsWSRRURL('06d54b26-796a-4fa6-bbba-1ddcb4e671fc', "60", "false", "false") + XMLData
    //ajax取动态列
    var htmlobj = $.ajax({
        url: urlCol,
        async: false
    });
    var Text = $.parseJSON(htmlobj.responseText);
    m_columns = Text.Col;

    var data1 = [];
    data1[data1.length] = { "name": "txt操作类型", "value": "GET" };
    data1[data1.length] = { "name": "txt实体", "value": "DailyPatternMakingDetail" };
    data1[data1.length] = { "name": "txt返回内容", "value": "成功" };
    data1[data1.length] = { "name": "txtCONO", "value": "HFYG" };
    data1[data1.length] = { "name": "txtDIVI", "value": m_zt };
    data1[data1.length] = { "name": "txt订货会季节", "value": m_cmbdhhjj };
    data1[data1.length] = { "name": "txt日期", "value": dateNow };
    data1[data1.length] = { "name": "txt标识", "value": "2" };
    data1[data1.length] = { "name": "txt数据标识", "value": "1" };
    data1[data1.length] = { "name": "txt开始日期", "value": "" };
    data1[data1.length] = { "name": "txt结束日期", "value": "" };
    data1[data1.length] = { "name": "txt查询类型", "value": "" };
    data1[data1.length] = { "name": "txt品牌", "value": brandCON };


    XMLdata1 = GetDBFrameAML(data1);
    var url = GetWSRRURL('06d54b26-796a-4fa6-bbba-1ddcb4e671fc') + XMLdata1
    $('#tabList').datagrid(
         {
             url: url,
             nowrap: true, //是否换行，True 就会把数据显示在一行里
             striped: true, //True 奇偶行使用不同背景色
             collapsible: false, //可折叠
             fit: true,
             columns: eval(m_columns),
             rownumbers: true,//行号
             singleSelect: true,//单行选择
             toolbar: "#tab_toolbar",
             //showFooter: true,
             toolbar: [
             {
                 id: 'btn_print',
                 text: '打印',
                 iconCls: 'icon-print',
                 handler: function () {
                     pring();//HTML打印
                 }
             }]
         });
    //取动态列,格式化列属性
    var columns = eval(m_columns);
    if (columns.length != "0") {
        var col = $('#tabList').datagrid('getColumnOption', columns[0][0].field);
        col.width = 50;
        col.align = "center";
        for (var i = 1; i < columns[0].length; i++) {
            var col = $('#tabList').datagrid('getColumnOption', columns[0][i].field);
            col.formater = Formater.Nums;
            col.align = "center";
            col.title = col.title.toUpperCase();
        }
    }
    $('#tabList').datagrid();//reload

    //最后一行统计行
    var data2 = [];
    data2[data2.length] = { "name": "txt操作类型", "value": "GET" };
    data2[data2.length] = { "name": "txt实体", "value": "DailyPatternMakingDetail" };
    data2[data2.length] = { "name": "txt返回内容", "value": "成功" };
    data2[data2.length] = { "name": "txtCONO", "value": "HFYG" };
    data2[data2.length] = { "name": "txtDIVI", "value": m_zt };
    data2[data2.length] = { "name": "txt订货会季节", "value": m_cmbdhhjj };
    data2[data2.length] = { "name": "txt日期", "value": dateNow };
    data2[data2.length] = { "name": "txt标识", "value": "2" };
    data2[data2.length] = { "name": "txt数据标识", "value": "2" };
    data2[data2.length] = { "name": "txt开始日期", "value": "" };
    data2[data2.length] = { "name": "txt结束日期", "value": "" };
    data2[data2.length] = { "name": "txt查询类型", "value": "" };
    data2[data2.length] = { "name": "txt品牌", "value": brandCON };


    XMLdata2 = GetDBFrameAML(data2);
    var urlData = GetWSRRURL('06d54b26-796a-4fa6-bbba-1ddcb4e671fc') + XMLdata2

    var htmlobj = $.ajax({
        url: urlData,
        async: false
    });
    var textData = $.parseJSON(htmlobj.responseText).rows[0];
    //EP统计
    m_epjbs = textData.ep交版数;//EP交版数
    m_epjjbs = textData.epj交版数;//EPJ交版数
    m_eptbs = textData.ep调版数;//ep调版数
    m_epjtbs = textData.epj调版数;//epj调版数
    m_epwjbs = textData.ep未交版数;//ep未交版数
    m_epjwjbs = textData.epj未交版数;//epj未交版数
    //EPR统计
    m_eprosperbjbs = textData.eprosperb交版数;
    m_eprospercjbs = textData.eprosperc交版数;
    m_eprosperfjbs = textData.eprosperf交版数;

    m_eprosperbtbs = textData.eprosperb调版数;
    m_eprosperctbs = textData.eprosperc调版数;
    m_eprosperftbs = textData.eprosperf调版数;

    m_eprosperbwjbs = textData.eprosperb未交版数;
    m_eprospercwjbs = textData.eprosperc未交版数;
    m_eprosperfwjbs = textData.eprosperf未交版数;
    m_DLjbs = textData.交版数
    m_DLtbs = textData.调版数
    m_DLwjbs = textData.未交版数
}

//按照品牌控制季节下拉数据
function changeDHHJJ() {
    var brandType = $('#txtbrand').combobox("getValue");
    if (brandType.substr(0, 2) == "EP") {
        brandType = "EP"
    }
    else if (brandType.substr(0, 2) == "E.P") {
        brandType = "E.Prosper"
    }
    else if (brandType.substr(0, 2) == "Do") {
        brandType = "Do"
    }
    else if (brandType.substr(0, 2) == "Ki") {
        brandType = "Kids"
    }

    if (m_DDHComboxData == null) {
        return;
    }
    var data = m_DDHComboxData;
    var data1 = [];
    for (var i = 0; i < data.length; i++) {
        if (data[i].id.toString().indexOf(brandType) > 0) {
            data1.push(data[i]);
        }
    }
    $('#txtcmbdhhjj').combobox({ url: "" });
    $('#txtcmbdhhjj').combobox("loadData", data1);//重加载季节下拉数据
}

//打印
function pring() {
    var endDate = $('#txtEndDate').combobox('getValue');//获取结束时间
    //var tableString =
    CreateFormPage("datagrid", $("#tabList"), m_cmbdhhjj, endDate, m_epjbs, m_epjjbs, m_eptbs, m_epjtbs, m_epwjbs, m_epjwjbs, m_eprosperbjbs, m_eprospercjbs, m_eprosperfjbs, m_eprosperbtbs, m_eprosperctbs, m_eprosperftbs, m_eprosperbwjbs, m_eprospercwjbs, m_eprosperfwjbs, m_DLjbs, m_DLtbs, m_DLwjbs);
    ////document.write(tableString);
    //$("#divPrint").html(tableString);
    //$('#divPrint').window({
    //    title: "111",
    //    top: 20,
    //    maximized: true,
    //    modal: true
    //});
    //$("#divPrint").printArea();
}