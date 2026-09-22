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

## 阅读界面 v2

- 正文优先，角色与境内札记位于文末。右上「设置」展开后才显示主题、双语、字号与注解开关。
- 六套手动主题：春日樱花、初夏梅雨、秋分红叶、冬日晴雪、由比滨落日、雪洞幽玄。主题含对应 SVG 纹样与纸张细节，不按日期自动切换。
- 偏好保存在酒馆全局变量的独立字段 `hujiuxi_reader_preferences_v2`，跨楼层、聊天与重新加载继承；多个已显示界面同步。连续修改按顺序保存，不覆盖其他全局变量。
- 头像默认显示线描占位，可在设置中填入图片 URL。连续点击头像六次切换「九条汐 / 狐九汐」，每次间隔不超过四秒。
- 缘结通过围绕正文的红线与文末水引结逐渐成形，隐藏数值。只读 MVU，不重写历史楼层。
- 御神签按所属人分别展示番号、运势、寄语、解签与四项运势，采用静态纸签；没有签时显示空白提示。不生成随机签，不写回变量。
- 正则替换前后保留两个换行，让 HTML 美化与 Markdown 代码围栏分隔。不要删掉 JSON 替换内容首尾换行，否则紧接思维链美化时可能不创建 iframe。
- 正文不等待 MVU 才挂载，状态尚未就绪时正文仍可阅读。注解采用 Vue 文本渲染，支持悬浮或点按查看。

## 验证

`node --experimental-strip-types --test tests/reader.test.mjs` 检查 gal 边界、正则分隔、双语嵌套注解和去重。`pnpm exec eslint src/狐九汐/界面/沉浸阅读` 检查源码。
