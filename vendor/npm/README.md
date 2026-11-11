# 内部模块压缩备份

此目录可直接提交到 Git。`archives.json` 记录每个压缩包的来源用途、SHA-256 和大小，由根 `postinstall` 及 `bun run deps:check` 校验。

logger@0.1.0、str-utils@0.1.0 正常情况下随 cmdjs@0.0.14 一起安装，缺失时从这里恢复。logger@0.0.1 的公开接口与原项目不兼容。

uwa-middleware、uwa-tools 原来嵌套于业务包 node_modules 中，没有 package.json，也没有可用同名 npm 包。源码现放在对应业务包 lib/ 下；middleware 的 monitor/view 两个版本分别归档。归档标记为 unversioned，未虚构 npm 版本。缺失本地 lib 入口时安装脚本可恢复它们；编辑源码后应重新安装以刷新运行副本。

完整说明见根目录 `docs/dependencies.md`。这些是原始内部模块的最小备份，不包含整棵第三方 node_modules。
