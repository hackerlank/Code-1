﻿var mtypename = [{ "id": "A", "text": "服装童装配饰" }, { "id": "E", "text": "家具家饰" }];
var editIndex;//编辑行索引
var SizeGroupData;//尺码组
var DeliveryplanData;//到货计划时间
var indexpohead;//采购单主表索引
var indexpoheaddetail;//采购单子表索引
var m_RowIndex = 1000;//行号默认1000
var ggg1 = "";
var strCheck = [];
var m_divi = "";
var m_data = [];
var m_editRow = ""; //采购单明细编辑,记录编辑行
var m_url = "";   //记录查找采购单明细表的url


$(function () {
    m_divi = $.cookie("compName");
    m_data[0] = { "name": "txtzt", "value": m_divi };

    //品牌下拉获取，支持模糊查询。
    $('#formselect #txtbr1_name').combogrid({
        panelWidth: 110,
        url: GetWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124') + "&pagerows=20000&XML=" + GetFormJson('', 'GETBRANDSEARCH'),
        idField: 'br1_brandcode',
        textField: 'br1_name',
        mode: 'remote',
        columns: [[
                { field: 'br1_name', title: '品牌名称', width: 100 }
        ]]
    });

    //加载季节combobox下拉
    if (m_divi == "GL") {
        $('#formselect #txtpd1_season').combobox({
            url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson('', 'GET') + "&Where=CT1_Code='" + "SSON" + "' AND CT1_State='20'",
            panelHeight: 'auto',
            editable: false,
            valueField: 'id',
            textField: 'text'
        });
    } else {
        $('#formselect #txtpd1_season').attr('disabled', true);
    }
    //加载年份combobox下拉
    $('#formselect #txtpd1_years').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson('', 'GET') + "&Where=CT1_Code='" + "YEAR" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        valueField: 'id',
        textField: 'text'
    });
    //加载供应商combogrid下拉，支持模糊查询
    $('#formselect #txtpo1_suppliercode').combogrid({
        panelWidth: 380,
        url: GetWSRRURL('ffda947c-e49f-4106-982a-dbda0664b282') + "&XML=" + GetFormJson('', 'SupplierInfo'),
        idField: 'sp1_suppliercode',
        textField: 'sp1_name',
        mode: 'remote',
        columns: [[
                { field: 'sp1_suppliercode', title: '供应商编号', width: 80 },
                { field: 'sp1_name', title: '供应商简称', width: 80 },
                { field: 'sp1_regioncode', title: '区域编码', width: 62 },
                { field: 'sp1_regionname', title: '区域名称', width: 62 },
                { field: 'sp1_supplytax', title: '供应商税率', width: 70 }
        ]]
    });
    //加载合同combogrid下拉支持模糊查询
    $('#formselect #txtpo1_pc1_contractcode').combogrid({
        panelWidth: 100,
        url: GetComboxWSRRURL('ea48f25a-597d-43cb-9084-e8742e9b50ea', "", "pc1_contractcode", "pc1_contractcode") + "&XML=" + GetFormJson(m_data, 'GETCONTRACTCOMBOGRID') + "&Where=PC1_StateCode='35'",
        idField: 'pc1_contractcode',
        textField: 'pc1_contractcode',
        mode: 'remote',
        editable: true,
        columns: [[
           { field: 'pc1_contractcode', title: '合同编号', width: 80 }
        ]]
    });

    var url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson(m_data, 'GET') + "&Where=PO1_DIVI='" + m_divi + "'";//组成URL，供加载采购单主表信息
    InitGird_PO1_POHead(url);//加载采购单信息
})
//加载采购单信息
function InitGird_PO1_POHead(url) {
    $('#PO1_POHeadList').datagrid(
        {
            title: '采购单', //表格标题
            url: url,
            sortName: 'po1_rgdt', //排序字段
            idField: 'po1_pocode', //标识字段,主键
            width: '90%', //宽度
            height: $(document).height() - 100, //高度
            nowrap: true, //是否换行，True 就会把数据显示在一行里
            remoteSort: true, //定义是否从服务器给数据排序
            collapsible: false, //可折叠
            sortOrder: 'DESC', //排序类型
            sortable: true,
            striped: true, //True 奇偶行使用不同背景色
            singleSelect: true, //单行选择
            fit: true,
            pagination: true, //是否开启分页
            pageSize: 20, //默认一页数据条数 
            onSelect: onClickRow,
            rownumbers: true,//行号
            columns: [[
                { field: 'ck', title: '选择', checkbox: true },
                { field: 'po1_pocode', title: '采购单编号', width: 65, search: true, sortable: true },
                { field: 'po1_sppocode', title: '供应商采购编号', width: 60, search: true, sortable: true },
                { field: 'po1_pc1_contractcode', title: '合同编号', width: 75, search: true, sortable: true },
                { field: 'po1_lstate', title: '最低状态', width: 30, search: true, sortable: true },
                { field: 'po1_hstate', title: '最高状态', width: 30, search: true, sortable: true },
                { field: 'po1_suppliercode', title: '供应商编号', width: 65, search: true, sortable: true },
                { field: 'sp1_name', title: '供应商名称', width: 95, search: true, sortable: true },
                { field: 'sp1_regionname', title: '供应商分类', width: 70, search: true, sortable: true },
                { field: 'po1_potypename', title: '采购类型', width: 60, search: true, sortable: true },
                { field: 'br1_name', title: '品牌名称', width: 60, search: true, sortable: true },
                { field: 'po1_plandeliverydate', title: '预计出货日期', width: 75, search: true, sortable: true },
                { field: 'po1_pznumber', title: '采购总数', width: 60, search: true, align: 'right', formatter: Formater.Nums },
                { field: 'po1_currency', title: '币种', width: 35, search: true },
                { field: 'po1_ocurrencysums', title: '原币金额', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po1_dcurrencysums', title: '本币金额', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po1_exchangerate', title: '汇率', width: 40, search: true },
                { field: 'po1_increaseratio', title: '增值税', width: 45, search: true },
                { field: 'po1_tariffratio', title: '关税', width: 45, search: true },
                { field: 'po1_transportratio', title: '运费', width: 45, search: true },
                { field: 'po1_supplytax', title: '供应商税率', width: 50, search: true },
                { field: 'po1_paymenttypename ', title: '付款方式', width: 60, search: true },
                { field: 'po1_paymentchannelname', title: '支付方式', width: 60, search: true },
                { field: 'po1_remark', title: '备注' },
                { field: 'po1_lmuser', title: '更新人', width: 50, search: true },
                { field: 'po1_lmdt', title: '更新时间', width: 120, search: true, sortable: true }
            ]],
            toolbar: "#tab_toolbar",
            toolbar: [
                {
                    id: 'btn_Add',
                    text: '新增',
                    iconCls: 'icon-add',
                    handler: function () {
                        Type("Add");
                    }
                },
                '-',
                {
                    id: 'btn_Edit',
                    text: '修改',
                    iconCls: 'icon-edit',
                    handler: function () {
                        Type("Edit");
                    }
                },
                '-',
                {
                    id: 'btn_Remove',
                    text: '删除',
                    iconCls: 'icon-remove',
                    handler: function () {
                        POHeadDelete();
                    }
                },
                '-',
                {
                    id: 'btn_End',
                    text: '完结',
                    iconCls: 'icon-up',
                    handler: function () {
                        EndPoHead();
                    }
                },
                '-',
                {
                    id: 'btn_Export',
                    text: '导出',
                    iconCls: 'icon-ok',
                    handler: function () {
                        //导出
                        exportToExcel("DivPrint");
                    }
                },
                '-',
                {
                    id: 'btn_Print',
                    text: '打印',
                    iconCls: 'icon-print',
                    handler: function () {
                        //打印
                        btnPrint();
                    }
                }
            ]
        });
}

//在采购单界面点击查询按钮，按照条件加载采购单信息
function InitGird_PO1_POHeadSelect() {
    ClearGrid("#PO1_POHeadList");//清空采购主表和子表信息
    ClearGrid("#PO2_PODetailList");
    //获取采购单单号，供应商编号，合同号，品牌名称，年份，季节。
    var mselectpo1_pocode = $('#formselect #txtpo1_pocode').val();
    var mselectpo1_suppliercode = $('#formselect #txtpo1_suppliercode').combogrid('getValue');
    var mselectpo1_pc1_contractcode = $('#formselect #txtpo1_pc1_contractcode').combogrid('getValue');
    var mselectbr1_name = $('#formselect  #txtbr1_name').combobox('getValue');
    var mselectpd1_years = $('#formselect #txtpd1_years').combobox('getValue');
    var mselectpd1_season = "";
    if (m_divi == 'GL') {
        mselectpd1_season = $('#formselect #txtpd1_season').combobox('getText');
    }
    //按照条件创建URL
    var url = "1=1";
    if (mselectpo1_pocode != "") {
        url += " and po1_pocode like '%" + mselectpo1_pocode + "%'";
    }
    if (mselectpo1_suppliercode != "") {
        url += " and po1_suppliercode='" + mselectpo1_suppliercode + "'";
    }
    if (mselectpo1_pc1_contractcode != "") {
        url += " and po1_pc1_contractcode='" + mselectpo1_pc1_contractcode + "'";
    }
    if (mselectbr1_name != "") {
        url += " and PO1_BR1_BrandCode='" + mselectbr1_name + "'";
    }
    var data = [];
    data[data.length] = { "name": "txtpd1_years", "value": mselectpd1_years };
    if (m_divi == 'GL') {
        data[data.length] = { "name": "txtpd1_season", "value": escape(mselectpd1_season) };
    }
    url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson(data, 'GET') + "&WHERE=" + escape(url) + " AND PO1_DIVI='" + m_divi + "'";
    InitGird_PO1_POHead(url);
}

//采购单界面控制完结按钮显示以否，如果采购单是75状态，完结按钮灰掉
function onClickRow(RowIndex, RowData) {
    if (RowData.po1_lstate == "75") {
        $('#btn_End').linkbutton('disable');
    }
    else {
        $('#btn_End').linkbutton('enable');
    }
    var mPO1POCode = RowData.po1_pocode
    var url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson("", 'GETPODETIL') + "&WHERE=" + " PO2_POCode = '" + mPO1POCode + "' and PO2_DIVI='" + m_divi + "'";
    m_url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson("", 'GETPODETILFORPRINT') + "&WHERE=" + " PO2_POCode = '" + mPO1POCode + "' and PO2_DIVI='" + m_divi + "'";//用于打印、导出采购单明细
    InitGird_PO2_PODetail(url);
    //点击采购单主表，动态加载采购子表信息
}

