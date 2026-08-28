import type { ReactNode } from 'react'
import { Search } from 'lucide-react'
import { token } from './style'

/** 工具栏：左侧 搜索框 + 筛选 pills，右侧 主操作（actionLabel 渲染内置按钮，或传入 actionNode 渲染自定义节点） */
export default function PageToolbar({
  searchPlaceholder,
  searchValue,
  onSearch,
  filters,
  actionLabel,
  onAction,
  actionIcon,
  actionNode,
}: {
  searchPlaceholder?: string
  /** 受控搜索词；传入后搜索框变为受控（配合 onSearch） */
  searchValue?: string
  onSearch?: (value: string) => void
  filters?: { label: string; active: boolean; onClick: () => void }[]
  actionLabel?: string
  onAction?: () => void
  actionIcon?: ReactNode
  /** 自定义右侧操作节点（如 antd Button）；传入后替代内置按钮 */
  actionNode?: ReactNode
}) {
  return (
    <div className="flex items-center justify-between gap-4 mb-2">
      <div className="flex items-center gap-4">
        {searchPlaceholder && (
          <div
            className="flex items-center gap-2"
            style={{
              height: 36,
              padding: '0 12px',
              background: token.surface,
              border: `1px solid ${token.border}`,
              borderRadius: token.radius,
              width: 280,
            }}
          >
            <Search width={16} height={16} color={token.mutedFg} style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={onSearch ? (e) => onSearch(e.target.value) : undefined}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: token.text1,
                fontSize: 14,
                fontFamily: token.fontSans,
                minWidth: 0,
              }}
            />
          </div>
        )}
        {filters && filters.length > 0 && (
          <div className="flex items-center gap-2">
            {filters.map((f) => (
              <button
                key={f.label}
                onClick={f.onClick}
                className="flex items-center justify-center px-3 whitespace-nowrap"
                style={{
                  height: 36,
                  borderRadius: token.radius,
                  cursor: 'pointer',
                  fontSize: 13,
                  fontWeight: 500,
                  fontFamily: token.fontSans,
                  background: f.active ? token.primary : token.surface,
                  color: f.active ? token.primaryFg : token.mutedFg,
                  border: f.active ? 'none' : `1px solid ${token.border}`,
                }}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}
      </div>
      {actionNode
        ? actionNode
        : actionLabel && (
          <button
            onClick={onAction}
            className="flex items-center gap-2 px-4 whitespace-nowrap"
            style={{
              height: 36,
              borderRadius: token.radius,
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: 500,
              fontFamily: token.fontSans,
              background: token.primary,
              color: token.primaryFg,
              border: 'none',
            }}
          >
            {actionIcon}
            <span>{actionLabel}</span>
          </button>
        )}
    </div>
  )
}
