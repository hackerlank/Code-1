﻿/* 全局变量*/
var m_DatagridID = '#cqtxlb'; //出勤填写列表
var m_LastIndex = -1;         //最后一次选中行下标
var m_PageNumber = 1;  //当前页码
var m_PageSize = 20;  //每页显示行数

//获取用户名
var m_UserInfo = parent.m_UserInfo;
var m_taskTypes = hr_getBaseItems(3);
var m_states = hr_getBaseItems(2);
var m_actors = hr_getBaseItems(1);

var m_Filter = '';  //主的条件
var m_Filter1 = ''; //查询条件
var m_OrderBy = ''; //排序方式

var m_Flag = 31;    //考勤月份的天数

var m_MID = '';     //主表ID
var m_ShopID = '';  //店铺ID
var m_ShopName = '';//店铺名字
var m_ATState = ''; //当前状态
var m_ATMonth = '';   //考勤月份
var m_ApproveID = '';   //待办ID

//考勤标记
var m_MarkType = [{ markid: '√', marktext: '出勤 √' }, { markid: '/', marktext: '休息 /' }, { markid: '╳', marktext: '旷工 ╳' }, { markid: 'C', marktext: '事假 C' }, { markid: 'S', marktext: '病假 S' }, { markid: 'M', marktext: '婚假 M' }, { markid: 'B', marktext: '产假 B' }, { markid: 'D', marktext: '丧假 D' }, { markid: 'Y', marktext: '年休 Y' }, { markid: 'L', marktext: '离职 L' }, { markid: '', marktext: '调出/未调入' }];
//var m_MarkType = [{ markid: '√', marktext: '√' }, { markid: '/', marktext: '/' }, { markid: '╳', marktext: '╳' }, { markid: 'C', marktext: 'C' }, { markid: 'S', marktext: 'S' }, { markid: 'M', marktext: 'M' }, { markid: 'B', marktext: 'B' }, { markid: 'D', marktext: 'D' }, { markid: 'Y', marktext: 'Y' }, { markid: 'L', marktext: 'L' }, { markid: ' ', marktext: ' ' }];


/***********************************************************************
  *  初始化
  *  DLY 
  */
$(function () {
    // 滚动条居顶
    parent.sc();

    //用户认证
    if (m_UserInfo == undefined || m_UserInfo.userName == undefined) {
        top.location.href = 'error.html';
        return;
    }
    var type = dataUtil_undefinedOrNull(basedata_getUrlParam("v0"), '');
    m_MID = dataUtil_undefinedOrNull(basedata_getUrlParam("v1"), '');

    //初始化列表
    if (type == 'new') {  // 新建
        m_ShopID = m_UserInfo.deptID;
        m_ShopName = m_UserInfo.deptName;
        //获取当前月份
        m_ATMonth = dateUtil_getMonthByDay('', '-', '5').substring(0, 7);
        m_Flag = dateUtil_DayNumOfMonth(m_ATMonth.substring(0, 4), m_ATMonth.substring(5, 7));
        m_ApproveID = dataUtil_undefinedOrNull(basedata_getUrlParam("v2"), '');
        $('#shopname').html(m_ShopName);
        $('#month').html(m_ATMonth);
        controlTools(2);  // 无提交按钮，保存后生成待办
        setDataGrid(1);
        actLoadDataNew(1, 10000);
    }
    else {   //待办     
        //根据主表ID获取当前考勤主信息
        var cons = ' AND  HR11_ID= \'' + m_MID + '\'';
        var res = hr_getAttendanceInfo(cons, 1, 1, '');
        if (res == '') {
            alert('主表信息获取失败!');
            return;
        }
        var zrow = res.rows[0];
        m_ATState = zrow.hr11_state;
        m_ATMonth = zrow.hr11_atmonth;
        m_ShopID = zrow.hr11_shopid;
        m_ShopName = zrow.hr11_shopname;
        m_Flag = dateUtil_DayNumOfMonth(m_ATMonth.substring(0, 4), m_ATMonth.substring(5, 7));
        $('#shopname').html(m_ShopName);
        $('#month').html(m_ATMonth);
        if (type == 'old') {
            controlTools(1);
            setDataGrid(0);
        }
        else if (type == 'approve') {
            if (m_ATState != '未提交') {
                controlTools(1);//全不可见 - （除汇总查询）
                setDataGrid(0);
            } else {
                controlTools(3);
                setDataGrid(1);
            }
        }
        actLoadData(m_PageNumber, m_PageSize);
    }
});


