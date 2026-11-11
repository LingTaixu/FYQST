<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class GameActivity extends GameBase {
    private static $table_name = 'uw_activity';      // 活动列表

    private static $columns =  array('id', 'title', '`type`', 'iconType', 'tiIconType', 'startTime', 'endTime', 'items', 'randomHeroes', 'exValues','exValues2','exValues3','content','isOpen','sort','exData','templateId');

    public static function getTableName(){
        return self::$table_name;
    }

    public static function count(){
        $db=self::__instance();
        return $db->count (self::getTableName());
    }

    public static function getList($start = 0, $page_size = 0){
        $db=self::__instance();
        $condition=array();
        $condition["ORDER"]=" id asc";
        if ($page_size) {
            $condition['LIMIT']=array($start,$page_size);
        }
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function getActivityById($id){
        $db = self::__instance();
        $condition=array();
        $condition['id']=$id;
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        if($list){
            return $list[0];
        }
        return array();
    }

    public static function insert($data, $sid = 0)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        if ($sid) {
            $db = self::__instance2($sid);
        } else {
            $db = self::__instance();
        }
        $result = $db->insert(self::getTableName(), $data);
        return $result;
    }

    public static  function  update($id, $data){
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$id);

        $result = $db->update ( self::getTableName(), $data, $condition );
        return $result;
    }

    public static  function  updateByServerId($serverId, $id, $data){
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance2($serverId);
        $condition=array("id"=>$id);
        $result = $db->update ( self::getTableName(), $data, $condition );
        return $result;
    }

    // 设置开服活动的时间
    public static function openServer($serverId, $openTime) {
        if (!$serverId ) {
            return false;
        }
        $db=self::__instance2($serverId);

        // 取到天数
        $tmStart = strtotime($openTime);
        $startTime = date('Y-m-d 00:00:00',$tmStart);
        $tmEnd6 = strtotime('+2000 day',$tmStart);
        $endDate6 = date('Y-m-d 23:59:59',$tmEnd6);// 2000天
        $tmEnd49 = strtotime('+7 day',$tmStart);
        $endDate49 = date('Y-m-d 23:59:59',$tmEnd49);// 8天
        $tmEnd50 = strtotime('+6 day',$tmStart);
        $endDate50 = date('Y-m-d 23:59:59',$tmEnd50);// 7天

        $tmEnd23 = strtotime('+2000 day',$tmStart);
        $endDate23 = date('Y-m-d 23:59:59',$tmEnd23);// 7天

        $tmEnd30 = strtotime('+6 day',$tmStart);
        $endDate30 = date('Y-m-d 23:59:59',$tmEnd30);// 7天

        $tmEnd62 = strtotime('+13 day',$tmStart);
        $endDate62 = date('Y-m-d 23:59:59',$tmEnd62);// 14天

        $condition=array("type"=>49);
        $data = array(
            'startTime' => $startTime,
            'endTime' => $endDate49
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>6);
        $data = array(
            'startTime' => $startTime,
            'endTime' => $endDate6
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        // 1 - 12 不是作为开服活动，是后期开的活动，不修改开服日期
        //if ($serverId > 12){

        $condition=array("type"=>50);
        $data = array(
            'startTime' => $startTime,
            'endTime' => $endDate50
        );
        $result = $db->update ( self::getTableName(), $data, $condition );
        //}

        $condition=array("type"=>23);
        $data = array(
            'startTime' => $startTime,
            'endTime' => $endDate23
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>30);
        $data = array(
            'startTime' => $startTime,
            'endTime' => $endDate30
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>62);
        $data = array(
            'startTime' => $startTime,
            'endTime' => $endDate62
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $start = strtotime($startTime);
        $scStart = strtotime('+7 day',$start);
        $scStartTime = date('Y-m-d 00:00:00', $scStart);
        //51 女神的私人报答
        $scEnd51 = strtotime('+6 day',$scStart);
        $endDate51 = date('Y-m-d 23:59:59', $scEnd51);
        //52 炼金术士的等价交换
        if ($serverId < 44) {
            $exchangeStart = $scStartTime;
        } else {
            $exchangeStart = $startTime;
        }
        $scEnd52 = strtotime('+17 day', strtotime($exchangeStart));
        $endDate52 = date('Y-m-d 23:59:59', $scEnd52);
        //53 神宠的羁绊
        $scEnd53 = strtotime('+6 day',$scStart);
        $endDate53 = date('Y-m-d 23:59:59', $scEnd53);
        //54 莱斯银行的风投业务
        $scEnd54 = strtotime('+12 day',$scStart);
        $endDate54 = date('Y-m-d 23:59:59', $scEnd54);
        //55 嘉年华
        $scEnd55 = strtotime('+6 day',$scStart);
        $endDate55 = date('Y-m-d 23:59:59', $scEnd55);
        //2 七日登录
        $scEnd2 = strtotime('+6 day',$scStart);
        $endDate2 = date('Y-m-d 23:59:59', $scEnd2);

        $condition=array("type"=>2);
        $data = array(
            'startTime' => $scStartTime,
            'endTime' => $endDate2
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>51);
        $data = array(
            'startTime' => $scStartTime,
            'endTime' => $endDate51
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>52);
        $data = array(
            'startTime' => $exchangeStart,
            'endTime' => $endDate52
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>53);
        $data = array(
            'startTime' => $scStartTime,
            'endTime' => $endDate53
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>54);
        $data = array(
            'startTime' => $scStartTime,
            'endTime' => $endDate54
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $condition=array("type"=>55);
        $data = array(
            'startTime' => $scStartTime,
            'endTime' => $endDate55
        );
        $result = $db->update ( self::getTableName(), $data, $condition );

        $start = strtotime($startTime);
        $scStart = strtotime('+2 day',$start);
        $scStartTime = date('Y-m-d 00:00:00', $scStart);

        $endDate57 = date('Y-m-d 23:59:59',$scStart);// 3天

        $condition=array("type"=>57);
        $data = array(
            'startTime' => $scStartTime,
            'endTime' => $endDate57
        );
        $result = $db->update ( self::getTableName(), $data, $condition );
        return $result;
    }

    // 活动开服活动信息
    public static function getOpenActivity($serverId){
        $db=self::__instance2($serverId);
        $condition=array("type"=>[6,49,50,23]);

        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        return $list;
    }

    public static function getServerActivity($serverId, $params = [])
    {
        $db = self::__instance2($serverId);
        $condition = array();
        $id = $params['id'];
        if ($id) {
            $condition['id'] = $id;
        }
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        if ($list) {
            return $list[0];
        }
        return array();
    }
}