//主界面采购明细查询
function InitGird_PO2_PODetail(url) {
    $('#PO2_PODetailList').datagrid(
        {
            url: url,
            sortName: 'po2_liseq', //排序字段
            idField: 'rowindex', //标识字段,主键
            width: '90%', //宽度
            height: $(document).height() - 100, //高度
            nowrap: true, //是否换行，True 就会把数据显示在一行里
            remoteSort: true, //定义是否从服务器给数据排序
            collapsible: false, //可折叠
            sortable: true,
            striped: true, //True 奇偶行使用不同背景色
            singleSelect: true, //单行选择
            fit: true,
            pagination: true, //是否开启分页
            pageSize: 20, //默认一页数据条数 
            rownumbers: true,
            selectOnCheck: false,//check开启
            checkOnSelect: true,
            onClickRow: Endshoworhide,
            columns: [[
                { field: 'ck', checkbox: true },
                { field: 'po2_liseq', title: '项次', width: 40, search: true },
                { field: 'po2_lsseq', title: '子项次', width: 40, search: true },
                { field: 'po2_state', title: '状态', width: 30, search: true, sortable: true },
                { field: 'st2_imagepath', title: '款图', width: 50 },
                { field: 'po2_pd1_supperierstyle', title: '供应商款号', width: 70, search: true },
                { field: 'po2_pd1_supperiercolor', title: '供应商颜色/简', width: 60, search: true },
                { field: 'st3_st2_skccode', title: 'SKC', width: 100, search: true, sortable: true },
                { field: 'po2_pd1_supperiersize', title: '供应商尺码', editor: { type: 'validatebox', options: { required: true } }, width: 60, search: true },
                { field: 'st3_size', title: '尺码', width: 60, search: true },
                { field: 'po2_number', title: '采购数量', editor: { type: 'numberbox', options: { required: true } }, width: 60, search: true, align: 'right', formatter: Formater.Nums },
                { field: 'po2_unit', title: '单位', width: 35, search: true },
                { field: 'po2_purchasecurrency', title: '币种', width: 30, search: true },
                { field: 'po2_ocurrencyprice', title: '原币单价', width: 60, editor: { type: 'validatebox', options: { required: true } }, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_dcurrencyprice', title: '本币单价', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_ocurrencyamount', title: '原币金额', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_dcurrencyamount', title: '本币金额', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_plandeliverydate', title: '预计出货时间', width: 80, search: true },
                { field: 'po2_lmuser', title: '更新人', width: 50, search: true },
                { field: 'po2_lmdt', title: '更新时间', width: 120, search: true }
            ]],
            //加载完成之后取消所有select
            onLoadSuccess: function () {
                $('#PO2_PODetailList').datagrid("unselectAll");
            },
            toolbar: "#tab_toolbar",
            toolbar: [
                 {
                     id: 'btn_Examine',
                     text: '审核',
                     iconCls: 'icon-ok',
                     handler: function () {
                         Examinetype("yes");
                     }
                 },
                 '-',
                 {
                     id: 'btn_Edit',
                     text: '弃审',
                     iconCls: 'icon-cancel',
                     handler: function () {
                         Examinetype("no");
                     }
                 },
                '-',
                {
                    id: 'btn_poromve',
                    text: '完结',
                    iconCls: 'icon-ok',
                    handler: function () {
                        EndPoDetail();
                    }
                }
            ]
        });
    var $dg = $('#PO2_PODetailList');
    var col = undefined;
    col = $dg.datagrid('getColumnOption', 'st2_imagepath');
    if (col != null) {
        col.formatter = function (value) {
            var strs = new Array(); //定义一数组 
            strs = value.split(","); //字符分割 
            var date = "<a href='" + strs[0] + "' target='_blank'><img  src='" + strs[0] + "' style='width:20px;height:20px'/></a>";
            return date;
        }
    }
    $dg.datagrid();
}

//采购子表，动态显示完结按钮
function Endshoworhide() {
    var mPO2_PODetail = $('#PO2_PODetailList').datagrid('getSelected');
    if (mPO2_PODetail.po2_state >= "75" || mPO2_PODetail.po2_state <= '35') {
        $('#btn_poromve').linkbutton('disable');
    }
    else {
        $('#btn_poromve').linkbutton('enable');
    }
}

// 审核采购明细和反审核
function Examinetype(type) {
    //获取选择的行数据
    var dataSelectPO2_PODetail = $('#PO2_PODetailList').datagrid('getChecked');
    if (dataSelectPO2_PODetail.length == 0) {
        $.messager.alert('提示', '请选择采购明细', 'warning');
        return;
    }
    else {
        //如果yes 执行审核操作
        if (type == "yes") {
            if (CheckStatus("审核")) {
                for (i = 0; i < dataSelectPO2_PODetail.length; i++) {
                    if (dataSelectPO2_PODetail[i].po1_lstate == '95' && dataSelectPO2_PODetail[i].po1_hstate == '95') {
                        $.messager.alert('警告', '已完结,不能审核', 'warning');
                        return;
                    } else {
                        dataSelectPO2_PODetail[i].type = "35";
                    }
                }
                XMLData = GetEditJsonbyType(dataSelectPO2_PODetail, "EXAMINEPODETAIL");
                $.ajax({
                    url: GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd'),
                    type: 'post',
                    data: { "XML": XMLData },
                    success: function (result) {
                        try {
                            var result = eval("[" + result + "]");

                            if (result[0].Error) {
                                $.messager.progress('close');
                                $.messager.alert("系统错误", result[0].Error, 'error');
                            } else if (result[0].rows[0].result == "False") {
                                $.messager.progress('close');
                                $.messager.alert("提示", result[0].rows[0].message, 'error');
                            }
                            else {
                                $.messager.progress('close');
                                $('#PO1_POHeadList').datagrid("reload");
                                $('#PO2_PODetailList').datagrid("reload");
                                $.messager.alert("提示", result[0].rows[0].message);
                            }
                        } catch (ex) {
                            $.messager.progress('close');
                            $.messager.alert("提示", ex, 'error');
                        }
                    },
                    error: function () {
                        $.messager.alert("提示", "提交错误了！", 'error');
                    }
                });
            };
            //如果不是yes 就执行反审核操作
        } else {
            if (CheckStatus("反审核")) {
                //判断是否有做到货计划 yjw-2015-4-8
                var data = [];
                data[data.length] = { "name": "txtpo2_pocode", "value": dataSelectPO2_PODetail[0].po2_pocode };
                data[data.length] = { "name": "txtpo2_pd1_product", "value": dataSelectPO2_PODetail[0].po2_pd1_productcode };
                data[data.length] = { "name": "txtpo2_divi", "value": dataSelectPO2_PODetail[0].po2_divi };
                data[data.length] = { "name": "txtpo2_liseq", "value": dataSelectPO2_PODetail[0].po2_liseq };
                data[data.length] = { "name": "txtpo2_lsseq", "value": dataSelectPO2_PODetail[0].po2_lsseq };

                var xmlData = GetFormJson(data, 'isAPO');
                var htmlobj = $.ajax({
                    url: GetWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124'),
                    data: { "XML": xmlData },
                    type: 'post',
                    async: false
                });
                var result = $.parseJSON(htmlobj.responseText);
                if (result.rows[0].result != 'True') {
                    $.messager.alert('警告', result.rows[0].message, 'warning');
                    return;
                }
                for (i = 0; i < dataSelectPO2_PODetail.length; i++) {
                    if (dataSelectPO2_PODetail[i].po1_lstate == '95' && dataSelectPO2_PODetail[i].po1_hstate == '95') {
                        $.messager.alert('警告', '已完结,不能反审核', 'warning');
                        return;
                    }
                    else {
                        dataSelectPO2_PODetail[i].type = "15";
                    }
                }
                XMLData = GetEditJsonbyType(dataSelectPO2_PODetail, "BACKEXAMINEPODETAIL");
                $.ajax({
                    url: GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd'),
                    type: 'post',
                    data: { "XML": XMLData },
                    success: function (result) {
                        try {
                            var result = eval("[" + result + "]");

                            if (result[0].Error) {
                                $.messager.progress('close');

                                $.messager.alert("系统错误", result[0].Error, 'error');
                            } else if (result[0].rows[0].result == "False") {
                                $.messager.progress('close');

                                $.messager.alert("提示", result[0].rows[0].message, 'error');
                            }
                            else {
                                $.messager.progress('close');
                                $('#PO1_POHeadList').datagrid("reload");
                                $('#PO1_POHeadList').datagrid("unselectAll");
                                $('#PO2_PODetailList').datagrid("reload");
                                $.messager.alert("提示", result[0].rows[0].message);
                            }
                        } catch (ex) {
                            $.messager.progress('close');
                            $.messager.alert("提示", ex, 'error');
                        }
                    },
                    error: function () {
                        $.messager.alert("提示", "提交错误了！", 'error');
                    }
                });
            };
        };
    };
};

//检查选中的采购子表信息数据是否都正确，如果选中的有75完结状态提示数据问题
function CheckStatus(type) {
    var dataSelectPO2_PODetail = $('#PO2_PODetailList').datagrid('getChecked');
    if (type == "审核") {
        for (i = 0; i < dataSelectPO2_PODetail.length; i++) {
            if (dataSelectPO2_PODetail[i].po2_state == "75" || dataSelectPO2_PODetail[i].po2_state == "35") {
                $.messager.alert('提示', '你请检查数据状态', 'warning');
                $('#PO2_PODetailList').datagrid("unselectAll");
                return false;
            } else {
                return true;
            };
        };
    } else {
        for (i = 0; i < dataSelectPO2_PODetail.length; i++) {
            if (dataSelectPO2_PODetail[i].po2_state != "35") {
                alert('请检查采购明细状态');
                $('#PO2_PODetailList').datagrid("unselectAll");
                return false;
            } else {
                return true;
            };
        };
    };
};

//完结采购子表数据
function EndPoDetail() {

    var dataSelectPO2_PODetail = $('#PO2_PODetailList').datagrid('getChecked');
    if (dataSelectPO2_PODetail.length == 0) {
        alert('请选择需要完结的行');
        return;
    }
    else {
        if (dataSelectPO2_PODetail[0].po1_lstate == '95' && dataSelectPO2_PODetail[0].po1_hstate == '95') {
            alert('已完结,不能完结');
            return;
        }
    }

    //else {
    //    var dataSelectPO2_PODetail = $('#PO2_PODetailList_A').datagrid('getChecked');
    //    if (dataSelectPO2_PODetail.length == 0) {
    //        alert('请选择需要完结的行');
    //        return;
    //    }
    //}
    for (var j = 0; j < dataSelectPO2_PODetail.length; j++) {
        if (dataSelectPO2_PODetail[j].po2_state == '95') {
            alert('已完结');
            return;
        }
        else if (ataSelectPO2_PODetail[j].po2_state == '15' || ataSelectPO2_PODetail[j].po2_state == '35') {
            alert('不能完结');
            return;
        }
    }
    $.messager.confirm('提示框', '是否确认完结', function (r) {
        if (r) {
            //for (i = 0; i < dataSelectPO2_PODetail.length; i++) {
            //    dataSelectPO2_PODetail[i].type = "75";
            //}
            XMLData = GetEditJsonbyType(dataSelectPO2_PODetail, "ENDPODTETAIL");
            $.messager.progress({ title: '请稍后', msg: '处理中' });
            $.ajax({
                url: GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd'),
                type: 'post',
                async: false, //同步,
                data: { "XML": XMLData },
                success: function (result) {
                    try {
                        var result = eval("[" + result + "]");

                        if (result[0].Error) {
                            $.messager.progress('close');

                            $.messager.alert("系统错误", result[0].Error, 'error');
                        } else if (result[0].rows[0].result == "False") {
                            $.messager.progress('close');

                            $.messager.alert("提示", result[0].rows[0].message, 'error');
                        }
                        else {
                            $.messager.progress('close');
                            //if (type == "A") {
                            $('#PO1_POHeadList').datagrid("reload");
                            $('#PO1_POHeadList').datagrid("unselectAll");
                            $('#PO2_PODetailList').datagrid("reload");
                            $('#PO2_PODetailList').datagrid("unselectAll");
                            //}
                            //else {
                            //    $('#PO2_PODetailList_A').datagrid("reload");
                            //    $('#PO2_PODetailList_A').datagrid("unselectAll");
                            //    $('#PO2_PODetailList').datagrid("reload");
                            //}
                            $.messager.alert("提示", result[0].rows[0].message);
                        }
                    } catch (ex) {
                        $.messager.progress('close');

                        $.messager.alert("提示", ex, 'error');
                    }
                },
                error: function () {
                    $.messager.alert("提示", "提交错误了！", 'error');
                }
            });
            return false;
        }
    })
}
//取消主界面查询条件参数
function CancelSelectParam() {
    $('#formselect #txtpo1_pocode').val("");
    $('#formselect #txtpo1_suppliercode').combogrid('setValue', "");
    $('#formselect #txtpo1_pc1_contractcode').combogrid('setValue', "");
    $('#formselect #txtbr1_name').combogrid('setValue', "");
    $('#formselect #txtpd1_years').combobox('setValue', "");
    $('#formselect #txtpd1_season').combobox('setValue', "");
}

