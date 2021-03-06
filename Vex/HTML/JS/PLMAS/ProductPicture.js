﻿/// JS名：ProductPicture.js
/// 说明：产品图册
/// 创建人：郭琦琦 
/// 创建日期：2014-11-13
var m_columns = null;//动态列
var m_QueryObject = [{ "id": "自主研发", "text": '自主研发' }, { "id": "成衣采购", "text": "成衣采购" }, { "id": "所有款式", "text": "所有款式", "selected": true }]//对象3种

var m_CountType = [{ "id": "按品类", "text": '按品类', "selected": true }, { "id": "按系列", "text": '按系列' }, { "id": "按设计师", "text": '按设计师' }]//方式4种

var m_Username;//取登入姓名
var m_DDHComboxData = null;//定义订货会季节下拉
var m_data1;//订货会季节
var m_season;//订货会季节
var m_zt;
var m_data = undefined;//主页
var m_datapat = undefined;//打印页
var m_SortingGroupData = null;//排序组
var m_FSortingGroupData;//按照品牌排序之后得到的排序组
var m_HtmlMain;
var m_HtmlPat;//打印页全局变

$(function () {
    //m_Username = "xuling"
    m_Username = window.m_UserID;//取登入姓名
    m_zt = $.cookie('m_zt');
    //m_zt = "EP";
    //分类方式

    

    $('#txtClassificationType').combobox({
        data: m_CountType,
        valueField: 'id',
        textField: 'text',
        panelHeight: 'auto',
        editable: false,
        onSelect: function (data) {
            changeSortingGroup();
        }
        //,
        //onLoadSuccess: function (data) {
        //    var data = $('#txtClassificationType').combobox('getData');
        //    $('#txtClassificationType').combobox('setValue', data[0].id);
        //}
    });

    //查询对象
    $('#txtQueryObject').combobox({
        data: m_QueryObject,
        panelHeight: 'auto',
        editable: false,
        valueField: 'id',
        textField: 'text',
        required: true
        //,
        //onLoadSuccess: function (data) {
        //    var data = $('#txtQueryObject').combobox('getData');
        //    $('#txtQueryObject').combobox('setValue', data[0].id);
        //}
    });

    initBrand();

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
                ChangeDHHJJ();//按照品牌控制季节下拉
            }
            m_data1 = $('#txtcmbdhhjj').combobox('getData');
            $('#txtcmbdhhjj').combobox('setValue', m_data1[m_data1.length - 1].text);
        }
    });



    ////品牌combobox
    //$('#txtbrand').combobox({
    //    panelHeight: 'auto',
    //    editable: false,
    //    valueField: 'id',
    //    textField: 'text',
    //    required: true,
    //    //onLoadSuccess: function (data) {
    //    //    changeSortingGroup();//按照品牌控制季节下拉
    //    //}
    //    onSelect: function (data) {
    //        changeSortingGroup();
    //    }
    //});


    //取排序放入全局变量之后共后面排序产品用
    var xmlDataSortingGroup = GetFormJson([{ "name": "txtzt", "value": m_zt }], 'GetSortingGroup');
    var htmlobjSortingGroup = $.ajax({
        url: GetWSRRURL('d763e76a-f7e0-4fbc-a2f2-9a9956ecccb9'),
        data: { "XML": xmlDataSortingGroup },
        type: 'post',
        async: false
    });
    m_SortingGroupData = $.parseJSON(htmlobjSortingGroup.responseText);


    //判断PLM 权限
    var xmlData = GetFormJson([{ "name": "txtzt", "value": m_zt }], 'UserPost');
    htmlobj = $.ajax({
        url: GetWSRRURL('d763e76a-f7e0-4fbc-a2f2-9a9956ecccb9'),
        data: { "XML": xmlData },
        type: 'post',
        async: false
    });
    var result = $.parseJSON(htmlobj.responseText);

    if (result.rows[0]['userpost'] == "管理员" || m_Username == "zhanglihua" || m_Username == "tianling") {
        //如果是管理员或者张利华或者田玲默认给上所有品牌
        if (m_zt == "EP") {
            ComboboxAddRow({ "id": "EP", "text": "EP" }, 0, '#txtbrand');
            ComboboxAddRow({ "id": "E.Prosper", "text": "E.Prosper" }, 1, '#txtbrand');
            ComboboxAddRow({ "id": "Kids", "text": "Kids" }, 2, '#txtbrand');
        }
        else if (m_zt == "DL") {
            ComboboxAddRow({ "id": "DoubleLove", "text": "DoubleLove" }, 2, '#txtbrand');
        }
        //获取下拉数据，默认选中第一个
        var data = $('#txtbrand').combobox('getData');
        $('#txtbrand').combobox('setValue', data[0].text);
        changeSortingGroup();

    } else {
        ////取该人的品牌USERINFO表OwnedBrand字段判断品牌
        //var xmlData = GetFormJson([{ "name": "txtzt", "value": m_zt }], 'GetOwnedBrand');
        //htmlobj = $.ajax({
        //    url: GetWSRRURL('d763e76a-f7e0-4fbc-a2f2-9a9956ecccb9'),
        //    data: { "XML": xmlData },
        //    type: 'post',
        //    async: false
        //});
        //var result = $.parseJSON(htmlobj.responseText);
        //$("#txtbrand").combobox('setValue', result.rows[0]['ownedbrand'])//把品牌赋值给HTML品牌
        changeSortingGroup();
    }

    //$("#A1").hide();

});



