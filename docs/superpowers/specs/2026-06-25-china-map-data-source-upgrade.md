# 中国地图数据源升级方案（参考 lychee-blog）

## 1. 背景
当前博客 `new-blog` 的中国地图页面位于 `/map`，底层组件是 `src/features/map/components/ChinaMap.vue`，地图数据来源为 `public/china.json`。  
参考项目 `/Users/lychee/vibeCoding/lychee-blog` 的地图页面在 `docs/map/README.md`，底层组件是 `docs/.vuepress/components/ChinaMap.vue`，地图数据来源为 `docs/.vuepress/public/map-data/china.json`（可选 city 区划 `china-cities.json`）。

两者都能渲染中国地图并标记去过城市，但 GeoJSON 结构和组件集成方式差异明显，因此不能直接“原样替换文件”，必须做一层适配。

---

## 2. 主要差异

### 2.1 GeoJSON 结构与体量
| 项目 | 文件 | Feature 数 | 省名格式 | 海南省形态 | 空白 Feature（南海岛礁） | 文件大小 |
| --- | --- | --- | --- | --- | --- | --- |
| `new-blog` | `public/china.json` | 35 | `XX省/XX市/XX自治区/…` | MultiPolygon（133 个 polygon） | 有（name = `""`，包含 10 个 polygon） | ~576 KB |
| 参考博客 | `docs/.vuepress/public/map-data/china.json` | 34 | `XX`（短名） | Polygon（1 条封闭路径，无小岛） | 无 | ~61 KB |

- 当前数据的“空 Feature”和 Hainan 的大量小岛是页面下方出现南海岛屿块的根因。参考数据把南海诸岛融入省份边界或做简化，视觉上更紧凑。
- 参考 GeoJSON 使用 ECharts 的 UTF8 压缩字段（`UTF8Encoding: true`），文件体积小很多，浏览器解析更快。

### 2.2 城市坐标数据源
- `new-blog`：城市坐标来自 `src/features/map/data/cities.ts` 手工维护的 `coordinates`，直接传给 `effectScatter`。地图组件不再加载额外数据。
- 参考博客：除了省 GeoJSON，还会请求 `china-cities.json`（约 1 MB）获取城市中心坐标，并在找不到时 fallback 到组件内坐标。目前 `new-blog` 并不需要这套 fallback 机制，可保持现有城市数据结构。

### 2.3 地图组件交互
- `new-blog`：高亮省份列表由 `getVisitedProvinces()` 生成，格式与省名一致（长名）。隐藏南海区块靠 `regions: [{ name: "南海诸岛", itemStyle: { opacity: 0 } }]`。
- 参考博客：手动维护 `provinceCitiesMap`，同样使用 `regions` 高亮，但省名是短名。无“南海诸岛”专属 region，因为它提供的是不含该 feature 的 GeoJSON。

---

## 3. 结论：能否直接替换？

**不能直接 drop-in 替换**，因为：

1. **Province name schema 不一致**：如果直接把参考 GeoJSON 放到 `public/china.json`，现有的 `regions` 会继续找“XX省”等长名，导致高亮失效。
2. **南海 region 处理方式不同**：当前依靠 `name: "南海诸岛"`，而参考 GeoJSON 没有该 feature，需要改成按空字符串 `""` 或直接删除 region。
3. **文件路径 & 额外数据**：如果未来想要 `china-cities.json`，需要调整 fetch 路径，但目前 `new-blog` 不依赖该文件，可先不引入。

**可行方案**：用参考 GeoJSON 替换 `public/china.json`，并同步更新组件里的省份名称格式。这样既保留现有城市数据结构，又能去掉南海岛礁占位。

---

## 4. 实施步骤

### 4.1 地图数据替换
1. 复制参考 GeoJSON：
   ```bash
   cp /Users/lychee/vibeCoding/lychee-blog/docs/.vuepress/public/map-data/china.json public/china.json
   ```
2. 验证文件特征：
   ```bash
   python3 - <<'PY'
   import json, pathlib
   p = pathlib.Path('public/china.json')
   data = json.load(open(p))
   print('features', len(data['features']), 'has_utf8', data.get('UTF8Encoding', False))
   PY
   ```
   期望：`features 34 has_utf8 True`，且无空 name。

### 4.2 适配 `src/features/map/components/ChinaMap.vue`
当前 `regions` 组合依赖 `getVisitedProvinces()` 返回长名 + `"南海诸岛"`。需做两件事：

1. **省份名映射到短名**：继续使用 `cities.ts`，但增加短名映射（或直接在 component 做截取）。推荐方式是在 `cities.ts` 输出 `provinceShort` 字段，保持数据集中。  
2. **隐藏南海区块**：对 `regions` 做调整：
   ```ts
   regions: [
     { name: "", itemStyle: { opacity: 0 }, emphasis: { itemStyle: { opacity: 0 } } },
     ...visited.map(p => ({
       name: p,
       itemStyle: { areaColor: visitedAreaColor },
       emphasis: { itemStyle: { areaColor: visitedEmphasisColor } }
     }))
   ]
   ```
   这里的 `""` 会命中参考 GeoJSON 中的“南海诸岛”相关 feature（如果存在），若 GeoJSON 完全移除该 feature，则该 region 也不会产生副作用。

### 4.3 可选增强
- **引入 city 数据**：参考 `china-cities.json` 用于 cityScatter，但体积 1 MB，需要评估带宽。如果坚持使用 `cities.ts` 的手工坐标，可跳过。
- **地图中心/缩放**：参考组件在移动端使用 `zoom=0.85`、桌面端 `zoom=1.22`，可根据当前布局在 `buildOption` 里增加 `zoom`/`center` 调整，改善南海岛礁缩略后视觉比例。

---

## 5. 验证计划

| 步骤 | 内容 | 预期 |
| --- | --- | --- |
| 5.1 | `npm run dev` 进入 `/map` | 地图正常渲染，海南部分仅显示主体区域 |
| 5.2 | 检查浏览器 Network | `/china.json` 返回 34 个 feature，无多余空 feature |
| 5.3 | 访问 `/city/...`（南宁、黄山等） | 地图上 effectScatter 仍在正确位置，点击跳转正常 |
| 5.4 | 切换 dark/light mode | visited region 颜色、tooltip 样式切换正确 |
| 5.5 | `vue-tsc --noEmit`、`npm run build` | 类型检查和构建通过 |

---

## 6. 文件变更清单
- `public/china.json`：替换为参考 GeoJSON。
- `src/features/map/components/ChinaMap.vue`：修改 `regions`（使用空 name、适配省份短名）。
- `src/features/map/data/cities.ts`（可选）：新增 `provinceShort` 或 helper，避免每次手动截取。

---

## 7. 风险提示
- 参考 GeoJSON 的投影与当前数据一致（ECharts 默认经纬度），但 feature name 不同，必须同步改名逻辑。
- 如需保留原先的“南海诸岛” region 特殊样式，需要参考 GeoJSON 是否包含对应 feature。若不包含，region 中使用 `""` 即可。
- 若未来需要 city 区划边界，需再评估 `china-cities.json` 大小与加载策略。

