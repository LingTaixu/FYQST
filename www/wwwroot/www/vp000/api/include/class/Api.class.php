<?php

class Api
{
    /**
     * 返回正确
     * @param $data
     * @return mixed
     */
    public static function successData($data = [])
    {
        $result = [
            'retcode' => 1,
            'data' => $data
        ];
        return json_encode($result);
    }

    /**
     * 返回错误
     * @param $code
     * @param array $data
     * @return string
     */
    public static function errorData($code, $data = [])
    {
        $result = [
            'retcode' => $code,
            'data' => $data
        ];
        return json_encode($result);
    }

    /**
     * 返回json
     * @param array $data
     * @return string
     */
    public static function returnJson($data = [])
    {
        return json_encode($data);
    }

    public static function md5Sign($param = [])
    {
        $sign = '';
        if ($param) {
            foreach ($param as $k => $v) {
                $sign .= $v;
            }
        }
        return md5($sign);
    }
}