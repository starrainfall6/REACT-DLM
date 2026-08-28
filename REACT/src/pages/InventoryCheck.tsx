import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { App, Button, DatePicker, Form, Input, Modal, Select, Table, type TableProps } from 'antd'
import { Plus } from 'lucide-react'
import type { Dayjs } from 'dayjs'
import dayjs from 'dayjs'
import { token } from '@/components/ui/style'
import Badge from '@/components/ui/Badge'
import PageToolbar from '@/components/ui/PageToolbar'
import { useAntdFit } from '@/components/ui/useAntdFit'
import type { InventoryOrder } from '@/data/inventoryOrders'
import { inventoryApi } from '@/api/client'
import { toInventoryOrder } from '@/api/mappers'

/** 倒计时卡片高度 */
const COUNTDOWN_H = 150

/** 计算下一次盘点目标时间：月度=当月最后一天 23:59:59；年度=当年 12-31 23:59:59 */
function getTargets(now: Date) {
  const y = now.getFullYear()
  const m = now.getMonth()
  let monthTarget = new Date(y, m + 1, 0, 23, 59, 59)
  if (monthTarget.getTime() <= now.getTime()) monthTarget = new Date(y, m + 2, 0, 23, 59, 59)
  let yearTarget = new Date(y, 11, 31, 23, 59, 59)
  if (yearTarget.getTime() <= now.getTime()) yearTarget = new Date(y + 1, 11, 31, 23, 59, 59)
  return { monthTarget, yearTarget }
}

function diff(target: Date, now: Date) {
  let ms = target.getTime() - now.getTime()
  if (ms < 0) ms = 0
  const day = 86400000
  return {
    days: Math.floor(ms / day),
    hours: Math.floor((ms % day) / 3600000),
  }
}

