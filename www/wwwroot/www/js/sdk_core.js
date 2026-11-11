sdkBase = 'http://ttf.zi2.cn:81/ttf';

var paramsInfo, ws;
if (typeof window.postMessage != 'undefined') {
	if(window.addEventListener) {
		window.addEventListener('message', messageHandler, false);
	} else if (window.attachEvent) {
		window.attachEvent('onmessage',messageHandler);
	}
}

function shareCallBack(type, status) {
	if ($("#fwgameframe").length > 0) {
		var data = {op: 'share', value: {type: type, status: status}};
		document.getElementById('fwgameframe').contentWindow.postMessage(data,'*');
	}
}

function ajaxPost(url, data, func) {
	var v;
	$.ajax({
		type: 'POST',
		url: url,
		cache: false,
		data: data,
		crossdomain: true,
		contentType: 'text/json; charset=utf-8',
		datatType: "json",
		beforeSend: function() {
			v = layer.load(0, {shade: 0.8});
		},
		success: function(data) {
			func(data);
		},
		error: function() {
			layer.msg('请求状态异常，请联系客服');
		},
		complete: function() {
			layer.close(v);
		}
	});
}