/***********************************************************************
*  加载数据（新增申请）
*  SY
*/
function actLoadDataNew(page, number) {
    $(m_DatagridID).datagrid('loadData', []);

    //查找当前店铺的员工
    var row = { type: '2', c_employeestatus: '', c_orgunitid: m_UserInfo.deptID };
    var pers = hr_getShopPers(row);

    if (pers.length <= 0) {
        alert('查询失败！');
    } else {
        var res = [];
        for (var i = 0; i < pers.length; i++) {
            res.push(initrow(pers[i], m_Flag));
        }
        $(m_DatagridID).datagrid('loadData', res);
    }
    $(m_DatagridID).datagrid("clearSelections");
}


/***********************************************************************
*  初始化默认值
*  SY 
*/
function initrow(per, days) {
    var row = {};
    row.hr12_empid = per.c_oid;
    row.hr12_empcode = per.c_code;
    row.hr12_empname = per.c_name;
    row.hr12_rgdt = dateUtil_dateFomaterA(new Date(), '-');
    row.hr12_rguser = m_UserInfo.userName;
    row.hr12_uptno = 0;
    for (var i = 1; i <= days; i++) {
        var fieldname = 'hr12_day';
        var name = (i < 10) ? ('0' + i) : i;
        fieldname = fieldname + name;
        row[fieldname] = '√';
    }
    return row;
}

/***********************************************************************
*  加载数据
*  SY 
*/
function actLoadData(page, number) {
    $(m_DatagridID).datagrid('loadData', []);

    var cons = ' AND ( HR12_MID = \'' + m_MID + '\')';
    var res = hr_getAttendanceRecord(cons, page, number, 'HR12_EmpCode');

    //alert(jsonUtil_jsonToStr(res));
    if (res == '') {
        alert('查询失败！');
    } else if (res.total > 0) {
        $(m_DatagridID).datagrid('loadData', res.rows);
    }
    $(m_DatagridID).datagrid("clearSelections");
}


/***********************************************************************
*  更新人员
*  SY
*/
function updateInfo() {
    if (m_LastIndex != -1) {
        $(m_DatagridID).datagrid('endEdit', m_LastIndex);
    }

    //查找当前店铺的员工
    var row = { type: '2', c_employeestatus: '', c_orgunitid: m_UserInfo.deptID };
    var pers = hr_getShopPers(row);

    //获取当前显示的店铺员工信息
    var datarows = $(m_DatagridID).datagrid('getRows');

    //记录是否需要追加店铺员工
    var flag = false;
    for (var i = 0; i < pers.length; i++) {
        var per = {};
        var flag1 = false;
        //遍历是否已存在该员工的考勤
        for (var j = 0; j < datarows.length; j++) {
            if (('' + pers[i].c_code) == datarows[j].hr12_empcode) {
                flag1 = true;
                break;
            }
        }
        if (!flag1) {
            per = initrow(pers[i], m_Flag);
            $(m_DatagridID).datagrid('appendRow', per);
            flag = true;
        }
    }
    if (!flag) {
        alert('人员信息已是最新！');
    }
    $(m_DatagridID).datagrid("clearSelections");
}


