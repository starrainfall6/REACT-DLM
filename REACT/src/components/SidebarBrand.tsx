/** 侧边栏品牌区：
 *  DLM 与 DemoLineManager 统一为同款蓝→青渐变文字。
 *  收起态只显示 "DLM"；展开态 "emoLineManager" 平滑补全为 "DemoLineManager"（带过渡，呈现展开感）。 */
export default function SidebarBrand() {
  return (
    <div className="sidebar-brand">
      <span className="brand-word">
        <span className="brand-abbr">DLM</span>
        <span className="brand-full">DemoLineManager</span>
      </span>
    </div>
  )
}
