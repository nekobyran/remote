# Neko Releases

`nkbr.cc` 的静态软件目录页，目前仅提供 LanzouPlus 的公开发布入口，并展示开发中的 LanzouYOU 与本地 FLClash++ 项目。其他独立渠道不在根目录公开链接。

## 本地预览

这是零构建依赖的静态站点，可在仓库根目录启动任意静态文件服务器预览。

## 发布

- 源码：GitHub `main` 分支
- 静态源：GitHub `nekobyran/remote`
- 边缘入口：Cloudflare Worker（只代理仓库中的公开静态文件）
- 自定义域名：`nkbr.cc`

边缘入口固定读取已发布的 Git 提交，避免半更新状态；更新静态文件后，将 `worker.js` 中的提交版本改为最新提交并重新部署。