/***********************************************************************
*  保存
*  SY 
*/
function actSave() {
    if (m_LastIndex != -1) {
        $(m_DatagridID).datagrid('endEdit', m_LastIndex);
    }
    //获取明细 
    var dataRows = $(m_DatagridID).datagrid('getRows');

    //校验
    if (m_UserInfo.empCode1 == undefined) {
        alert('未获取到店铺对于大区经理配置，请截图联系系统管理员！');
        return flag;
    }
    if (m_UserInfo.empCode2 == undefined) {
        alert('未获取到公司对于人资负责人配置，请截图联系系统管理员！');
        return flag;
    }

    var type = dataUtil_undefinedOrNull(basedata_getUrlParam("v0"), '');
    var zrow = {}; //主信息
    var cXMLd = '';
    //新建申请
    if (type == 'new') {
        var inserted = [];
        zrow.hr11_id = m_MID
        zrow.hr11_shopid = m_ShopID;
        zrow.hr11_shopname = m_ShopName;
        zrow.hr11_atmonth = m_ATMonth;
        zrow.hr11_state = '未提交';
        zrow.hr11_rgdt = dateUtil_dateFomaterA(new Date(), '-');;
        zrow.hr11_rguser = m_UserInfo.userName;
        zrow.hr11_uptno = 0;

        inserted.push(zrow);
        cXMLd = GetEditJson(inserted, [], []);//json转xml
        //保存主表
        var flag = hr_saveAttendanceInfo(cXMLd, m_UserInfo.userName);
        if (!flag) {
            alert('保存考勤主信息失败！')
            return;
        }

        //生成任务行
        var arow = {};
        arow.hr3_id = m_ApproveID;
        arow.hr3_rid = m_MID;
        arow.hr3_type = m_taskTypes[5].value;
        arow.hr3_subject = m_UserInfo.deptName + '(' + $('#month').html() + ') - ' + m_taskTypes[5].value;
        arow.hr3_state = m_states[0].value;
        arow.hr3_rguser = m_UserInfo.userName;
        arow.hr3_actor = m_actors[0].value;
        arow.hr3_perid = m_UserInfo.deptID;
        arow.hr3_perid1 = m_UserInfo.empCode1;
        arow.hr3_perid2 = m_UserInfo.empCode2;
        arow.hr3_rgdt = dateUtil_dateFomaterA(new Date(), '-');
        arow.hr3_uptno = 0;
        arow.hr3_com = m_UserInfo.selfInfo.c_orgid;

        flag = hr_saveTask('N', arow, m_UserInfo.userName);
        if (!flag) {
            alert('生成待办任务失败！')
            return;
        }

        //明细信息
        for (var i = 0; i < dataRows.length; i++) {
            dataRows[i].hr12_id = dataUtil_NewGuid();
            dataRows[i].hr12_mid = m_MID;
            var result = getHZInfo(dataRows[i]);
            dataRows[i].hr12_attendance = result.attendance;
            dataRows[i].hr12_rest = result.rest;
            dataRows[i].hr12_absence = result.absence;
            dataRows[i].hr12_casualleave = result.casualleave;
            dataRows[i].hr12_sickleave = result.sickleave;
            dataRows[i].hr12_marriageleave = result.marriageleave;
            dataRows[i].hr12_maternityleave = result.maternityleave;
            dataRows[i].hr12_bereavementleave = result.bereavementleave;
            dataRows[i].hr12_annualleave = result.annualleave;
            dataRows[i].hr12_dimission = result.dimission;
            dataRows[i].hr12_blank = result.blank;
            dataRows[i].hr12_rgdt = dateUtil_dateFomaterA(new Date(), '-');
            dataRows[i].hr12_rguser = m_UserInfo.userName;
            dataRows[i].hr12_uptno = 0;
        }

        cXMLd = GetGetJson(dataRows, 'INSERT');//数组转xml
        //保存明细
        flag = hr_saveAttendanceRecord(cXMLd, m_UserInfo.userName);
        if (!flag) {
            alert('保存加班明细信息失败！')
            return flag;
        }

        alert('保存成功！');
        type = 'approve';

        //跳转到提交页面
        var curlo = 'checkAttendanceAdd.html?' + 'v0=' + type + '&v1=' + m_MID + '&v2=' + m_ApproveID
                     + '&s=' + dateUtil_dateFomaterA(new Date(), '-');
        parent.turnPage('B', 'tasksPage', curlo);
    } else if (type == 'approve') {
        if ($(m_DatagridID).datagrid('getChanges').length <= 0) {
            alert("没有修改信息！")
            return;
        }
        var inserted = $(m_DatagridID).datagrid('getChanges', "inserted");
        var updated = $(m_DatagridID).datagrid('getChanges', "updated");
        var deleted = $(m_DatagridID).datagrid('getChanges', "deleted");

        //保存主表
        var cons = ' AND  HR11_ID= \'' + m_MID + '\'';
        var res = hr_getAttendanceInfo(cons, 1, 1, '');
        if (res == '') {
            alert('主表信息获取失败!');
            return;
        }
        zrow = res.rows[0];
        zrow.hr11_lmdt = dateUtil_dateFomaterA(new Date(), '-');
        zrow.hr11_lmuser = m_UserInfo.userName;
        zrow.hr11_uptno++;

        var zrows = [];
        zrows.push(zrow);
        cXMLd = GetEditJson([], zrows, []);//json转xml
        //保存主表
        var flag = hr_saveAttendanceInfo(cXMLd, m_UserInfo.userName);
        if (!flag) {
            alert('保存加班主信息失败！')
            return;
        }

        for (var i = 0; i < inserted.length; i++) {
            inserted[i].hr12_id = dataUtil_NewGuid();
            inserted[i].hr12_mid = m_MID;
            //明细信息
            var result = getHZInfo(inserted[i]);
            inserted[i].hr12_attendance = result.attendance;
            inserted[i].hr12_rest = result.rest;
            inserted[i].hr12_absence = result.absence;
            inserted[i].hr12_casualleave = result.casualleave;
            inserted[i].hr12_sickleave = result.sickleave;
            inserted[i].hr12_marriageleave = result.marriageleave;
            inserted[i].hr12_maternityleave = result.maternityleave;
            inserted[i].hr12_bereavementleave = result.bereavementleave;
            inserted[i].hr12_annualleave = result.annualleave;
            inserted[i].hr12_dimission = result.dimission;
            inserted[i].hr12_blank = result.blank;
            inserted[i].hr12_rgdt = dateUtil_dateFomaterA(new Date(), '-');
            inserted[i].hr12_rguser = m_UserInfo.userName;
            inserted[i].hr12_uptno = 0;
        }

        for (var i = 0; i < updated.length; i++) {
            //明细信息
            var result = getHZInfo(updated[i]);
            updated[i].hr12_attendance = result.attendance;
            updated[i].hr12_rest = result.rest;
            updated[i].hr12_absence = result.absence;
            updated[i].hr12_casualleave = result.casualleave;
            updated[i].hr12_sickleave = result.sickleave;
            updated[i].hr12_marriageleave = result.marriageleave;
            updated[i].hr12_maternityleave = result.maternityleave;
            updated[i].hr12_bereavementleave = result.bereavementleave;
            updated[i].hr12_annualleave = result.annualleave;
            updated[i].hr12_dimission = result.dimission;
            updated[i].hr12_blank = result.blank;
            updated[i].hr12_lmdt = dateUtil_dateFomaterA(new Date(), '-');
            updated[i].hr12_lmuser = m_UserInfo.userName;
            updated[i].hr12_uptno = 1 + parseInt(updated[i].hr12_uptno);
        }

        //保存明细

        cXMLd = GetEditJson(inserted, updated, deleted);//json转xml
        //保存明细
        flag = hr_saveAttendanceRecord(cXMLd, m_UserInfo.userName);
        if (!flag) {
            alert('保存加班明细信息失败！')
            return;
        }

        actLoadData(1, m_PageSize);
        alert('保存成功！');
    }
}


