# Quaero Beautiful HTML Templates

为 AI 驱动的演示文稿生成而设计的精美 HTML 模板库。

69 套 HTML 幻灯片模板（34 套基础模板、34 套 Quaero 变体和 1 套 Institutional），内置 Quaero institutional chrome — 让任何 AI agent 都能自动选择合适的模板，生成漂亮的演示文稿。

## 快速开始

告诉你的 AI agent：

```
Clone https://github.com/GeziP/quaero-beautiful-html-templates and follow the instructions in AGENTS.md to build me a beautiful HTML slide deck.
```

使用本库的 Agent 应先阅读 [`AGENTS.md`](./AGENTS.md)。这是操作手册：如何读取 `index.json`、匹配用户需求与模板、克隆并替换内容。

## Quaero Chrome

`quaero-*` 模板包含 Quaero institutional chrome — 一套统一的顶栏和底栏，会根据幻灯片背景自动调整明暗：

- 顶栏显示当前幻灯片标题和页码
- 底栏显示 Quaero logo 和保密声明
- 根据背景亮度自动切换明/暗文字

## 模板结构

所有模板位于 `templates/` 目录：

```
templates/<template-slug>/
  template.html      # 独立的 HTML 幻灯片
  template.json      # 元数据：风格、配色、适用场景
  design.md          # 设计系统、布局规则、中文字体适配
  styles.css         # （可选）外部样式
  deck-stage.js      # （可选）自定义幻灯片引擎
```

浏览 [`templates/`](./templates/) 文件夹查看所有模板。每个 `template.json` 描述了模板的视觉系统、风格和适用场景 — Agent 用这些元数据来匹配用户需求。

## 模板展示

34 个基础模板，每个展示 3 张幻灯片（封面 · 中间 · 后段），帮助你快速了解每个视觉系统的布局能力。点击模板名称可打开对应文件夹。

### [Soft Editorial](./templates/soft-editorial/)

<p>
  <img src="./screenshots/soft-editorial-4.png" width="32.5%" alt="Soft Editorial — slide 4" />
  <img src="./screenshots/soft-editorial-6.png" width="32.5%" alt="Soft Editorial — slide 6" />
  <img src="./screenshots/soft-editorial-10.png" width="32.5%" alt="Soft Editorial — slide 10" />
</p>

> Cormorant Garamond serif on warm paper with sage, blush, and lemon accents.

### [Stencil & Tablet](./templates/stencil-tablet/)

<p>
  <img src="./screenshots/stencil-tablet-1.png" width="32.5%" alt="Stencil & Tablet — slide 1" />
  <img src="./screenshots/stencil-tablet-3.png" width="32.5%" alt="Stencil & Tablet — slide 3" />
  <img src="./screenshots/stencil-tablet-8.png" width="32.5%" alt="Stencil & Tablet — slide 8" />
</p>

> Bone paper with stencil-cut headlines and a six-color earth palette: archaeology meets brand.

### [Vellum](./templates/vellum/)

<p>
  <img src="./screenshots/vellum-1.png" width="32.5%" alt="Vellum — slide 1" />
  <img src="./screenshots/vellum-4.png" width="32.5%" alt="Vellum — slide 4" />
  <img src="./screenshots/vellum-8.png" width="32.5%" alt="Vellum — slide 8" />
</p>

> Deep navy canvas with warm-yellow italic Cormorant serifs and a single dusty teal accent. A quiet, scholarly aesthetic.

### [Neo-Grid Bold](./templates/neo-grid-bold/)

<p>
  <img src="./screenshots/neo-grid-bold-1.png" width="32.5%" alt="Neo-Grid Bold — slide 1" />
  <img src="./screenshots/neo-grid-bold-3.png" width="32.5%" alt="Neo-Grid Bold — slide 3" />
  <img src="./screenshots/neo-grid-bold-8.png" width="32.5%" alt="Neo-Grid Bold — slide 8" />
</p>

> Editorial neo-brutalism with a single neon yellow accent on off-white paper.

### [Editorial Tri-Tone](./templates/editorial-tri-tone/)

<p>
  <img src="./screenshots/editorial-tri-tone-1.png" width="32.5%" alt="Editorial Tri-Tone — slide 1" />
  <img src="./screenshots/editorial-tri-tone-4.png" width="32.5%" alt="Editorial Tri-Tone — slide 4" />
  <img src="./screenshots/editorial-tri-tone-3.png" width="32.5%" alt="Editorial Tri-Tone — slide 3" />
</p>

> Three-color editorial system: dusty pink, mustard cream, and deep burgundy, set in Bricolage + Instrument Serif.