function Type(type) {
    //$('#DivEdit').show();
    $('#formAddEdit').form('clear');
    var title = "";
    if (type == "Edit") {
        title = "采购单修改";
    }
    else {
        title = "采购单新增";
    }
    $('#DivEdit').window({
        title: title,
        modal: true
    });
    $('#DivEdit').window('open');

    //初始化
    //初始化采购类型下拉 改成POTP
    $('#formAddEdit #txtpo1_potypecode').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "POTP" + "'  AND CT1_State='20'",
        valueField: 'id',
        textField: 'text',
        required: true,
        panelHeight: 'auto',
        editable: false,
        multiple: false

    });

    //加载合同数据   
    function init_select_contract(Selectcontractcode) {
        var url = GetWSRRURL('ea48f25a-597d-43cb-9084-e8742e9b50ea') + "&XML=" + GetFormJson([], 'GETCONTRACTCOMBOGRID')
            + "&Where=PC1_SP1_SupplierCode='" + Selectcontractcode + "' and PC1_DIVI='" + m_divi + "' AND PC1_StateCode='35'";
        htmlobj = $.ajax({
            url: url,
            async: false
        });
        m_select_contract = $.parseJSON(htmlobj.responseText);
        //初始化合同下拉
        $('#formAddEdit #txtpo1_pc1_contractcode').combogrid({
            panelWidth: 100,
            data: m_select_contract,
            idField: 'pc1_contractcode',
            textField: 'pc1_contractcode',
            editable: true,
            mode: 'remote',
            //required: true,
            columns: [[
               { field: 'pc1_contractcode', title: '合同编号', width: 80 }
            ]]
        });
    };
    init_select_contract();

    //初始化供应商下拉数据
    $('#formAddEdit #txtpo1_suppliercode').combogrid({
        panelWidth: 380,
        url: GetWSRRURL('ffda947c-e49f-4106-982a-dbda0664b282') + "&XML=" + GetFormJson(m_data, 'SupplierInfo'),
        idField: 'sp1_suppliercode',
        textField: 'sp1_name',
        mode: 'remote',
        required: true,
        columns: [[
           { field: 'sp1_suppliercode', title: '供应商编号', width: 80 },
           { field: 'sp1_name', title: '供应商简称', width: 80 },
           { field: 'sp1_regioncode', title: '区域编码', width: 62 },
           { field: 'sp1_regionname', title: '区域名称', width: 62 },
           { field: 'sp1_supplytax', title: '供应商税率', width: 70 }
        ]],
        //如果选择一行，把值付给别的输入框
        onSelect: function (rowIndex, rowData) {
            var mRegionName = rowData['sp1_regionname'];
            var mSupplyTax = rowData['sp1_supplytax'];
            $('#formAddEdit #txtsp1_regionname').val(mRegionName);
            $('#formAddEdit #txtpo1_supplytax').val(mSupplyTax);
            //合同编号 设置为可选(没有选择供应商,则为不可选)
            $('#formAddEdit #txtpo1_pc1_contractcode').combogrid({ disabled: false });
            var Selectbrandcode = $('#formAddEdit #txtpo1_suppliercode').combobox('getValue');
            init_select_contract(Selectbrandcode);//取供应商编号联动合同
        },
        onChange: function () {
            var Selectbrandcode = $('#formAddEdit #txtpo1_suppliercode').combobox('getValue');
            init_select_contract(Selectbrandcode);//取供应商编号联动合同
        }
    });

    //初始化品牌
    $('#formAddEdit #txtpo1_br1_brandcode').combogrid({
        panelWidth: 140,
        url: GetWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124') + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GETBRANDSEARCH'),
        idField: 'br1_brandcode',
        textField: 'br1_name',
        mode: 'remote',
        required: true,
        columns: [[
                { field: 'br1_brandcode', title: '品牌编号', width: 50, hidden: true },
                { field: 'br1_name', title: '品牌名称', width: 100 }
        ]]
    });

    //初始化日期
    $('#formAddEdit #txtpo1_plandeliverydate').datebox({
        formatter: function (date) { return date.format("yyyy-MM-dd") }
    });

    //初始化币种下拉，联动汇率下拉
    $('#formAddEdit #txtpo1_currency').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "CUCD" + "'  AND CT1_State='20'",
        panelHeight: 'auto',
        required: true,
        editable: false,
        valueField: 'id',
        textField: 'text',
        async: false,
        onChange: function () {
            var data = $('#formAddEdit #txtpo1_currency').combobox("getValue");
            initselectexchangerate(data);
        }
    });
    //汇率数据加载
    function initselectexchangerate(strselectexchangerate) {
        var dataParam = [];
        dataParam[dataParam.length] = { "name": "txtct1_code", "value": "CUCD" };
        dataParam[dataParam.length] = { "name": "txtct1_keyid ", "value": strselectexchangerate };
        dataParam[dataParam.length] = m_data[0]; //添加事业体
        url = GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&XML=" + GetFormJson(dataParam, 'GET2Level');
        //初始化汇率下拉
        $('#formAddEdit #txtpo1_exchangerate').combobox({
            url: url,
            panelHeight: 'auto',
            editable: false,
            valueField: 'id',
            textField: 'text',
            async: false,
            onLoadSuccess: function () {
                var data = $('#formAddEdit #txtpo1_exchangerate').combobox("getData");
                if (data.length != 0) {
                    $('#formAddEdit #txtpo1_exchangerate').combobox('setValue', data[0].text);
                }

            }
        });
    }

    //初始化运费
    $('#formAddEdit #txtpo1_transportratio').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "FRHT" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        valueField: 'text',
        textField: 'text',
        onLoadSuccess: function () {
            var data = $('#formAddEdit #txtpo1_transportratio').combobox("getData");
            if (data.length != 0) {
                $('#formAddEdit #txtpo1_transportratio').combobox('setValue', data[0].text);
            }
        }
    });

    //初始化付款方式
    $('#formAddEdit #txtpo1_paymenttypename').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "TEPY" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        required: true,
        valueField: 'text',
        textField: 'text'
    });

    //初始化支付方式
    $('#formAddEdit #txtpo1_paymentchannelname').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "PYTP" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        valueField: 'text',
        required: true,
        textField: 'text'
    });

    //初始化增值税
    $('#formAddEdit #txtpo1_increaseratio').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "VTCD" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        valueField: 'text',
        textField: 'text',
        onLoadSuccess: function () {
            var data = $('#formAddEdit #txtpo1_increaseratio').combobox("getData");
            if (data.length != 0) {
                $('#formAddEdit #txtpo1_increaseratio').combobox('setValue', data[0].text);
            }
        }
    });

    //初始化关税
    $('#formAddEdit #txtpo1_tariffratio').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "TARI" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        valueField: 'text',
        textField: 'text',
        onLoadSuccess: function () {
            var data = $('#formAddEdit #txtpo1_tariffratio').combobox("getData");
            if (data.length != 0) {
                $('#formAddEdit #txtpo1_tariffratio').combobox('setValue', data[0].text);
            }
        }
    });

    if (type == "Add") {

        //附上默认值
        $('#formAddEdit #txtpo1_pocode').val("");
        //$('#formAddEdit #txtpo1_potypecode').combobox('setValue', "");
        $('#formAddEdit #txtpo1_hstate').val("15");
        $('#formAddEdit #txtpo1_lstate').val("15");
        $('#formAddEdit #txtpo1_suppliercode').combogrid("setValue", "");
        $('#formAddEdit #txtsp1_regionname').val("");
        $('#formAddEdit #txtpo1_plandeliverydate ').datebox('setValue', "");
        $('#formAddEdit #txtpo1_pznumber').val("0");
        $('#formAddEdit #txtpo1_sppocode').val("");
        $('#formAddEdit #txtpo1_ocurrencysums').val("0");
        $('#formAddEdit #txtpo1_dcurrencysums').val("0");
        $('#formAddEdit #txtpo1_currency').combobox('setValue', "");
        $('#formAddEdit #txtpo1_exchangerate').val("");
        $('#formAddEdit #txtpo1_supplytax').val("");
        $('#formAddEdit #txtpo1_paymenttypename').combobox('setValue', "");
        $('#formAddEdit #txtpo1_paymentchannelname').combobox('setValue', "");
        $('#formAddEdit #txtpo1_increaseratio').combobox('setValue', "");
        $('#formAddEdit #txtpo1_tariffratio').combobox('setValue', "");
        $('#formAddEdit #txtpo1_transportratio').combobox('setValue', "");
        //$('#formAddEdit #txtpo1_exchangerate').combobox('setValue', "");
        $('#formAddEdit #txtpo1_potypecode').combobox('enable');//新增的时候，类型下拉可以选择
        $('#formAddEdit #txtpo1_remark').val(''); //新增时 备注 为空
    }
        //如果是edit就修改
    else if (type == "Edit") {
        var EditPO2_PODetail = $('#PO1_POHeadList').datagrid('getSelected')

        if (!EditPO2_PODetail) {
            $('#DivEdit').window('close');
            alert('请选择一行');
            return;
        }
        else if (EditPO2_PODetail.po1_lstate == '95' && EditPO2_PODetail.po1_hstate == '95') {
            $('#DivEdit').window('close');
            alert('已完结,不能修改');
            return;
        }

        //附上采购单一些相应的数据
        $('#formAddEdit #txtpo1_pocode').val(EditPO2_PODetail.po1_pocode);
        $('#formAddEdit #txtpo1_potypecode').combobox('setValue', EditPO2_PODetail.po1_potypecode);
        $('#formAddEdit #txtpo1_hstate').val(EditPO2_PODetail.po1_hstate);
        $('#formAddEdit #txtpo1_lstate').val(EditPO2_PODetail.po1_lstate);
        $('#formAddEdit #txtpo1_plandeliverydate').datebox('setValue', EditPO2_PODetail.po1_plandeliverydate);
        $('#formAddEdit #txtpo1_pznumber').val(((EditPO2_PODetail.po1_pznumber) * 1).toFixed(0));
        $('#formAddEdit #txtpo1_sppocode').val(EditPO2_PODetail.po1_sppocode);
        $('#formAddEdit #txtpo1_ocurrencysums').val(EditPO2_PODetail.po1_ocurrencysums);
        $('#formAddEdit #txtpo1_dcurrencysums').val(EditPO2_PODetail.po1_dcurrencysums);
        $('#formAddEdit #txtpo1_paymenttypename').combobox('setValue', EditPO2_PODetail.po1_paymenttypename);
        $('#formAddEdit #txtpo1_paymentchannelname').combobox('setValue', EditPO2_PODetail.po1_paymentchannelname);
        $('#formAddEdit #txtpo1_increaseratio').combobox('setValue', EditPO2_PODetail.po1_increaseratio);
        $('#formAddEdit #txtpo1_tariffratio').combobox('setValue', EditPO2_PODetail.po1_tariffratio);
        $('#formAddEdit #txtpo1_transportratio').combobox('setValue', EditPO2_PODetail.po1_transportratio);
        $('#formAddEdit #txtpo1_suppliercode').combogrid('setValue', EditPO2_PODetail.po1_suppliercode);
        $('#formAddEdit #txtsp1_regionname').val(EditPO2_PODetail.sp1_regionname);
        $('#formAddEdit #txtpo1_supplytax').val(EditPO2_PODetail.po1_supplytax);
        $('#formAddEdit #txtpo1_br1_brandcode').combogrid('setValue', EditPO2_PODetail.po1_br1_brandcode);
        $('#formAddEdit #txtpo1_pc1_contractcode').combogrid('setValue', EditPO2_PODetail.po1_pc1_contractcode);
        $('#formAddEdit #txtpo1_exchangerate').val(EditPO2_PODetail.po1_exchangerate);
        $('#formAddEdit #txtpo1_currency').combobox('setValue', EditPO2_PODetail.po1_currency);//结算币种
        $('#formAddEdit #txtpo1_exchangerate').combobox('setValue', EditPO2_PODetail.po1_exchangerate); //汇率
        $('#formAddEdit #txtpo1_lmuser').val(EditPO2_PODetail.po1_lmuser);
        $('#formAddEdit #txtpo1_lmdt').val(EditPO2_PODetail.po1_lmdt);
        //$('#formAddEdit #txtpo1_company').combobox('setValue', EditPO2_PODetail.po1_company);

        //初始化不可编辑输入框
        $('#formAddEdit #txtpo1_potypecode').combobox('disable');
        $('#formAddEdit #txtpo1_br1_brandcode').combogrid('disable'); //品牌
        $('#formAddEdit #txtpo1_suppliercode').combogrid('disable'); //供应商编号   
        //$('#formAddEdit #txtpo1_company').combobox('disable');
        $('#formAddEdit #txtpo1_remark').val(EditPO2_PODetail.po1_remark); //修改时 赋值 备注
    }

    $('#myTab').tabs({
        onSelect: function (title) {
            if (title == '采购单明细') {
                if ($('#formAddEdit #txtpo1_pocode').val() == "") {
                    alert('请先保存采购单主表');
                    $('#myTab').tabs('select', 0);
                    return;
                }
                //初始化采购单编号
                $('#txtpo1_pocode_dtl').val($('#formAddEdit #txtpo1_pocode').val());
                //初始化供应商简称
                $('#txtpo1_suppliercode_dtl').val($('#formAddEdit #txtpo1_suppliercode').combogrid('getValue'));
                //初始化品牌名称
                $('#txtpo1_br1_brandcode_dtl').val($('#formAddEdit #txtpo1_br1_brandcode').combogrid('getValue'));
                //初始化供应商采购单号
                $('#txtpo1_sppocode_dtl').val($('#formAddEdit #txtpo1_sppocode').val());
                //初始化结算币种
                $('#txtpo1_currency_dtl').val($('#formAddEdit #txtpo1_currency').combobox('getValue'));
                //初始化汇率
                $('#txtpo1_exchangerate_dtl').val($('#formAddEdit #txtpo1_exchangerate').combobox('getValue'));
                //初始化最高、最低状态
                $('#txtpo1_hstate_dtl').val($('#formAddEdit #txtpo1_hstate').val());
                $('#txtpo1_lstate_dtl').val($('#formAddEdit #txtpo1_lstate').val());
                //初始化预计出货日期
                $('#txtpo1_plandeliverydate_dtl').datebox('setValue', $('#formAddEdit #txtpo1_plandeliverydate').datebox('getValue'));

                InitGird_PO2_PODetail_B(true);
            }
        }
    });
    //$('#formAddEdit').validate();
}
//主表删除
function POHeadDelete() {

    var dataSelectPO1_POHead = $('#PO1_POHeadList').datagrid('getSelected');
    if (!dataSelectPO1_POHead) {
        alert('请选择需要删除的一行');
        return;
    }
    if (dataSelectPO1_POHead.po1_lstate == 75) {
        alert("已收货,不能删除");
        return;
    }
    else if (dataSelectPO1_POHead.po1_lstate == 35) {
        alert("请先弃审");
        return;
    }
    else if (dataSelectPO1_POHead.po1_lstate == 15) {
        var DatePO2_PODetailList = $('#PO2_PODetailList').datagrid('getData');
        if (DatePO2_PODetailList.rows.length != "0") {
            alert('已经生成采购子表无法删除');
            return;
        }
    }
    //郭琦琦添加删采购单的时候验证是否已经收货
    var data = [];
    data[data.length] = { "name": "txtPORECode", "value": dataSelectPO1_POHead.po1_pocode }; //m_limitedMtno
    data[data.length] = m_data[0]; //添加事业体
    var xmlData = GetFormJson(data, 'checkPOre');
    var htmlobj = $.ajax({
        url: GetWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124'),
        data: { "XML": xmlData },
        type: 'post',
        async: false
    });
    var result = $.parseJSON(htmlobj.responseText);
    var count1 = result.rows[0]['count']//判断是否有权限
    //如果权限有,就可以新增,如果没有弹窗
    if (count1 > 0) {
        alert("已经收货,不能删除此采购单");
        return;
    }

    $.messager.confirm('提示框', '是否确认删除', function (r) {
        if (r) {
            var data = [];
            data[data.length] = { "name": "txtpo1_pocode", "value": dataSelectPO1_POHead.po1_pocode };
            data[data.length] = m_data[0];

            var XMLData = GetFormJson(data, 'DELETEPOHEAD');
            //return;
            $.messager.progress({ title: '请稍后', msg: '处理中' });
            $.ajax({
                url: GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd'),
                type: 'post',
                async: false, //异步,
                data: { "XML": XMLData },
                success: function (result) {
                    try {
                        var result = eval("[" + result + "]");

                        if (result[0].Error) {
                            $.messager.progress('close');

                            $.messager.alert("系统错误", result[0].Error, 'error');
                        } else if (result[0].rows[0].result == "False") {
                            $.messager.progress('close');

                            $.messager.alert("提示", result[0].rows[0].message, 'error');
                        }
                        else {
                            $.messager.progress('close');
                            $('#PO1_POHeadList').datagrid("reload");
                            $.messager.alert("提示", result[0].rows[0].message);
                        }
                    } catch (ex) {
                        $.messager.progress('close');

                        $.messager.alert("提示", ex, 'error');
                    }
                },
                error: function () {
                    $.messager.alert("提示", "提交错误了！", 'error');
                }
            });
            return false;
        }
    });
}
//采购主表完结
function EndPoHead() {
    var dataSelectPO1_POHead = $('#PO1_POHeadList').datagrid('getSelected');
    if (!dataSelectPO1_POHead) {
        alert('请选择需要完结的一行');
        return;
    }
    $.messager.confirm('提示框', '是否确认完结', function (r) {
        if (r) {
            var data = [];
            data[data.length] = { "name": "txtpo1_pocode", "value": dataSelectPO1_POHead.po1_pocode };
            data[data.length] = m_data[0];
            var XMLData = GetFormJson(data, 'ENDPOHEAD');
            //return;
            $.messager.progress({ title: '请稍后', msg: '处理中' });
            $.ajax({
                url: GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd'),
                type: 'post',
                async: false, //异步,
                data: { "XML": XMLData },
                success: function (result) {
                    try {
                        var result = eval("[" + result + "]");

                        if (result[0].Error) {
                            $.messager.progress('close');

                            $.messager.alert("系统错误", result[0].Error, 'error');
                        } else if (result[0].rows[0].result == "False") {
                            $.messager.progress('close');

                            $.messager.alert("提示", result[0].rows[0].message, 'error');
                        }
                        else {
                            $.messager.progress('close');
                            $('#PO1_POHeadList').datagrid("reload");
                            $('#PO2_PODetailList').datagrid("reload");
                            $.messager.alert("提示", result[0].rows[0].message);
                        }
                    } catch (ex) {
                        $.messager.progress('close');

                        $.messager.alert("提示", ex, 'error');
                    }
                },
                error: function () {
                    $.messager.alert("提示", "提交错误了！", 'error');
                }
            });
            return false;
        }
    })
}

