import { useEffect } from 'react'
import { Button, DatePicker, Form, Input, InputNumber, Modal, Select } from 'antd'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { token } from '@/components/ui/style'

/** 操作模式：lend = 借出/入库（增加可用量），return = 归还/出库（减少可用量） */
export type OpMode = 'lend' | 'return'

export interface OpItemInfo {
  id: string
  name: string
  /** lend 模式下显示并作为数量上限，如「在库」「当前库存」 */
  addLabel: string
  addValue: number
  /** return 模式下显示并作为数量上限，如「借出」「当前库存」 */
  reduceLabel: string
  reduceValue: number
}

export interface LendPayload {
  mode: 'lend'
  qty: number
  borrower: string
  dept: string
  /** 操作人：备品等无借用人场景填写；工具/治具沿用借用人 */
  operator?: string
  purpose: string
  /** 备注：工具/治具借出时取用途，备品入库为弹窗备注 */
  note?: string
  /** YYYY-MM-DD，未填为空串 */
  expectReturn: string
}

export interface ReturnPayload {
  mode: 'return'
  /** 归还的活跃借出单号 */
  recordId: string
  qty: number
  /** YYYY-MM-DD */
  actualReturn: string
  note: string
  /** 操作人：备品出库等无借用记录场景填写 */
  operator?: string
}

export type OpPayload = LendPayload | ReturnPayload

interface FieldValues {
  borrower?: string
  dept?: string
  qty?: number
  purpose?: string
  expectReturn?: Dayjs
  actualReturn?: Dayjs
  note?: string
  recordId?: string
  operator?: string
}