function initBrand() {
    //品牌
    $("#txtbrand").combobox({
        url: GetComboxWSRRURL('d763e76a-f7e0-4fbc-a2f2-9a9956ecccb9', "", "cbstky", "cbstky") + "&XML=" + GetFormJson([{ "name": "txtzt", "value": m_zt }], 'GetBrand'),
        valueField: 'id',
        textField: 'text',
        width: '100',
        panelHeight: 'auto',
        editable: false,
        required: true,
        async: false,//同步
        onSelect: function (record) {
            changeSortingGroup();
            //getSampleWorker(record.text);
            ChangeDHHJJ();
        }
    });

    //取该人的品牌USERINFO表OwnedBrand字段判断品牌
    var xmlData = GetFormJson([{ "name": "txtzt", "value": m_zt }], 'GetOwnedBrand');
    htmlobj = $.ajax({
        url: GetWSRRURL('d763e76a-f7e0-4fbc-a2f2-9a9956ecccb9'),
        data: { "XML": xmlData },
        type: 'post',
        async: false
    });
    var result = $.parseJSON(htmlobj.responseText),
        ownedBrand = result.rows[0].message;

    $("#txtbrand").combobox('setValue', ownedBrand);//把品牌赋值给HTML品牌
}

//点击查询加载取第一页款图
function searchClick(type) {

    if (type == "main") {
        var page = "10";
        var picWidth = "100px";
    } else {
        var page = "5";
        var picWidth = "200px";
    }
    var data = [];
    data[data.length] = { "name": "Brand", "value": $('#txtbrand').combobox('getValue') };
    data[data.length] = { "name": "OrderSeason", "value": $('#txtcmbdhhjj').combobox('getValue') };
    data[data.length] = { "name": "UserPost", "value": $('#txtQueryObject').combobox('getValue') };
    data[data.length] = { "name": "UserName", "value": m_Username };
    data[data.length] = { "name": "CONO", "value": "" };
    data[data.length] = { "name": "DIVI", "value": m_zt };

    htmlobj = $.ajax({
        url: GetWSRRURL('6dcb64be-2dfb-40df-9ec3-e5f4523bf356'),
        data: data,
        type: 'post',
        async: false
    });
    m_data = $.parseJSON(htmlobj.responseText);

    //把后台返回的图片进行批量处理
    for (var i = 0; i < m_data.rows.length; i++) {
        if (m_data.rows[i].designimagesmall == "" && m_data.rows[i].measurementsid == "") {
            m_data.rows[i].designimagesmall = "<img  src='http://192.168.0.35:85/image/nopic.jpg' style='height:" + picWidth + ";width:" + picWidth + "' border='0'/><br/>";
        } else if (m_data.rows[i].designimagesmall == "") {
            m_data.rows[i].designimagesmall = "<img  src='http://192.168.0.35:85/image/nopic.jpg' style='height:" + picWidth + ";width:" + picWidth + "' border='0'/>";
        }
        else if (m_data.rows[i].designimagesmall != "" && m_data.rows[i].measurementsid == "") {
            m_data.rows[i].designimagesmall = "<img  src='http://192.168.0.72/FlexPLMAPI/GetFlexImage.aspx?IMG=" + m_data.rows[i].designimagesmall + "' style='height:" + picWidth + ";width:" + picWidth + "' border='0'/><br/>";
        }
        else {
            m_data.rows[i].designimagesmall = "<img  src='http://192.168.0.72/FlexPLMAPI/GetFlexImage.aspx?IMG=" + m_data.rows[i].designimagesmall + "' style='height:" + picWidth + ";width:" + picWidth + "' border='0'/>";
        }
    }

    initGird(type, page);//加载数据

}

