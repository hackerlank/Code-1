﻿/// JS名：Brand.js
/// 说明：品牌维护
/// 创建人：郭琦琦 
/// 创建日期：2014-06-06

///修改人:刘洪
///修改内容:注释掉所有与供应商相关的字段
///修改时间:2014-11-08

var m_br1_state = [{ "id": "20", "text": "正常" }, { "id": "99", "text": "禁用" }];

$(function () {

/*--------------------------------------------------注释-------------------------------------------------------------
    //加载供应商编号下拉支持模糊查询
    $('#formBrand #txtbr1_suppliercode').combogrid({
        panelWidth: 200,
        url: GetWSRRURL('d15d8c7d-4eb5-47c8-a2ba-fe3b95bb811b') + "&XML=" + GetFormJson([], 'SupplierInfo'),
        idField: 'sp1_suppliercode',
        textField: 'sp1_name',
        mode: 'remote',
        required: true,
        columns: [[
                { field: 'sp1_suppliercode', title: '供应商编号', width: 80 },
                { field: 'sp1_name', title: '供应商简称', width: 80 }
        ]],
        onSelect: function (rowIndex, rowData) {
            var sp1_name = rowData['sp1_name'];
            $('#txtbr1_suppliername').val(sp1_name);
        }
    });
--------------------------------------------------------------------------------------------------------------------*/
    //加载国家信息
    $('#formBrand #txtbr1_country').combogrid({
        panelWidth: 100,
        url: GetWSRRURL('93837c9f-7fba-49a6-abc2-5fc950d26ff0') + "&pagerows=20000&XML=" + GetFormJson([], 'GET') + "&Where=CT1_Code='" + "COTY" + "'",
        idField: 'ct1_options',
        textField: 'ct1_options',
        mode: 'remote',
        required: false,
        sortName: 'ct1_options', //排序字段
        columns: [[
            { field: 'ct1_options', title: '国家', width: 80 },
        ]]
    });

    //加载状态下拉
    $('#formBrand #txtbr1_state').combobox({
        valueField: 'id',
        textField: 'text',
        data: m_br1_state,
        required: true,
        panelHeight: 'auto',
        editable: false
    });
    //初始化品牌数据
    var url = GetWSRRURL('d4e5d028-bb15-4a63-a072-78cab14c3b8a') + "&XML=" + GetFormJson([], 'BrandInfoForPageList');
    initGird(url);
})

//加载数据
function initGird(url) {
    $('#tab_list').datagrid(
            {
                title: '品牌', //表格标题
                url: url,
                sortName: 'br1_lmdt', //排序字段
                idField: 'br1_id', //标识字段,主键
                width: '90%', //宽度
                height: $(document).height() - 100, //高度
                nowrap: false, //是否换行，True 就会把数据显示在一行里
                remoteSort: true, //定义是否从服务器给数据排序
                collapsible: false, //可折叠
                sortOrder: 'DESC', //排序类型
                sortable: true,
                striped: true, //True 奇偶行使用不同背景色
                singleSelect: true, //单行选择
                fit: true,
                pagination: true, //是否开启分页
                pageSize: 20, //默认一页数据条数 
                rownumbers: true,//行号
                columns: [[
                    { field: 'br1_brandcode', title: '品牌ID', width: 100, search: true, sortable: true },
                    { field: 'br1_name', title: '简称', width: 100, search: true, sortable: true },
                    { field: 'br1_desp', title: '全称', width: 100, search: true, sortable: true },
                    //注释LeeGo//{ field: 'br1_suppliercode', title: '供应商编号', width: 65, search: true, sortable: true },
                    //注释LeeGo//{ field: 'sp1_name', title: '供应商名称', width: 80, search: true, sortable: true },
                    { field: 'br1_country', title: '所属国家', width: 80, search: true, sortable: true },
                    { field: 'br1_stylename', title: '风格', width: 65, search: true, sortable: true },
                    { field: 'br1_customergroup', title: '目标群体', width: 65, search: true, sortable: true },
                    { field: 'br1_state', title: '状态', width: 65, search: true, sortable: true },
                    { field: 'br1_lmuser', title: '修改人', width: 80, search: true, sortable: true },
                    { field: 'br1_lmdt', title: '修改日期', width: 120, search: true, sortable: true }
                ]],
                toolbar: '#tab_toolbar'
            });
    var $dg = $('#tab_list');
    col = $dg.datagrid('getColumnOption', 'br1_state');
    if (col != null) {
        col.formatter = function (value) {
            return GetCommboboxText(m_br1_state, value);
        }
    }
}

