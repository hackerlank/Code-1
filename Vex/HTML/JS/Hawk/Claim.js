﻿
//获取登录环境
var company = $.cookie("compName");
var m_user = '';
var m_warehouse = '';

$(function () {
    //渲染页面各个按钮(查询，取消，退货，换货，折扣,窗口的增加，保存，取消)
    $('#btnSearch').linkbutton({ iconCls: 'icon-search', plain: true });
    $('#btnCancel').linkbutton({ iconCls: 'icon-undo', plain: true });
    $('#btnReturn').linkbutton({ iconCls: 'icon-add', plain: true });
    $('#btnReplace').linkbutton({ iconCls: 'icon-add', plain: true });
    $('#btnDiscount').linkbutton({ iconCls: 'icon-add', plain: true });
    $('#btnAdd').linkbutton({ iconCls: 'icon-add', plain: true });
    $('#btnSave').linkbutton({ iconCls: 'icon-save', plain: true });
    $('#btnClose').linkbutton({ iconCls: 'icon-undo', plain: true });

    //获取仓库
    m_warehouse = $.ajax({
        url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "WH1_WareHouseCode", "WH1_Name") + "&XML=" + GetGetJson([], 'GetWH'),
        type: 'post',
        async: false
    });
    m_warehouse = $.parseJSON(m_warehouse.responseText);

    //获取用户名
    var htmlobj = $.ajax({
        url: GetWSRRURL('LoginName'),
        options: "JSON",
        async: false
    });
    var result = $.parseJSON(htmlobj.responseText);
    m_user = result.UserName;

    btnSearch();
})


//主界面查询按钮的方法
function btnSearch() {
    var data = $('#getCondition').serializeArray();
    XMLData = GetFormJson(data, 'GetSearch');
    initGird(XMLData);
}

//获取主界面DataGrid的数据
function initGird(XMLDate) {
    $('#tab_list').datagrid({
        url: GetWSRRURL('2c77a6d2-5c6b-406e-9010-f49fba7dafbc'),
        queryParams: { "XML": XMLDate },
        title: '索赔单列表',
        width: '90%',
        fit: true,
        striped: true,
        sortName: 'cd2_rgdt',
        sortOrder: 'desc',
        pagination: true, //是否开启分页
        pageNumber: 1, //默认索引页
        pageSize: 20, //默认一页数据条数
        rownumbers: true,
        columns: [[
            { field: 'ck', checkbox: true },
            { field: 'cd2_claimcode', title: '索赔单号' },
            { field: 'cd1_claimtype', title: '处理结果' },
            { field: 'rp2_unqualifieddesp', title: '不合格原因' },
            { field: 'cd1_rp1_receiptcode', title: '收货单号' },
            { field: 'sp1_name', title: '供应商名称' },
            { field: 'po2_pd1_supperierstyle', title: '供应商款号' },
            { field: 'po2_pd1_supperiercolor', title: '供应商颜色' },
            { field: 'po2_pd1_supperiersize', title: '供应商尺码' },
            { field: 'cd2_pd1_productcode', title: 'SKU' },
            { field: 'cd2_number', title: '索赔数量' },
            { field: 'cd2_lmuser', title: '索赔处理人' },
            { field: 'cd2_lmdt', title: '索赔处理日期' }
        ]]
    });
}

//退货按钮的提发方法
function btnReturn() {
    if (GetRowsIsOK()) {
        var getRows = $('#tab_list').datagrid('getChecked');
        $("#winReturn").window('open');

        $('#txtWarehouse').combobox({
            url: GetComboxWSRRURL('7ea4d40d-02fa-43cf-ae3c-8231943f8124', "", "WH1_WareHouseCode", "WH1_Name") + "&XML=" + GetGetJson([], 'GetWH'),
            required: true,
            type: 'post',
            editable: false,
            valueField: 'id',
            textField: 'text',
            panelHeight: 120
        });
        //初始化按钮
        $('#btnReturnSave').bind('click', function () {
            
            //获取选中的仓库
            var wareHouse = $('#txtWarehouse').combobox('getValue');
            $('#winReturn').window('close');
            if (wareHouse == '') {
                $.messager.alert('提示', '请选择退货仓库', 'warning');
            } else {

                for (var i = 0; i < getRows.length; i++) {
                    if (getRows[i].cd2_state == '15') {
                        getRows[i].RT1_RetreatWareHouse = wareHouse;
                    }
                    else {
                        $.messager.alert('提示', getRows[i].cd2_claimcode + '不允许操作', 'warning');
                        return false;
                    }
                }

                var XMLData = GetGetJson(getRows, "Return");

                sumbitReturn(XMLData);
            }

        });
    }
    else {
        alert("不允许退货.");
        return false;
    }
}