### [Creative Mode](./templates/creative-mode/)

<p>
  <img src="./screenshots/creative-mode-1.png" width="32.5%" alt="Creative Mode — slide 1" />
  <img src="./screenshots/creative-mode-4.png" width="32.5%" alt="Creative Mode — slide 4" />
  <img src="./screenshots/creative-mode-6.png" width="32.5%" alt="Creative Mode — slide 6" />
</p>

> Cream paper canvas with confident multi-color (green, pink, orange, yellow) accents and Archivo Black display.

### [Monochrome](./templates/monochrome/)

<p>
  <img src="./screenshots/monochrome-1.png" width="32.5%" alt="Monochrome — slide 1" />
  <img src="./screenshots/monochrome-4.png" width="32.5%" alt="Monochrome — slide 4" />
  <img src="./screenshots/monochrome-12.png" width="32.5%" alt="Monochrome — slide 12" />
</p>

> Ivory ledger paper with all-black type; Lora serif headlines, Jost body, no color at all.

### [People's Platform (Block & Bold)](./templates/peoples-platform/)

<p>
  <img src="./screenshots/peoples-platform-1.png" width="32.5%" alt="People's Platform (Block & Bold) — slide 1" />
  <img src="./screenshots/peoples-platform-4.png" width="32.5%" alt="People's Platform (Block & Bold) — slide 4" />
  <img src="./screenshots/peoples-platform-8.png" width="32.5%" alt="People's Platform (Block & Bold) — slide 8" />
</p>

> Activist poster energy: blue, orange, red on cream, with Alfa Slab + Caveat Brush.

### [Pink Script — After Hours](./templates/pink-script/)

<p>
  <img src="./screenshots/pink-script-1.png" width="32.5%" alt="Pink Script — After Hours — slide 1" />
  <img src="./screenshots/pink-script-4.png" width="32.5%" alt="Pink Script — After Hours — slide 4" />
  <img src="./screenshots/pink-script-8.png" width="32.5%" alt="Pink Script — After Hours — slide 8" />
</p>

> Black canvas, hot pink accent, pearl-cream paper, Instrument Serif headlines: late-night editorial luxury.

### [8-Bit Orbit](./templates/8-bit-orbit/)

<p>
  <img src="./screenshots/8-bit-orbit-1.png" width="32.5%" alt="8-Bit Orbit — slide 1" />
  <img src="./screenshots/8-bit-orbit-6.png" width="32.5%" alt="8-Bit Orbit — slide 6" />
  <img src="./screenshots/8-bit-orbit-5.png" width="32.5%" alt="8-Bit Orbit — slide 5" />
</p>

> Pixel-art neon arcade aesthetic on a deep navy void.

### [BlockFrame](./templates/block-frame/)

<p>
  <img src="./screenshots/block-frame-1.png" width="32.5%" alt="BlockFrame — slide 1" />
  <img src="./screenshots/block-frame-4.png" width="32.5%" alt="BlockFrame — slide 4" />
  <img src="./screenshots/block-frame-8.png" width="32.5%" alt="BlockFrame — slide 8" />
</p>

> Neobrutalist deck with pastel-neon color blocks and chunky black borders.

### [Blue Professional](./templates/blue-professional/)

<p>
  <img src="./screenshots/blue-professional-1.png" width="32.5%" alt="Blue Professional — slide 1" />
  <img src="./screenshots/blue-professional-6.png" width="32.5%" alt="Blue Professional — slide 6" />
  <img src="./screenshots/blue-professional-8.png" width="32.5%" alt="Blue Professional — slide 8" />
</p>

> Cream paper background with electric cobalt blue accents; clean modern professional.

### [Bold Poster](./templates/bold-poster/)

<p>
  <img src="./screenshots/bold-poster-1.png" width="32.5%" alt="Bold Poster — slide 1" />
  <img src="./screenshots/bold-poster-4.png" width="32.5%" alt="Bold Poster — slide 4" />
  <img src="./screenshots/bold-poster-8.png" width="32.5%" alt="Bold Poster — slide 8" />
</p>

> Editorial poster aesthetic with massive Shrikhand display and a single fire-engine red accent.

### [Broadside](./templates/broadside/)

<p>
  <img src="./screenshots/broadside-1.png" width="32.5%" alt="Broadside — slide 1" />
  <img src="./screenshots/broadside-4.png" width="32.5%" alt="Broadside — slide 4" />
  <img src="./screenshots/broadside-13.png" width="32.5%" alt="Broadside — slide 13" />
</p>

> Dark editorial canvas with a single fire orange accent and bilingual Latin/Chinese type stack.

