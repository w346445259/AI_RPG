```markdown
# AI_RPG — Copilot Instructions (简明)

目的：帮助 AI 编码代理快速上手并在此仓库中安全、可预测地做出改动。

核心概览
- **单页 HTML5 Canvas 游戏**：入口是 `index.html`，主要逻辑在 `main.js`，可配置数据集中在 `config/` 下（`playerConfig.js`、`monsterConfig.js`、`spawnConfig.js`、`weaponConfig.js`）。
- **持久化**：使用 `localStorage` 保存 `totalGold`, `totalReiki`, `cultivationStage`, `equippedWeaponId` 等键。
- **渲染/逻辑分离**：`main.js` 包含游戏循环、输入处理、UI 事件和对 `config/*` 的读取；配置文件仅导出静态对象。

重要文件与模式（快速参考）
- `index.html`：包含画布 `id="gameCanvas"` 和多个 UI 元素（例如 `start-btn`, `restart-btn`, `gold-display` 等），修改 UI 时先检查这些 id。
- `main.js`：所有游戏状态、循环、渲染与事件监听都在这里。它通过 `import { ... } from './config/...'` 加载配置。
- `config/*.js`：添加或调整数值（如怪物属性、武器属性、关卡产出率）时优先在这里修改。
- `assets/`：图标与静态资源；配置中的 `iconPath` 使用相对路径（例如 `assets/pistol.png`）。

开发/运行工作流
- 依赖 & 启动：
  - `npm install`
  - `npm run dev` （使用 Vite，默认 `http://localhost:5173`）
- 已定义 VS Code 任务：`Open Game`（打开 `index.html`），`Start Dev Server`（运行 `npm run dev`）。

代码/修改注意事项（可操作的、可验证的规则）
- **配置优先**：新增武器/怪物/关卡时，优先在 `config/weaponConfig.js` 或 `config/monsterConfig.js` 添加条目。例：新增武器时添加对象並包含 `id`, `type`, `damageMultiplier`, `fireRate`, `projectileCount` 等字段。
- **不要移动 DOM id**：`main.js` 通过固定 id 查询元素（例如 `weapon-list`, `upgrade-screen`），改名会导致运行时错误。
- **慎用全局 window**：代码中会把 `equipWeapon` 挂到 `window`（用于 HTML onclick）。若需新增类似交互，维持此模式或改为事件绑定并同步 HTML。
- **localStorage 键**：修改或重命名键会影响玩家存档；若必须更名，请同时迁移旧键的数据。
- **帧/时间单位**：`spawnRate`、`fireRate` 等使用毫秒（ms）；`levelConfig` 中以 `spawnRate` 表示两次产出间隔。

常见改动示例（摘录可复制）
- 新武器（追加到 `config/weaponConfig.js`）：
  ```js
  3: {
    id: 3,
    type: 'penetrate',
    name: '散弹枪',
    damageMultiplier: 1.0,
    fireRate: 1200,
    projectileCount: 5,
    penetration: 0,
    burstCount: 1,
    visual: { color: '#f00' },
    iconPath: 'assets/shotgun.png'
  }
  ```

审核/测试指引
- 本仓库没有自动化测试；修改后本地验证：
  - `npm run dev` → 打开 `http://localhost:5173` 或运行 `Open Game` 任务。
  - 验证 UI 元素是否按预期显示（启动、强化、武器界面、暂停、胜利/失败）。

约束与本仓库特有约定
- **所有代码注释必须使用中文**（中文简体）。
- **UI 文本必须是中文**（现有 HTML 文案已为中文）。
- 主要逻辑集中在 `main.js`，避免将大量新逻辑分散到多个新文件，除非为清晰重构并配有说明。

外部依赖
- 仅开发依赖：`vite`（见 `package.json`）。无后端或额外服务。

合并说明
- 原有检查列表已保留为仓库约束点。请在此基础上反馈需要补充的用例或规则（例如：命名约定、分支策略、PR 模板）。

如果有遗漏或想补充的点，请标注具体的修改场景（例如：如何扩展 AI 控制逻辑，或如何添加音效），我会据此迭代此文档。
```- [x] Verify that the copilot-instructions.md file in the .github directory is created.

- [x] Clarify Project Requirements

- [x] Scaffold the Project

- [x] Customize the Project

- [x] Install Required Extensions

- [x] Compile the Project

- [x] Create and Run Task

- [x] Launch the Project

- [x] Ensure Documentation is Complete

- Work through each checklist item systematically.
- Keep communication concise and focused.
- Follow development best practices.
- **Always use Chinese for code comments.**
- **Ensure all UI text is in Chinese.**