function onClickCellAP1_APOHeadList(index, field) {
    if (endEditingAP1_APOHeadList()) {
        $('#AP1_APOHeadList').datagrid('selectRow', index)
                .datagrid('editCell', { index: index, field: field });
        editIndex = index;
    }
}

function endEditingAP1_APOHeadList() {
    if (editIndex != undefined) {
        if ($('#AP1_APOHeadList').datagrid('validateRow', editIndex)) {
            $('#AP1_APOHeadList').datagrid('endEdit', editIndex);
            editIndex = undefined;
        }
        else {
            return false;
        }
    }
    return true;
}

function InitGird_PO2_PODetail_B(type) {
    //if (type == false) {
    //    var url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson("", 'GETPODETIL') + "&WHERE=" + "1!=1";
    //}
    if (type == true) {
        var mPO1POCode = $('#formAddEdit #txtpo1_pocode').val();
        var url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson("", 'GETPODETIL') + "&WHERE=" + " PO2_POCode = '" + mPO1POCode + "' AND PO2_DIVI='" + m_divi + "'";
        //ClearGrid("#PO2_PODetailList_A");
    }
    else if (type == "PoDetail") {
        var mPO1POCode = $('#formAddEdit #txtpo1_pocode').val();
        var url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson("", 'GETPODETIL') + "&WHERE=" + " PO2_POCode = '" + mPO1POCode + "' AND PO2_DIVI='" + m_divi + "'";
    }
    //ClearGrid("#PO2_PODetailList_A");

    $('#PO2_PODetailList_A').datagrid(
        {
            url: url,
            sortName: 'po2_liseq', //排序字段
            //sortName: 'st3_st2_skccode,st3_size', //排序字段
            idField: 'rowindex', //标识字段,主键
            //width: '90%', //宽度
            //height: $(document).height() - 100, //高度
            nowrap: true, //是否换行，True 就会把数据显示在一行里
            remoteSort: true, //定义是否从服务器给数据排序
            collapsible: false, //可折叠
            sortable: true,
            striped: true, //True 奇偶行使用不同背景色
            singleSelect: true, //单行选择
            fit: true,
            onDblClickRow: onDblClickRow,
            onClickCell: function () { endEditing() },
            pagination: true, //是否开启分页
            pageSize: 100, //默认一页数据条数 
            pageList: [100],
            //sortOrder: 'ASC', //排序类型
            //showFooter: true,
            //rownumbers: true,
            selectOnCheck: false,
            checkOnSelect: true,
            columns: [[
                { field: 'ck', checkbox: true },
                { field: 'po2_liseq', title: '项次', width: 40, search: true },
                { field: 'po2_lsseq', title: '子项次', width: 40, search: true },
                { field: 'po2_state', title: '状态', width: 30, search: true },
                { field: 'st2_imagepath', title: '款图', width: 50 },
                { field: 'st2_st1_stylecode', title: '款号', width: 50 },
                { field: 'po2_pd1_supperierstyle', title: '供应商款号', width: 70, search: true },
                { field: 'po2_pd1_supperiercolor', title: '供应商颜色/简', width: 60, search: true },
                { field: 'st3_st2_skccode', title: 'SKC', width: 100, hidden: true },
                { field: 'po2_pd1_supperiersize', title: '供应商尺码', width: 60, search: true },
                { field: 'st3_size', title: '尺码', width: 60, search: true },
                { field: 'po2_pd1_productcode', title: 'SKU', width: 100, search: true, sortable: true },
                { field: 'po2_number', title: '采购数量', editor: { type: 'numberbox', options: { required: true } }, width: 60, search: true, align: 'right', formatter: Formater.Nums },
                { field: 'po2_unit', title: '单位', width: 35, search: true },
                { field: 'po2_purchasecurrency', title: '币种', width: 30, search: true },
                { field: 'po2_ocurrencyprice', title: '原币单价', width: 60, editor: { type: 'validatebox', options: { required: true } }, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_dcurrencyprice', title: '本币单价', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_ocurrencyamount', title: '原币金额', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_dcurrencyamount', title: '本币金额', width: 60, search: true, align: 'right', formatter: Formater.Account },
                { field: 'po2_plandeliverydate', title: '预计出货时间', width: 80, search: true },
                { field: 'po2_lmuser', title: '更新人', width: 50, search: true },
                { field: 'po2_lmdt', title: '更新时间', width: 120, search: true }
            ]],
            onLoadSuccess: function () {
                $('#PO2_PODetailList_A').datagrid("clearChecked");
                $('#PO2_PODetailList_A').datagrid("unselectAll");
            },
            toolbar: "#tab_toolbar",
            toolbar: [
            {
                id: 'btn_Add_D',
                text: '新增',
                iconCls: 'icon-add',
                hidden: false,
                handler: function () {
                    AddPODetailList()
                }
            },
            '-',
            {
                id: 'btn_Remove',
                text: '删除',
                iconCls: 'icon-remove',
                hidden: false,
                handler: function () {
                    DeletePO2_PODetail()
                }
            },
            '-',
            {
                id: 'btn_Save',
                text: '保存',
                iconCls: 'icon-save',
                handler: function () {
                    //保存新增的采购明细
                    SavePODetailList();
                }
            }
            //,
            //'-',
            //{
            //    id: 'btn_End',
            //    text: '完结',
            //    hidden: false,
            //    iconCls: 'icon-up',
            //    handler: function () {
            //        EndPoDetail("B")

            //    }
            //}
            ]
        });
    col = $('#PO2_PODetailList_A').datagrid('getColumnOption', 'po2_plandeliverydate');
    col.editor = {
        type: 'datebox', options: {
            editable: false,
            required: true,
            formatter: function (date) { return date.format("yyyy-MM-dd") }
        }
    };

    var $dg = $('#PO2_PODetailList_A');
    var col = undefined;
    col = $dg.datagrid('getColumnOption', 'st2_imagepath');
    if (col != null) {
        col.formatter = function (value) {
            //var date = "<img  src='/image/Mat_image/" + value + "' style='width:40px;height:40px'/>";

            var strs = new Array(); //定义一数组 
            strs = value.split(","); //字符分割 
            var date = "<a href='" + strs[0] + "' target='_blank'><img  src='" + strs[0] + "' style='width:20px;height:20px'/></a>";
            //var date = "<a href='" + value + "' target='_blank'><img  src='" + value + "' style='width:20px;height:20px'/></a>";
            return date;
        }
    }
    $dg.datagrid();
}

//保存采购单明细
function SavePODetailList() {
    endEditing();
    var updates = $("#PO2_PODetailList_A").datagrid('getChanges');
    if (updates.length > 0) {
        var data = [];
        var inserted = $("#PO2_PODetailList_A").datagrid('getChanges', "inserted");
        for (var i = 0; i < inserted.length; i++) {
            if (inserted[i].po2_number <= 0) {
                alert('采购数量不能小于等于0');
                return false;
            }
        }
        var updated = $("#PO2_PODetailList_A").datagrid('getChanges', "updated");
        for (var j = 0; j < updated.length; j++) {
            if (updated[j].po2_number <= 0) {
                alert('采购数量不能小于等于0');
                return false;
            }
        }
        var deleted = $("#PO2_PODetailList_A").datagrid('getChanges', "deleted");
        updateJSON = GetEditJson(inserted, updated, deleted);
        data[data.length] = { "name": "txtpo1_pocode", "value": $('#txtpo1_pocode_dtl').val() };
        data[data.length] = { "name": "txtst3_divi", "value": m_divi };
        data[data.length] = { "name": "txtPoDetail", "value": updateJSON, "specialCharset": true };
        var XMLData = GetFormJson(data, 'EDITDETAIL');
        $.messager.progress({ title: '请稍后', msg: '处理中' });
        $.ajax({
            url: GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd'),
            type: 'post',
            async: false, //同步,
            data: { "XML": XMLData },
            success: function (result) {
                try {
                    var result = eval("[" + result + "]");

                    if (result[0].Error) {
                        $.messager.progress('close');

                        $.messager.alert("系统错误", result[0].Error, 'error');
                    } else if (result[0].rows[0].result == "False") {
                        $.messager.progress('close');

                        $.messager.alert("提示", result[0].rows[0].message, 'error');
                    }
                    else {
                        $.messager.progress('close');
                        $('#PO1_POHeadList').datagrid("reload");
                        $("#PO2_PODetailList_A").datagrid('reload');
                        //统计采购总数和采购金额
                        TotalPrice();

                    }
                } catch (ex) {
                    $.messager.progress('close');

                    $.messager.alert("提示", ex, 'error');
                }
            },
            error: function () {
                $.messager.alert("提示", "提交错误了！", 'error');
            }
        });
        return false;
    }
}

function BeginEdit(index, rowData) {

    if (rowData.po2_state == 35) {
        $.messager.alert("提示", "已审核，不能修改！", 'error');
        return false;
    }
    if (rowData.po2_state == 70) {
        $.messager.alert("提示", "已有收货，不能修改！", 'error');
        return false;
    }
    if (rowData.po2_state == 75) {
        $.messager.alert("提示", "已完全收货，不能修改！", 'error');
        return false;
    }
    if (rowData.po2_state == 15) {   //可编辑
        if (editIndex != index) {
            if (endEditing()) {
                editIndex = index;
                SelectSizeGroup(rowData.st2_sizegroup);

                var col = $('#PO2_PODetailList_A').datagrid('getColumnOption', 'st3_size');
                if (col.dataSizegroup == null) {
                    SelectSizeGroup(rowData.st2_sizegroup);
                    col.dataSizegroup = SizeGroupData;
                }

                $('#PO2_PODetailList_A').datagrid('selectRow', editIndex).datagrid('beginEdit', editIndex);
                return true;
            }
            else {
                return false;
            }
        }
        else {
            return true;
        }
    }
    else {
        $.messager.alert("提示", "状态异常,不能修改！", 'error');
        return false;
    }
}
//双击事件
function onDblClickRow(index, rowData) {
    BeginEdit(index, rowData);
}
//结束编辑事件
function endEditing() {
    if (editIndex != undefined) {
        if ($('#PO2_PODetailList_A').datagrid('validateRow', editIndex)) {
            $('#PO2_PODetailList_A').datagrid('endEdit', editIndex);
            TotalNum($('#PO2_PODetailList_A').datagrid('getChecked'));
            editIndex = undefined;
        }
        else {
            return false;
        }
    }
    return true;
}
function TotalNum(prowOpration) {
    for (k = 0; k < prowOpration.length; k++) {
        var Num = prowOpration[k].po2_number; //数量
        var npo2_ocurrencyprice = prowOpration[k].po2_ocurrencyprice; //采购原币单价
        var npo1_exchangerate = $('#formAddEdit #txtpo1_exchangerate').combobox('getValue') //汇率
        var npo2_dcurrencyprice = npo2_ocurrencyprice * npo1_exchangerate; //采购本币单价
        var npo2_ocurrencyamount = npo2_ocurrencyprice * Num; //采购原币金额
        var npo2_dcurrencyamount = npo2_dcurrencyprice * Num; //采购本币金额
        var index = $('#PO2_PODetailList_A').datagrid('getRowIndex', prowOpration[k])

        if (Num == undefined) {
            return;
        }
        else {
            Num = Num * 1;
        }

        $('#PO2_PODetailList_A').datagrid('updateRow', {
            index: index,
            row:
            {
                po2_dcurrencyprice: npo2_dcurrencyprice,
                po2_ocurrencyamount: npo2_ocurrencyamount,
                po2_dcurrencyamount: npo2_dcurrencyamount,
                po2_purchasecurrency: $('#formAddEdit #txtpo1_currency').combobox('getValue')
            }
        });
    }
}

//总数采购主表
function TotalPrice() {

    var PO2_PODetailList_AData = $('#PO2_PODetailList_A').datagrid('getData');


    var npo2_number = 0; var npo2_numberTotal = 0; //总金额

    var npo2_ocurrencyamount = 0; var npo2_ocurrencyamountTotal = 0;//原币单价

    var npo2_dcurrencyamount = 0; var npo2_dcurrencyamountTotal = 0;//本币单价


    for (var i = 0; i < PO2_PODetailList_AData.rows.length; i++) {
        npo2_number = parseFloat(PO2_PODetailList_AData.rows[i].po2_number)
        npo2_numberTotal = npo2_numberTotal + npo2_number;


        npo2_ocurrencyamount = parseFloat(PO2_PODetailList_AData.rows[i].po2_ocurrencyamount)
        npo2_ocurrencyamountTotal = npo2_ocurrencyamountTotal + npo2_ocurrencyamount;

        npo2_dcurrencyamount = parseFloat(PO2_PODetailList_AData.rows[i].po2_dcurrencyamount)
        npo2_dcurrencyamountTotal = npo2_dcurrencyamountTotal + npo2_dcurrencyamount;

    }

    npo2_numberTotal = npo2_numberTotal.toFixed(0);
    $('#formAddEdit #txtpo1_pznumber').val(npo2_numberTotal);

    npo2_ocurrencyamountTotal = npo2_ocurrencyamountTotal.toFixed(2);
    $('#formAddEdit #txtpo1_ocurrencysums').val(npo2_ocurrencyamountTotal);
    npo2_dcurrencyamountTotal = npo2_dcurrencyamountTotal.toFixed(2);
    $('#formAddEdit #txtpo1_dcurrencysums').val(npo2_dcurrencyamountTotal);

}

//新增
function AddPODetailList() {
    if ($('#formAddEdit').form('validate') == false) {
        $.messager.alert("提示", "请把必填项填写好，再新增明细！", 'error');
        return false;
    }

    $('#DivAddPODetail').window('open');

    $('#formAddPODetail #txtpd1_season').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "SSON" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        valueField: 'id',
        textField: 'text',
        onLoadSuccess: function () {
            var data = $('#formAddPODetail #txtpd1_season').combobox("getData");
            if (data.length == 0 || data[0].id != "0") {
                ComboboxAddRow({ "id": "0", "text": "全部", "selected": true }, 0, '#formAddPODetail #txtpd1_season');
            }
        },
        onChange: function (newValue, oldValue) {
            $('#formAddPODetail').find("#txtpo2_pd1_supperierstyle").focus();
        }
    });

    $('#formAddPODetail #txtpd1_years').combobox({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&pagerows=20000&XML=" + GetFormJson(m_data, 'GET') + "&Where=CT1_Code='" + "YEAR" + "' AND CT1_State='20'",
        panelHeight: 'auto',
        editable: false,
        valueField: 'id',
        textField: 'text',
        required: true,
        onChange: function (newValue, oldValue) {
            $('#formAddPODetail').find("#txtpo2_pd1_supperierstyle").focus();
        }

    });

    $('#formAddPODetail').find("#txtpo2_pd1_supperierstyle").val("");
    $('#formAddPODetail').find("#txtpd1_stylecode").val("");

    $('#formAddPODetail #txtpo1_suppliercode').val($('#formAddEdit #txtpo1_suppliercode').combobox('getValue'));
    $('#formAddPODetail #txtsp1_name').val($('#formAddEdit #txtpo1_suppliercode').combobox('getText'));
    $('#formAddPODetail #txtpo1_br1_brandcode').val($('#formAddEdit #txtpo1_br1_brandcode').combogrid('getValue'));
    $('#formAddPODetail #txtbr1_name').val($('#formAddEdit #txtpo1_br1_brandcode').combogrid('getText'));

    var txtpo1_suppliercode = $('#formAddEdit #txtpo1_suppliercode').combobox('getValue');
    var txtBR1_Name = $('#formAddEdit #txtpo1_br1_brandcode').combogrid('getText');


    var url = " 1=1";
    url += " and ST1_SupplierCode = '" + txtpo1_suppliercode + "'" + " AND  BR1_Name  = " + "'" + txtBR1_Name + "' AND ST2_DIVI='" + m_divi + "'";


    url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson("", 'GETSTYLE') + "&WHERE=" + escape(url);
    ClearGrid("#selectstylelist");
}