### [Capsule](./templates/capsule/)

<p>
  <img src="./screenshots/capsule-1.png" width="32.5%" alt="Capsule — slide 1" />
  <img src="./screenshots/capsule-4.png" width="32.5%" alt="Capsule — slide 4" />
  <img src="./screenshots/capsule-8.png" width="32.5%" alt="Capsule — slide 8" />
</p>

> Modular pill-shaped cards on warm bone with a full pastel-pop palette.

### [Cartesian](./templates/cartesian/)

<p>
  <img src="./screenshots/cartesian-1.png" width="32.5%" alt="Cartesian — slide 1" />
  <img src="./screenshots/cartesian-4.png" width="32.5%" alt="Cartesian — slide 4" />
  <img src="./screenshots/cartesian-8.png" width="32.5%" alt="Cartesian — slide 8" />
</p>

> Quiet warm-neutral palette with classical Playfair serifs; tasteful and unhurried.

### [Coral](./templates/coral/)

<p>
  <img src="./screenshots/coral-1.png" width="32.5%" alt="Coral — slide 1" />
  <img src="./screenshots/coral-4.png" width="32.5%" alt="Coral — slide 4" />
  <img src="./screenshots/coral-8.png" width="32.5%" alt="Coral — slide 8" />
</p>

> Cream and coral on near-black, set in oversized Bebas Neue.

### [Daisy Days](./templates/daisy-days/)

<p>
  <img src="./screenshots/daisy-days-1.png" width="32.5%" alt="Daisy Days — slide 1" />
  <img src="./screenshots/daisy-days-4.png" width="32.5%" alt="Daisy Days — slide 4" />
  <img src="./screenshots/daisy-days-8.png" width="32.5%" alt="Daisy Days — slide 8" />
</p>

> Cheerful pastel deck with hand-drawn daisies, stars, and rainbows. Friendly, soft, and warm.

### [Grove](./templates/grove/)

<p>
  <img src="./screenshots/grove-1.png" width="32.5%" alt="Grove — slide 1" />
  <img src="./screenshots/grove-4.png" width="32.5%" alt="Grove — slide 4" />
  <img src="./screenshots/grove-8.png" width="32.5%" alt="Grove — slide 8" />
</p>

> Forest-green canvas with cream type, classical Playfair serifs, and a single rust accent.

### [Mat](./templates/mat/)

<p>
  <img src="./screenshots/mat-1.png" width="32.5%" alt="Mat — slide 1" />
  <img src="./screenshots/mat-4.png" width="32.5%" alt="Mat — slide 4" />
  <img src="./screenshots/mat-8.png" width="32.5%" alt="Mat — slide 8" />
</p>

> Dark sage canvas with bone paper and burnt-orange accent; mid-century modern with wood undertones.

### [Pin & Paper](./templates/pin-and-paper/)

<p>
  <img src="./screenshots/pin-and-paper-1.png" width="32.5%" alt="Pin & Paper — slide 1" />
  <img src="./screenshots/pin-and-paper-11.png" width="32.5%" alt="Pin & Paper — slide 11" />
  <img src="./screenshots/pin-and-paper-3.png" width="32.5%" alt="Pin & Paper — slide 3" />
</p>

> Yellow paper with safety-pin illustrations, ink-blue handwritten Caveat, paper-grain texture.

### [Playful](./templates/playful/)

<p>
  <img src="./screenshots/playful-1.png" width="32.5%" alt="Playful — slide 1" />
  <img src="./screenshots/playful-6.png" width="32.5%" alt="Playful — slide 6" />
  <img src="./screenshots/playful-8.png" width="32.5%" alt="Playful — slide 8" />
</p>

> Sun-warm peach background with Syne display: a friendly indie launch deck.

### [Raw Grid](./templates/raw-grid/)

<p>
  <img src="./screenshots/raw-grid-1.png" width="32.5%" alt="Raw Grid — slide 1" />
  <img src="./screenshots/raw-grid-4.png" width="32.5%" alt="Raw Grid — slide 4" />
  <img src="./screenshots/raw-grid-8.png" width="32.5%" alt="Raw Grid — slide 8" />
</p>

> Neo-brutalist deck with thick borders, offset shadows, and a pink/sage/ink palette.

### [Retro Windows](./templates/retro-windows/)

<p>
  <img src="./screenshots/retro-windows-1.png" width="32.5%" alt="Retro Windows — slide 1" />
  <img src="./screenshots/retro-windows-4.png" width="32.5%" alt="Retro Windows — slide 4" />
  <img src="./screenshots/retro-windows-8.png" width="32.5%" alt="Retro Windows — slide 8" />
