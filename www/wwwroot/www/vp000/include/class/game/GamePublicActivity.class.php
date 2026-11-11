<?php
if (!defined('ACCESS')) {
    exit('Access denied.');
}

class GamePublicActivity extends MainBase
{
    private static $table_name = 'uw_public_activity';      // 活动列表

    private static $columns = array('id', 'title', 'fullTitle', '`type`', 'iconType', 'tiIconType', 'startTime', 'endTime',
        'items', 'randomHeroes', 'exValues', 'exValues2', 'exValues3', 'content', 'isOpen', 'sort', 'exData', 'note', 'templateId', 'isTemplate', 'templateName',
        'serverArr','isAnyTimeValid');

    public static function getTableName()
    {
        return self::$table_name;
    }

    public static function count($params = [])
    {
        $db = self::__instance();


        $condition = array();
        $sub_condition = array();
        $isTemplate = $params['isTemplate'];
        if (!empty($isTemplate)) {
            $sub_condition['isTemplate'] = $isTemplate;
        }

        if (empty($sub_condition)) {
            $condition = array();
        } else {
            $condition["AND"] = $sub_condition;
        }

        return $db->count(self::getTableName(), $condition);
    }

    public static function getList($start = 0, $page_size = 0, $params = [], $getColumns = [])
    {
        $db = self::__instance();
        $condition = array();
        $condition["ORDER"] = " type,id asc";
        if (isset($params['id'])) {
            $condition['AND']['id'] = $params['id'];
        }
        if (isset($params['templateName'])) {
            $condition['AND']['templateName'] = $params['templateName'];
        }
        if (isset($params['isTemplate'])) {
            $condition['AND']['isTemplate'] = $params['isTemplate'];
        }
        if ($page_size) {
            $condition['LIMIT'] = array($start, $page_size);
        }
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function getTemplateList($params = [], $getColumns = [])
    {
        if (empty($getColumns)) {
            $getColumns = self::$columns;
        }
        $db = self::__instance();
        $condition = array();
        if (isset($params['id'])) {
            $condition['AND']['id'] = $params['id'];
        }
        if (isset($params['templateName'])) {
            $condition['AND']['templateName'] = $params['templateName'];
        }
        if (isset($params['isTemplate'])) {
            $condition['AND']['isTemplate'] = $params['isTemplate'];
        }
        $condition["ORDER"] = " type,id asc";
        $list = $db->select(self::getTableName(), $getColumns, $condition);
        return $list;
    }

    public static function getActivityById($id)
    {
        $db = self::__instance();
        $condition = array();
        $condition['id'] = $id;
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        if ($list) {
            return $list[0];
        }
        return array();
    }

    public static function insert($data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $result = $db->insert(self::getTableName(), $data);
        return $result;
    }

    public static function update($id, $data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $condition = array("id" => $id);

        $result = $db->update(self::getTableName(), $data, $condition);
        return $result;
    }

    public static function templateSwitch($data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $condition = array("isTemplate" => 1);

        $result = $db->update(self::getTableName(), $data, $condition);
        return $result;
    }

}