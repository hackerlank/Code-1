﻿Ext.define('WMC.model.Fire_Question', {
    extend: 'Ext.data.Model',
    fields: [
		
		'Id',
		'Question',
		'QImage',
		'TntId',
		'CreateUser',
		{ name: 'CreateTime', convert: function (value) { return Ext.Tools.FormatDate(value, 'Y-m-d').toString(); } },
		'ModifyUser',
		{ name: 'ModifyTime', convert: function (value) { return Ext.Tools.FormatDate(value, 'Y-m-d').toString(); } }
    ]
});