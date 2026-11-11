@echo off 
start http://10.104.32.217:2223/gem_gain/WebForm1.aspx
ping -n 5 127.1 >nul 2>nul 
taskkill /f /im IEXPLORE.exe 
@echo on