<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameMail extends GameBase {
    private static $table_name = 'uw_mail';      // 邮件表

    private static $columns =  array('id', 'userId', 'type', 'fromName', 'title', 'content', 'replaceArgs', 'items', 'isPicked', 'isRead','delHours','delTime','expireTime','addTime','isDelete','taskId');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function insertMail($data) {
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $data );
        return $id;
    }

    public static function  count($uid){
        $db=self::__instance();
        $condition=array();
        $sub_condition = array();


        if($uid != ""){
            $sub_condition['userId'] = $uid;
        }else{
            return 0;
        }

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count ( self::getTableName(),$condition);
        return $num;
    }

    public static function getMailList($uid, $start,$page_size){
        $db=self::__instance();

        $condition=array();
        $sub_condition = array();

        if($uid != "")
            $sub_condition['userId'] = $uid;
        else
            return array();

        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);

        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        $ret = array();
        global $CONFIG_MAIL, $CONFIG_ITEM;
        if ($list) {
            $ret = array();
            foreach($list as $k=>$v){
                $mail = $CONFIG_MAIL[$v['type']];
                $row = $v;
                $row['fromName'] = $mail['fromName'];
                $row['title'] =  $mail['title'];
                $replaceArgs =  json_decode($row['replaceArgs'], true);
                $content = vsprintf($mail['content'],  $replaceArgs);
                $row['content'] = $content;

                $items = json_decode($row['items'], true);
                $bagInfo = array();
                foreach($items as $k=>$v){
                    $item = $CONFIG_ITEM[$k]['name']." * ".$v;
                    $bagInfo[] = $item;
                }
                $bags = join("|",$bagInfo);
                $row['items'] = $bags;
                 $ret[] = $row;
            }
            return $ret;
        }
        return array ();
    }

    public static function sendServerMails($servers,$data) {
        if (! $servers || ! is_array ( $servers )) {
            return false;
        }
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $data['type'] = 0;//"类型"
        $data['fromName'] = "系统邮件";//"发送者"
        //$data['replaceArgs'] = [];//内容"
        $data['delHours'] = 0;//"操作后几小时删除"
        //$data['delTime'] = 0;//"删除时间"
        $data['expireTime'] = date("Y-m-d H:i:s",time()+24*60*60*30*12);;//"过期时间"
        $data['isPicked'] = 0;//"是否提取物品"
        $data['isRead'] = 0;//"是否阅读"
        $data['addTime'] = date("Y-m-d H:i:s");
        foreach($servers as $k =>$severId){
            //echo '<br>'.'操作'.$severId.'服';
            $db=self::__instance2($severId);
            $userList = GameUser::getRelUserList($severId);
            $insertData = [];//重置

            foreach($userList as $userinfo){
                $data['userId'] = $userinfo['id'];
                $insertData[] = $data;
               // $id = $db->insert ( self::getTableName(), $data );
            }

            //Medoo 批量insert
            $eachLen = 1000;
            $tmpData = [];
            for($i = 0; $i < count($insertData); $i++){
                if($i > 0 && $i%$eachLen == 0){
                    $id = $db->insert ( self::getTableName(), $tmpData);
                    $tmpData = [];
                    //var_dump("send num1:",count($tmpData));
                }
                $tmpData[] = $insertData[$i];
            }

            if(count($tmpData) > 0){
                $id = $db->insert ( self::getTableName(), $tmpData );
                //var_dump("send num2:",count($tmpData));
            }
        }

        return $id;
    }

}
