# Neko Releases

`nkbr.cc` 的静态软件发布页，目前提供 Lanzou++ 的发布入口。

## 本地预览

这是零构建依赖的静态站点，可在仓库根目录启动任意静态文件服务器预览。

## 发布

- 源码：GitHub `main` 分支
- 静态源：GitHub `nekobyran/remote`
- 边缘入口：Cloudflare Worker（只代理仓库中的公开静态文件）
- 自定义域名：`nkbr.cc`

更新 `main` 分支的静态文件后，线上内容会在短缓存周期内自动刷新；修改 `worker.js` 时再使用 Wrangler 部署边缘入口。
