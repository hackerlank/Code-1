
$(document).ready(function(){

	var param 
		= window.location.href.split('?');
	var wxno 
		= param[1].split('=')[1];
	
	if(wxno.length != 0)
	{
		var url = GetWSRRURL("3a9cf88e-fc42-485d-9dff-96c35a8a1750")
			+"&XML=" + GetFormJson([{"name":"txtWxno","value":wxno}], 'getWXList');

		$.post(url,function(data){
		    var rst = eval("(" + data + ")");

		    if(rst.rows.length >0){
		    	//维修单号
		    	$("#wxno").empty()
		    		.append(rst.rows[0].wxno);

				//紧急程度
				var urgentColor = "";
				if(rst.rows[0].urgentlevel == "L0"){
					//高
					urgentColor = "<span style=\"background-color:#CC0033; "
						+ " width:10px; height:10px; float:left;"
						+ " margin:6px 10px;\"></span>" 
						+ "<span>高</span>";
				}else if (rst.rows[0].urgentlevel == "L1"){
					//中
					urgentColor = "<span style=\"background-color:#FFCC33; "
						+ " width:10px; height:10px; float:left;"
						+ " margin:6px 10px;\"></span>"
						+ "<span>中</span>";
				}else if (rst.rows[0].urgentlevel == "L2"){
					//低
				    urgentColor = "<span style=\"background-color:#00CC33; "
						+ " width:10px; height:10px; float:left;"
						+ " margin:6px 10px;\"></span>"
						+ "<span>低</span>";
				};

				$("#urgentlevel").empty().append(urgentColor);
				$("#warehouse").empty()
					.append(rst.rows[0].warehousename);
				$("#nature").empty()
					.append(rst.rows[0].wxstname);
				$("#status").empty()
					.append(rst.rows[0].statusname);

				var sku = rst.rows[0].sku;
                $("#sku").empty().append(sku);

                var size = sku.substr(sku.length-1,1);
                var color = sku.substr(sku.length-2,1);

                $("#color").empty().append(color);
                $("#size").empty().append(size);

                $("#question").empty()
                	.append(rst.rows[0].question);

                if(rst.rows[0].remark.length ==0){
                	$("#remark").empty()
                		.append("无备注信息.");
                }
                else{
                	$("#remark").empty()
                		.append(rst.rows[0].remark);
                };

                //主要原因
                $("#foname").empty()
                	.append(rst.rows[0].foname);
                $("#fqname").empty()
                	.append(rst.rows[0].fqname);
                if(rst.rows[0].fixlength.length ==0){
                	$("#fpname").empty()
                	.append(rst.rows[0].fpname);
                }
                else{
                	$("#fpname").empty()
                	.append(rst.rows[0].fpname 
                	+ '-' +rst.rows[0].fixlength+"cm");
                }
                
                //次要原因
                if(rst.rows[0].soname.length == 0){
                	$("#second").hide();
                }
                else{
                	$("#second").show();
                	$("#soname").empty()
                		.append(rst.rows[0].soname);
                	$("#sqname").empty()
                		.append(rst.rows[0].sqname);
                	$("#spname").empty()
                		.append(rst.rows[0].spname);
                };
                $("#firstdecide").empty()
                	.append(rst.rows[0].firstdecide);
                $("#dayarea").empty()
                	.append(rst.rows[0].fixneedtime + "天");
                $("#moneyarea").empty()
                	.append(rst.rows[0].fixneedmoney + "元");
                	
                //再判描述
                if(rst.rows[0].seconddecide.length ==0){
                	$("#secondD").hide();
                }
                else{
			$("#secondD").show();
			$("#sedDecide").empty()
                		.append(rst.rows[0].seconddecide);
                };
                //最终描述
                if(rst.rows[0].thirddecide.length ==0){
                	$("#thirdD").hide();
                }
                else{
        		$("#thirdD").show();
        		$("#trdDecide").empty()
        		.append(rst.rows[0].thirddecide);
                };

                $("#dmname").empty()
                	.append(rst.rows[0].dmname);
                $("#drname").empty()
                	.append(rst.rows[0].drname);
                //其他信息
                if(rst.rows[0].ftname.length !=0){
					$("#other").empty()
                		.append(rst.rows[0].ftname);
                };
                if(rst.rows[0].whname.length !=0){
	                $("#other").empty()
	                	.append("等级:"+rst.rows[0].whname+"退仓单号:"+rst.rows[0].returnno);
                };
                if(rst.rows[0].suppliername.length !=0){
                	$("#other").empty()
	                	.append("供应商:"+rst.rows[0].suppliername);
                };

                //完成信息
                if(rst.rows[0].isfinish.length == 0){
                        $("#finDiv").hide();
                }
                else{

                        $("#finDiv").show();
                        $("#finPnt").empty().append(rst.rows[0].finpntname);
                        $("#finMan").empty().append(rst.rows[0].finmanname);
                        $("#finDate").empty().append(rst.rows[0].finishdate);
                        $("#finMon").empty().append(rst.rows[0].finishmoney + "元");
                        $("#isFin").empty().append(rst.rows[0].isfinish)
                }

                $("#area").empty()
                	.append(rst.rows[0].depotarea);
                $("#dpname").empty()
                	.append(rst.rows[0].depotname);
                $("#dpphone").empty()
                	.append(rst.rows[0].depotphone);
                $("#staff").empty()
                	.append(rst.rows[0].respname + '-'+rst.rows[0].respphone);
                $("#resp").empty()
                	.append(rst.rows[0].staffname + '-'+rst.rows[0].staffphone);
                $("#vipname").empty().append(rst.rows[0].vipname);
                
                $("#vipphone").empty().append(rst.rows[0].vipphone);
                $("#cost").empty().append(rst.rows[0].collect);

                $("#dpExp").empty().append(rst.rows[0].dpexpname + '|' +rst.rows[0].dpexpno);
		    };
		});
	};
	
})


