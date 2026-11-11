<{include file ="header.tpl"}>
<{include file ="navibar.tpl"}>
<{include file ="sidebar.tpl"}>
<!--- START 以上内容不需更改，保证该TPL页内的标签匹配即可 --->

<{$osadmin_action_alert}>
<{$osadmin_quick_note}>
<form action="" method="POST" style="margin-bottom:0px">
   <{html_checkboxes name="serverIdArr" options=$serverlist selected=$_POST.serverIdArr separtator=" "}>
    <br/>设置开服时间
    <input type="text" id="serverDate" name="serverDate" value="" >
    <button type="submit" class="btn btn-primary" id="modify"><strong>设置</strong></button>
</form>
<!---操作的确认层，相当于javascript:confirm函数--->
<{$osadmin_action_confirm}>

<!--- END 以下内容不需更改，请保证该TPL页内的标签匹配即可 --->
<{include file="footer.tpl" }>
<script>
    $("#check_all").click(function(){
        if(this.checked){
            $("input[name='accountArr[]']").prop("checked",true);
        }else{
            $("input[name='accountArr[]']").prop("checked",false);
        }
    });
    //阻止事件冒泡
    $("input[name='accountArr[]']").click(function(event){
        event.stopPropagation();
    });

    $("#dataList tr").click(function(){
        var node = $(this).find("input[name='accountArr[]']");
        if(node.prop("checked")){
            node.prop("checked",false);
        }else{
            node.prop("checked",true);
        }
    });


    $(function() {
        var date=$( "#serverDate" );
        date.datetimepicker({
            showSecond: true,
            dateFormat: 'yy-mm-dd',
            timeFormat: 'HH:mm:ss',
            stepHour: 1,
            stepMinute: 1,
            stepSecond: 1
        })
    });
</script>