/***********************************************************************
*  流程  店长——大区经理——人资
*  DLY 
*/
function actApprove() {
    if (m_LastIndex != -1) {
        $(m_DatagridID).datagrid('endEdit', m_LastIndex);
    }
    //数据修改校验 
    if ($(m_DatagridID).datagrid('getChanges').length > 0) {
        alert('数据已修改，请先保存！');
        return;
    }

    //待办校验 
    var taskid = dataUtil_undefinedOrNull(basedata_getUrlParam("v2"), '');
    if (taskid == '') {
        alert('任务ID无效，请截全屏图发给系统管理员！');
        return;
    }

    var cons = ' AND  HR3_ID= \'' + taskid + '\'';
    var res = hr_getTask(cons);
    if (res == '1') {
        alert('未找到对应待办任务，请截全屏图发给系统管理员！');
        return;
    } else if (res.hr3_id != undefined && res.hr3_id != '') {
        if (res.hr3_state != m_ATState) {
            alert('该任务状态已更新，请刷新任务！');
            return;
        }
    } else {
        alert('待办任务信息获取失败，请截全屏图发给系统管理员！');
        return;
    }


    //审批操作——提交
    var actinfo = '';
    actinfo = '提交';
    $.messager.confirm('确认框', '确认' + actinfo + '该考勤申请吗？', function (r) {
        if (r) {
            var actT = dateUtil_dateFomaterA(new Date(), '-');
            res.hr3_comment = res.hr3_comment + '店长：' + m_UserInfo.userName + ' ' + actT + actinfo + 'rrbrrr';
            res.hr3_state = '经理待批';
            res.hr3_actor = '经理';

            //修改任务信息  
            var flag = hr_saveTask('U', res, m_UserInfo.userName);
            if (!flag) {
                alert(actinfo + '失败，请截全屏图发给系统管理员！')
                return flag;
            }
            //修改主表状态 
            var zrow = {};
            var cons = ' AND  HR11_ID= \'' + m_MID + '\'';
            var zrows = hr_getAttendanceInfo(cons, 1, 1, '');
            if (zrows == '') {
                alert('主表信息获取失败！');
                return;
            }
            zrow = zrows.rows[0]
            zrow.hr11_state = res.hr3_state;
            zrow.hr11_lmdt = dateUtil_dateFomaterA(new Date(), '-');
            zrow.hr11_lmuser = m_UserInfo.userName;
            zrow.hr11_uptno++;
            zrows = [];
            zrows.push(zrow);
            var cXMLd = GetEditJson([], zrows, []);//json转xml
            //保存主表
            var flag = hr_saveAttendanceInfo(cXMLd, m_UserInfo.userName);

            if (!flag) {
                alert('回写考勤主信息失败，请截全屏图发给系统管理员！')
                return flag;
            }
            alert(actinfo + '成功！');
            parent.turnPage('A', 'tasks', '');
        }
    });
}