//加载HTML
function initGird(type, page) {
    //获取类型
    var queryObject = $('#txtClassificationType').combobox('getText')

    var m_HtmlMain = "";//加载数据的时候HTM空
    if (type == 'main') {
        $('#mainPanle').html("");
    }
    //按照类型进行分类
    if (queryObject == "按设计师") {

        //m_FSortingGroupData

        m_HtmlMain = '<div>';

        var arrDesigner1 = [];
        var arrDesigner = [];

        for (var o = 0; o < m_FSortingGroupData.length; o++) {
            var s = m_FSortingGroupData[o];
            for (var j = 0; j < m_data.rows.length; j++) {
                var b = m_data.rows[j].designer;
                if (b == s) {
                    arrDesigner1.push(b)
                }
            }
        }

        for (var l = 0; l < arrDesigner1.length; l++) {
            var k = arrDesigner1[l];
            $.each(arrDesigner1, function () {
                if ($.inArray(k, arrDesigner) == -1) {
                    arrDesigner.push(k)
                }
            })
        }

        for (var i = 0; i < arrDesigner.length; i++) {
            var arrURL = [];

            var designer = arrDesigner[i];

            arrURL.designer = designer;

            for (var g = 0; g < m_data.rows.length; g++) {
                var e = m_data.rows[g].designer;
                if (e == designer) {
                    var ob = new Object();
                    ob.designimagesmall = m_data.rows[g].designimagesmall;
                    ob.measurementsid = m_data.rows[g].measurementsid;
                    arrURL.push(ob)
                }
            }

            m_HtmlMain += '<span style="cursor:pointer;text-align: left; font-size: 20px;" colspan="2" onclick="clickExpansion(' + "'" + designer.replace(".", "_") + "'" + ')"  >' + designer + '   共' + arrURL.length + '</span><br /><table id = "' + designer.replace(".", "_") + '"><tr>';

            for (var q = 0; q < arrURL.length; q++) {

                if (q % page != 0) {
                    m_HtmlMain += '<td  onclick="clickSearch(' + "'" + arrURL[q].measurementsid + "'" + ')"  >' + '<center>' + arrURL[q].designimagesmall + '<br/>' + arrURL[q].measurementsid + '</center></td>'
                } else {
                    m_HtmlMain += '</tr><tr>'
                    m_HtmlMain += '<td onclick="clickSearch(' + "'" + arrURL[q].measurementsid + "'" + ')"  >' + arrURL[q].designimagesmall + '<br/>' + '<center>' + arrURL[q].measurementsid + '</center></td>'
                }
            }
            m_HtmlMain += '</tr></table><br/>';
        }
        m_HtmlMain += '</div>';
    }
    else if (queryObject == "按系列") {
        m_HtmlMain = '<div>';

        //var arrseries = [];
        //for (var i = 0; i < m_data.rows.length; i++) {
        //    var j = m_data.rows[i].series;
        //    if (arrseries.length == 0 || arrseries.length == undefined) {
        //        arrseries.push(j)
        //    }
        //    $.each(arrseries, function () {
        //        if ($.inArray(j, arrseries) == -1) {
        //            arrseries.push(j)
        //        }
        //    })
        //}

        //arrseries = arrseries.sort(function (a, b) { return a > b ? 1 : -1 });

        var arrseries1 = [];
        var arrseries = [];

        for (var o = 0; o < m_FSortingGroupData.length; o++) {
            var s = m_FSortingGroupData[o];
            for (var j = 0; j < m_data.rows.length; j++) {
                var b = m_data.rows[j].series;
                if (b == s) {
                    arrseries1.push(b)
                }
            }
        }

        for (var l = 0; l < arrseries1.length; l++) {
            var k = arrseries1[l];
            $.each(arrseries1, function () {
                if ($.inArray(k, arrseries) == -1) {
                    arrseries.push(k)
                }
            })
        }

        for (var i = 0; i < arrseries.length; i++) {
            var arrURL = [];

            var series = arrseries[i];

            arrURL.series = series;

            for (var g = 0; g < m_data.rows.length; g++) {
                var e = m_data.rows[g].series;
                if (e == series) {
                    var ob = new Object();
                    ob.designimagesmall = m_data.rows[g].designimagesmall;
                    ob.measurementsid = m_data.rows[g].measurementsid;
                    arrURL.push(ob)
                }
            }

            m_HtmlMain += '<span style="cursor:pointer;text-align: left; font-size: 20px;" colspan="2"  onclick="clickExpansion(' + "'" + series.replace(".", "_") + "'" + ')"  >' + series + '   共' + arrURL.length + '</span><br /><table id = "' + series.replace(".", "_") + '"><tr>';

            for (var q = 0; q < arrURL.length; q++) {

                if (q % page != 0) {
                    m_HtmlMain += '<td  onclick="clickSearch(' + "'" + arrURL[q].measurementsid + "'" + ')"  >' + '<center>' + arrURL[q].designimagesmall + '<br/>' + arrURL[q].measurementsid + '</center></td>'
                } else {
                    m_HtmlMain += '</tr><tr>'
                    m_HtmlMain += '<td onclick="clickSearch(' + "'" + arrURL[q].measurementsid + "'" + ')"  >' + arrURL[q].designimagesmall + '<br/>' + '<center>' + arrURL[q].measurementsid + '</center></td>'
                }
            }
            m_HtmlMain += '</tr></table><br/>';
        }
        m_HtmlMain += '</div>';
    }
    else if (queryObject == "按品类") {
        m_HtmlMain = '<div style="border:1px">';

        var arrcategory = [];
        for (var i = 0; i < m_data.rows.length; i++) {
            var j = m_data.rows[i].category;
            if (arrcategory.length == 0 || arrcategory.length == undefined) {
                arrcategory.push(j)
            }
            $.each(arrcategory, function () {
                if ($.inArray(j, arrcategory) == -1) {
                    arrcategory.push(j)
                }
            })
        }

        arrcategory = arrcategory.sort(function (a, b) { return a > b ? 1 : -1 });

        for (var i = 0; i < arrcategory.length; i++) {
            var arrURL = [];

            var category = arrcategory[i];

            arrURL.category = category;

            for (var g = 0; g < m_data.rows.length; g++) {
                var e = m_data.rows[g].category;
                if (e == category) {
                    var ob = new Object();
                    ob.designimagesmall = m_data.rows[g].designimagesmall;
                    ob.measurementsid = m_data.rows[g].measurementsid;
                    arrURL.push(ob)
                }
            }

            m_HtmlMain += '<span style="cursor:pointer;text-align: left; font-size: 20px;" colspan="2"  onclick="clickExpansion(' + "'" + category.replace(".", "_") + "'" + ')"  >' + category + '   共' + arrURL.length + '</span><br /><table id = "' + category.replace(".", "_") + '"><tr>';

            for (var q = 0; q < arrURL.length; q++) {

                if (q % page != 0) {
                    m_HtmlMain += '<td  onclick="clickSearch(' + "'" + arrURL[q].measurementsid + "'" + ')"  >' + '<center>' + arrURL[q].designimagesmall + '<br/>' + arrURL[q].measurementsid + '</center></td>'
                } else {
                    m_HtmlMain += '</tr><tr>'
                    m_HtmlMain += '<td onclick="clickSearch(' + "'" + arrURL[q].measurementsid + "'" + ')"  >' + arrURL[q].designimagesmall + '<br/>' + '<center>' + arrURL[q].measurementsid + '</center></td>'
                }
            }
            m_HtmlMain += '</tr></table><br/>';
        }
        m_HtmlMain += '</div>';
    }
    if (type == 'main') {
        $('#mainPanle').append(m_HtmlMain)
    } else {
        m_HtmlPat = m_HtmlMain;
    }
}