//退货保存
function sumbitReturn(XMLData) {
    $.ajax({
        url: GetWSRRURL('2c77a6d2-5c6b-406e-9010-f49fba7dafbc'),
        type: 'post',
        async: false, //同步,
        data: { "XML": XMLData },
        success: function (result) {
            try {
                var result = eval("[" + result + "]");

                if (result[0].Error) {
                    $.messager.progress('close');

                    $.messager.alert("系统错误", result[0].Error, 'error');
                }
                else
                    if (result[0].rows[0].result == "False") {
                        $.messager.progress('close');

                        $.messager.alert("提示", result[0].rows[0].message, 'error');
                    }
                    else {
                        $("#winWH").window("close");
                        $.messager.alert("提示", result[0].rows[0].message);
                        ClearGrid("#tab_list");
                        btnSearch();
                    }
            }
            catch (ex) {
                $.messager.progress('close');
                $.messager.alert("提示", ex, 'error');
            }
        },
        error: function () {
            $.messager.alert("提示", "退货错误了！", 'error');
        }
    });
}

//折价
function btnDiscount() {
    if (GetRowsIsOK()) {
        var getRows = $('#tab_list').datagrid('getChecked');
        $("#winDiscount").window('open');

        $('#txtDisPrice').numberbox({ required: true }).numberbox('clear');
        //收货仓库
        $('#txtGetWareHouse').combobox({
            data: m_warehouse,
            required: true,
            type: 'post',
            editable: false,
            valueField: 'id',
            textField: 'text',
            panelHeight: 120
        });
        //退货仓库
        $('#txtGetReturn').combobox({
            data: m_warehouse,
            required: true,
            type: 'post',
            editable: false,
            valueField: 'id',
            textField: 'text',
            panelHeight: 120
        });

        //初始化按钮
        $('#btnDiscountSave').bind('click', function () {
            
            //获取选中的仓库
            var discount = $('#txtDisPrice').numberbox('getValue');
            var getWarehouse = $('#txtGetWareHouse').combobox('getValue');
            var GetReturn = $('#txtGetReturn').combobox('getValue');
            $("#winDiscount").window('close');

            if (discount == '' || getWarehouse == '' || GetReturn == '') {
                $.messager.alert('提示', '请填写折后单价、收货仓库、退货仓库', 'warning');
            } else {
                $.messager.progress({ title: '请稍后', msg: '处理中' });
                var errorCDcode = ''; //没有执行成功的索赔单号
                //循环调用接口 做折价处理
                for (var i = 0; i < getRows.length; i++) {
                    var data = [];
                    data[data.length] = { "name": "txt模块", "value": "ConcessionReceive" };
                    data[data.length] = { "name": "txt操作类型", "value": "UPDATE" };
                    data[data.length] = { "name": "txtDIVI", "value": getRows[i].cd2_divi };
                    data[data.length] = { "name": "txtCONO", "value": getRows[i].cd2_cono };
                    data[data.length] = { "name": "txt退货仓库", "value": GetReturn };
                    data[data.length] = { "name": "txt收货仓库", "value": getWarehouse };
                    data[data.length] = { "name": "txt合格库位", "value": "W03" };
                    data[data.length] = { "name": "txt合格储位", "value": "E12001" };
                    data[data.length] = { "name": "txt索赔单号", "value": getRows[i].cd2_claimcode };
                    data[data.length] = { "name": "txt原采购单价", "value": getRows[i].cd2_po2_ocurrencyprice };
                    data[data.length] = { "name": "txt折后采购单价", "value": discount };
                    data[data.length] = { "name": "txt操作员", "value": m_user };

                    //调用后台API
                    var XMLData = GetDBFrameAML(data);
                    $.ajax({
                        url: GetWSRRURL('c8b84f5d-4170-4af0-9bb1-97279257af65') + XMLData,
                        type: 'post',
                        async: false, //异步
                        success: function (result) {
                            try {
                                var result = eval("[" + result + "]");

                                if (result[0].rows[0].result != "3") {
                                    errorCDcode += ' ' + getRows[i].cd2_claimcode;
                                }
                            }
                            catch (ex) {
                                errorCDcode += ' ' + getRows[i].cd2_claimcode;
                            }
                        },
                        error: function () {
                            errorCDcode += ' ' + getRows[i].cd2_claimcode;
                        }
                    });
                }
                $.messager.progress('close');
                if (errorCDcode.length > 0) {
                    $.messager.alert('操作结果', '以下索赔单执行失败:' + errorCDcode, 'warning');
                    $('#tab_list').datagrid('reload');
                    return false;
                }
                else {
                    $.messager.alert('操作结果', '操作成功!', 'warning');
                    $('#tab_list').datagrid('reload');
                    return false;
                }

            }

        });
    }
}

