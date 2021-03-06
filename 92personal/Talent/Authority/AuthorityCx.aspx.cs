﻿using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.UI;
using System.Web.UI.WebControls;
using System.Text;

namespace Talent.Web.Authority
{
    public partial class AuthorityCx : System.Web.UI.Page
    {
        private static BLL.TB_RC_Permission permissiondb = new BLL.TB_RC_Permission();
        private static BLL.TN_SYS_EM_USER userdb = new BLL.TN_SYS_EM_USER();

        protected int total = 0;
        protected int index = 0;

        protected string permissionList = "";
        protected void Page_Load(object sender, EventArgs e)
        {
            string tmp = Common.Constants.getReqValue(Request, "numPerPage");
            int pagesize = Convert.ToInt32(tmp == "" ? "0" : tmp);
            tmp = Common.Constants.getReqValue(Request, "pageNum");
            index = Convert.ToInt32(tmp == "" ? "1" : tmp);

            tmp = "";

            tmp = getQueryStr(Common.Constants.getReqValue(Request, "PM_Login"), Common.Constants.getReqValue(Request, "PM_Province"), Common.Constants.getReqValue(Request, "PM_Level"));

            total = permissiondb.GetTotal(tmp);
            permissionList = GetPermissonList(pagesize, index, tmp, total);
        }

        public static string GetPermissonList(int pagesize, int index, string querystr, int total)
        {
            int itempager = Common.Constants.GetPageItems(ref pagesize, index, total);
            if (itempager <= 0) return "";
            StringBuilder sb = new StringBuilder();
            List<Model.TB_RC_Permission> list = permissiondb.GetModelList(pagesize, index, querystr, itempager);
            foreach (var apply in list)
            {
                sb.Append("<tr target='sid_authority' rel='" + apply.PM_No + "'>");
                sb.Append("<td><input name='ids' value='" + apply.PM_No + "' type='checkbox'></td>");
                sb.Append("<td>" + apply.PM_Login + "</td>");
                sb.Append("<td>" + apply.PM_Province + "</td>");
                sb.Append("<td>" + (apply.PM_Level == -1 ? "无权限" : "") + (apply.PM_Level == 0 ? "查看权限" : "") + (apply.PM_Level == 1 ? "管理权限" : "") + "</td>");
                sb.Append("</tr>");
            }
            return sb.ToString();
        }

        /*
         *组装sql
         */
        private static string getQueryStr(string PM_Login, string PM_Province, string PM_Level)
        {
            string tmp = "";
            tmp = Tools.SessionHelper.Get("userid");
            if (tmp != "")
            {
                tmp = " PM_Login !='" + tmp + "' ";
            }
            if (PM_Login != "")
            {
                if (tmp != "") tmp += " and ";
                tmp += " PM_Login like '%" + PM_Login + "%' ";
            }
            if (PM_Province != "")
            {
                if (tmp != "") tmp += " and ";
                tmp += " PM_Province like '%" + PM_Province + "%' ";
            }
            if (PM_Level != "")
            {
                if (tmp != "") tmp += " and ";
                tmp += " PM_Level = '" + PM_Level + "' ";
            }
            return tmp;
        }

        public static int AddAddressBook(HttpRequest req, ref string message)
        {
            var list  = userdb.GetModelList("");
            foreach(var user in list)
            {
                var tmp = permissiondb.GetModel(user.CN_LOGIN);
                if (tmp == null)
                {
                    Model.TB_RC_Permission p = new Model.TB_RC_Permission();
                    p.PM_Login = user.CN_LOGIN;
                    p.PM_Level = -1;
                    permissiondb.Add(p);
                }
            }
            message = "更新成功！";
            return Common.Constants.OK;
        }

        public static int UpdateQx(HttpRequest req, ref string message)
        {
            var PM_No = Common.Constants.getReqValue(req, "PM_No");
            if (PM_No == "")
            {
                var tmpmodel = new Model.TB_RC_Permission();
                tmpmodel.PM_Login = Common.Constants.getReqValue(req, "PM_Login");
                var PM_Level = Common.Constants.getReqValue(req, "PM_Level");
                if (PM_Level == "") tmpmodel.PM_Level = -1;
                else tmpmodel.PM_Level = Convert.ToInt32(PM_Level);
                var PM_Province = Common.Constants.getReqValue(req, "PM_Province");
                if (PM_Province == "") tmpmodel.PM_Province = "";
                else tmpmodel.PM_Province = "," + Common.Constants.getReqValue(req, "PM_Province") + ",";
                permissiondb.Add(tmpmodel);
                message = "新增成功！";
            }
            else
            {
                var model = permissiondb.GetModel(Convert.ToInt32(PM_No));
                model.PM_Login = Common.Constants.getReqValue(req, "PM_Login");
                var PM_Level = Common.Constants.getReqValue(req, "PM_Level");
                if (PM_Level == "") model.PM_Level = -1;
                else model.PM_Level = Convert.ToInt32(PM_Level);
                var PM_Province = Common.Constants.getReqValue(req, "PM_Province");
                if (PM_Province == "") model.PM_Province = "";
                else model.PM_Province = "," + Common.Constants.getReqValue(req, "PM_Province") + ",";
                permissiondb.Update(model);
                message = "更新成功！";
            }
            return Common.Constants.OK;
        }

        public static int DelAuthorityList(HttpRequest req, ref string message)
        {
            string dellist = Common.Constants.getReqValue(req, "ids");
            if (dellist == "")
            {
                message = "删除条件为空！";
                return Common.Constants.ERR;
            }
            permissiondb.DeleteList(dellist);
            message = "删除人员成功！";
            return Common.Constants.OK;
        }
    }
}