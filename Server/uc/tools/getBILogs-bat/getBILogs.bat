rem 当前日期前一天
Call :_GET_DAY_ADD  -1
rem 当前日期前一天年月（201508）
set YEARSM=%DAY_ADD:~0,6%
rem 当前日期前一日（24）
set DAY=%DAY_ADD:~-2%

rem 关闭应用池,防止出现删除不了文件  
taskkill /f /im w3wp.exe

rem 删除文件夹下的内容
cd /d C:\underworld\BILogs
for /f "delims=" %%a in ('dir/ad/b') do rd /s /q "%%~a"
del /f/q/s *

rem 创建文件夹
md C:\underworld\BILogs\10001\%DAY% C:\underworld\BILogs\100011\%DAY%  C:\underworld\BILogs\10002\%DAY%  C:\underworld\BILogs\100021\%DAY%  C:\underworld\BILogs\100022\%DAY%  C:\underworld\BILogs\100031\%DAY%  C:\underworld\BILogs\100032\%DAY%  C:\underworld\BILogs\100033\%DAY%  C:\underworld\BILogs\100034\%DAY%  C:\underworld\BILogs\100035\%DAY% 

[code=BatchFile1]@echo off
set ftpFile1=%temp%\TempFTP1.txt
>"%ftpFile1%" (
  echo open 119.29.117.100
  echo ftproot
  echo YGzvJFQF7tQvvAA
  echo cd /storm/UnderWorld/BILogs/1/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\10002\%DAY%
  echo mget *.*
  echo cd /storm/UnderWorld/BILogs/2/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100021\%DAY%
  echo mget *.*
  echo cd /storm/UnderWorld/BILogs/3/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100022\%DAY%
  echo mget *.*
  echo bye
)
ftp -v -i -s:"%ftpFile1%" 119.29.117.100[/code]


[code=BatchFile2]@echo off
set ftpFile2=%temp%\TempFTP2.txt
>"%ftpFile2%" (
  echo open 123.59.12.43
  echo ftproot
  echo EgretGame-998
  echo cd /storm/UnderWorld/BILogs_game/1/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100031\%DAY%
  echo mget *.*
  echo cd /storm/UnderWorld/BILogs_game/2/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100032\%DAY%
  echo mget *.*
  echo cd /storm/UnderWorld/BILogs_game/3/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100033\%DAY%
  echo mget *.*
  echo cd /storm/UnderWorld/BILogs_game/4/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100034\%DAY%
  echo mget *.*
  echo cd /storm/UnderWorld/BILogs_game/5/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100035\%DAY%
  echo mget *.*

  echo cd /storm/UnderWorld/BILogs_game/10001/1/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\10001\%DAY%
  echo mget *.*
  echo cd /storm/UnderWorld/BILogs_game/10001/2/parse/%YEARSM%/%DAY%
  echo bin
  echo lcd C:\underworld\BILogs\100011\%DAY%
  echo mget *.*

  echo bye
)
ftp -v -i -s:"%ftpFile2%" 123.59.12.43[/code]

goto :eof
:_GET_DAY_ADD
  (echo d1 = Now^(^)
   echo d2 = d1
   if not "%~2"=="" echo d1 = Replace^("%~2", ".", "-"^)
   if not "%~1"=="" echo d2 = DateAdd^("d", Eval^("%~1"^), d1^)
   echo d2 = Right^(Year^(d2^),4^) ^& "" ^& Right^("0" ^& Month^(d2^),2^) ^& "" ^& Right^("0" ^& Day^(d2^),2^)
   echo WScript.Echo d2) > "%temp%\DayAdd.vbs"
   for /f "tokens=1,* delims=??" %%i in ('CScript //NoLogo "%temp%\DayAdd.vbs"') Do (
     set DAY_ADD=%%i
   )
   goto :eof

@echo on


