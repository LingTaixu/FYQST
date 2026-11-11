<?php
if(!defined('ACCESS')) {exit('Access denied.');}

class Utils{

    const FAB_DIR		= "../scripts/fab";
    /*
     *  fab 需要在系统目录中, /usr/bin/fab
     */
    static public function createNewMachine($host){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab createNewMachine:h=".$host;
        //$cmd = "cd ".self::FAB_DIR.";pwd; sh createNewServer.sh ".$sid;
        //echo $cmd; exit(0);
        shell_exec($cmd);
    }

    static public function createNewServer($sid){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab createNewServer:sid=".$sid;
        //$cmd = "cd ".self::FAB_DIR.";pwd; sh createNewServer.sh ".$sid;
        //echo $cmd; exit(0);
        shell_exec($cmd);
    }

    static public function startServer($sid){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab startServer:sid=".$sid;
        shell_exec($cmd);
    }

    static public function stopServer($sid){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab stopServer:sid=".$sid;
        shell_exec($cmd);
    }

    static public function reloadServer($sid){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab reloadServer:sid=".$sid;
        shell_exec($cmd);
    }

    static public function sendSignalAllServer(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab sendSignalAllServer";
        shell_exec($cmd);
    }

    static public function sendStopAllServer(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab sendStopAllServer";
        shell_exec($cmd);
    }

    static public function sendStopAllCity(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab sendStopAllCity";
        shell_exec($cmd);
    }

    static public function sendStartAllServer(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab sendStartAllServer";
        shell_exec($cmd);
    }

    static public function sendStartAllCity(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab sendStartAllCity";
        shell_exec($cmd);
    }

    static public function sendStartServer(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab sendStartServer";
        shell_exec($cmd);
    }
    ////////////  BATTLE ////////////
    static public function createNewBattleMachine($host){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab -f fabbattle.py createNewBattleMachine:h=".$host;
        shell_exec($cmd);
    }

    static public function createNewBattleMachineEnv($host){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab -f fabbattle.py createNewBattleMachineEnv:h=".$host;
        shell_exec($cmd);
    }
    static  public function  createNewBattleServer($bid){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab -f fabbattle.py createNewBattleServer:bid=".$bid;
        shell_exec($cmd);
    }
    static public function startBattle($sid){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab -f fabbattle.py startBattle:sid=".$sid;
        shell_exec($cmd);
    }

    static public function stopBattle($sid){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab -f fabbattle.py stopBattle:sid=".$sid;
        shell_exec($cmd);
    }

    static public function sendStopAllBattle(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab -f fabbattle.py sendStopAllBattle";
        shell_exec($cmd);
    }

    static public function sendStartAllBattle(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab -f fabbattle.py sendStartAllBattle";
        shell_exec($cmd);
    }
    //////// Web Moniter
    static public function startWebMoniter(){
        $cmd = "cd ".self::FAB_DIR."; /usr/local/Python3.6.4/bin/fab startWebMoniter";
        shell_exec($cmd);
    }

    static  public function monitServer($url){

       $data = self::httpGet($url);
       $jdata = json_decode($data, true);
       $process = $jdata['processes'];
       $plist = [];
       foreach ($process as $k => $p){
           $plist[$p['name']] = $p['pm2_env']['status'];
       }
       return $plist;
    }

    static public function httpGet($url){
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_HEADER, 0);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);

        $data = curl_exec($ch);
        curl_close($ch);
        if ($data)
            return $data;
        else
            return false;
    }

    //Curl Post数据
    function httpPost($url, $vars) {
        $ch = curl_init();
        curl_setopt($ch,CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL,$url);
        curl_setopt($ch, CURLOPT_POST, 1 );
        curl_setopt($ch, CURLOPT_POSTFIELDS, $vars);
        //disable https check
        curl_setopt ($ch, CURLOPT_SSL_VERIFYHOST, 0);
        curl_setopt ($ch, CURLOPT_SSL_VERIFYPEER, 0);
        //disable https check
        $data = curl_exec($ch);
        if ($data)
        {
            curl_close($ch);
            return $data;
        }
        else
        {
            //echo 'Curl error: ' . curl_error($ch);
            curl_close($ch);
            return false;
        }
    }
}