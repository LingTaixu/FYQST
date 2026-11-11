<?php
if(!defined('ACCESS')) {exit('Access denied.');}
class GuildWarConfig extends MainBase {
    private static $table_name = 'uw_game_config';      // 公告表

    private static $columns =  array('id', 'guildWarSign','guildWarOpen','guildWarHost', 'guildWarPort', 'redisHostArr', 'noSignServerArr');

    private static $rid = 1;

    public static function getTableName(){
        return self::$table_name;
    }

    public static function getConfig(){
        $db=self::__instance();
        $condition["id"]= self::$rid;
        $list = $db->select ( self::getTableName(), self::$columns, $condition);

        $ret = array();

        if ($list) {
            $cfg = $list[0];
            $cfg['guildWarSign'] = json_decode($cfg['guildWarSign']);
            $cfg['guildWarOpen'] = json_decode($cfg['guildWarOpen']);
            $signOpenMonth = $cfg['guildWarSign'][0];
            $signOpenDay = $cfg['guildWarSign'][1];
            $signOpenHour = $cfg['guildWarSign'][2];
            $signEndMonth = $cfg['guildWarSign'][3];
            $signEndDay = $cfg['guildWarSign'][4];
            $signEndHour = $cfg['guildWarSign'][5];

            $warOpenMonth = $cfg['guildWarOpen'][0];
            $warOpenDay = $cfg['guildWarOpen'][1];
            $warOpenHour = $cfg['guildWarOpen'][2];
            $warEndHour = $cfg['guildWarOpen'][3];

            $ret['signOpen'] =   date('Y-m-d H:i:s',mktime($signOpenHour, 0, 0, $signOpenMonth  , $signOpenDay, 2018));
            $ret['signEnd'] =   date('Y-m-d H:i:s',mktime($signEndHour, 0, 0, $signEndMonth  , $signEndDay, 2018));


            $ret['warOpen'] =  date('Y-m-d H:i:s',mktime($warOpenHour, 0, 0, $warOpenMonth  , $warOpenDay, 2018));
            $ret['warEnd'] =  date('Y-m-d H:i:s',mktime($warEndHour, 0, 0, $warOpenMonth  , $warOpenDay, 2018));
        }
        return $ret;
    }


    public static function updateDate ( $signOpen,$signEnd,$warOpen, $warEnd) {

        $db=self::__instance();
        $condition=array("id"=>self::$rid);
        $tmSignOpen = strtotime( $signOpen);
        $tmSignEnd = strtotime( $signEnd);
        $tmWarOpen = strtotime($warOpen);
        $tmWarEnd = strtotime( $warEnd);

        $signOpenMonth = intval(date('m',$tmSignOpen));
        $signOpenDay = intval(date('d',$tmSignOpen));
        $signOpenHour = intval(date('H', $tmSignOpen));

        $signEndMonth= intval(date('m',$tmSignEnd));
        $signEndDay= intval(date('d',$tmSignEnd));
        $signEndHour= intval(date('H',$tmSignEnd));

        $warOpenMonth = intval(date('m',$tmWarOpen));
        $warOpenDay = intval(date('d',$tmWarOpen));
        $warOpenHour = intval(date('H',$tmWarOpen));
        $warEndHour = intval(date('H',$tmWarEnd));

        $guildWarSign = [$signOpenMonth, $signOpenDay, $signOpenHour, $signEndMonth, $signEndDay, $signEndHour];
        $guildWarOpen = [$warOpenMonth, $warOpenDay, $warOpenHour, $warEndHour];
        $updateData = array(
           'guildWarSign' => json_encode($guildWarSign),
           'guildWarOpen' => json_encode($guildWarOpen)
        );

        $result = $db->update ( self::getTableName(), $updateData, $condition );
        return $result;
    }

}