//新增品牌
function addBrand() {
    $('#DivBrand').window({
        title: "品牌新增",
        top: 100,
        width: 700,
        height: 230,
        modal: true
    });
    $('#txtbr1_brandcode').val("系统自动生成");//品牌名
    $('#txtbr1_name').val("");//品牌名
    $('#txtbr1_desp').val("");//品牌简称

/*-----------------------------注释------------------------------------
    $('#txtbr1_suppliername').val("");//供应商编号
    $('#txtbr1_suppliercode').combogrid('setValue', "");//供应商名称
-------------------------------注释----------------------------------*/

    $('#txtbr1_country').combogrid('setValue', "");//国家
    $('#txtbr1_stylename').val("");//风格
    $('#txtbr1_customergroup').val("");//群体
    $('#txtbr1_state').combobox('setValue', "20");//状态
    $('#txtbr1_lmuser').val("");//更新人
    $('#txtbr1_lmdt').val("");//更新时间

    $('#txtbr1_desp').attr("disabled", false);
    $('#txtbr1_name').attr("disabled", false);
    //$('#txtbr1_desp').attr("disabled", "");

/*-----------------------------注释------------------------------------
    $('#txtbr1_suppliercode').combogrid('enable')
-------------------------------注释----------------------------------*/

    $('#formSupplier').form('validate')
}

//修改未
function editBrand() {
    var selectBrand = $('#tab_list').datagrid('getSelected')
    if (!selectBrand) {
        alert('请选择一行');
        return;
    }
    $('#DivBrand').window({
        title: "品牌修改",
        top: 100,
        width: 700,
        height: 230,
        modal: true
    });

    $('#txtbr1_brandcode').val(selectBrand.br1_brandcode);//品牌名
    $('#txtbr1_name').val(selectBrand.br1_name);//品牌名
    $('#txtbr1_desp').val(selectBrand.br1_desp);//品牌简称

    /*-----------------------------注释------------------------------------
    $('#txtbr1_suppliername').val(selectBrand.br1_suppliername);//供应商编号
    $('#txtbr1_suppliercode').combogrid('setValue', selectBrand.br1_suppliercode);//供应商名称
    -------------------------------注释----------------------------------*/

    $('#txtbr1_country').combogrid('setValue', selectBrand.br1_country);//国家
    $('#txtbr1_stylename').val(selectBrand.br1_stylename);//风格
    $('#txtbr1_customergroup').val(selectBrand.br1_customergroup);//群体
    $('#txtbr1_state').combobox('setValue', selectBrand.br1_state);//状态
    $('#txtbr1_lmuser').val(selectBrand.br1_lmuser);//更新人
    $('#txtbr1_lmdt').val(selectBrand.br1_lmdt);//更新时间
    $('#formBrand').form('validate')
    $('#txtbr1_name').attr("disabled", "disabled");
    $('#txtbr1_desp').attr("disabled", "disabled");

    /*-----------------------------注释------------------------------------
    $('#txtbr1_suppliercode').combogrid('disable')
    -------------------------------注释----------------------------------*/

    $('#formBrand').form('validate')
}

//新增修改保存操作
function formBrandSubmit(type) {
    var br1_brandcode = $('#txtbr1_brandcode').val();//品牌编号
    var br1_name = $('#txtbr1_name').val();//品牌编号
    var br1_desp = $('#txtbr1_desp').val();//品牌编号
    $('#formBrand').form('submit', {
        onSubmit: function (e) {
            if ($('#formBrand').form('validate') == false) {
                $.messager.alert("提示", "请把必填项填完！", 'error');
                return false;
            }
            $.messager.confirm('提示框', '是否确认提交', function (r) {
                if (r) {
                    var data = $('#formBrand').serializeArray();
                    data[data.length] = { "name": "txtbr1_name", "value": br1_name }
                    data[data.length] = { "name": "txtbr1_desp", "value": br1_desp }
                    data[data.length] = { "name": "txtbr1_brandcode", "value": br1_brandcode }
                    var XMLData = GetFormJson(data, 'EDIT');
                    //return;
                    $.messager.progress({ title: '请稍后', msg: '处理中' });
                    $.ajax({
                        url: GetWSRRURL('d4e5d028-bb15-4a63-a072-78cab14c3b8a'),
                        type: 'post',
                        async: true, //异步,
                        data: { "XML": XMLData },
                        success: function (result) {
                            try {
                                var result = eval("[" + result + "]");
                                if (result[0].Error) {
                                    $.messager.progress('close');
                                    $.messager.alert("系统错误", result[0].Error, 'error');
                                }
                                else if (result[0].rows[0].result == "False") {
                                    $.messager.alert("提示", result[0].rows[0].message, 'error');
                                }
                                else {
                                    $.messager.progress('close');
                                    if (type == '保存并继续新建') {
                                        addBrand();
                                    }
                                    if (type == '保存并关闭') {
                                        $('#DivBrand').window('close');
                                    }
                                    $('#tab_list').datagrid("unselectAll");
                                    $('#tab_list').datagrid("reload");
                                    $.messager.alert("提示", result[0].rows[0].message);
                                }
                            } catch (ex) {
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

function cancel() {
    $('#DivBrand').window('close');
}

//模糊查询（按照供应商名称和供应商简称）
function doSearch() {
    var searchBoxForBrand = $('#SearchBoxForBrand').searchbox('getValue');//取查询框数据
    var url = "1=1";
    if (searchBoxForBrand == "") {
        url = url
    } else {
        url += " and br1_name like '%" + searchBoxForBrand + "%' or br1_desp like '%" + searchBoxForBrand + "%' ";
    }
    url = GetWSRRURL('d4e5d028-bb15-4a63-a072-78cab14c3b8a') + "&XML=" + GetFormJson([], 'BrandInfoForPageList') + "&WHERE=" + escape(url);
    initGird(url);
}