<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class MachineInfo extends Base
{
    private static $table_name = 'machine_info';      // 服务器列表信息

    private static $columns = array('id', 'name', 'desc_info', 'host', 'outer_ip', 'inner_ip', 'is_init', 'type', 'servers', 'rtime', 'create_time');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function count($params = [])
    {
        $db = self::__instance();
        $condition = array();
        $sub_condition = array();

        $type = $params['type'];
        if (!empty($type)) {
            $sub_condition['type'] = $type;
        }

        if (!empty($sub_condition)) {
            $condition["AND"] = $sub_condition;
        }
        $num = $db->count(self::getTableName(), $condition);
        return $num;
    }

    public static function getList($params = [])
    {
        $db = self::__instance();
        $sql = "select id,name,desc_info,host,outer_ip,inner_ip,is_init,type,servers,rtime from " . self::getTableName() . " where 1=1 ";
        $id = $params['id'];
        if (!empty($id)) {
            $sql .= " and id = $id";
        }
        $type = $params['type'];
        if (is_numeric($type)) {
            $sql .= " and type = $type";
        }
        $pageStart = $params['pageStart'];
        $pageSize = $params['pageSize'];
        $sql .= " order by id desc";
        if ($pageStart) {
            $sql .= " limit $pageStart, $pageSize";
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function addData($data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $id = $db->insert(self::getTableName(), $data);
        return $id;
    }

    public static function getMachine($serverId, $type=0)
    {
        if (!$serverId) {
            return false;
        }

        $mlist = self::getList(['type' => $type]);
        foreach ($mlist as $k => $m) {
            $servers = explode(",", $m['servers']);
            if (in_array($serverId, $servers)) {
                return $m;
            }
        }

        return false;
    }

    public static function updateDataById($id, $data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $condition = array("id" => $id);
        $result = $db->update(self::getTableName(), $data, $condition);
        return $result;
    }

    public static function getMachineById($id){
        $db=self::__instance();
        $condition['id'] = $id;
        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            return $list[0];
        }
        return false;
    }

    public static function  isMachineInitDone($host){
        if (! $host ) {
            return 0;
        }
        $db=self::__instance();
        $condition = array("host" => $host,
            "is_init" => 1);
        $result = $db->select ( self::getTableName(), self::$columns,$condition );
        if($result){
            return 1;
        }
        return 0;
    }
}