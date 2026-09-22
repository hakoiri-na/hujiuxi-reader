# 狐九汐 · 雨下书简

基于 Tavern Helper 模板的 Vue / MVU 阅读界面。上游模板：https://github.com/StageDog/tavern_helper_template

## 正文格式

仅渲染当前楼层完整的 `<gal>正文</gal>` 区块，标签外的 MVU 更新内容不会进入阅读区。多个完整区块按顺序合并；没有完整区块时显示空状态。

支持 `「日语|中文」` 双语切换和 `{词语|注释}` 风物志。

## 安装

启用酒馆助手、MVU 与角色卡变量结构脚本。将仓库 `install/gal-reader.json` 导入角色卡局部正则，启用仅显示替换。将正文放进 gal 标签；变量更新放在标签之外。

加载文件：`https://testingcf.jsdelivr.net/gh/hakoiri-na/hujiuxi-reader@main/dist/狐九汐/界面/沉浸阅读/index.html`。

## 开发

`pnpm install --frozen-lockfile` 后运行 `pnpm build`。实时修改使用 `pnpm watch`，并启用酒馆助手“允许监听”。

御神签展示来自楼层 MVU，动画只展开已有签文，不会凭空创建或覆盖剧情中的签。
