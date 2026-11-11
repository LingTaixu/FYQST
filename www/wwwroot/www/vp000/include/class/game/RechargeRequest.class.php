<?php
if(!defined('ACCESS')) {exit('Access denied.');}
ini_set('memory_limit', '8024M');
//ini_set('max_execution_time', '0');

class RechargeRequest extends MainBase {
    private static $table_name = 'uw_recharge_request';      // 服务器列表信息

    private static $columns =  array('id', 'accountId', 'userId', 'serverId',  'rechargeId','status', 'addTime', 'transId', 'goodsId', 'orderNo','gmStatus','lvl','goodsPrice','feeMoney','channelId','sdkChannelId');

    public static function getTableName(){
        return self::$table_name;
    }

    // 过滤掉status=0的请求账单
    public static function count($serverId = '', $accountId = '', $transId = '', $params = [])
    {
        $db = self::__instance();
        $condition = array();
        $sub_condition = array();
        if ($serverId && $serverId != '') {
            $sub_condition['serverId'] = $serverId;
        }
        if ($accountId && $accountId != '') {
            $sub_condition['accountId'] = $accountId;
        }
        if ($transId && $transId != '') {
            $sub_condition['transId'] = $transId;
        }
        $status = $params['status'];
        if (isset($params['status'])) {
            if ($status == '>=1') {
                $sub_condition['status[>=]'] = 1;
            }
            if (is_numeric($status)) {
                $sub_condition['status'] = $status;
            }
        }
        $userId = $params['userId'];
        if ($userId) {
            $sub_condition['userId'] = $userId;
        }
        $startTime = $params['startTime'];
        if (!empty($startTime)) {
            $sub_condition['addTime[>=]'] = $startTime;
        }
        $endTime = $params['endTime'];
        if (!empty($endTime)) {
            $sub_condition['addTime[<]'] = $endTime;
        }
        $buyStatus = $params['buyStatus'];
        if (is_numeric($buyStatus)) {
            $sub_condition['status'] = $buyStatus;
        }

        $sub_condition['gmStatus[!]'] = 1;
        if (empty($sub_condition)) {
            $condition = array();
        } else {
            $condition["AND"] = $sub_condition;
        }

        $num = $db->count(self::getTableName(), $condition);
        return $num;
    }

    public static function countTopPay($params = [])
    {
        $db = self::__instance();
        $sql = "select count(DISTINCT userId) as num from " . self::$table_name . " where status in (1,2) and gmStatus != 1";
        $servers = $params['servers'];
        if ($servers && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            $sql .= " and channelId in ($str)";
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            $sql .= " and sdkChannelId in ($str)";
        }
        $list = $db->query($sql)->fetchAll();
        $num = $list[0]['num'];
        return $num;
    }

