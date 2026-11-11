<?php

class Help
{
    /**
     * 获取相差天数
     * @param $start
     * @param $end
     * @return float
     */
    public static function getDifferentDays($start, $end)
    {
        if (!is_numeric($start)) {
            $start = strtotime($start);
        }
        if (!is_numeric($end)) {
            $end = strtotime($end);
        }
        $days = floor(($end - $start) / 86400);
        return $days;
    }

    /**
     * 获取服务器列表html
     * @param $gameServerArr
     * @param $chooseServer
     * @return string
     */
    public static function getServerSelect($gameServerArr, $chooseServer)
    {
        $html = '';
        if (!empty($gameServerArr) && is_array($gameServerArr)) {
            $html .= "<select class='markChooseServer' name='chooseServer' id='chooseServer'>";
            foreach ($gameServerArr as $serverId) {
                if ($serverId == $chooseServer) {
                    $html .= "<option value = '" . $serverId . "' selected=selected>" . $serverId . "服</option>";
                } else {
                    $html .= "<option value = '" . $serverId . "'>" . $serverId . "服</option>";
                }
            }
            $html .= "</select>";
        }
        return $html;
    }

    public static function getServerInput($defValue = '')
    {
        $maxServer = self::getMaxServerNum();
        $placeholder = '逗号横杠分隔。如：1,3,8-22。默认为全服,当前最大服为:' . $maxServer;
        return '<label>服编号</label>
	<input type="text" id="selectServer" name="selectServer" value="' . $defValue . '" placeholder="' . $placeholder . '" style="width: 400px;"/>';
    }

