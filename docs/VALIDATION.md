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

本次为按文件同步上游最终版本并重建变体，未把上游全部提交历史合并进 fork 的 main。同步来源详见 `upstream-sync.json`。四批升级最初通过依次审阅的草稿 PR 交付，随后按用户指令合入 main。实际演示保留验收时的汇报内容。

## 实际中文演示验收

使用升级后的 Quaero Editorial Forest Skill 生成了 8 页完整中文演示，源码见 [实际演示示例](../examples/upgrade-validation/index.html)，机器记录见 [actual-slide-validation.json](actual-slide-validation.json)。

- 8/8 页逐页检查：文本未越过画布或侵入品牌页眉页脚，页码为 01–08，无缺失图片。
- 已人工查看全部 8 页浏览器预览与全部 8 页导出 PNG，未发现裁切或内容缺失。
- Chromium 字体使用记录确认标题实际使用 LXGW WenKai TC，正文使用 Noto Serif SC；断网回放后标题仍使用内嵌字体。
- 独立 HTML 为 23,536,823 字节。断网加载不请求网络，前后翻页通过。
- 8/8 页 PNG 导出成功，均为 3840 × 2160，全部像素不透明。

这是 Windows Edge 上对该实际演示的验收，不代表所有模板的每页或所有浏览器都已经实测。独立 HTML 与高清 PNG 作为本地交付产物，未把大体积字体内嵌文件加入 Git。

## 2026-10-05 排版细查

前一次“不越界”检查没有覆盖细微对齐与非 16:9 窗口中的品牌定位。本轮检查实际 8 页演示在 1280×720、1920×1080、1440×900、1024×768 四种窗口中的布局。

发现并修正：图表类别标签偏离柱心、纵轴刻度偏离网格线、第 6 页两张流程卡片的单字尾行、品牌页眉页脚在居中画布之外。新增文案的字体子集也已补齐，实际使用的中文字体通过 Chromium 字体记录确认。

32 个页面/窗口组合均未发现文字侵入品牌安全区。图表中心与刻度的最大测量偏差均小于 0.05 个屏幕像素。69 套独立包浏览器回归通过；最终兼容性调整后，Editorial Forest 的针对性回归也通过。8 页高清 PNG 与离线 HTML 已重新生成并检查。测量摘要见 [layout-review.json](layout-review.json)。

本轮针对该实际演示做排版细查，不代表对全部 69 套模板的每一页进行了审美检查。