/***********************************************************************
*  获得汇总
*  SY 
*/
function getHZInfo(row) {
    $(m_DatagridID).datagrid('endEdit', m_LastIndex);

    var result = {
        empcode: '', empname: '', attendance: 0, rest: 0, absence: 0,
        casualleave: 0, sickleave: 0, marriageleave: 0, maternityleave: 0,
        bereavementleave: 0, annualleave: 0, dimission: 0, blank: 0
    };

    //汇总
    if (row != '') {
        result.empcode = row.hr12_empcode;
        result.empname = row.hr12_empname;
        for (var i = 1; i <= m_Flag ; i++) {
            var fieldname = 'hr12_day';
            var name = (i < 10) ? ('0' + i) : i;
            fieldname = fieldname + name;
            //统计信息
            if (row[fieldname] == '√') {
                result.attendance++;
            } else if (row[fieldname] == '/') {
                result.rest++;
            } else if (row[fieldname] == '╳') {
                result.absence++;
            } else if (row[fieldname] == 'C') {
                result.casualleave++;
            } else if (row[fieldname] == 'S') {
                result.sickleave++;
            } else if (row[fieldname] == 'M') {
                result.marriageleave++;
            } else if (row[fieldname] == 'B') {
                result.maternityleave++;
            } else if (row[fieldname] == 'D') {
                result.bereavementleave++;
            } else if (row[fieldname] == 'Y') {
                result.annualleave++;
            } else if (row[fieldname] == 'L') {
                result.dimission++;
            } else {
                result.blank++;
            }
        }
    } else {
        alert('该记录未填写！');
    }
    return result;
}