    /**
     * 获取总信息
     * @param array $params
     * @return mixed
     */
    public static function getAllInfo($params = [])
    {
        $db = self::__instance();
        $sql = "select count(DISTINCT userId) as num, sum(goodsPrice) as allPrice from " . self::$table_name . " where status in (1,2) and gmStatus != 1";
        $servers = $params['servers'];
        if ($servers && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $sql .= " and userId in ($userStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getList($serverId, $accountId,$transId, $start,$page_size){

        $db=self::__instance();
        $condition=array();

        $sub_condition = array();
        if ($serverId && $serverId != ''){
            $sub_condition['serverId'] = $serverId;
        }
        if ($accountId && $accountId != ''){
            $sub_condition['accountId'] = $accountId;
        }
        if ($serverId && $serverId != ''){
            $sub_condition['serverId'] = $serverId;
        }
        if ($transId && $transId != ''){
            $sub_condition['transId'] = $transId;
        }
        $sub_condition['status[>=]'] = 1;
        if(empty($sub_condition)){
            $condition = array();
        }else{
            $condition["AND"] = $sub_condition;
        }
        $condition['gmStatus[!]'] = 1;
        $condition['status[>=]'] = 1;
        $condition["ORDER"]=" id desc";
        $condition['LIMIT']=array($start,$page_size);
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function  getListByAccId($accId){
        $db=self::__instance();
        $condition=array();
        $condition['accountId'] = $accId;
        $condition['gmStatus[!]'] = 1;
        $condition['status[>=]'] = 1;
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function  getSuccListByServerId($accId){
        $db=self::__instance();
        $condition=array();
        $condition['accountId']=$accId;
        $condition['gmStatus[!]'] = 1;
        $list = $db->select ( self::getTableName(), self::$columns, $condition);
        return $list;
    }

    /**
     * 新增数据，添加模拟充值
     * @param $data
     * @return bool
     */
    public static function add($data)
    {
        if (!$data || !is_array($data)) {
            return false;
        }
        $db = self::__instance();
        $id = $db->insert(self::getTableName(), $data);
        return $id;
    }

    public static function update($id,$data) {

        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $condition=array("id"=>$id);

        $result = $db->update ( self::getTableName(), $data, $condition );
        return $result;
    }

    public static function getGoodsByRechargeId($params = [])
    {
        $db = self::__instance();
        $sql = "select rechargeId,goodsId,sum(goodsPrice) as sumPrice,count(id) as allCount from uw_recharge_request where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $sql .= " group by rechargeId";
        $list = $db->query($sql)->fetchAll();
        return $list;
    }

    public static function getBuyGoodsList($params = []) {
        $allNum = $allPrice = 0;
        $channelId = UserSession::getUserPlatform();
        global $CONFIG_RECHARGE;
        global $CONFIG_RECHARGE_OLD;
        global $CONFIG_PAY_INFO;
        $ret = array();
        $db=self::__instance();
//        $sql = "select goodsId,count(goodsId) count,sum(goodsPrice) as totalNum from uw_recharge_request where status in(1,2) group by goodsId";
//        $list = $db->query ( $sql )->fetchAll();
//
//        if ($list) {
//            foreach($list as $k=>$row){
//                $row['goodsName'] = $CONFIG_RECHARGE[$row['goodsId']]['name'];
//                $row['goodsPrice'] = $CONFIG_RECHARGE[$row['goodsId']]['cost'];
//                $ret[] = $row;
//            }
//        }
        $sql = "select rechargeId,goodsId,goodsPrice,addTime from uw_recharge_request where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $list = $db->query ( $sql )->fetchAll();
        if ($list) {
            foreach($list as $k=>$row){
                $theId = $row['rechargeId'];
//                foreach ($CONFIG_PAY_INFO as $key => $payInfo) {
//                    if (isset($payInfo[$channelId][$theId])) {
//                        $theId = $key;
//                    }
//                }

                $cfg_old = $CONFIG_RECHARGE_OLD[$theId];
                $cfg_new = $CONFIG_RECHARGE[$theId];
                $goodsId = $theId;
                $goodsName = $cfg_new['name'];
                if($cfg_new['name'] != $cfg_old['name'] || $cfg_new['cost'] != $cfg_old['cost']){
                    //新老版本充值表  如果商品名 或 价格有变动时区分新老商品
                    if(strtotime($row['addTime']) < strtotime('2018-01-15 17:30:00') ){
                        //老版充值表 2018-01-15 17:30:00 之前
                        $goodsId = 'OLD_'.$theId;
                        $goodsName = $cfg_old['name'];
                    }
                }

                $ret[$goodsId]['goodsId'] = $goodsId;
                $ret[$goodsId]['goodsName'] = $goodsName;
                $ret[$goodsId]['goodsPrice'] = $row['goodsPrice'];
                $ret[$goodsId]['count'] ++;
                $allNum ++;
                $ret[$goodsId]['totalNum'] += $row['goodsPrice'];
                $allPrice += $row['goodsPrice'];
            }
        }
        array_multisort(array_column($ret,'goodsId'),SORT_ASC,$ret);

        foreach ($ret as $goodsId => $value) {
            $ret[$goodsId]['numRate'] = $allNum == 0 ? 0 : sprintf("%.4f", $value['count'] / $allNum) * 100;
            $ret[$goodsId]['priceRate'] = $allPrice == 0 ? 0 : sprintf("%.4f", $value['totalNum'] / $allPrice) * 100;
        }
        return $ret;
    }

    /**
     * 查询充值排行
     * @param array $params
     * @param int $start
     * @param int $page_size
     * @return array
     */
    public static function getUserRechargeList($params = [], $start = 0, $page_size = 0)
    {
        $db = self::__instance();
        $sql = "select accountId,userId,serverId,sum(goodsPrice) as totalNum,channelId,sdkChannelId from uw_recharge_request where status in (1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if ($servers && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            $sql .= " and channelId in ($str)";
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            $sql .= " and sdkChannelId in ($str)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $sql .= " and userId in ($userStr)";
        }
        $sql .= " group by userId order by totalNum desc";
        if ($page_size > 0) {
            $sql .= " limit $start,$page_size ";
        }

        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        $userRet = array();
        if ($list) {
            foreach ($list as $k => $row) {
//                $row['goodsName'] = $CONFIG_RECHARGE[$row['goodsId']]['name'];
//                $row['goodsPrice'] = $CONFIG_RECHARGE[$row['goodsId']]['cost'];
                $serverId = $row['serverId'];
                $userRet[$serverId][] = $row['userId'];
            }
        }
        return [
            'list' => $list,
            'userRet' => $userRet
        ];
    }

    public static function getPriceByDay($params = [])
    {
        $db = self::__instance();
        $sql = "select accountId,userId,goodsId,DATE_FORMAT(addTime,'%Y-%m-%d') as day,goodsPrice,channelId,sdkChannelId from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            if ($str) {
                $sql .= " and channelId in ($str)";
            }
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            if ($str) {
                $sql .= " and sdkChannelId in ($str)";
            }
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
//        $result = $db->query($sql);
//        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
//            yield $row;
//        }
    }

    public static function getPriceByDayForAllTotal($params = [])
    {
        $db = self::__instance();
        $sql = "select accountId,DATE_FORMAT(addTime,'%Y-%m-%d') as day,goodsPrice from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $channels = $params['channels'];
        if ($channels && is_array($channels)) {
            $str = join(',', $channels);
            if ($str) {
                $sql .= " and channelId in ($str)";
            }
        }
        $sdkChannels = $params['sdkChannels'];
        if ($sdkChannels && is_array($sdkChannels)) {
            $str = join(',', $sdkChannels);
            if ($str) {
                $sql .= " and sdkChannelId in ($str)";
            }
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
//        $result = $db->query($sql);
//        while ($row = $result->fetch(PDO::FETCH_ASSOC)) {
//            yield $row;
//        }
    }

    public static function getGoodsByDay($params = [])
    {
        $db = self::__instance();
        $sql = "select accountId,userId,rechargeId,DATE_FORMAT(addTime,'%Y-%m-%d') as day,COUNT(1) as times,SUM(goodsPrice) as total,goodsPrice from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['startTime'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['endTime'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $rechargeId = $params['rechargeId'];
        if (!empty($rechargeId)) {
            $sql .= " and rechargeId=$rechargeId";
        }
        $userId = $params['userId'];
        if (!empty($userId)) {
            $sql .= " and userId=$userId";
        }
        $sql .= " group by day,rechargeId,goodsPrice order by day desc";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getPayUsers($params = [])
    {
        $db = self::__instance();
        $sql = "select count(id) as times,DATE_FORMAT(addTime,'%Y-%m-%d') day,accountId,userId,sum(goodsPrice) as allPrice,serverId from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $sql .= " and userId in ($userStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $sql .= " group by day,userId order by accountId desc";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getPayAccounts($params = [])
    {
        $db = self::__instance();
        $sql = "select count(id) as times,DATE_FORMAT(addTime,'%Y-%m-%d') day,accountId,userId,goodsPrice,serverId from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $sql .= " group by day,accountId order by accountId desc";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getTotalPayByDay($serverId)
    {
        $db = self::__instance();
        $sql = "select sum(goodsPrice) as totalPay,DATE_FORMAT(addTime,'%Y-%m-%d') day, serverId from " . self::getTableName() . " where status>0 and gmStatus != 1 
        and serverId=" . $serverId . " group by day";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getTotalPay($params = [])
    {
        $db = self::__instance();
        $sql = "select sum(goodsPrice) as totalPay from " . self::getTableName() . " where status>0 and gmStatus != 1 ";
        $accountIds = $params['accountIds'];
        if (!empty($accountIds)) {
            if (is_array($accountIds)) {
                $accountArr = join(',', $accountIds);
                $sql .= " and accountId in ($accountArr)";
            }
        }
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    /*
     * 算每个服务器，每种商品，每天，购买数量
     */
    public static function getPayByServer($params = [])
    {
        $db = self::__instance();
        $sql = "select DATE_FORMAT(addTime,'%Y-%m-%d') day,count(DISTINCT id) as allNum,SUM(goodsPrice) as allPrice,count(DISTINCT userId) as users,serverId,rechargeId from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $sql .= " group by serverId,day,rechargeId ";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    /**
     * 充值明细
     * @param array $params
     * @param int $start
     * @param int $page_size
     * @return mixed
     */
    public static function getDetailList($params = [], $start = 0, $page_size = 0)
    {
        $db = self::__instance();
        $condition = array();

        $sub_condition = array();
        $serverId = $params['servers'];
        if ($serverId) {
            $sub_condition['serverId'] = $serverId;
        }
        $accountId = $params['accountId'];
        if ($accountId) {
            $sub_condition['accountId'] = $accountId;
        }
        $transId = $params['transId'];
        if ($transId) {
            $sub_condition['transId'] = $transId;
        }
        $userId = $params['userId'];
        if ($userId) {
            $sub_condition['userId'] = $userId;
        }
        $startTime = $params['startTime'];
        if (!empty($startTime)) {
            $sub_condition['addTime[>=]'] = $startTime;
        }
        $endTime = $params['endTime'];
        if (!empty($endTime)) {
            $sub_condition['addTime[<]'] = $endTime;
        }
        $buyStatus = $params['buyStatus'];
        if (is_numeric($buyStatus)) {
            $sub_condition['status'] = $buyStatus;
        }

        $sub_condition['gmStatus[!]'] = 1;

        $condition = array();
        if (!empty($sub_condition)) {
            $condition["AND"] = $sub_condition;
        }

        $condition["ORDER"] = " id desc";
        if ($page_size) {
            $condition['LIMIT'] = array($start, $page_size);
        }
        $list = $db->select(self::getTableName(), self::$columns, $condition);
        return $list;
    }

    public static function getDetail($params = [])
    {
        $db = self::__instance();
        $sql = "select DATE_FORMAT(addTime,'%Y-%m-%d') day,addTime,accountId,userId,goodsPrice,serverId,rechargeId,goodsId,lvl from "
            . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $sql .= " and userId in ($userStr)";
        }
        $sql .= " order by addTime";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    /**
     * 首冲礼包明细
     * @param array $params
     * @return mixed
     *
     * a  查出每个玩家，每种礼包购买情况
     * b  查出首冲日期
     * 总
     */
    public static function getFirstByGoods($params = [])
    {
        $db = self::__instance();
        $sql = "select count(id) as times,DATE_FORMAT(addTime,'%Y-%m-%d') day,accountId,userId,sum(goodsPrice) as allPrice,serverId,rechargeId,goodsId,sum(lvl) sumLvl from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $sql .= " and userId in ($userStr)";
        }
        $sql .= " group by userId,day,goodsId order by day";

        $bSql = "select DATE_FORMAT(min(addTime),'%Y-%m-%d') minDay,accountId,userId from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $bSql .= " and serverId in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $bSql .= " and userId in ($userStr)";
        }
        $bSql .= " group by userId order by minDay";

        $minSql = "select sum(a.times) theTimes,min(a.day) theDay,a.accountId,a.userId,a.serverId,a.rechargeId,a.goodsId,sum(a.sumLvl) theLvl,sum(a.allPrice) thePrice 
                  from ($sql) a left join ($bSql) b on a.userId=b.userId where a.day=b.minDay  ";
        $startTime = $params['start'];
        if (!empty($startTime)) {
            $minSql .= " and a.day >= '$startTime'";
        }
        $endTime = $params['end'];
        if (!empty($endTime)) {
            $minSql .= " and a.day < '$endTime'";
        }
        $minSql .= " group by userId,goodsId order by theDay";
        $list = $db->query($minSql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getFirst($params = [])
    {
        $db = self::__instance();
        $bSql = "select DATE_FORMAT(min(addTime),'%Y-%m-%d') minDay,accountId,userId from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $bSql .= " and serverId in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $bSql .= " and userId in ($userStr)";
        }
        $bSql .= " group by userId order by minDay";
        $list = $db->query($bSql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getPriceByMonth($params = [])
    {
        $db = self::__instance();
        $sql = "select DATE_FORMAT(addTime,'%Y-%m') as month,COUNT(1) as times,SUM(goodsPrice) as total,COUNT(accountId) as accountNum,COUNT(userId) as userNum from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $sql .= " and serverId in ($serStr)";
        }
        $startTime = $params['startTime'];
        if (!empty($startTime)) {
            $sql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['endTime'];
        if (!empty($endTime)) {
            $sql .= " and addTime < '$endTime'";
        }
        $rechargeId = $params['rechargeId'];
        if (!empty($rechargeId)) {
            $sql .= " and rechargeId=$rechargeId";
        }
        $sql .= " group by month order by month desc";
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }

    public static function getSumPriceByUser($params = [])
    {
        $db = self::__instance();
        $bSql = "select sum(goodsPrice) as sumPrice,serverId,accountId,userId from " . self::getTableName() . " where status in(1,2) and gmStatus != 1 
        and rechargeId != 31 ";
        $servers = $params['servers'];
        if (!empty($servers) && is_array($servers)) {
            $serStr = join(',', $servers);
            $bSql .= " and serverId in ($serStr)";
        }
        $users = $params['users'];
        if (!empty($users) && is_array($users)) {
            $userStr = join(',', $users);
            $bSql .= " and userId in ($userStr)";
        }
        $startTime = $params['startTime'];
        if (!empty($startTime)) {
            $bSql .= " and addTime >= '$startTime'";
        }
        $endTime = $params['endTime'];
        if (!empty($endTime)) {
            $bSql .= " and addTime < '$endTime'";
        }
        $bSql .= " group by userId ";
        $list = $db->query($bSql)->fetchAll(PDO::FETCH_ASSOC);
        return $list;
    }
}




