# 音频与低带宽运行

当前采用全静音策略：客户端不加载背景音乐和音效，服务器对遗留音频请求返回 204 和零字节正文。因此没有另行生成低码率音频，也没有用降低音量代替停止下载。

## 新运营后台

`vp000` 的 Bun 服务同样拦截音频 URL，返回 204 / 零正文；React 页面没有音频资源，CSP 也禁止媒体加载。前端按页面动态导入，构建预生成 Brotli / gzip，内容散列资源使用一年不可变缓存和 ETag。API 使用 gzip、分页与按需详情，页面没有自动轮询或外部字体。

浏览器已验证新后台的 22 个资源页面、公告 CRUD、邮件审核、礼包 CSV、模拟充值和报表；资源实际通过 Brotli 传输，页面脚本错误和音频请求均为 0。接口和部署方式见 [后台迁移说明](admin-migration.md)。

## 客户端

`www/wwwroot/www/game.html` 在 SDK 前加载 `js/bandwidth.js`，并在启动 Egret 前安装策略：

- 固定 `window.noVoice=true`，隐藏已有音频开关。
- 禁用 mo 音乐和音效播放，音频配置即使被旧本地偏好重新启用，也保持关闭。
- 替换 Egret Sound、HtmlSound、WebAudioSound 的加载入口，不发起网络请求。
- 静音加载仍异步触发 COMPLETE，避免资源组等待、失败重试或界面卡住；播放返回可安全停止的静音通道。

新增资源或更换 Egret 版本后，应继续验证这三个加载入口。外部 SDK 如自行实现音频加载，还需要应用同样策略；本次已验证游戏登录和进入一区路径。

## 服务器

WSL 使用的 `scripts/router.php` 在处理静态文件前拦截 mp3、ogg、oga、wav、m4a、aac、flac、opus、weba 扩展，大小写不敏感，并处理 URL 编码、查询参数和 Range 请求。返回：

```http
HTTP/1.1 204 No Content
Cache-Control: public, max-age=31536000, immutable
X-Audio-Policy: disabled
```

如果使用 Nginx 托管静态资源，需要在站点 `server {}` 内、其他静态正则 location 之前包含 `deploy/nginx-bandwidth.conf` 的绝对路径，然后用 `nginx -t` 检查并重载。该文件是提供的部署配置，当前 WSL 实测使用 PHP 路由。

对于已有 CDN 或其他静态服务器，也应应用扩展拦截规则并清理旧音频缓存。仅修改 PHP 路由无法影响绕过 PHP 的静态文件服务。

## 资源与上传

原项目共有 12 个 MP3，总计 1,907,378 字节，约 1.82 MiB，位于 resource/music 和 resource/sound。这是全部原始音频体积，不表示每次登录都会下载全部文件。

原文件保留在当前磁盘，`.gitignore` 的 `*.mp3` 阻止它们进入 GitHub。新克隆没有这些文件也可以正常运行：客户端不请求音频，服务器仍对旧音频 URL 返回 204。若以后恢复声音，需同时调整客户端、服务器策略及 Git 忽略规则。

## 检查

```bash
bun test ./tests
curl -sS -D - -o /tmp/fyqst-audio-body http://127.0.0.1:8080/resource/music/city.mp3
wc -c /tmp/fyqst-audio-body
curl -sS -H 'Range: bytes=0-1023' -D - -o /tmp/fyqst-audio-range http://127.0.0.1:8080/resource/music/city.mp3
wc -c /tmp/fyqst-audio-range
```

应返回 204，两个正文文件均为 0 字节。浏览器 Network 过滤音频扩展，应没有游戏音频请求；旧设置启用音效后结果也应相同。音频文件不适合通过普通 gzip 获得明显收益，本项目直接取消其传输，避免额外消耗服务器带宽。

2026-11-11 实测：Windows Chromium 登录测试账号并进入一区后，脚本错误、失败请求和 HTTP 错误均为 0。预先保存启用音效设置，再尝试修改 mo 开关、播放音乐/音效和直接调用 Egret Sound.load，音频请求数仍为 **0**、音频传输为 **0 字节**，静音加载正常触发 COMPLETE。服务器的 GET、HEAD、Range、大小写及 URL 编码、缺失音频文件、扩展名后附路径共 6 个请求场景均返回 204、正文 0 字节。
