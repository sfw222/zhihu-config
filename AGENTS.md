# Project Guidelines

知乎深色/浅色主题切换 + 多色彩主题预设油猴脚本（Tampermonkey）。

## 发布工作流（强制）

每次完成代码修改后，必须按顺序执行：

1. 递增 `zhihu-config.user.js` 头部的 `@version`（如 7.1 → 7.2）
2. 运行语法检查：`node --check zhihu-config.user.js`
3. `git add` + `git commit`，提交信息用中文 conventional commit（`feat:` / `fix:` / `refactor:`）
4. `git push origin main` 直接推送，无需询问

## 架构要点

- 主题预设定义在 `PRESETS`：含 `name` / `swatches` / `vars`（`--z-*` 变量）；浅色预设带 `mode:'light'`，应用时给 `<html>` 加 `zh-light-preset` class
- `--z-*` 变量只在脚本注入的补丁 CSS 中被消费；补丁 CSS 选择器用 `:is([data-theme="dark"],[data-theme="light"].zh-light-preset)` 双模式化，浅色覆盖块（`color-scheme:light`、`--color-primary` 品牌青、`img{filter:none}`）追加在样式串末尾
- 状态恢复统一走 `applySavedState()`；预设模式与主题不匹配时 `presetFor()` 回落 `'default'`
- 设置面板与补丁 CSS 自身是深色外观（硬编码色值），与页面主题隔离

## 验证

- 语法：`node --check zhihu-config.user.js`
- 手动：油猴面板切换深/浅色 + 各预设，确认页面配色与选中态正确