function SelectSourcepocodeinfo(url) {
    $('#sourcepocod_list').datagrid(
           {
               url: url,
               sortName: 'seq', //排序字段
               //idField: 'st2_state', //标识字段,主键
               width: '90%', //宽度
               height: $(document).height() - 100, //高度
               nowrap: true, //是否换行，True 就会把数据显示在一行里
               remoteSort: true, //定义是否从服务器给数据排序
               collapsible: false, //可折叠
               sortable: true,
               striped: true, //True 奇偶行使用不同背景色
               singleSelect: true, //单行选择
               fit: true,
               pagination: true, //是否开启分页
               pageSize: 20, //默认一页数据条数 
               //onSelect: onClickRow,
               onDblClickRow: SelectSourcepocodeinfoDblClickRow,
               //showFooter: true,
               rownumbers: true,
               pageList: [200, 300, 400],
               selectOnCheck: false,
               checkOnSelect: true,
               columns: [[
                   { field: 'ck', checkbox: true },
                   { field: 'code', title: '订单编号', width: 100 },
                   { field: 'cus1_code', title: '客户代号', width: 60 },
                   { field: 'seq', title: '项次', width: 50 },
                   { field: 'subseq', title: '子项次', width: 50 },
                   { field: 'mara_code', title: 'SKU', width: 100 },
                   { field: 'sumnumber', title: '下单数量', width: 50 },
                   { field: 'state', title: '状态', width: 50 },
                   { field: 'DeliveryDate', title: '货期', width: 100 }
               ]],
               onLoadSuccess: function () {
                   $('#sourcepocod_list').datagrid("unselectAll");
               },
               toolbar: "#sourcepocod_list_toolbar",
               toolbar: [
               {
                   id: 'btn_save',
                   text: '确定',
                   iconCls: 'icon-save',
                   handler: function () {
                       SelectSourcepocodeinfoDblClickRow();
                   }
               }]
           })

}

