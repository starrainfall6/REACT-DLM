import { Pencil } from 'lucide-react'
import type { CSSProperties } from 'react'
import { Button } from 'antd'

/** 操作列按钮压缩样式：比 antd size="small" 更紧凑 */
const opBtnStyle: CSSProperties = {
  fontSize: 12,
  height: 22,
  paddingInline: 6,
  lineHeight: '20px',
}

/** 行内操作按钮组：借出 / 归还 / 编辑。借还为蓝色幽灵按钮（透明底+蓝字蓝边，标签可覆盖），编辑为图标按钮。 */
export default function RowActions({
  onLend,
  onReturn,
  onEdit,
  lendLabel = '借出',
  returnLabel = '归还',
}: {
  onLend?: () => void
  onReturn?: () => void
  onEdit?: () => void
  /** 借/还 按钮文案，默认「借出」「归还」；备品页传「入」「出」 */
  lendLabel?: string
  returnLabel?: string
}) {
  return (
    <div className="flex items-center justify-center gap-2">
      {onLend && (
        <Button type="primary" ghost size="small" style={opBtnStyle} onClick={onLend}>
          {lendLabel}
        </Button>
      )}
      {onReturn && (
        <Button type="primary" ghost size="small" style={opBtnStyle} onClick={onReturn}>
          {returnLabel}
        </Button>
      )}
      {onEdit && (
        <Button
          type="text"
          size="small"
          title="编辑"
          style={opBtnStyle}
          icon={<Pencil width={13} height={13} />}
          onClick={onEdit}
        />
      )}
    </div>
  )
}