</p>

> Windows 95 chrome: gray title bars, MS Sans Serif, pixel typography, full nostalgia.

### [Retro Zine](./templates/retro-zine/)

<p>
  <img src="./screenshots/retro-zine-1.png" width="32.5%" alt="Retro Zine — slide 1" />
  <img src="./screenshots/retro-zine-4.png" width="32.5%" alt="Retro Zine — slide 4" />
  <img src="./screenshots/retro-zine-8.png" width="32.5%" alt="Retro Zine — slide 8" />
</p>

> Beige paper with green accent and Bebas Neue + Caveat: a riso-printed zine in HTML form.

### [Scatterbrain](./templates/scatterbrain/)

<p>
  <img src="./screenshots/scatterbrain-1.png" width="32.5%" alt="Scatterbrain — slide 1" />
  <img src="./screenshots/scatterbrain-4.png" width="32.5%" alt="Scatterbrain — slide 4" />
  <img src="./screenshots/scatterbrain-8.png" width="32.5%" alt="Scatterbrain — slide 8" />
</p>

> Post-it inspired: pastel sticky notes, Caveat handwriting, Shrikhand and Zilla Slab type stack.

### [Signal](./templates/signal/)

<p>
  <img src="./screenshots/signal-1.png" width="32.5%" alt="Signal — slide 1" />
  <img src="./screenshots/signal-18.png" width="32.5%" alt="Signal — slide 18" />
  <img src="./screenshots/signal-8.png" width="32.5%" alt="Signal — slide 8" />
</p>

> Deep navy canvas with bone paper and a single muted-gold accent; institutional with quiet weight.

### [Studio](./templates/studio/)

<p>
  <img src="./screenshots/studio-1.png" width="32.5%" alt="Studio — slide 1" />
  <img src="./screenshots/studio-4.png" width="32.5%" alt="Studio — slide 4" />
  <img src="./screenshots/studio-8.png" width="32.5%" alt="Studio — slide 8" />
</p>

> Black canvas with electric-yellow type; high-voltage design studio aesthetic.

### [Biennale Yellow](./templates/biennale-yellow/)

<p>
  <img src="./screenshots/biennale-yellow-1.png" width="32.5%" alt="Biennale Yellow — slide 1" />
  <img src="./screenshots/biennale-yellow-5.png" width="32.5%" alt="Biennale Yellow — slide 5" />
  <img src="./screenshots/biennale-yellow-8.png" width="32.5%" alt="Biennale Yellow — slide 8" />
</p>

> Solar yellow on warm parchment with deep indigo serif and atmospheric sun-glow gradients. Dutch-editorial poster energy.

### [Sakura Chroma](./templates/sakura-chroma/)

<p>
  <img src="./screenshots/sakura-chroma-1.png" width="32.5%" alt="Sakura Chroma — slide 1" />
  <img src="./screenshots/sakura-chroma-3.png" width="32.5%" alt="Sakura Chroma — slide 3" />
  <img src="./screenshots/sakura-chroma-4.png" width="32.5%" alt="Sakura Chroma — slide 4" />
</p>

> Vintage Japanese cassette-package aesthetic: cream paper, diagonal rainbow ribbons, condensed bold type, JIS-style spec checkboxes.

### [Cobalt Grid](./templates/cobalt-grid/)

<p>
  <img src="./screenshots/cobalt-grid-1.png" width="32.5%" alt="Cobalt Grid — slide 1" />
  <img src="./screenshots/cobalt-grid-3.png" width="32.5%" alt="Cobalt Grid — slide 3" />
  <img src="./screenshots/cobalt-grid-5.png" width="32.5%" alt="Cobalt Grid — slide 5" />
</p>

> Electric cobalt italic serifs on a graph-paper canvas, anchored by stair-stepped pixel-glitch decorations and slim hairline rules.

### [Long Table](./templates/long-table/)

<p>
  <img src="./screenshots/long-table-1.png" width="32.5%" alt="Long Table — slide 1" />
  <img src="./screenshots/long-table-3.png" width="32.5%" alt="Long Table — slide 3" />
  <img src="./screenshots/long-table-7.png" width="32.5%" alt="Long Table — slide 7" />
</p>

> Warm cream and rust-red supper-club aesthetic with bold uppercase grotesk headlines, italic Fraunces, and pill-shaped outlined buttons.

### [Editorial Forest](./templates/editorial-forest/)