function SelectSourcepocodeinfoDblClickRow() {

    //var SelectStyle = $('#selectstylelist').datagrid('getSelected')
    var Selectsourcepocode = $('#sourcepocod_list').datagrid('getChecked');

    var PO2_PODetailList_AData = $('#PO2_PODetailList_A').datagrid('getData');
    for (var m = 0; m < Selectsourcepocode.length; m++) {
        var q = Selectsourcepocode[m].seq;
        for (var n = 0; n < PO2_PODetailList_AData.rows.length; n++) {
            var q1 = PO2_PODetailList_AData.rows[n].po2_liseq;
            if (q = q1) {
                var nMaxId = 0;
                var PO2_PODetailList_AData = $('#PO2_PODetailList_A').datagrid('getData');
                for (var i = 0; i < PO2_PODetailList_AData.rows.length; i++) {
                    if (parseInt(PO2_PODetailList_AData.rows[i].po2_lsseq) > nMaxId) {
                        nMaxId = parseInt(PO2_PODetailList_AData.rows[i].po2_lsseq);
                    }
                }
                nMaxId++;
                Selectsourcepocode[m].subseq = nMaxId;
            }
        }
    }

    $('#Divsourcepocode').window('close');

    for (b = 0; b < Selectsourcepocode.length; b++) {
        $('#PO2_PODetailList_A').datagrid('appendRow',
            {
                rowindex: m_RowIndex++,
                po2_liseq: Selectsourcepocode[b].seq,
                po2_state: "15",
                st3_size: Selectsourcepocode[b].mara_code.substring(Selectsourcepocode[b].mara_code.length - 1),
                po2_lsseq: Selectsourcepocode[b].subseq,
                st2_imagepath: Selectsourcepocode[b].st2_imagepath,
                po2_ocurrencyprice: Selectsourcepocode[b].price,
                po2_pd1_supperierstyle: Selectsourcepocode[b].st1_supperierstyle,
                po2_pd1_supperiercolor: Selectsourcepocode[b].st2_supperiercolor,
                st2_sizegroup: Selectsourcepocode[b].st2_sizegroup,
                st3_st2_skccode: Selectsourcepocode[b].st2_skccode,
                po2_pd1_supperiersize: "",
                po2_number: "000",
                po2_unit: Selectsourcepocode[b].unit,
                po2_plandeliverydate: Selectsourcepocode[b].deliverydate,
                po2_purchasecurrency: "",
                po2_ocurrencyamount: "0",
                po2_dcurrencyamount: "0",
                po2_pocode: $('#formAddEdit #txtpo1_pocode').val(),
                po2_purchasecurrency: $('#formAddEdit #txtpo1_currency').combobox('getValue'),
                po2_dcurrencyprice: $('#formAddEdit #txtpo1_exchangerate').combobox('getValue') * Selectsourcepocode[b].price,
            });
    }
    TotalPrice();
}

function SelectStyleInfo(url) {
    ClearGrid('#selectstylelist');
    $('#selectstylelist').datagrid({
        url: url,
        sortName: 'st3_skucode', //排序字段
        //idField: 'st2_state', //标识字段,主键
        width: '95%', //宽度
        height: $(document).height() - 100, //高度
        nowrap: true, //是否换行，True 就会把数据显示在一行里
        //remoteSort: true, //定义是否从服务器给数据排序
        //collapsible: false, //可折叠
        //sortable: true,
        striped: true, //True 奇偶行使用不同背景色
        //singleSelect: true, //单行选择
        fit: true,
        pagination: true, //是否开启分页
        //pageSize: 20, //默认一页数据条数 
        //onSelect: onClickRow,
        onDblClickRow: SelectStyleDblClickRow,
        //onClickRow: onClickRowForEdit,
        //showFooter: true,
        rownumbers: true,
        //pageList: [200, 300, 400],
        //selectOnCheck: false,
        //checkOnSelect: true,
        columns: [[
            { field: 'ck', checkbox: true },
            //{ field: 'rownumber', title: '序号', width: 40 },
            { field: 'st3_state', title: '状态', width: 40 },
            { field: 'st2_imagepath', title: '款图', width: 100 },
            { field: 'st1_supperierstyle', title: '供应商款号', width: 80 },
            { field: 'st2_supperiercolor', title: '供应商颜色/简', width: 90 },
            { field: 'st3_supperiersize', title: '供应商尺码' },
            { field: 'st2_st1_stylecode', title: '款号' },
            { field: 'st2_color', title: '颜色' },
            { field: 'st3_size', title: '尺码' },
            { field: 'st3_skucode', title: 'SKU' },
            { field: 'po1_ocurrencysums', title: '采购价', width: 80 },
            //{ field: 'po1_pznumber', title: '采购数量', editor: 'numberbox' },
            //{ field: 'st2_purchaseprice', title: '参考采购价', width: 100 },
            { field: 'st2_skccode', title: 'SKC', width: 100, hidden: true }
        ]],

        //toolbar: "#selectstylelisttab_toolbar",
        toolbar: [
            {
                id: 'btn_save',
                text: '确定',
                iconCls: 'icon-save',
                //hidden: false,
                handler: function () {
                    SelectStyleDblClickRow();
                }
            },
            '-',
            {
                id: 'btn_close',
                text: '关闭',
                iconCls: 'icon-cancel',
                handler: function () {
                    $('#DivAddPODetail').window('close');
                }
            }]
    });
    var $dg = $('#selectstylelist');
    var col = undefined;
    col = $dg.datagrid('getColumnOption', 'st2_imagepath');
    if (col != null) {
        col.formatter = function (value) {
            //var date = "<img  src='/image/Mat_image/" + value + "' style='width:40px;height:40px'/>";
            var strs = new Array(); //定义一数组 
            strs = value.split(","); //字符分割 
            var date = "<a href='" + strs[0] + "' target='_blank'><img  src='" + strs[0] + "' style='height:40px'/></a>";
            //var date = "<a href='" + value + "' target='_blank'><img  src='" + value + "' style='height:40px'/></a>";
            return date;
        }
    }
    $dg.datagrid();
}

function SelectStyleDblClickRow() {

    //var SelectStyle = $('#selectstylelist').datagrid('getSelected')
    var SelectStyle = $('#selectstylelist').datagrid('getChecked');

    $('#DivAddPODetail').window('close');

    for (k = 0; k < SelectStyle.length; k++) {

        var nMaxId = 0;
        var PO2_PODetailList_AData = $('#PO2_PODetailList_A').datagrid('getData');
        for (var i = 0; i < PO2_PODetailList_AData.rows.length; i++) {
            if (parseInt(PO2_PODetailList_AData.rows[i].po2_liseq) > nMaxId) {
                nMaxId = parseInt(PO2_PODetailList_AData.rows[i].po2_liseq);
            }
        }
        nMaxId++;

        var SelectStyleForpo2_unit = SelectStyle[k].st2_st1_stylecode;

        if (SelectStyleForpo2_unit != "") {
            XMLData = GetFormJson([], 'GETUNIT');
            htmlobj = $.ajax({
                url: GetWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124'),
                data: { "XML": XMLData, "WHERE": "ST1_StyleCode ='" + SelectStyleForpo2_unit + "'" },
                type: 'post',
                async: false
            });
            var result = $.parseJSON(htmlobj.responseText);
            if (result.rows[0]['st1_unit'] != "") {
                var Selectst1_unit = result.rows[0]['st1_unit']
            }
        }

        $('#PO2_PODetailList_A').datagrid('appendRow',
            {
                rowindex: m_RowIndex++,
                po2_liseq: "",
                //po2_state: SelectStyle.st2_state,
                po2_state: "15",
                po2_lsseq: "000",
                st2_imagepath: SelectStyle[k].st2_imagepath,
                st2_st1_stylecode: SelectStyle[k].st2_st1_stylecode,
                po2_ocurrencyprice: SelectStyle[k].st2_purchaseprice,
                po2_pd1_supperierstyle: SelectStyle[k].st1_supperierstyle,
                po2_pd1_supperiercolor: SelectStyle[k].st2_supperiercolor,
                st2_sizegroup: SelectStyle[k].st2_sizegroup,
                st3_st2_skccode: SelectStyle[k].st2_skccode,
                po2_pd1_supperiersize: SelectStyle[k].st3_supperiersize,
                st3_size: SelectStyle[k].st3_size,
                po2_pd1_productcode: SelectStyle[k].st3_skucode,
                po2_number: '000',
                po2_unit: Selectst1_unit,
                po2_plandeliverydate: $('#txtpo1_plandeliverydate_dtl').datebox('getValue'),
                po2_purchasecurrency: "",
                po2_ocurrencyamount: "0",
                po2_dcurrencyamount: "0",
                po2_pocode: $('#formAddEdit #txtpo1_pocode').val(),
                po2_purchasecurrency: $('#formAddEdit #txtpo1_currency').combobox('getValue'),
                po2_dcurrencyprice: $('#formAddEdit #txtpo1_exchangerate').combobox('getValue') * SelectStyle[k].st2_purchaseprice
            });
    }
    TotalPrice();
}