/***********************************************************************
*  设置汇总
*  SY
*/
function setHZInfo() {
    $(m_DatagridID).datagrid('endEdit', m_LastIndex);
    $('#hzInfodlg').dialog('open');
    var rows = $(m_DatagridID).datagrid('getRows');
    var info = [];
    for (var i = 0; i < rows.length; i++) {
        var result = getHZInfo(rows[i]);
        info.push(result);
    }
    var hzinfo = '<table style="width:600px; margin-left:20px;margin-top:10px;">';
    hzinfo = hzinfo + '<tr><td>工 号</td><td>姓 名</td>'
                    + '<td align="center">出 勤</td><td align="center">休 息</td>'
                    + '<td align="center">旷 工</td><td align="center">事 假</td>'
                    + '<td align="center">病 假</td><td align="center">婚 假</td>'
                    + '<td align="center">产 假</td><td align="center">丧 假</td>'
                    + '<td align="center">年 休</td><td align="center">离 职</td>'
                    + '<td align="center">空白</td></tr>';
    //计算总数
    var footer = {
        attendance: 0, rest: 0, absence: 0, casualleave: 0, sickleave: 0, marriageleave: 0,
        maternityleave: 0, bereavementleave: 0, annualleave: 0, dimission: 0, blank: 0
    };
    for (var j = 0; j < info.length; j++) {
        footer.attendance += info[j].attendance;
        footer.rest += info[j].rest;
        footer.absence += info[j].absence;
        footer.casualleave += info[j].casualleave;
        footer.sickleave += info[j].sickleave;
        footer.marriageleave += info[j].marriageleave;
        footer.maternityleave += info[j].maternityleave;
        footer.bereavementleave += info[j].bereavementleave;
        footer.annualleave += info[j].annualleave;
        footer.dimission += info[j].dimission;
        footer.blank += info[j].blank;
        hzinfo = hzinfo + '<tr>';
        hzinfo = hzinfo + '<td>' + info[j].empcode + '</td>';
        hzinfo = hzinfo + '<td>' + info[j].empname + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].attendance + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].rest + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].absence + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].casualleave + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].sickleave + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].marriageleave + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].maternityleave + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].bereavementleave + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].annualleave + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].dimission + '</td>';
        hzinfo = hzinfo + '<td align="center">' + info[j].blank + '</td></tr>';
    }
    hzinfo = hzinfo + '<tr>';
    hzinfo = hzinfo + '<td></td>';
    hzinfo = hzinfo + '<td><font color="red">合 计</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.attendance + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.rest + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.absence + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.casualleave + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.sickleave + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.marriageleave + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.maternityleave + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.bereavementleave + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.annualleave + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.dimission + '</font></td>';
    hzinfo = hzinfo + '<td align="center"><font color="red">' + footer.blank + '</font></td></tr>';
    hzinfo = hzinfo + '</table>';
    $('#hzInfoSpan').html(hzinfo);
}


/***********************************************************************
*  关闭
*  DLY 
*/
function actClose() {
    //var type = dataUtil_undefinedOrNull(basedata_getUrlParam("v1"), '');
    //if (type == 'task') {
    //    parent.turnPage('A', 'tasks', '');
    //} else if (type == 'list') {
    parent.turnPage('A', 'checkAttendance', '');
    //}
}


/***********************************************************************
*  工具条及按钮控制
*  SY 
*/
function controlTools(type) {
    if (type == 1) {    //全不可见 - （除汇总查询）
        $('#tool').show();
        $('#btnprint').show();
        $('#btnupdate').hide();
        $('#btnsave').hide();
        $('#btntj').hide();
    } else if (type == 2) { //申请人 - 新建
        $('#tool').show();
        $('#btnprint').hide();
        $('#btnupdate').show();
        $('#btnsave').show();
        $('#btntj').hide();
    } else if (type == 3) { //申请人 - 待办
        $('#tool').show();
        $('#btnprint').show();
        $('#btnupdate').show();
        $('#btnsave').show();
        $('#btntj').show();
    }
}