/** 借出/归还（含备品 入库/出库）操作弹窗：antd Modal + Form，含物品摘要与数量校验 */
export default function BorrowReturnModal({
  open,
  mode,
  item,
  withPersonnel = true,
  title,
  okText,
  qtyLabel,
  selectRecord = false,
  withOperator = false,
  hideDate = false,
  /** 归还模式下可选：该物品活跃（未结清）的借出单 */
  activeRecords = [],
  onCancel,
  onConfirm,
}: {
  open: boolean
  mode: OpMode
  item: OpItemInfo
  /** lend 模式是否显示 借用人/部门/用途（备品入库等纯库存操作可关闭） */
  withPersonnel?: boolean
  title?: string
  okText?: string
  qtyLabel?: string
  /** return 模式是否要求先选择活跃的借出单（工具/治具归还） */
  selectRecord?: boolean
  /** 是否显示「操作人」输入（备品入库/出库等无借用人场景） */
  withOperator?: boolean
  /** 是否隐藏日期字段（备品库存调整等无借还日期概念的场景） */
  hideDate?: boolean
  /** 归还模式下可选：该物品活跃（未结清）的借出单 */
  activeRecords?: { id: string; borrower: string; remaining: number }[]
  onCancel: () => void
  onConfirm: (payload: OpPayload) => void
}) {
  const [form] = Form.useForm<FieldValues>()
  const isLend = mode === 'lend'

  // 每次打开时重置表单；归还/出库默认当天
  useEffect(() => {
    if (!open) return
    form.resetFields()
    if (!isLend) {
      form.setFieldsValue({ actualReturn: dayjs() })
    }
  }, [open, mode, form, isLend])

  const selectedRecordId = Form.useWatch('recordId', form)
  const selectedRec = activeRecords.find((r) => r.id === selectedRecordId)
  const remaining = selectedRec ? selectedRec.remaining : undefined
  const limit = isLend ? item.addValue : remaining ?? item.reduceValue
  const limitLabel = isLend ? item.addLabel : remaining !== undefined ? '待还数量' : item.reduceLabel

  const handleOk = async () => {
    try {
      const v = await form.validateFields()
      if (isLend) {
        onConfirm({
          mode: 'lend',
          qty: v.qty ?? 0,
          borrower: withPersonnel ? (v.borrower?.trim() ?? '') : '',
          dept: withPersonnel ? (v.dept?.trim() ?? '') : '',
          purpose: withPersonnel ? (v.purpose?.trim() ?? '') : '',
          expectReturn: v.expectReturn ? v.expectReturn.format('YYYY-MM-DD') : '',
          operator: withPersonnel ? (v.borrower?.trim() ?? '') : (v.operator?.trim() ?? ''),
          note: withPersonnel ? (v.purpose?.trim() ?? '') : (v.note?.trim() ?? ''),
        })
      } else {
        onConfirm({
          mode: 'return',
          recordId: v.recordId ?? '',
          qty: v.qty ?? 0,
          actualReturn: v.actualReturn ? v.actualReturn.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
          note: v.note?.trim() ?? '',
          operator: withPersonnel ? '' : (v.operator?.trim() ?? ''),
        })
      }
    } catch {
      // 校验失败由 Form 显示错误，不关闭
    }
  }

  return (
    <Modal
      open={open}
      title={title ?? (isLend ? '借出登记' : '归还登记')}
      onCancel={onCancel}
      width={480}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="ok" type="primary" onClick={() => void handleOk()}>
          {okText ?? (isLend ? '确认借出' : '确认归还')}
        </Button>,
      ]}
      destroyOnHidden
    >
      {/* 物品摘要 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '10px 14px',
          borderRadius: token.radius,
          background: token.surface2,
          border: `1px solid ${token.border}`,
        }}
      >
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: token.text1 }}>{item.name}</div>
          <div style={{ fontSize: 12, color: token.mutedFg, fontFamily: token.fontMono, marginTop: 2 }}>
            {item.id}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 12, color: token.mutedFg }}>{limitLabel}</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: token.text1, fontFamily: token.fontMono, lineHeight: 1.2 }}>
            {limit}
          </div>
        </div>
      </div>

      <Form<FieldValues>
        form={form}
        layout="vertical"
        requiredMark={false}
        style={{ marginTop: 16 }}
      >
        {isLend ? (
          <>
            {withPersonnel && (
              <div className="flex gap-3">
                <Form.Item
                  name="borrower"
                  label="借用人"
                  rules={[{ required: true, message: '请输入借用人' }]}
                  style={{ flex: 1, minWidth: 0 }}
                >
                  <Input placeholder="例如：张工" />
                </Form.Item>
                <Form.Item name="dept" label="部门" style={{ flex: 1, minWidth: 0 }}>
                  <Input placeholder="例如：装配车间" />
                </Form.Item>
              </div>
            )}
            {withOperator && (
              <Form.Item
                name="operator"
                label="操作人"
                rules={[{ required: true, message: '请输入操作人' }]}
              >
                <Input placeholder="例如：张三" />
              </Form.Item>
            )}
            {withOperator && (
              <Form.Item name="note" label="备注">
                <Input placeholder="可选，填写备注说明" />
              </Form.Item>
            )}
            <div className="flex gap-3">
              <Form.Item
                name="qty"
                label={qtyLabel ?? '借出数量'}
                rules={[
                  { required: true, message: '请输入数量' },
                  { type: 'number', min: 1, max: limit, message: `最多 ${limit}（当前${limitLabel}）` },
                ]}
                style={{ flex: 1, minWidth: 0 }}
              >
                <InputNumber min={1} max={limit} style={{ width: '100%' }} placeholder="请输入数量" />
              </Form.Item>
              {!hideDate && (
                <Form.Item name="expectReturn" label="预计归还日期" style={{ flex: 1, minWidth: 0 }}>
                  <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                </Form.Item>
              )}
            </div>
            {withPersonnel && (
              <Form.Item name="purpose" label="用途">
                <Input placeholder="可选，填写借用用途" />
              </Form.Item>
            )}
          </>
        ) : (
          <>
            {selectRecord && (
              <Form.Item
                name="recordId"
                label="归还借出单"
                rules={[{ required: true, message: '请选择借出单' }]}
              >
                <Select
                  placeholder="请选择活跃的借出单"
                  notFoundContent="该物品暂无活跃的借出单"
                  showSearch
                  optionFilterProp="label"
                  options={activeRecords.map((r) => ({
                    value: r.id,
                    label: `${r.id} · ${r.borrower} · 待还 ${r.remaining}`,
                  }))}
                />
              </Form.Item>
            )}
            {withOperator && (
              <Form.Item
                name="operator"
                label="操作人"
                rules={[{ required: true, message: '请输入操作人' }]}
              >
                <Input placeholder="例如：张三" />
              </Form.Item>
            )}
            <div className="flex gap-3">
              <Form.Item
                name="qty"
                label={qtyLabel ?? '归还数量'}
                rules={[
                  { required: true, message: '请输入数量' },
                  { type: 'number', min: 1, max: limit, message: `最多 ${limit}（当前${limitLabel}）` },
                ]}
                style={{ flex: 1, minWidth: 0 }}
              >
                <InputNumber min={1} max={limit} style={{ width: '100%' }} placeholder="请输入数量" />
              </Form.Item>
              {!hideDate && (
                <Form.Item name="actualReturn" label="实际归还日期" style={{ flex: 1, minWidth: 0 }}>
                  <DatePicker style={{ width: '100%' }} placeholder="请选择日期" />
                </Form.Item>
              )}
            </div>
            <Form.Item name="note" label="备注">
              <Input placeholder="可选，填写归还说明" />
            </Form.Item>
          </>
        )}
      </Form>
    </Modal>
  )
}