//点击图片或者款图的时候,加载明细
function clickSearch(measurementsid) {

    if (measurementsid == "") {
        alert("该款图没有样版号");
        return;
    }
    initDtail(measurementsid)
}

//加载明细
function initDtail(measurementsid) {

    var data = [];
    data[data.length] = { "name": "Brand", "value": $('#txtbrand').combobox('getValue') };
    data[data.length] = { "name": "OrderSeason", "value": $('#txtcmbdhhjj').combobox('getValue') };
    data[data.length] = { "name": "MeasurementsId", "value": measurementsid };
    data[data.length] = { "name": "CONO", "value": "" };
    data[data.length] = { "name": "DIVI", "value": m_zt };

    $.messager.progress({ title: '请稍后', msg: '处理中' });

    var htmlobjD = $.ajax({
        url: GetWSRRURL('842b2f51-9de1-4dad-9b49-26aa9ba9e4d0'),
        data: data,
        type: 'post',
        async: true,
        success: function (result) {
            try {

                var result = eval("[" + result + "]");

                if (result[0].Error) {
                    $.messager.progress('close');
                    $.messager.alert("系统错误", result[0].Error, 'error');
                }
                else if (result[0].rows[0].result == "false") {

                    $.messager.alert("提示", "无该样板号详细信息!", 'error');
                    $.messager.progress('close');
                }

                else {

                    var m_dataDt = $.parseJSON(htmlobjD.responseText);

                    $('#divDetail').window({
                        title: "详细页",
                        top: 20,
                        width: 300,
                        height: 313,
                        maximized: true
                    }).window("open");

                    $('#tabListDt').datagrid(
                       {
                           data: m_dataDt,
                           async: false,
                           //sortName: 'key', //排序字段
                           //idField: 'dyyyno', //标识字段,主键
                           width: '90%', //宽度
                           height: $(document).height() - 100, //高度
                           nowrap: true, //是否换行，True 就会把数据显示在一行里
                           remoteSort: false, //定义是否从服务器给数据排序
                           collapsible: false, //可折叠
                           sortOrder: 'DESC', //排序类型
                           //sortable: true,
                           striped: true, //True 奇偶行使用不同背景色
                           singleSelect: true, //单行选择
                           fit: true,//自适应
                           //rownumbers: true,//行号
                           columns: [[
                               { field: 'id', title: '系列', width: 100, hidden: false },
                               { field: 'value', title: '名称', width: 140, hidden: false }
                           ]],
                           onLoadSuccess: function (data) {
                               if ((data.rows.length == 1 && data.rows[0].id == undefined) || (data.rows.length == 1 && data.rows[0].id == "")) {
                                   ClearGrid("#tabListDt");
                               }
                               else {
                                   $('#divImagezuo').html("");
                                   $('#divImageyou').html("");
                                   $('#bei').html("");
                                   var index = data.rows.length - 1;
                                   var valueimg = $('#tabListDt').datagrid('selectRow', index).datagrid('getSelected');
                                   var valueimgD = $('#tabListDt').datagrid('selectRow', index * 1 - 1).datagrid('getSelected');
                                   htmlbei = "<table><tr><td style='color: red;'>注:左边是款式图片,右边是样衣图片!</td></tr></table>"

                                   var htmlzuo = "";
                                   var htmlyou = "";

                                   if (valueimg.value == "") {
                                       htmlzuo = "<img  src='http://192.168.0.35:85/image/nopic.jpg' style='height:300px;' border='0'/>";
                                   } else {
                                       var jmURL = valueimg.value;
                                       htmlzuo = "<img  src='http://192.168.0.72/FlexPLMAPI/GetFlexImage.aspx?DT=true&IMG=" + jmURL + "' style='height:300px;' border='0'/>";
                                   }
                                   if (valueimgD.value == "") {
                                       htmlyou = "&nbsp;  <img  src='http://192.168.0.35:85/image/nopic.jpg' style='height:300px;' border='0'/>";
                                   } else {
                                       var repURL = valueimgD.value;
                                       //repURL = repURL.toString().replaceAll('\\\\', '/', false); 
                                       //htmlyou = "<img  src='file:" + repURL + "' style='height:300px;' border='0'/>";
                                       htmlyou = "<img  src='http://192.168.0.36:8020/" + repURL + ".JPG' style='height:300px;' border='0'/>";
                                   }
                                   $('#bei').html(htmlbei);
                                   $('#divImagezuo').html(htmlzuo);
                                   $('#divImageyou').html(htmlyou);


                                   var valueimg = $('#tabListDt').datagrid('selectRow', index).datagrid('getSelected');
                                   $('#tabListDt').datagrid('deleteRow', index);
                                   $('#tabListDt').datagrid('deleteRow', index * 1 - 1);
                                   $.messager.progress('close');
                               }
                           }
                       });
                }
            } catch (ex) {
                $.messager.alert("提示", "异常,请联系信息管理部", 'error');
                $.messager.progress('close');
            }
        }
    });

}