/***********************************************************************
*  设置列表
* SY
*/
function setDataGrid(type) {
    if (type == 1) {
        //信息列表
        $(m_DatagridID).datagrid({
            //title:'加班记录列表',
            //iconCls:'icon-save',
            width: $(document.body).width(),
            height: 420,
            nowrap: true,
            striped: true,
            collapsible: true,
            //url:'mroomlist.action',
            sortName: 'hr12_empcode',
            sortOrder: 'asc',
            remoteSort: false,
            idField: 'hr12_id',
            frozenColumns: [[
                { field: 'hr12_id', title: 'ID', width: 80, hidden: true },
                { field: 'hr12_mid', title: 'MID', width: 80, hidden: true },
                { field: 'hr12_empid', title: '员工号', width: 80, hidden: true },
                { field: 'hr12_empcode', title: '工号', width: 70, align: 'center' },
                { field: 'hr12_empname', title: '姓名', width: 65, align: 'center' },
            ]],
            columns: [[
                {
                    field: 'hr12_day01', title: '1', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day02', title: '2', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day03', title: '3', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day04', title: '4', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day05', title: '5', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day06', title: '6', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day07', title: '7', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day08', title: '8', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day09', title: '9', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day10', title: '10', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day11', title: '11', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day12', title: '12', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day13', title: '13', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day14', title: '14', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day15', title: '15', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day16', title: '16', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day17', title: '17', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day18', title: '18', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day19', title: '19', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day20', title: '20', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day21', title: '21', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day22', title: '22', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day23', title: '23', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day24', title: '24', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day25', title: '25', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day26', title: '26', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day27', title: '27', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day28', title: '28', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day29', title: '29', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day30', title: '30', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                {
                    field: 'hr12_day31', title: '31', width: 45, align: 'center', editor: {
                        type: 'combobox', options: {
                            valueField: 'markid', textField: 'marktext',
                            editable: false, panelHeight: "250", panelWidth: 75,
                            multiple: false, data: m_MarkType
                        }
                    }
                },
                { field: 'hr12_attendance', title: '出勤', width: 80, hidden: true },
                { field: 'hr12_rest', title: '休息', width: 80, hidden: true },
                { field: 'hr12_absence', title: '旷工', width: 80, hidden: true },
                { field: 'hr12_casualleave', title: '事假', width: 80, hidden: true },
                { field: 'hr12_sickleave', title: '病假', width: 80, hidden: true },
                { field: 'hr12_marriageleave', title: '婚假', width: 80, hidden: true },
                { field: 'hr12_maternityleave', title: '产假', width: 80, hidden: true },
                { field: 'hr12_bereavementleave', title: '丧假', width: 80, hidden: true },
                { field: 'hr12_annualleave', title: '年休', width: 80, hidden: true },
                { field: 'hr12_dimission', title: '离职', width: 80, hidden: true },
                { field: 'hr12_blank', title: '空白', width: 80, hidden: true },
                { field: 'hr12_rgdt', title: '创建时间', width: 80, hidden: true },
                { field: 'hr12_rguser', title: '创建人', width: 80, hidden: true },
                { field: 'hr12_lmdt', title: '修改时间', width: 80, hidden: true },
                { field: 'hr12_lmuser', title: '修改人', width: 80, hidden: true },
                { field: 'hr12_uptno', title: '修改次数', width: 80, hidden: true }
            ]],
            rownumbers: true,
            singleSelect: true,
            //onRowContextMenu:onRowContextMenu,
            onDblClickRow: function (rowIndex) {
            },
            onClickRow: function (rowIndex) {
            },
            onDblClickCell: function (index, field, value) {
            },
            onClickCell: function (index, field) {
                if (m_LastIndex != -1) {
                    if ($(m_DatagridID).datagrid('validateRow', m_LastIndex)) {
                        $(m_DatagridID).datagrid('endEdit', m_LastIndex);
                        m_LastIndex = -1;
                    }
                }

                $(m_DatagridID).datagrid('selectRow', index)
                        .datagrid('editCell', { index: index, field: field });
                m_LastIndex = index;

            }
        });
    }
    else {
        //信息列表
        $(m_DatagridID).datagrid({
            //title:'加班记录列表',
            //iconCls:'icon-save',
            width: $(document.body).width(),
            height: 420,
            nowrap: true,
            striped: true,
            collapsible: true,
            //url:'mroomlist.action',
            sortName: 'hr12_empcode',
            sortOrder: 'asc',
            remoteSort: false,
            idField: 'hr12_id',
            frozenColumns: [[
                //{field:'ck',checkbox:true},
                { field: 'hr12_id', title: 'ID', width: 80, hidden: true },
                { field: 'hr12_mid', title: 'MID', width: 80, hidden: true },
                { field: 'hr12_empid', title: '员工号', width: 80, hidden: true },
                { field: 'hr12_empcode', title: '工号', width: 70, align: 'center' },
                { field: 'hr12_empname', title: '姓名', width: 65, align: 'center' },
            ]],
            columns: [[
                { field: 'hr12_day01', title: '1', width: 45, align: 'center' },
                { field: 'hr12_day02', title: '2', width: 45, align: 'center' },
                { field: 'hr12_day03', title: '3', width: 45, align: 'center' },
                { field: 'hr12_day04', title: '4', width: 45, align: 'center' },
                { field: 'hr12_day05', title: '5', width: 45, align: 'center' },
                { field: 'hr12_day06', title: '6', width: 45, align: 'center' },
                { field: 'hr12_day07', title: '7', width: 45, align: 'center' },
                { field: 'hr12_day08', title: '8', width: 45, align: 'center' },
                { field: 'hr12_day09', title: '9', width: 45, align: 'center' },
                { field: 'hr12_day10', title: '10', width: 45, align: 'center' },
                { field: 'hr12_day11', title: '11', width: 45, align: 'center' },
                { field: 'hr12_day12', title: '12', width: 45, align: 'center' },
                { field: 'hr12_day13', title: '13', width: 45, align: 'center' },
                { field: 'hr12_day14', title: '14', width: 45, align: 'center' },
                { field: 'hr12_day15', title: '15', width: 45, align: 'center' },
                { field: 'hr12_day16', title: '16', width: 45, align: 'center' },
                { field: 'hr12_day17', title: '17', width: 45, align: 'center' },
                { field: 'hr12_day18', title: '18', width: 45, align: 'center' },
                { field: 'hr12_day19', title: '19', width: 45, align: 'center' },
                { field: 'hr12_day20', title: '20', width: 45, align: 'center' },
                { field: 'hr12_day21', title: '21', width: 45, align: 'center' },
                { field: 'hr12_day22', title: '22', width: 45, align: 'center' },
                { field: 'hr12_day23', title: '23', width: 45, align: 'center' },
                { field: 'hr12_day24', title: '24', width: 45, align: 'center' },
                { field: 'hr12_day25', title: '25', width: 45, align: 'center' },
                { field: 'hr12_day26', title: '26', width: 45, align: 'center' },
                { field: 'hr12_day27', title: '27', width: 45, align: 'center' },
                { field: 'hr12_day28', title: '28', width: 45, align: 'center' },
                { field: 'hr12_day29', title: '29', width: 45, align: 'center' },
                { field: 'hr12_day30', title: '30', width: 45, align: 'center' },
                { field: 'hr12_day31', title: '31', width: 45, align: 'center' },
                { field: 'hr12_attendance', title: '出勤', width: 80, hidden: true },
                { field: 'hr12_rest', title: '休息', width: 80, hidden: true },
                { field: 'hr12_absence', title: '旷工', width: 80, hidden: true },
                { field: 'hr12_casualleave', title: '事假', width: 80, hidden: true },
                { field: 'hr12_sickleave', title: '病假', width: 80, hidden: true },
                { field: 'hr12_marriageleave', title: '婚假', width: 80, hidden: true },
                { field: 'hr12_maternityleave', title: '产假', width: 80, hidden: true },
                { field: 'hr12_bereavementleave', title: '丧假', width: 80, hidden: true },
                { field: 'hr12_annualleave', title: '年休', width: 80, hidden: true },
                { field: 'hr12_dimission', title: '离职', width: 80, hidden: true },
                { field: 'hr12_blank', title: '空白', width: 80, hidden: true },
                { field: 'hr12_rgdt', title: '创建时间', width: 80, hidden: true },
                { field: 'hr12_rguser', title: '创建人', width: 80, hidden: true },
                { field: 'hr12_lmdt', title: '修改时间', width: 80, hidden: true },
                { field: 'hr12_lmuser', title: '修改人', width: 80, hidden: true },
                { field: 'hr12_uptno', title: '修改次数', width: 80, hidden: true }
            ]],
            rownumbers: true,
            singleSelect: true,
            //onRowContextMenu:onRowContextMenu,
            onDblClickRow: function () {
            },
            onClickRow: function (rowIndex) {

            }
        });
    }

    //当月份的天数为30
    if (m_Flag == 30) {
        $(m_DatagridID).datagrid('hideColumn', 'hr12_day31');
    }
    //当月份的天数为29
    if (m_Flag == 29) {
        $(m_DatagridID).datagrid('hideColumn', 'hr12_day30');
        $(m_DatagridID).datagrid('hideColumn', 'hr12_day31');
    }
    //当月份的天数为28
    if (m_Flag == 29) {
        $(m_DatagridID).datagrid('hideColumn', 'hr12_day29');
        $(m_DatagridID).datagrid('hideColumn', 'hr12_day30');
        $(m_DatagridID).datagrid('hideColumn', 'hr12_day31');
    }
}


/***********************************************************************
*  打印
*  SY
*/
function print() {
    window.open("../../../WEB/PE_OA/HR/checkAttendancePrint.html?v0=" + m_MID + "&v1=" + m_ATMonth);
}