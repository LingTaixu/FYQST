<?php
if(!defined('ACCESS')) {exit('Access denied.');}
class UserSession{
	const SESSION_NAME="osa_user_info";
	public static function setSessionInfo($user_info){
		$_SESSION[self::SESSION_NAME] = $user_info;
		return true;
	}
	
	public static function getSessionInfo(){
		$user_info = array();
		$user_info = $_SESSION[self::SESSION_NAME];
		return $user_info;
	}
	
	public static function getUserName(){
		$user_name = '';
		$user_name = $_SESSION[self::SESSION_NAME]['user_name'];
		return $user_name;
	}
	
	public static function getUserId(){
		$admin_id = '';
		$admin_id = $_SESSION[self::SESSION_NAME]['user_id'];
		return $admin_id;
	}
	
	public static function getRealName(){
		$real_name = '';
		$real_name = $_SESSION[self::SESSION_NAME]['real_name'];
		return $real_name;
	}
	
	public static function getUserGroup(){
		$purviews = '';
		$purviews = $_SESSION[self::SESSION_NAME]['user_group'];
		return $purviews;
	}
	
	public static function getTemplate(){
		$template = '';
		$template = $_SESSION[self::SESSION_NAME]['template'];
		return $template;
	}

    public static function getUserPlatform(){
        global $DATABASE_LIST;
        //设置一个默认平台
        $platform = empty($_SESSION[self::SESSION_NAME]['platform'])?array_keys($DATABASE_LIST)[0]:$_SESSION[self::SESSION_NAME]['platform'];
        return $platform;
    }

    public static function getUserServerId(){
        global $DATABASE_LIST;
        if(!empty($_SESSION[self::SESSION_NAME]['serverId'])){
            $serverId = $_SESSION[self::SESSION_NAME]['serverId'];
        }else{
     //       $platform = self::getUserPlatform();
          //$serverList = GameServerInfo::getServerList();
//            var_dump($serverList);
//            $serverId = array_keys($serverList)[0];
            $serverId = 1;
        }
        return $serverId;
    }


    public static function clear(){
        $_SESSION[self::SESSION_NAME] = null;
        return true; 
    }
	
	public static function reload(){
		$current_user_info=self::getSessionInfo();
		$user_info = User::getUserById($current_user_info['user_id']);

		if($user_info['status']!=1){
			Common::jumpUrl("login.php");
			return;
		}
		
		//��ȡ���û������û��齫�����Ȩ�ޱ�����$_SESSION��
		$user_group = UserGroup::getGroupById($user_info['user_group']);
		$user_info['group_id']=$user_group['group_id'];
		$user_info['user_role']=$user_group['group_role'];
		$user_info['shortcuts_arr']=explode(',',$user_info['shortcuts']);
		$menu = MenuUrl::getMenuByUrl('/admin/setting.php');
		if(strpos($user_group['group_role'],$menu['menu_id'])){
			$user_info['setting']=1;
		}
		$user_info['login_time']=Common::getDateTime($user_info['login_time']);
		//平台 区服没存库 reload时赋原值
        $user_info['platform']  = self::getUserPlatform();
        $user_info['serverId']  = self::getUserServerId();
		UserSession::setSessionInfo( $user_info);
	}
}