function fmtDate(d: Date) {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

/** 倒计时卡片外壳：标题 + 距下一次盘点 + 主体 + 目标时间 */
function CountdownCard({ title, target, children }: { title: string; target: Date; children: ReactNode }) {
  return (
    <div
      style={{
        height: COUNTDOWN_H,
        background: token.surface,
        border: `1px solid ${token.border}`,
        borderRadius: token.radius,
        padding: '18px 24px 14px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-between">
        <h3 style={{ fontSize: 16, fontWeight: 600, color: token.text1, margin: 0 }}>{title}</h3>
        <span style={{ fontSize: 12, color: token.mutedFg, background: token.surface2, padding: '3px 10px', borderRadius: 999 }}>
          距下一次盘点
        </span>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
        {children}
      </div>
      <div style={{ textAlign: 'center', fontSize: 12, color: token.mutedFg }}>
        目标：{fmtDate(target)} 23:59
      </div>
    </div>
  )
}

/** 年度盘点：单一大数字倒计时 */
function YearlyCard({ target, now }: { target: Date; now: Date }) {
  const d = diff(target, now)
  return (
    <CountdownCard title="年度盘点" target={target}>
      <div className="flex items-end gap-2">
        <span style={{ fontSize: 52, fontWeight: 700, lineHeight: 1, color: token.primary, fontFamily: token.fontMono }}>{d.days}</span>
        <span style={{ fontSize: 16, color: token.mutedFg, paddingBottom: 4 }}>天</span>
      </div>
    </CountdownCard>
  )
}

/** 月度盘点：工具 / 治具 / 备品 三个倒计时 */
function MonthlyCard({ target, now }: { target: Date; now: Date }) {
  const d = diff(target, now)
  const items: { label: string; accent: string }[] = [
    { label: '工具', accent: token.primary },
    { label: '治具', accent: token.success },
    { label: '备品', accent: token.warning },
  ]
  return (
    <CountdownCard title="月度盘点" target={target}>
      <div style={{ width: '100%', display: 'flex', justifyContent: 'space-around', gap: 12 }}>
        {items.map((it) => (
          <div key={it.label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <span style={{ fontSize: 13, color: token.mutedFg, fontWeight: 500 }}>{it.label}</span>
            <span style={{ fontSize: 32, fontWeight: 700, color: it.accent, fontFamily: token.fontMono, lineHeight: 1 }}>
              {d.days}
              <span style={{ fontSize: 12, color: token.mutedFg, marginLeft: 3, fontWeight: 400 }}>天</span>
            </span>
          </div>
        ))}
      </div>
    </CountdownCard>
  )
}

/** 创建盘点单表单 */
interface CreateFormValues {
  type: '年度' | '月度'
  project: string
  time?: Dayjs
  person?: string
}

/** 盘点单卡片：列表 + 创建 / 同步操作（数据来自后端） */
function OrderCard() {
  const { message } = App.useApp()
  const [orders, setOrders] = useState<InventoryOrder[]>([])
  const [loading, setLoading] = useState(false)
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [form] = Form.useForm<CreateFormValues>()
  const wrapRef = useRef<HTMLDivElement>(null)
  const { pageSize, scrollY } = useAntdFit(wrapRef)

  /** 从后端拉取盘点单列表 */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await inventoryApi.checks()
      setOrders(res.items.map(toInventoryOrder))
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载盘点单失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    const kw = keyword.trim()
    if (!kw) return orders
    const k = kw.toLowerCase()
    return orders.filter(
      (o) =>
        o.id.toLowerCase().includes(k) ||
        o.project.toLowerCase().includes(k) ||
        o.person.toLowerCase().includes(k) ||
        o.type.includes(kw),
    )
  }, [orders, keyword])

  const pendingCount = orders.filter((o) => o.status === '待同步').length
  const total = filtered.length
  const ps = total > 0 ? Math.min(pageSize, total) : pageSize

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(total / ps))
    if (page > tp) setPage(tp)
  }, [total, ps, page])

  /** 同步盘点单（待同步 → 已同步） */
  const doSync = async (dbId: number) => {
    try {
      await inventoryApi.sync(dbId)
      message.success('已同步盘点单')
      void fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '同步失败')
    }
  }

  /** 创建盘点单（编号由后端生成 PD-YYYYMMDD-NNN） */
  const onCreate = async (v: CreateFormValues) => {
    try {
      const order = await inventoryApi.create({
        type: v.type,
        project: v.project,
        time: v.time ? v.time.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD'),
        person: v.person?.trim() || '',
      })
      setOpen(false)
      form.resetFields()
      message.success(`已创建盘点单：${order.ref_no}`)
      void fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '创建失败')
    }
  }

  const columns: TableProps<InventoryOrder>['columns'] = [
    {
      title: '盘点单号',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 150,
      render: (v: string) => <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 80,
      render: (v: InventoryOrder['type']) => <Badge tone={v === '年度' ? 'neutral' : 'info'}>{v}</Badge>,
    },
    { title: '盘点项目', dataIndex: 'project', key: 'project', align: 'left', width: 90 },
    {
      title: '盘点时间',
      dataIndex: 'time',
      key: 'time',
      align: 'center',
      width: 110,
      render: (v: string) => <span style={{ fontFamily: token.fontMono }}>{v || '—'}</span>,
    },
    { title: '盘点人', dataIndex: 'person', key: 'person', align: 'left', width: 90, render: (v: string) => v || '—' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 90,
      render: (v: InventoryOrder['status']) => (
        <Badge tone={v === '已同步' ? 'success' : 'warning'}>{v}</Badge>
      ),
    },
    {
      title: '同步时间',
      dataIndex: 'syncTime',
      key: 'syncTime',
      align: 'center',
      width: 150,
      render: (v: string) =>
        v === '—' || !v ? <span style={{ color: token.mutedFg }}>—</span> : <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    {
      title: '操作',
      key: 'op',
      align: 'center',
      width: 80,
      render: (_: unknown, r: InventoryOrder) => (
        <Button
          type="link"
          size="small"
          style={{ padding: 0 }}
          disabled={r.status === '已同步'}
          onClick={(e) => {
            e.stopPropagation()
            void doSync(r.dbId)
          }}
        >
          同步
        </Button>
      ),
    },
  ]

  return (
    <div
      style={{
        flex: 1,
        minHeight: 0,
        background: token.surface,
        border: `1px solid ${token.border}`,
        borderRadius: token.radius,
        padding: '18px 20px 10px',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 style={{ fontSize: 16, fontWeight: 600, color: token.text1, margin: 0 }}>盘点单</h3>
          <span style={{ fontSize: 12, color: token.mutedFg }}>共 {orders.length} 张 · {pendingCount} 张待同步</span>
        </div>
        <div className="flex gap-2">
          <Button type="primary" icon={<Plus size={16} />} onClick={() => setOpen(true)}>
            创建盘点单
          </Button>
        </div>
      </div>
      <PageToolbar searchPlaceholder="搜索盘点单号、项目、盘点人..." searchValue={keyword} onSearch={setKeyword} />
      <div
        ref={wrapRef}
        className="tools-fit"
        style={
          {
            flex: 1,
            minHeight: 0,
            display: 'flex',
            flexDirection: 'column',
            '--fit-y': `${scrollY}px`,
          } as React.CSSProperties
        }
      >
        <Table<InventoryOrder>
          loading={loading}
          columns={columns}
          dataSource={filtered}
          rowKey="id"
          size="middle"
          scroll={{ y: scrollY }}
          pagination={{
            current: page,
            pageSize: ps,
            onChange: (p) => setPage(p),
            showSizeChanger: false,
            hideOnSinglePage: true,
          }}
        />
      </div>

      <Modal
        open={open}
        title="创建盘点单"
        onCancel={() => setOpen(false)}
        width={480}
        destroyOnHidden
        footer={[
          <Button key="cancel" onClick={() => setOpen(false)}>
            取消
          </Button>,
          <Button key="ok" type="primary" onClick={() => void form.submit()}>
            确认创建
          </Button>,
        ]}
      >
        <Form<CreateFormValues>
          form={form}
          layout="vertical"
          requiredMark={false}
          onFinish={(v) => void onCreate(v)}
          style={{ marginTop: 8 }}
        >
          <div className="flex gap-3">
            <Form.Item
              name="type"
              label="盘点类型"
              initialValue="月度"
              rules={[{ required: true, message: '请选择盘点类型' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Select options={[{ value: '年度', label: '年度' }, { value: '月度', label: '月度' }]} />
            </Form.Item>
            <Form.Item
              name="project"
              label="盘点项目"
              initialValue="全部"
              rules={[{ required: true, message: '请选择盘点项目' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Select options={['全部', '工具', '治具', '备品'].map((p) => ({ value: p, label: p }))} />
            </Form.Item>
          </div>
          <div className="flex gap-3">
            <Form.Item name="time" label="盘点时间" style={{ flex: 1, minWidth: 0 }}>
              <DatePicker style={{ width: '100%' }} placeholder="默认今天" />
            </Form.Item>
            <Form.Item
              name="person"
              label="盘点人"
              rules={[{ required: true, message: '请输入盘点人' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Input placeholder="例如：张三" />
            </Form.Item>
          </div>
        </Form>
      </Modal>
    </div>
  )
}

export default function InventoryCheck() {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const { monthTarget, yearTarget } = getTargets(now)

  return (
    <div className="inv-page">
      <div className="inv-row">
        <YearlyCard target={yearTarget} now={now} />
        <MonthlyCard target={monthTarget} now={now} />
      </div>
      <OrderCard />
    </div>
  )
}