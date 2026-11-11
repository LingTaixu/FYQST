
var LOGIN_PAAMR = {};

var js_gameVars = {
		svrip:"",
		svrport:"",
		account:"",
		sign:"",
		zoneid:"",
		webid:"",
		agent:"",
		time:"",
		ad:"",
		isadult:"",
		cdn:"",
		prover:"",
		resver:"",
		cfgver:"",
		serverId:"",
		showlogin:"",
		agent_plusdata:"",
		agent_coldatas:"",
		adregtime:"",
		hfagent:"",
		agent_append_data:"",
		agent_append_sign:"",
		gamever:"",
		bootswf:"",
		swfurl:"",
		showlogin:"",
		sid:"",
		platUsername:""
};
window["isRelease"] = true;

var sjSys = {
		
	arrayservers : [], //区服数组
	
	serverids : [], //最近登陆记录
	
	zoneid : "",
	
	textTemplate : ["","-区"], //区服文字模板
	
	arrayserversinfo : [],
	
	addmenu : function(){
		var size = this.arrayservers.length;
		 if(size % 100 ==0){
			 for(var i = size/100;i >= 1;i--){
					$("#bootagent").append("<li id='bootagent'"+i+">  <span>"+1*i+"-"+100*i+"</li>");
				}
		 }else{
			 for(var i = Math.ceil(size / 100);i >= 1;i--){
				if(i==size/100+1){
					$(".bootagent").append("<li id='bootagent'"+i+"> <span>"+1*i+"-"+100*i+"</li>");
				}else{
					$(".bootagent").append("<li id='bootagent'"+i+"> <span>"+1*i+"-"+size+"</li>");
				}
				
			}
		}
	 },
	//选区按钮
	 chooseServer :function(){
		$(".bootxuanqu").hide();//隐藏div
//				$("#bootgongao").hide();//隐藏div
		$(".bootqufu").show();//显示div
//		if(sjSys.arrayservers.length>0){
//			return;
//		}

	 },
	 back :function(){ 
		$(".bootxuanqu").show();//显示div
		$(".bootqufu").hide();//隐藏div
		/*$("#bootgongao").show();//隐藏div*/				
	},
	
	selectServer:function(){
		var zoneidx = $(this).children("#bootserviceid").html().split("-")[0]
		sjSys.zoneid = zoneidx;
		sjSys.tablestateimg();
		
		$("#bootserviceid2").html(zoneidx)
		$(".bootxuanqu").show();//显示div
		$(".bootqufu").hide();//隐藏div
	},
	loginGame :function() {
			
			for(var j=0;j<sjSys.arrayserversinfo.length;j++){
		    	if(sjSys.arrayserversinfo[j].zoneid == sjSys.zoneid){
		    		if(sjSys.arrayserversinfo[j].serverStatus ==3 || sjSys.arrayserversinfo[j].serverStatus == 0){
		    			alert("服务器正在维护中");
		    			$(".bootbody").show();//隐藏div
		    			return;
		    		}
		    	}
		    }
			if (isEmpty(sjSys.zoneid)) {
				$(".bootbody").show();//隐藏div
				 return ;
			}
			
			if (isEmpty(LOGIN_PAAMR.uid)) {
//				 $("#boot-box").show();
				 return ;
			} 
			
			var arr = [];
			for(var i in LOGIN_PAAMR){
				var str = i + "=" + LOGIN_PAAMR[i];
				arr.push(str);
			}
//			var host=$("#host").val();
		    var url =  "/"+LOGIN_PAAMR.loginGameName+"?"+arr.join("&") + "&zoneid="+sjSys.zoneid;
		 
		    $.ajax({
				type : "GET",
				data : {},
				url : url,
				dataType : "json",
				success : function(data) {
					for(var key in data){
						js_gameVars[key] = data[key];
					}
					window["js_gameVars"]= js_gameVars;
					
					if(js_gameVars.code!=0){
						alert(js_gameVars.msg)
						$(".bootbody").show();//显示div
						$(".bootbody").css({"background-image":"url(../img/bg_009.jpg)"});
						$("body").css({"background-image":"url(../img/bg_007.jpg)"});
						return;
					}
					sjSys.loadjs();
					
				},
				errro : function() {
					alert("网络错误，请重试！");
				}

			})
		},

		loadjs :function() {
			var mainloaderJSUrl = js_gameVars.swfurl+"lib_"+js_gameVars.bootver+"/mainloader.js";
//			mainloaderJSUrl = mainloaderJSUrl.replace(".js","lib_"+js_gameVars.bootver+".js");
			var fileref = document.createElement("script");
			fileref.setAttribute("type", "text/javascript");
			fileref.setAttribute("src", mainloaderJSUrl);
			document.getElementsByTagName("body")[0].appendChild(fileref);
		},
		//区服状态图片  11
		stateimgsrc :function(xiabiao,menutype){
			var subscript = 0;
			var arrayqufu = [];
			if(menutype){
				//区服下标
				subscript = xiabiao-1;
				arrayqufu = sjSys.arrayservers;
			}else{
				//最近登陆下标
				subscript = xiabiao;
				arrayqufu = sjSys.serverids;
			}
			sjSys.img1 = "";
			sjSys.img2 = "";
			for(var j=0;j<sjSys.arrayserversinfo.length;j++){
	    		if(sjSys.arrayserversinfo[j].zoneid == arrayqufu[subscript]){
	    			var date = new Date(parseInt(sjSys.arrayserversinfo[j].kftime));
	    			switch(sjSys.arrayserversinfo[j].serverStatus){
	    			case 1://爆
	    				sjSys.img1 = "../img/zhuangtai_01.png";
	    				sjSys.img2 = "<img class='bootqizhi' src='../img/icon_041.png'>";
	    				break;
	    			case 2://新
	    				sjSys.img1 = "../img/zhuangtai_02.png";
	    				sjSys.img2 = "<img class='bootqizhi' src='../img/icon_042.png'>";
	    				break;
	    			case 3://维
	    				sjSys.img1 = "../img/zhuangtai_03.png";
	    				sjSys.img2 = "<img class='bootqizhi' src='../img/icon_043.png'>";
	    				break;
	    			case 0://未开启
	    				sjSys.img1 = "../img/zhuangtai_02.png";
	    				sjSys.img2 = "<span class='bootqufu1' id='boottime'>"+
	    				date.getHours()+":"+date.getMinutes() +"开启"
	    				+"</span>";
	    				break;
	    			case 4://不显示
	    				return;	    			}
	    		}
	    	 }
			
				$(".bootservers").append("<li>" +
						"<img class='bootqufu1' src='"+sjSys.img1+"'>" +
						"<span class='bootqufu1'>"+sjSys.textTemplate[0]+"</span>" +
						"<span class='bootqufu1' id='bootserviceid'>"+arrayqufu[subscript]+"</span>" +
						"<span class='bootqufu1'>"+sjSys.textTemplate[1]+"</span>" +
						sjSys.img2 +
						"</li>");
		},
		tablestateimg :function(zid){
			sjSys.img1 = "";
			sjSys.img2 = "";
			 for(var j=0;j<sjSys.arrayserversinfo.length;j++){
		    	if(sjSys.arrayserversinfo[j].zoneid == sjSys.zoneid){
		    		switch(sjSys.arrayserversinfo[j].serverStatus){
		    		case 1://爆
		    			sjSys.img1 = "../img/zhuangtai_01.png";
		    			sjSys.img2 = "../img/zhuangtai_a01.png";
		    			break;
		    		case 0:
		    		case 2://新
		    			sjSys.img1 = "../img/zhuangtai_02.png";
		    			sjSys.img2 = "../img/zhuangtai_a02.png";
		    			break;
		    		case 3://维
		    			sjSys.img1 = "../img/zhuangtai_03.png";
		    			sjSys.img2 = "../img/zhuangtai_a03.png";
		    			break;
		    			
		    		}
		    	}
		    }
			var imgs = $("#bootserviceid").children("img");
			$(imgs[0]).attr("src",sjSys.img1);
			$(imgs[1]).attr("src",sjSys.img2);
	    	$("#bootserviceid2").html(sjSys.zoneid);
		},
		
		initParms:function(){
			
			var uid = $("#uid").val();
			 
			LOGIN_PAAMR.uid=$("#uid").val();
			LOGIN_PAAMR.agent=$("#agent").val();
			LOGIN_PAAMR.time=$("#time").val();
			LOGIN_PAAMR.sign=$("#sign").val();
			LOGIN_PAAMR.serviceid=$("#serviceid").val();
			LOGIN_PAAMR.ad=$("#ad").val();
			LOGIN_PAAMR.loginGameName=$("#loginGameName").val();
			
			if(LOGIN_PAAMR.agent == "gaore"){
				GAORE_H5.afterCb(sjSys.getServerList);
			}else{
				sjSys.getServerList();
			}
			
		},
		
		start:function(){
			
			var logo=$("#logo").val();
		    if(logo){
		        $(".bootlogo").css("visibility","hidden");//元素隐藏
//		        $(".bootlogo").css("visibility","visible");//元素显示
		        /*$(".bootxuanqu").css("padding-top","100%");*/
		    }
		    if(LOGIN_PAAMR.agent =="xy"){
		    	sjSys.textTemplate[0] = "不删档";
		    	sjSys.textTemplate[1] = "服";
		    }
		    
		    var spanarr = $("#bootserviceid").children("span")
			$(spanarr[0]).html(sjSys.textTemplate[0]);
			$(spanarr[2]).html(sjSys.textTemplate[1]);
			//带区服的自动登陆
			if(LOGIN_PAAMR.serviceid != null && typeof(LOGIN_PAAMR.serviceid) != "undefined" 
				&& LOGIN_PAAMR.serviceid != "" && LOGIN_PAAMR.serviceid >0){
				sjSys.zoneid = LOGIN_PAAMR.serviceid;
				$(".bootbody").hide();//隐藏div
//				$(".bootbody").css({"background-image":"url()"});
//				$("body").css({"background-image":"url()"});
				sjSys.loginGame()
			}
			
			//选平台
			$(".bootagent").on("click","li",function(){ 
				$(".bootagent li").css({"background-image":"url(../img/btn_062.png )"});
				$(".bootagent li").css({"background-size": ""});
				$(".bootagent span ").css({"color": "#96672F"});
				$(this).css({"background-image":"url(../img/btn_063.png )"});
				$(this).css({"background-size": "112% 100%"});
				$(this).children("span").css({"color": "#FFE184"});
				
				$(".bootservers").empty();
				var agent=$(this).children("span").html();
				if(agent!="最近登陆"){
					var indexs=agent.split("-");
					
					for(var i=indexs[1];i>=indexs[0];i--){
						sjSys.stateimgsrc(i,1);
					}
				}else{
					for(var j=0;j<sjSys.serverids.length;j++){
						sjSys.stateimgsrc(j,0);
			    	}
				}
			});
			//选区
			$(".bootservers").on("click","li",function(){ 
				var zoneidx = $(this).children("#bootserviceid").html().split("-")[0]
				sjSys.zoneid = zoneidx;
				sjSys.tablestateimg();
				
				$("#bootserviceid2").html(zoneidx)
				$(".bootxuanqu").show();//显示div
				$(".bootqufu").hide();//隐藏div
			});
			
			$("#bootdl").mouseup(function(){
//				$(".bootdenglu").css({"top":"55vh"});
				sjSys.zoneid=$("#bootserviceid2").html()
				$(".bootbody").hide();//隐藏div
//				$(".bootbody").css({"background-image":"url()"});
				$("body").attr("background-image","");
				sjSys.loginGame()
				
			});
		},
		
		getServerList:function(){
			 //最近登陆
			 $.ajax({ 
			     type : "POST", //提交方式 
			     url : "getLoginServer.php",//路径 
//			     header :"Access-Control-Allow-Origin:*",
			     data : { 
			    	 "agent":LOGIN_PAAMR.agent,
			    	 "openid":LOGIN_PAAMR.uid
			     },//数据，这里使用的是Json格式进行传输 
			     success : function(result) {//返回数据根据结果进行相应的处理 
			    	 $("#servers").empty();
			    	 for(var i=0;i<result.length;i++){
			    		 var servers=result[i];
			    		 sjSys.serverids=servers.serverid.split(",");
			    	 }
			    	 
			    	 sjSys.zoneid = sjSys.serverids[0];
			 		//区服数据
			 		$.ajax({ 
			 		     type : "POST", //提交方式 
			 		     url : "serversList.php",//路径 
			 		     data : { 
			 		    	 "agent":LOGIN_PAAMR.agent
			 		     },//数据，这里使用的是Json格式进行传输 
			 		     success : function(result) {//返回数据根据结果进行相应的处理 
			 		    	 sjSys.arrayservers = [];
			 		    	 sjSys.arrayserversinfo = result;
			 		    	 for(var i=0;i<result.length;i++){
			 		    		 var servers=result[i];
			 		    		 sjSys.arrayservers.push(servers.zoneid);
			 		    	 }
			 		    	 sjSys.arrayservers.sort();
			 		    	 $(".bootagent").empty();
			 		    	 $(".bootagent").append("<li><span>最近登陆</span></li>");
			 		    	 sjSys.addmenu();

			 		    	 sjSys.Initialization();
			 		    	if(sjSys.serverids.length <= 0) {
			 		    		sjSys.zoneid = sjSys.arrayservers[sjSys.arrayservers.length-1];
			 		    	}
			 		    	sjSys.tablestateimg();
			 		     } 
			 		});
			    	 
			     } 
			 });
		},
		Initialization :function(){
				$(".bootservers").empty();
				if(sjSys.serverids.length > 0){
					$(".bootagent li").css({"background-image":"url(../img/btn_062.png )"});
					$(".bootagent li").css({"background-size": ""});
					$(".bootagent span ").css({"color": "#96672F"});
					var oLi=$(".bootagent li");
					$(oLi[0]).css({"background-image":"url(../img/btn_063.png )"});
					$(oLi[0]).css({"background-size": "112% 100%"});
					$(oLi[0]).css({"color": "#FFE184"});
					
					for(var j=0;j<sjSys.serverids.length;j++){
						sjSys.stateimgsrc(j,0);
			    	}
				}else if(sjSys.arrayservers.length > 0){
					$(".bootagent li").css({"background-image":"url(../img/btn_062.png )"});
					$(".bootagent li").css({"background-size": ""});
					$(".bootagent span ").css({"color": "#96672F"});
					var oLi=$(".bootagent li");
					$(oLi[oLi.length-1]).css({"background-image":"url(../img/btn_063.png )"});
					$(oLi[oLi.length-1]).css({"background-size": "112% 100%"});
					$(oLi[oLi.length-1]).css({"color": "#FFE184"});
					
					var agent=$(oLi[oLi.length-1]).children("span").html();
					var indexs=agent.split("-");
					for(var i=indexs[0];i<=indexs[1];i++){
						sjSys.stateimgsrc(i,1);
					}
					
				}
			},
			
}

function isEmpty(obj) {
	if (typeof obj == "undefined" || obj == null || obj == ""||obj =="null") {
		return true;
	} else {
		return false;
	}
}

$(document).ready( function() {
	
	sjSys.initParms();
	sjSys.start();
});