    /**
     * 获取渠道列表html
     * @param $gameChannelArr
     * @param $chooseChannel
     * @param $name
     * @return string
     */
    public static function getChannelSelect($gameChannelArr, $chooseChannel, $name = 'chooseChannel')
    {
        $html = '';
        if (!empty($gameChannelArr) && is_array($gameChannelArr)) {
            $html = "<div class=\"controls\">
                    <label style=\"display: inline-block;font-size: 12px;width: 180px\"><input type=\"checkbox\" class=\"selectAllChannel\" value=\"0\" separtator=\" \">全选</label>
                </div>";
            $html .= "<div class=\"controls allChannel\">";
            foreach ($gameChannelArr as $key => $val) {
                $checked = '';
                if (in_array($key, $chooseChannel)) {
                    $checked = "checked=true";
                }
                $html .= "<label style=\"display: inline-block;font-size: 12px;width: 180px\"><input type=\"checkbox\" name=\"{$name}[]\" value=\"{$key}\" separtator=\" \" $checked>{$val}</label>";
            }
            $html .= "</div>";
            $html .= "<script type=\"text/javascript\">
                $(document).on('click', '.selectAllChannel', function () {
                    if ($(this).is(':checked')) {
                        $(this).parents('.markChannelDiv').find(\"input[name='{$name}[]']\").prop('checked', true);
                    } else {
                        $(this).parents('.markChannelDiv').find(\"input[name='{$name}[]']\").prop('checked', false);
                    }
                });
                $(document).on('click', '.show_{$name}', function () {
                    var thisBtn = $(this);
                    if (thisBtn.attr('data') == 'on') {
                        thisBtn.parents('.markFaChannel').find('.markChannelDiv').hide();
                        thisBtn.attr('data', 'off');
                    } else {
                        thisBtn.parents('.markFaChannel').find('.markChannelDiv').show();
                        thisBtn.attr('data', 'on');
                    }
                });
            </script>";
        }
        return $html;
    }

    public static function getMaxServerNum()
    {
        $serversInfo = GameServerInfo::getAllServer();
        $gameServerArr = [];
        foreach ($serversInfo as $row) {
            $gameServerArr[] = $row['serverId'];
        }
        return max($gameServerArr);
    }

    public static function getSelectedServers($servers, $sttt)
    {
        $selectId = array();
        $selectedServers = array();

        $maxServer = self::getMaxServerNum();

        if (!empty($sttt)) {
            $sttt = str_replace('，', ',', $sttt);
            $sttt = str_replace(' ', '', $sttt);
            $tmp = explode(',', $sttt);
            foreach ($tmp as $tt) {
                $tt = trim($tt);
                if (!empty($tt)) {
                    if (strstr($tt, '-')) {
                        $ttArray = explode('-', $tt);
                        $min = min($ttArray[1], $maxServer);
                        for ($i = $ttArray[0]; $i <= $min; $i++) {
                            $selectedServers[$i] = 's' . $i;
                            $selectId[] = $i;
                        }
                    } else {
                        if ($tt <= $maxServer) {
                            $selectedServers[$tt] = 's' . $tt;
                            $selectId[] = $tt;
                        }
                    }
                }
            }
        } else {
            $selectId = $servers;
            foreach ($servers as $sVal) {
                $selectedServers[] = 's' . $sVal;
            }
        }
        krsort($selectedServers, SORT_NUMERIC);

        return [
            'sttt' => $sttt,
            'selectId' => $selectId,
            'selectedServers' => $selectedServers,
        ];
    }

    /**
     * 导出excel
     * @param $fileName
     * @param $title
     * @param $outArr
     */
    public static function writeExcel($fileName, $title, $outArr)
    {
        $titleKey = array_keys($title);

        $objPHPExcel = new PHPExcel();
// Set properties
        $objPHPExcel->getProperties()
            ->setCreator("Maarten Balliauw")
            ->setLastModifiedBy("Maarten Balliauw")
            ->setTitle("Office 2007 XLSX Test Document")
            ->setSubject("Office 2007 XLSX Test Document")
            ->setDescription("Test document for Office 2007 XLSX, generated using PHP classes.")
            ->setKeywords("office 2007 openxml php")
            ->setCategory("Test result file");

        $Excel = $objPHPExcel->setActiveSheetIndex(0);

        $row = 1;
//set data
        $line = 0;
        foreach ($title as $width => $value) {
            if (strlen($value) != mb_strlen($value)) {
                $width = (strlen($value) + iconv_strlen($value)) * 1.1 * 8.26 / 22;
                $objPHPExcel->getActiveSheet()->getColumnDimension(self::getNameFromNumber($line))->setWidth($width);
            } else {
                $objPHPExcel->getActiveSheet()->getColumnDimension(self::getNameFromNumber($line))->setAutoSize(true);
            }
            $Excel->setCellValue(self::getNameFromNumber($line++) . '' . $row, $value);
        }
        $row++;

        foreach ($outArr as $dateVal => $data) {
            $i = 0;
            foreach ($titleKey as $t) {
                $item = $data[$t] ? $data[$t] : '';
                $Excel->setCellValue(self::getNameFromNumber($i) . '' . $row, $item);
                $i++;
            }
            $row++;
        }

        $file_name = $fileName;
// Rename sheet
        $objPHPExcel->getActiveSheet()->setTitle($file_name);
// Set active sheet index to the first sheet, so Excel opens this as the first sheet
        $objPHPExcel->setActiveSheetIndex(0);
// Redirect output to a client鈥檚 web browser (Excel5)
        header('Content-Type: application/vnd.ms-excel');
        header("Content-Disposition: attachment;filename={$file_name}.xls");
        header('Cache-Control: max-age=0');

        $objWriter = PHPExcel_IOFactory::createWriter($objPHPExcel, 'Excel5');
        $objWriter->save('php://output');
    }

    public static function getNameFromNumber($num)
    {
        $numeric = $num % 26;
        $letter = chr(65 + $numeric);
        $num2 = intval($num / 26);
        if ($num2 > 0) {
            return self::getNameFromNumber($num2 - 1) . $letter;
        } else {
            return $letter;
        }
    }
}

