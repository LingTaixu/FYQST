<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div style="width:80%" >
	<div>
		<canvas id="canvas" height="400" width="600"></canvas>
	</div>
</div>

    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">在线人数列表</a>
        <div id="page-stats" class="block-body collapse in">
               <table class="table table-striped">
              <thead>
                <tr>
					<th style="width:150px">时间</th>
					<th style="width:80px">在线人数</th>
                </tr>
              </thead>
				   <tbody>
				   <{foreach name=num from=$num_info item=num}>
					   <tr>
						   <td><{$num.created}></td>
						   <td><{$num.num}></td>
					   </tr>
					   <{/foreach}>
				   </tbody>
            </table>
				<!--- START 分页模板 --->
               <{$page_html}>
			   <!--- END --->
        </div>
    </div>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>


<script>
	var randomScalingFactor = function(){ return Math.round(Math.random()*100)};
	var lineChartData = {
						labels : <{$labellist}>,
			datasets : [
		{
			label: "My Second dataset",
			fillColor : "rgba(151,187,205,0.2)",
			strokeColor : "rgba(151,187,205,1)",
			pointColor : "rgba(151,187,205,1)",
			pointStrokeColor : "#fff",
			pointHighlightFill : "#fff",
			pointHighlightStroke : "rgba(151,187,205,1)",
			data : <{$datalist}>,
	}
	]

	}

	window.onload = function(){
		var ctx = document.getElementById("canvas").getContext("2d");
		window.myLine = new Chart(ctx).Line(lineChartData, {
			responsive: true
		});
	}

	// 设置计时器来刷新页面
	function refresh(){
		window.location.href="onlinenum.php?serverid=<{$serverid}>";
		console.log("refresh ...");
	}
	window.setInterval(refresh, 60000);

</script>