//换货
function btnReplace() {
    if (GetRowsIsOK()) {
        var getRows = $('#tab_list').datagrid('getChecked');
        $("#winReplace").window('open');

        $('#txtRplSKU').val('');
        $('#txtReturn').combobox({
            data: m_warehouse,
            required: true,
            type: 'post',
            editable: false,
            valueField: 'id',
            textField: 'text',
            panelHeight: 120
        });

        //初始化按钮
        $('#btnReplaceSave').bind('click', function () {
            
            //获取选中的仓库
            //var sku = $('#txtRplSKU').val();
            var warehouse = $('#txtReturn').combobox('getValue');

            $("#winReplace").window('close');
            if (warehouse == '') {
                $.messager.alert('提示', '请填写退货仓库', 'warning');
            } else {
                $.messager.progress({ title: '请稍后', msg: '处理中' });
                var errorCDcode = ''; //没有执行成功的索赔单号
                //循环调用接口 做折价处理
                for (var i = 0; i < getRows.length; i++) {
                    var sku = getRows[i].cd2_pd1_productcode;
                    var skuData = '<Root><List><Rows><SKU>' + sku + '</SKU><NUM>1</NUM></Rows></List></Root>';
                    var data = [];
                    data[data.length] = { "name": "txt模块", "value": "Alternative" };
                    data[data.length] = { "name": "txt操作类型", "value": "UPDATE" };
                    data[data.length] = { "name": "txtDIVI", "value": getRows[i].cd2_divi };
                    data[data.length] = { "name": "txtCONO", "value": getRows[i].cd2_cono };
                    data[data.length] = { "name": "txt退货仓库", "value": warehouse };
                    data[data.length] = { "name": "txt合格库位", "value": "W03" };
                    data[data.length] = { "name": "txt合格储位", "value": "E13001" };
                    data[data.length] = { "name": "txt索赔单号", "value": getRows[i].cd2_claimcode };
                    data[data.length] = { "name": "txt款式列表", "value": skuData };
                    data[data.length] = { "name": "txt原采购单价", "value": getRows[i].cd2_po2_ocurrencyprice };
                    data[data.length] = { "name": "txt折后采购单价", "value": '' };
                    data[data.length] = { "name": "txt操作员", "value": m_user };

                    //调用后台API
                    var XMLData = GetDBFrameAML(data);
                    $.ajax({
                        url: GetWSRRURL('c8b84f5d-4170-4af0-9bb1-97279257af65') + XMLData,
                        type: 'post',
                        async: false, //同步
                        success: function (result) {
                            try {
                                var result = eval("[" + result + "]");

                                if (result[0].rows[0].result != "3") {
                                    errorCDcode += ' ' + getRows[i].cd2_claimcode;
                                }

                            }
                            catch (ex) {
                                errorCDcode += ' ' + getRows[i].cd2_claimcode;
                            }
                        },
                        error: function () {
                            errorCDcode += ' ' + getRows[i].cd2_claimcode;
                        }
                    });
                }
                $.messager.progress('close');
                if (errorCDcode != '') {
                    $.messager.alert('操作结果', '以下索赔单执行失败:' + errorCDcode, 'warning');
                    $('#tab_list').datagrid('reload');
                    return false;
                }
                else {
                    $.messager.alert('操作结果', '操作成功!', 'warning');
                    $('#tab_list').datagrid('reload');
                    return false;
                }
            }

        });
    }
}


//判断是否选择行,判断选中行是否已处理
function GetRowsIsOK() {
    var getRows = $('#tab_list').datagrid('getChecked');
    if (getRows.length > 0) {
        for (var i = 0; i < getRows.length; i++) {
            if (getRows[i].cd2_state == '20') {
                return false;
            }
        }
        return true;
    }
    else {
        return false;
    }
}