//按照品牌控制季节下拉数据
function ChangeDHHJJ() {
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

//得到最终排序组
function changeSortingGroup() {
    var brandTypeSortingGroup = $('#txtbrand').combobox("getText");
    var typeSortingGroup = $('#txtClassificationType').combobox("getText");

    typeSortingGroup = typeSortingGroup.substr(1)

    if (brandTypeSortingGroup.substr(0, 2) == "EP") {
        brandTypeSortingGroup = "EP"
    }
    else if (brandTypeSortingGroup.substr(0, 2) == "E.P") {
        brandTypeSortingGroup = "E.Prosper"
    }
    else if (brandTypeSortingGroup.substr(0, 2) == "Do") {
        brandTypeSortingGroup = "Do"
    }
    else if (brandTypeSortingGroup.substr(0, 2) == "Ki") {
        brandTypeSortingGroup = "Kids"
    }
    if (m_SortingGroupData == null) {
        return;
    }
    var data = m_SortingGroupData;
    m_FSortingGroupData1 = [];

    for (var i = 0; i < data.rows.length; i++) {
        if (data.rows[i].cbtx15.toString().indexOf(brandTypeSortingGroup) > -1) {
            m_FSortingGroupData1.push(data.rows[i]);
        }
    }

    m_FSortingGroupData = [];
    //var j = m_data.rows[i].designer
    for (var h = 0; h < m_FSortingGroupData1.length; h++) {
        if (m_FSortingGroupData1[h].cbstco.toString().indexOf(typeSortingGroup) > -1) {
            var m = m_FSortingGroupData1[h].cbstky
            m_FSortingGroupData.push(m);
        }
    }
}


function clickExpansion(dtype) {

    //$("#div").is(":hidden"); // 判断是否隐藏 
    if ($("#" + dtype).is(":hidden")) {
        $("#" + dtype).show();
    } else {
        $("#" + dtype).hide();
    }
}

function pring() {

    searchClick('pat');

    var m_htmlprint = "";
    var m_html = "<center><DIV style='font-size:30px'></div></center>";
    if (m_HtmlPat == undefined) {
        alert("无数据!请先查询!");
        return;
    } else {
        m_htmlprint = m_HtmlPat + m_html;
        window.showModalDialog("print.html", new String(m_htmlprint),
      "location:No;status:no;help:No;dialogWidth:700px;resizable:yes;center:yes;dialogHeight:700px;scroll:auto;");
    }
}