function SelectStyeCancel() {
    $('#formAddPODetail #txtpd1_season').combobox('setValue', "");
    $('#formAddPODetail #txtpd1_years').combobox('setValue', "");
    $('#formAddPODetail #txtpd1_stylecode').val("");
    $('#formAddPODetail #txtpo2_pd1_supperierstyle').val("");
}

function SearchStyle() {


    if ($('#formAddPODetail').form('validate') == false) {
        $.messager.alert("提示", "请填写年份！", 'error');
        return false;
    }

    var txtpo1_suppliercode = $('#formAddEdit #txtpo1_suppliercode').combobox('getValue');
    var txtpo1_br1_brandcode = $('#formAddEdit #txtpo1_br1_brandcode').combogrid('getValue');

    var txtpd1_years = $('#formAddPODetail #txtpd1_years').combobox('getText');
    var txtpd1_season = $('#formAddPODetail #txtpd1_season').combobox('getValue');
    var txtpd1_stylecode = $('#formAddPODetail #txtpd1_stylecode').val();
    var txtpo2_pd1_supperierstyle = $('#formAddPODetail #txtpo2_pd1_supperierstyle').val();
    //var txtpo1_company = $('#formAddEdit #txtpo1_company').combobox('getValue');

    var url = " 1=1";
    if (txtpd1_years != "") {
        url += " and ST1_Years = '" + txtpd1_years + "'";
    } else {
        url = url;
    }
    if (txtpd1_season != "0") {
        url += " and ST1_Season = '" + txtpd1_season + "'";
    }
    else {
        url = url;
    }
    if (txtpd1_stylecode == "") {
        url = url;
    }
    else {
        url += " and ST2_ST1_StyleCode like '%" + txtpd1_stylecode + "%'";
    }
    if (txtpo2_pd1_supperierstyle == "") {
        url = url;
    }
    else {
        url += " and ST1_SupperierStyle like '%" + txtpo2_pd1_supperierstyle + "%'";
    }
    url += " and ST1_SupplierCode = '" + txtpo1_suppliercode + "'" + " AND  st1_br1_brandcode = " + "'" + txtpo1_br1_brandcode +
        "' AND ST2_DIVI='" + m_divi + "'";
    url = GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd') + "&XML=" + GetFormJson("", 'GETSTYLE') + "&WHERE=" + escape(url);
    SelectStyleInfo(url);
}

function DeletePO2_PODetail() {
    var dataSelectPO2_PODetail = $('#PO2_PODetailList_A').datagrid('getChecked');

    if (dataSelectPO2_PODetail.length == 0) {
        alert('请选择一行');
        return;
    }

    for (var i = 0; i < dataSelectPO2_PODetail.length; i++) {
        if (dataSelectPO2_PODetail[i].po2_state == "75") {
            alert('有数据已经完结无法删除');
            return;
        }
        else if (dataSelectPO2_PODetail[i].po2_state == "35") {
            alert('已审核,不能删除');
            return;
        }
        else if (dataSelectPO2_PODetail[i].po2_state == "15") {

        }
        else {
            alert('不能删除');
            return;
        }
    }


    //郭琦琦添加删采购单的时候验证是否已经收货
    //var data = [];
    //data[data.length] = { "name": "txtPORECode", "value": $('#formAddEdit #txtpo1_pocode').val() };
    //data[data.length] = m_data[0];

    //var xmlData = GetFormJson(data, 'checkPOre');
    //var htmlobj = $.ajax({
    //    url: GetWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124'),
    //    data: { "XML": xmlData },
    //    type: 'post',
    //    async: false
    //});
    //var result = $.parseJSON(htmlobj.responseText);
    //var count1 = result.rows[0]['count']//判断是否有权限
    ////如果权限有,就可以新增,如果没有弹窗
    //if (count1 > 0) {
    //    alert("已经收货,不能删除");
    //    return;
    //}

    $.messager.confirm('提示框', '是否确认删除', function (r) {
        if (r) {
            for (var i = dataSelectPO2_PODetail.length - 1; i >= 0; i--) {
                var index = $('#PO2_PODetailList_A').datagrid('getRowIndex', dataSelectPO2_PODetail[i])
                $('#PO2_PODetailList_A').datagrid('deleteRow', index)
            }
            TotalPrice();
        }
    });
}

function PODetailCopy() {
    endEditing()
    var PODetailcheckdata = $('#PO2_PODetailList_A').datagrid('getChecked');
    if (PODetailcheckdata.length == 0) {
        alert('请选择需要复制的行');
        return;
    }
    for (k = 0; k < PODetailcheckdata.length; k++) {
        var nIndex = $('#PO2_PODetailList_A').datagrid('getRowIndex', PODetailcheckdata[k]);
        $('#PO2_PODetailList_A').datagrid('insertRow', {
            index: nIndex + 1,
            row: {
                rowindex: m_RowIndex++,
                po2_liseq: "",
                po2_lsseq: PODetailcheckdata[k].po2_lsseq,
                po2_pocode: PODetailcheckdata[k].po2_pocode,
                po2_dcurrencyamount: "0",
                po2_dcurrencyprice: PODetailcheckdata[k].po2_dcurrencyprice,
                st2_imagepath: PODetailcheckdata[k].st2_imagepath,
                po2_number: "0",
                po2_ocurrencyamount: "0",
                po2_ocurrencyprice: PODetailcheckdata[k].po2_ocurrencyprice,
                po2_pd1_supperiercolor: PODetailcheckdata[k].po2_pd1_supperiercolor,
                po2_pd1_supperiersize: "",
                po2_pd1_supperierstyle: PODetailcheckdata[k].po2_pd1_supperierstyle,
                po2_plandeliverydate: PODetailcheckdata[k].po2_plandeliverydate,
                po2_purchasecurrency: PODetailcheckdata[k].po2_purchasecurrency,
                po2_state: PODetailcheckdata[k].po2_state,
                po2_unit: PODetailcheckdata[k].po2_unit,
                st2_sizegroup: PODetailcheckdata[k].st2_sizegroup,
                st3_st2_skccode: PODetailcheckdata[k].st3_st2_skccode,
                st3_size: ""
            }
        });
    }
    TotalPrice();
}

function FormAddEditSubmit() {

    //验证品牌和供应商简称
    //$('#formAddEdit #txtpo1_suppliercode').combogrid('isValid');
    //$('#formAddEdit #txtpo1_suppliercode').combogrid('setValue', $('#formAddEdit #txtpo1_suppliercode').combogrid('getValue'));
    //if ($('#formAddEdit #txtpo1_suppliercode').combogrid('getText') == '') {
    //    $.messager.alert("提示", "供应商简称不正确", 'error');
    //    return false;
    //}
    //$('#formAddEdit #txtpo1_br1_brandcode').combogrid('isValid');
    //$('#formAddEdit #txtpo1_br1_brandcode').combogrid('setValue', $('#formAddEdit #txtpo1_br1_brandcode').combogrid('getValue'));
    //if ($('#formAddEdit #txtpo1_br1_brandcode').combogrid('getText') == '') {
    //    $.messager.alert("提示", "品牌不正确！", 'error');
    //    return false;
    //}
    $('#formAddEdit').form('submit', {
        onSubmit: function (e) {
            if ($('#formAddEdit').form('validate') == false) {
                $.messager.alert("提示", "请把必填项填完！", 'error');
                return false;
            }
            $.messager.confirm('提示框', '是否确认提交', function (r) {
                if (r) {
                    //$('#txtpo1_pc1_contractcode').combogrid('setText', $('#txtpo1_pc1_contractcode').combogrid('getText'));

                    var data = $('#formAddEdit').serializeArray();
                    //data[data.length] = { "name": "txtpo1_exchangerate", "value": $('#formAddEdit #txtpo1_exchangerate').combobox("getValue") }
                    data[data.length] = { "name": "txtpo1_company", "value": m_divi };
                    data[data.length] = { "name": "txtpo1_potypename", "value": $('#formAddEdit #txtpo1_potypecode').combobox('getText') };
                    data[data.length] = { "name": "txtpo1_pocode", "value": $('#formAddEdit #txtpo1_pocode').val() };
                    data[data.length] = { "name": "txtpo1_hstate", "value": $('#formAddEdit #txtpo1_hstate').val() };
                    data[data.length] = { "name": "txtpo1_lstate", "value": $('#formAddEdit #txtpo1_lstate').val() };
                    data[data.length] = { "name": "txtpo1_ocurrencysums", "value": $('#formAddEdit #txtpo1_ocurrencysums').val() };
                    data[data.length] = { "name": "txtpo1_dcurrencysums", "value": $('#formAddEdit #txtpo1_dcurrencysums').val() };
                    data[data.length] = { "name": "txtpo1_pznumber", "value": $('#formAddEdit #txtpo1_pznumber').val() };
                    data[data.length] = { "name": "txtpo1_supplytax", "value": $('#formAddEdit #txtpo1_supplytax').val() };
                    data[data.length] = { "name": "txtpo1_divi", "value": m_divi };  //事业体   

                    if ($('#formAddEdit #txtpo1_pc1_contractcode').combogrid('getText') == '') {
                        data[1].value = '';
                    } else {
                        data[1].value = $('#formAddEdit #txtpo1_pc1_contractcode').combogrid('getText');
                    }

                    var XMLData = GetFormJson(data, 'EDIT');

                    $.messager.progress({ title: '请稍后', msg: '处理中' });
                    $.ajax({
                        url: GetWSRRURL('d2ac5391-d4af-4991-8ae8-55a23dacccdd'),
                        type: 'post',
                        async: false, //同步,
                        data: { "XML": XMLData },
                        success: function (result) {
                            try {
                                var result = eval("[" + result + "]");

                                if (result[0].Error) {
                                    $.messager.progress('close');

                                    $.messager.alert("系统错误", result[0].Error, 'error');
                                } else if (result[0].rows[0].result == "False") {
                                    $.messager.progress('close');

                                    $.messager.alert("提示", result[0].rows[0].message, 'error');
                                }
                                else {
                                    $.messager.progress('close');
                                    $('#PO1_POHeadList').datagrid("reload");
                                    //$("#PO2_PODetailList_A").datagrid('reload');
                                    //$("#PO2_PODetailList_A").datagrid('onUncheckAll');
                                    $.messager.alert("提示", result[0].rows[0].message + "保存成功");
                                    $('#formAddEdit #txtpo1_pocode').val(result[0].rows[0].message);
                                    $('#formAddEdit #txtpo1_potypecode').combobox('disable');
                                    InitGird_PO2_PODetail_B("PoDetail");
                                }
                            } catch (ex) {
                                $.messager.progress('close');

                                $.messager.alert("提示", ex, 'error');
                            }
                        },
                        error: function () {
                            $.messager.alert("提示", "提交错误了！", 'error');
                        }
                    });
                    return false;
                }
            })
        }
    });
}

function Cancel(type) {
    if (type == "A1") {
        $('#DivEdit').window('close');
    }
    else if (type == "A2") {
        $('#DivAddDeliveryplan').window('close');
    }
}

function SelectSizeGroup(st2_sizegroup) {
    var dataParam = [];
    dataParam[dataParam.length] = { "name": "txtct1_code", "value": "SDGP" };
    dataParam[dataParam.length] = { "name": "txtct1_keyid ", "value": st2_sizegroup };
    dataParam[dataParam.length] = m_data[0];
    url = GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "CT1_OptionsValues", "CT1_Options") + "&XML=" + GetFormJson(dataParam, 'GET2Level');

    htmlobj = $.ajax({
        url: url,
        async: false
    });

    SizeGroupData = $.parseJSON(htmlobj.responseText);
}