<img src="./screenshots/editorial-forest-1.png" width="32.5%" alt="Editorial Forest" /> <img src="./screenshots/editorial-forest-2.png" width="32.5%" alt="Editorial Forest" /> <img src="./screenshots/editorial-forest-5.png" width="32.5%" alt="Editorial Forest" />

> Forest green, dusty pink, and cream with Source Serif 4.

### [Emerald Editorial](./templates/emerald-editorial/)

<img src="./screenshots/emerald-editorial-1.png" width="32.5%" alt="Emerald Editorial" /> <img src="./screenshots/emerald-editorial-3.png" width="32.5%" alt="Emerald Editorial" /> <img src="./screenshots/emerald-editorial-6.png" width="32.5%" alt="Emerald Editorial" />

> Emerald, cream, and warm editorial typography.

## Export Toolbar

每个模板内置了一键导出工具栏（右下角悬浮按钮），支持：

| 按钮 | 功能 | 适用平台 |
|---|---|---|
| **WeChat** | 复制内联样式 HTML；需在公众号编辑器检查布局与图片 | 微信公众号 |
| **Copy IMG** | 当前幻灯片截图为 2x PNG 并复制到剪贴板 | X / 小红书 / 微博 |
| **PNG** | 下载当前幻灯片为高清 PNG 文件 | 任何平台 |
| **HTML** | 下载完整 deck 为独立 .html 文件 | 离线分享 |

工具栏默认透明度 35%，鼠标悬停时显示，打印时自动隐藏。

管理命令：

```bash
node scripts/inject-export-toolbar.mjs           # 注入到所有模板
node scripts/inject-export-toolbar.mjs --remove   # 从所有模板移除
```

## html-anything 集成

本库的 69 套模板可以导出为 [html-anything](https://github.com/nexu-io/html-anything) 兼容的 SKILL.md 格式，让 Claude Code、Cursor、Codex 等 8 种 AI 编码 CLI 直接使用我们的设计系统。

```bash
node scripts/export-skills.mjs
# → dist/skills/ 目录下生成 69 个 skill 文件夹
```

每个 skill 文件夹包含：

```
dist/skills/deck-<slug>/
  SKILL.md        # 提示词 + 前置元数据
  example.html    # 我们的 template.html
  assets/         # 按原目录关系打包的本地依赖
  references/     # design.md、中文内容、品牌规范、验收说明
  manifest.json   # 打包依赖清单
```

将 `dist/skills/` 下的文件夹复制到 html-anything 的 `src/lib/templates/skills/` 即可在其 picker 中显示。

## 构建与自验证

```sh
npm ci
npm run build
npm test
npm run verify
npm run verify:repro
npx playwright install chromium
npm run verify:browser
```

Windows 已安装 Edge 时，可在 PowerShell 中设置 `$env:BROWSER_CHANNEL='msedge'`。
浏览器测试把全部 Skill 包复制到仓库外，再检查本地资源、脚本、翻页和品牌页码。
导出测试覆盖离线 HTML、PNG 像素与伪元素、实际下载、缺失资源和剪贴板权限失败。
检查结果与截图写入 `artifacts/`。GitHub Actions 会保存这些文件供复核。

基础模板是源文件，Quaero 变体由脚本重新生成。Institutional 单独维护。
连续构建应生成相同文件。修改页数时，同时更新 `template.json`。
设计规则的英文指令采用短句和明确条件，演示文案保留用户需要的语气。

HTML 导出会打包脚本、样式、图片和样式引用的字体。资源必须允许浏览器获取。
建议通过 localhost 打开模板，例如在项目根目录运行 `python -m http.server 8000`。
缺失资源或 CORS 限制会使导出失败，不会把残缺文件宣称为独立文件。
剪贴板功能依赖安全上下文和浏览器权限。微信公众号编辑器兼容性需手动验证。
默认自动浏览器检查不访问外部字体。可另外运行 `npm run verify:online`，检查真实模板的线上字体、离线回放及 PNG。Safari 兼容性仍需单独验证。独立 HTML 内嵌字体后可能较大，本次样例约 23 MB。

## 新增模板

```sh
node scripts/new-template.mjs my-template
```

补齐 `template.html`、`template.json` 和 `design.md` 后，运行构建与验收命令。

## 工作流程

1. Agent 使用用户已提供的场景和风格，仅询问缺失的关键资料
2. Agent 读取 `index.json`，匹配 3 个候选模板
3. Agent 为每个候选模板生成封面预览
4. Agent 克隆用户选择的模板并替换内容
5. Agent 将完成的演示文稿写入指定位置

详见 [`AGENTS.md`](./AGENTS.md)。

## 许可证

[MIT](./LICENSE) — 自由使用、修改和分发。
