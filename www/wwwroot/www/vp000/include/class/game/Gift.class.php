<?php
if(!defined('ACCESS')) {exit('Access denied.');}
//礼包码
class Gift extends MainBase {
    private static $table_name = 'uw_coupon';

    private static $columns =  array('id', 'userId', 'name', 'content','code','type','startTime','endTime','items','channelId','isUsed','serverId','accountId','channelIds','isNew','period');

    public static function getTableName(){
        return self::$table_name;
    }
    //文件列表
    public static function getFileList() {

        $list = array();
        if (is_dir(GIFT_FILE)) {
            if ($dh = opendir(GIFT_FILE)) {
                while (($file = readdir($dh)) !== false) {
                    if($file !='.' && $file !='..' && $file !='.DS_Store'){
                        $list[] = $file;
                    }
                }
                closedir($dh);
            }
        }
        return $list;
    }

    //列表
    public static function getAllGift() {
        $db=self::__instance();
        $sql = "select * from ".self::getTableName();
        $list = $db->query($sql)->fetchAll(PDO::FETCH_ASSOC);
        if ($list) {
            return $list;
        }
        return array ();
    }

    public static function getGiftByCode($code) {
        if ( $code == "" ) {
            return array();
        }
        $db=self::__instance();
        $condition['code'] = $code;
        $list = $db->select ( self::getTableName(), self::$columns, $condition );
        if ($list) {
            return $list [0];
        }
        return array ();
    }

    public static function addGift1($data) {
        if (! $data || ! is_array ( $data )) {
            return false;
        }
        $db=self::__instance();
        $id = $db->insert ( self::getTableName(), $data );
        return $id;
    }

    public static function addGift($data,$count)
    {
        $db=self::__instance();
        if(!file_exists(GIFT_FILE)){
            mkdir (GIFT_FILE,'0777',true);
            chmod(GIFT_FILE, 0777);
        }

        //$channel = $data['channel_id'];
        $name = $data['name'];
        $fname = "礼包名称_".$name.'_数量_'.$count.'_日期_'.date('Y-m-d');
        $ext = '.txt';
        $filename = $fname.$ext;
        $fullname = GIFT_FILE.$filename;
        $fp = fopen($fullname,"a+");
        //var_dump($fp);
        // 从db取当前递增值
        $autoAdd = $db->max(self::getTableName(),'id');
        if($autoAdd == null || $autoAdd == false)
        {
            $autoAdd=0;
        }

        $insertData = array();
        for($m = 1; $m <= $count; $m++)
        {
            $id = $autoAdd + $m;
            $code = self::create_duid($id);
            $data['code'] = $code;
            $data['isNew'] = 1;
            //TODO优化下 一次性insert  fwrite
            $insertData[] = $data;
//            $query = $db->query("
//    INSERT INTO uw_coupon(`id`,`name`,`content`,`code`,`type`,`startTime`,`endTime`,`items`,`channelIds`,`channelId`,`isUsed`,`serverId`,`period`,`isNew`)
//    VALUES ({$autoid},'测试礼包','这是测试礼包','{$code}',{$giftType},'2010-01-18 00:00:01','2028-01-18 00:00:01','{\"99\":\"10000\"}',null,99999,0,1,0,1)");

            if(flock($fp,LOCK_EX))
            {
                fwrite($fp, $code."\r\n");
                flock($fp,LOCK_UN);
            }
        }
        fclose($fp);
        $addid = $db->insert(self::getTableName(), $insertData);
//        $zip=new ZipArchive;
//        echo GIFT_FILE."{$fname}.zip";
//        if($zip->open(GIFT_FILE."{$fname}.zip",ZipArchive::OVERWRITE)===TRUE){
//            $zip->addFile($fullname,"$filename");//假设加入的文件名是image.txt，在当前路径下
//            $zip->close();
//        }else{
//            echo '文件打开失败';
//        }
        //unlink ($fullname);
        return $count;
    }

    public static function create_duid($id)
    {
        $str_channel = sprintf("%08d", $id);
        $UID = $str_channel;
        $strPol = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHIJKLMNPQRSTUVWXYZ";
        $max = strlen($strPol) - 1;
        $strnum = strlen($UID);
        while ($strnum){
            $array[] = substr($UID,0,1);
            $UID = substr($UID,1,$strnum);
            $strnum = strlen($UID);
        }
        //$output=implode(',',$array);
        $str = "";
        foreach($array as $char)
        {
            $str = $str.$strPol[rand(0,$max)].$char;
        }
        return $str;
    }

//    public static function delGiftByTypeId($typeid)
//    {
//        if (! $typeid || ! is_numeric ( $typeid )) {
//            return false;
//        }
//        $db=self::__instance();
//        $condition = array("typeid" => $typeid);
//        $result = $db->delete ( self::getTableName(), $condition );
//        return $result;
//    }
    public static function downLoadFile($filename)
    {
        //===========================================================
//        $fullname = GIFT_FILE.$filename; //文件路径
//        header("Content-Type: application/txtf");
//        header("Content-Disposition: attachment; filename=".basename($filename));
//        readfile($fullname);
        //===========================================================
        $fullname = GIFT_FILE.$filename; //文件路径
        $str = readfile($fullname);
        header("Content-type: text/plain");
        header("Accept-Ranges: bytes");
        header("Content-Disposition: attachment; filename=".$filename);
        header("Cache-Control: must-revalidate, post-check=0, pre-check=0" );
        header("Pragma: no-cache" );
        header("Expires: 0" );
        exit($str);
    }


}