function datagridCheckValueRepeat1(dgName, checkColumnList, toUpper, trim, noAlert, allCheck) {
    var rowIndexList = [];
    var checkResult = true;
    var $dg = $(dgName);
    ggg1 = "";
    strCheck = [];
    var rows = $dg.datagrid('getChanges');
    for (var i = 0; i < rows.length; i++) {

        var row = rows[i];

        var rows1 = $dg.datagrid('getRows');

        for (var j = 0; j < rows1.length; j++) {
            var row1 = rows1[j];
            if (row1 == row) {
                continue;
            }

            var evalstr = "";
            var evalstr1 = "";
            var evalstr2 = "";

            for (var k = 0; k < checkColumnList.length; k++) {
                try {
                    var checkColumn = checkColumnList[k];

                    evalstr = "row1." + checkColumn.name;
                    evalstr1 = "row." + checkColumn.name;
                    if (toUpper == true) {
                        evalstr += ".toLocaleLowerCase()"
                        evalstr1 += ".toLocaleLowerCase()"
                    }
                    if (trim && trim == true) {
                        evalstr += ".trim()"
                        evalstr1 += ".trim()"
                    }
                    if (evalstr2 != "") {
                        evalstr2 += " && ";
                    }
                    evalstr2 = evalstr2 + evalstr + " == " + evalstr1;
                }
                catch (ex) {
                }
            }

            if (eval(evalstr2)) {
                if (noAlert || noAlert == true) {
                    $.messager.alert("提示", "第" + ($dg.datagrid('getRowIndex', row) + 1) + "行与第" + ($dg.datagrid('getRowIndex', row1) + 1) + "行数据重复！", "error");
                }

                if (allCheck || allCheck == true) {
                    var ggg = row.st3_st2_skccode + "  为  " + row.st3_size + " 尺码" + "\n";

                    var haveFlag = false;
                    if (strCheck.length == 0) {
                        haveFlag = true;
                    }
                    else {
                        for (var p = 0; p < strCheck.length; p++) {
                            if (strCheck[p] == ggg) {
                                haveFlag = false;
                                break;
                            }
                        }
                    }
                    if (haveFlag) {
                        strCheck.push(ggg);
                    }
                }
            }
        }
    }
    return strCheck
}


/*--------------------------------------------------------汇总打印、导出报表-------------------------------------*/
function PrintDetailGrid(url) {
    var getHeadRow = $('#PO1_POHeadList').datagrid('getSelected');
    if (getHeadRow == null) {
        alert("请在采购单中选择一行数据");
        return false;
    }
    else {
        var searchListData = $.ajax({
            url: url,
            type: 'post',
            async: false
        });
        var result = $.parseJSON(searchListData.responseText);
        if (result.rows.length > 0) {
            var html = "";
            html += "<caption style=\"font-size:20px; font-weight: bolder;\">采购订单信息汇总表</caption>";
            html += "<tr><th colspan=\"3\" style=\"text-align:right\">采购订单编号:</th>";
            html += "<td colspan=\"2\" style=\"text-align:left;width:180px;border-bottom:1px solid #888;\">" + getHeadRow.po1_pocode + "</td>";
            html += "<th colspan=\"2\" style=\"text-align:right\">采购类型:</th>";
            html += "<td colspan=\"2\" style=\"text-align:left;width:150px;border-bottom:1px solid #888;\">" + getHeadRow.po1_potypename + "</td>";
            html += "<th colspan=\"2\" style=\"text-align:right\">品牌名称:</th>";
            html += "<td colspan=\"3\" style=\"text-align:left;width:150px;border-bottom:1px solid #888;\">" + getHeadRow.br1_name + "</td></tr>";

            html += "<tr><th colspan=\"3\" style=\"text-align:right\">供应商名称:</th>";
            html += "<td colspan=\"2\" style=\"text-align:left;width:180px;border-bottom:1px solid #888;\">" + getHeadRow.sp1_name + "</td>";
            html += "<th colspan=\"2\" style=\"text-align:right\">采购数量:</th>";
            html += "<td colspan=\"2\" style=\"text-align:left;width:150px;border-bottom:1px solid #888;\">" + parseInt(getHeadRow.po1_pznumber.trim()) + "</td>";
            html += "<th colspan=\"2\" style=\"text-align:right\">采购金额:</th>";
            html += "<td colspan=\"3\" style=\"text-align:left;width:150px;border-bottom:1px solid #888;\">" + getHeadRow.po1_ocurrencysums + "</td></tr>";

            html += "<tr><th colspan=\"3\" style=\"text-align:right\">付款方式:</th>";
            html += "<td colspan=\"2\" style=\"text-align:left;width:180px;border-bottom:1px solid #888;\">" + getHeadRow.po1_paymenttypename + "</td>";
            html += "<th colspan=\"2\" style=\"text-align:right\">下单人:</th>";
            html += "<td colspan=\"2\" style=\"text-align:left;width:150px;border-bottom:1px solid #888;\">" + getHeadRow.po1_lmuser + "</td>";
            html += "<th colspan=\"2\" style=\"text-align:right\">下单时间:</th>";
            html += "<td colspan=\"3\" style=\"text-align:left;width:150px;border-bottom:1px solid #888;\">" + getHeadRow.po1_lmdt + "</td></tr>";

            html += "<tr style=\"font-size:10pt;font-family:Arial Unicode MS;\">";
            html += "<th>项次</th><th>子项次</th><th>状态</th><th style=\"width:100px\">SKC</th><th>尺码</th><th>数量</th><th>单位</th><th>币种</th><th>原币单价</th><th>本币单价</th><th>原币金额</th><th>本币金额</th><th style=\"width:120px\">预计出货日期</th><th>更新人</th></tr>";
            for (var i = 0; i < result.rows.length - 1; i++) {
                html += "<tr style=\"font-size:10pt;font-family:Arial Unicode MS;\">";
                html = html + "<td>" + result.rows[i].po2_liseq.trim() + "</td><td>" + result.rows[i].po2_lsseq.trim() + "</td><td>" +
                    result.rows[i].po2_state.trim() + "</td><td>" + result.rows[i].st3_st2_skccode.trim() + "</td><td>" + result.rows[i].st3_size.trim() + "</td><td>" +
                    parseInt(result.rows[i].po2_number.trim()) + "</td><td>" + result.rows[i].po2_unit.trim() + "</td><td>" + result.rows[i].po2_purchasecurrency.trim() + "</td><td>" +
                    millon(parseFloat(result.rows[i].po2_ocurrencyprice).toFixed(2).trim()) + "</td><td>" + millon(parseFloat(result.rows[i].po2_dcurrencyprice).toFixed(2).trim()) + "</td><td>" + millon(result.rows[i].po2_ocurrencyamount.trim()) + "</td><td>" +
                    millon(result.rows[i].po2_dcurrencyamount.trim()) + "</td><td>" + result.rows[i].po2_plandeliverydate.split(" ")[0].trim() + "</td><td>" + result.rows[i].po2_lmuser.trim() + "</td>";
                html += "</tr>";
            }
            html += "</tr>";
            html = html + "<tr><td>" + "合计" + "</td>" + "<td></td><td></td><td></td><td></td>" + "<td>" + parseInt(result.rows[result.rows.length - 1].po2_number) + "</td>" + "<td></td><td></td><td></td><td></td>" +
                "<td>" + millon(result.rows[result.rows.length - 1].po2_ocurrencyamount) + "</td><td>" + millon(result.rows[result.rows.length - 1].po2_dcurrencyamount) + "</td><td></td><td></td></tr>";
            $('#DivPrint').html(html);
            return true;
        }
    }
}

/*----------------------------------------------------------打印--------------------------------------------------*/
function btnPrint() {
    var bool = PrintDetailGrid(m_url);
    if (bool) {
        $('#DivPrint').jqprint();
    }

}


/*----------------------------------------------------------导出--------------------------------------------------*/
function exportToExcel(tableid) {

    var bool = PrintDetailGrid(m_url);
    if (bool) {
        var curTbl = document.getElementById(tableid);
        var myRows = curTbl.rows.length;
        var oXL;
        if (navigator.userAgent.indexOf('MSIE') > -1 || navigator.userAgent.indexOf('Trident') > -1) {   //ie浏览器
            try {
                oXL = new ActiveXObject("Excel.Application"); //创建AX对象excel 
            } catch (e) {
                alert("无法启动Excel!\n\n如果您确信您的电脑中已经安装了Excel，" + "那么请使用IE浏览器并调整IE的安全级别。\n\n具体操作：\n\n" + "工具 → Internet选项 → 安全 → 自定义级别 → 对没有标记为安全的ActiveX进行初始化和脚本运行 → 启用");
                return false;
            }
            var oWB = oXL.Workbooks.Add(); //获取workbook对象
            var oSheet = oWB.ActiveSheet;//激活当前sheet 

            var sel = document.body.createTextRange();
            sel.moveToElementText(curTbl); //把表格中的内容移到TextRange中
            sel.select(); //全选TextRange中内容 
            sel.execCommand("Copy");//复制TextRange中内容 
            oSheet.Paste();//粘贴到活动的EXCEL中
            oXL.Visible = true; //设置excel可见属性
            oSheet.Range("A1", "N1").Font.Bold = true;
            oSheet.Range("A1", "N1").Font.Size = 20;
            oSheet.Rows(5 + ":" + myRows + 1).Font.Name = "Arial Unicode MS";
            oSheet.Rows(5 + ":" + myRows + 1).Font.Size = 10;
            oSheet.Rows(5).RowHeight = 30;
            oSheet.Range("K6", "K" + myRows + 1).NumberFormatLocal = "#,##0.00";
            oSheet.Range("L6", "L" + myRows + 1).NumberFormatLocal = "#,##0.00";
            oSheet.Range("I6", "I" + myRows).NumberFormatLocal = "#,##0.00";
            oSheet.Range("J6", "J" + myRows).NumberFormatLocal = "#,##0.00";
            oSheet.Range("I" + myRows, "I" + myRows + 1).NumberFormatLocal = "@";
            oSheet.Range("J" + myRows, "J" + myRows + 1).NumberFormatLocal = "@";
            oSheet.Range("I" + myRows, "I" + myRows + 1).value = "";
            oSheet.Range("J" + myRows, "J" + myRows + 1).value = "";
            oSheet.Columns(4).ColumnWidth = 12;
            oSheet.Columns(5).NumberFormatLocal = "@";
            oSheet.Columns(5).VerticalAlignment = 2;
            oSheet.Columns(13).ColumnWidth = 15;
            oXL.UserControl = true;
            var fname = oXL.Application.GetSaveAsFilename("采购单汇总表", "Excel Spreadsheets (*.xlsx), *.xlsx");
            oWB.SaveAs(fname);
            oWB.Close();
            oXL.Quit();
        }
        else {   //非IE浏览器
            window.open('data:application/vnd.ms-excel,' + encodeURIComponent($('div[id$=DivPODetail]').html()));
        }
    }
}


//数字转换成带有千分位
function millon(myNum) {
    var s = parseFloat(myNum);
    //获取小数型数据
    s += "";
    if (s.indexOf(".") == -1) s += ".0";
    //如果没有小数点，在后面补个小数点和0
    if (/\.\d$/.test(s)) s += "0";
    //正则判断
    while (/\d{4}(\.|,)/.test(s))
        //符合条件则进行替换
        s = s.replace(/(\d)(\d{3}(\.|,))/, "$1,$2");
    //每隔3位添加一个，
    return s;
}