<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>

<div style="border:0px;padding-bottom:5px;height:auto">
	<form action="" method="GET" style="margin-bottom:0px">
  		<div style="float:left;margin-right:5px">
			<label>间隔天数</label>
			<input type="text" name="interday" value="<{$_GET.interday}>" placeholder="" >
		</div>
  	 	<div class="btn-toolbar" style="padding-top:25px;padding-bottom:0px;margin-bottom:0px">
		<button type="submit" class="btn btn-primary"><strong>查询</strong></button>
	</div>

	<div style="clear:both;"></div>
	</form>
</div>
    <div class="block">
        <a href="#page-stats" class="block-heading" data-toggle="collapse">成就任务流失统计</a>
        <div id="page-stats" class="block-body collapse in">
               <table class="table table-striped">
              <thead>
                <tr>ID
					<th style="width:30px">任务id</th>
					<th style="width:30px">统计数量</th>
                </tr>
              </thead>
				   <tbody>
				   <{foreach name=task from=$task_info item=task}>
					   <tr>
						   <td><{$task.task_id}></td>
						   <td><{$task.num}></td>
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