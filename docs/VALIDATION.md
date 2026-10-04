# 升级自验证记录

验证日期：2026-10-04（Asia/Shanghai）。本地环境：Windows、Node.js 20.20.2、Playwright 1.62.1、Microsoft Edge。

## 验证结果

| 项目 | 结果 | 范围 |
|---|---|---|
| 构建 | 通过 | 34 套基础模板、34 套品牌变体、1 套 Institutional，69 个 Skill |
| 元数据与资源 | 通过 | 69 套模板和 Skill；YAML、索引、参考文档、资源清单、页数 |
| 回归测试 | 3/3 通过 | 非法元数据、可搬移资源包、缺失或越界资产 |
| 可重复构建 | 通过 | 连续两次构建，975 个文件 SHA-256 一致 |
| 独立包浏览器验收 | 69/69 通过 | 包复制到仓库外，仅从副本加载；脚本、资源、前后翻页和品牌总页数 |
| 中文长标题 | 3/3 通过 | Pink Script、Editorial Forest、Institutional，替换长标题并按规则调整排版 |
| PNG 回归 | 通过 | 非透明像素、伪元素、缩放画布中的品牌底栏位置、真实下载 |
| 离线 HTML | 通过 | 内嵌脚本、图片、CSS import 后，断网打开仍可运行和翻页 |
| 失败处理 | 通过 | 404 资源导致导出失败；剪贴板拒绝权限时显示失败，不宣称成功 |
| 真实模板在线与离线验收 | 通过 | Quaero Editorial Forest：真实字体加载，断网回放后翻页、字体与 PNG |
| npm audit | 通过 | 包含开发依赖，0 个已报告漏洞 |
| git diff --check | 通过 | 无空白错误 |

真实模板的独立 HTML 为 23,978,571 字节，PNG 为 445,599 字节。字体内嵌是 HTML 体积的主要来源。

浏览器结构测试默认不访问外部字体。中文测试验证长标题布局，不证明所有中文字体 CDN 都可用。另一个线上测试只验证指定真实模板的字体。

已人工查看代表模板、中文标题、真实模板页面和 PNG。模板边界检查没有发现超出画布的代表标题。未对全部幻灯片进行逐页像素比较。

## 重现方式

```sh
npm ci
npm run build
npm test
npm run verify
npm run verify:repro
npx playwright install chromium
npm run verify:browser
npm run verify:online
```

Windows 使用 Edge 时，在 PowerShell 中先设置 `$env:BROWSER_CHANNEL='msedge'`。

原始浏览器结果保存在 `artifacts/browser-report.json`，线上测试结果保存在 `artifacts/online-export-report.json`，同目录有截图、PNG 和独立 HTML。GitHub Actions 将上传浏览器测试产物。

## 验证中修复的问题

- SVG 数据中的内部 URL 被资源扫描误判为文件。
- 上游部分元数据的页数与 HTML 不一致。
- 部分 deck-stage 页面没有 `.slide` 类名。
- 滚动式模板的品牌页码缺少滚动同步。
- 原始动画锁定时间超过测试等待时间；浏览器验收改为顺序运行。
- PNG 复制的逻辑定位属性覆盖了品牌底栏坐标。
- 品牌安全区使用视口像素，但固定画布内的 padding 使用原生像素。

## 验证边界

微信公众号编辑器的粘贴结果、Safari/Firefox、用户设备的剪贴板权限尚未实测。PNG 使用 SVG foreignObject，新增复杂滤镜或其他浏览器需要重新验证。没有把这些能力列为已经验证。

本次为按文件同步上游最终版本并重建变体，未把上游全部提交历史合并进 fork 的 main。同步来源详见 `upstream-sync.json`。四批升级通过依次审阅的 PR 交付，main 尚未修改。
