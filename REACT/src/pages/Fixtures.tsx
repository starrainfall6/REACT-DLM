import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { App, Button, Form, Input, InputNumber, Modal, Popover, Table, type TableProps } from 'antd'
import PageToolbar from '@/components/ui/PageToolbar'
import Badge from '@/components/ui/Badge'
import RowActions from '@/components/ui/RowActions'
import BorrowReturnModal, { type OpPayload } from '@/components/ui/BorrowReturnModal'
import { useAntdFit } from '@/components/ui/useAntdFit'
import type { FixtureItem } from '@/data/fixtures'
import { itemsApi, recordsApi } from '@/api/client'
import { toFixtureItem } from '@/api/mappers'
import { token } from '@/components/ui/style'

type Filter = '全部' | '在库' | '借出'

/** 名称 + 圆圈 i：hover/click 弹出 antd 气泡卡片（autoAdjustOverflow 贴边自动偏移；挂到 body 不被表格滚动裁切） */
function FixtureNameCell({ name, drawing, note }: {
  name: string
  drawing: string
  note: string
}) {
  return (
    <Popover
      placement="top"
      trigger={['hover', 'click']}
      autoAdjustOverflow
      align={{ offset: [0, 8] }}
      getPopupContainer={(node) => document.body}
      content={
        <div style={{ fontSize: 12, lineHeight: 1.7, minWidth: 170, textAlign: 'left' }}>
          <div><b>图纸号：</b>{drawing || '—'}</div>
          <div><b>备注：</b>{note || '—'}</div>
        </div>
      }
    >
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'help' }}>
        <span style={{ fontWeight: 500 }}>{name}</span>
        <span
          role="img"
          aria-label="扩展信息"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 15,
            height: 15,
            borderRadius: '50%',
            border: `1px solid ${token.border}`,
            color: token.mutedFg,
            fontSize: 10,
            fontStyle: 'italic',
            lineHeight: 1,
            flexShrink: 0,
          }}
        >
          i
        </span>
      </span>
    </Popover>
  )
}

interface FixtureFormValues {
  name: string
  category: string
  drawing?: string
  spec?: string
  inStock: number
  warn: number
  location?: string
  note?: string
}

const addDefaults: FixtureFormValues = {
  name: '',
  category: '',
  drawing: '',
  spec: '',
  inStock: 0,
  warn: 5,
  location: '',
  note: '',
}

export default function Fixtures() {
  const { message } = App.useApp()
  const [data, setData] = useState<FixtureItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('全部')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<FixtureItem | null>(null)
  const [op, setOp] = useState<{ mode: 'lend' | 'return'; item: FixtureItem } | null>(null)
  const [activeRecords, setActiveRecords] = useState<{ id: string; borrower: string; remaining: number }[]>([])
  const [form] = Form.useForm<FixtureFormValues>()
  const wrapRef = useRef<HTMLDivElement>(null)
  const { pageSize, scrollY } = useAntdFit(wrapRef)

  /** 从后端拉取治具列表（全量，本地过滤/分页） */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await itemsApi.list({ type: 'fixture', page_size: 1000 })
      setData(res.items.map(toFixtureItem))
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载治具列表失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  /** 打开归还弹窗时拉取该物品活跃的借出单 */
  useEffect(() => {
    if (op?.mode !== 'return') return
    let cancelled = false
    setActiveRecords([])
    void (async () => {
      try {
        const res = await recordsApi.list({ keyword: op.item.id, page_size: 1000 })
        if (cancelled) return
        setActiveRecords(
          res.items
            .filter((r) => r.status === 'active' || r.status === 'overdue')
            .filter((r) => r.returned_quantity < r.borrow_quantity)
            .map((r) => ({
              id: r.ref_no,
              borrower: r.borrower_name,
              remaining: r.borrow_quantity - r.returned_quantity,
            })),
        )
      } catch {
        // 忽略：弹窗内会显示空列表
      }
    })()
    return () => {
      cancelled = true
    }
  }, [op])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return data.filter((d) => {
      const okFilter = filter === '全部' || d.status === filter
      const okKw =
        !kw ||
        d.id.toLowerCase().includes(kw) ||
        d.name.toLowerCase().includes(kw) ||
        d.category.toLowerCase().includes(kw) ||
        d.drawing.toLowerCase().includes(kw)
      return okFilter && okKw
    })
  }, [data, filter, keyword])
  const total = filtered.length
  const ps = total > 0 ? Math.min(pageSize, total) : pageSize

  // 每页行数 / 过滤变化后，避免停留在已不存在的页码
  useEffect(() => {
    const tp = Math.max(1, Math.ceil(total / ps))
    if (page > tp) setPage(tp)
  }, [total, ps, page])

  const openAdd = () => {
    setEditing(null)
    setOpen(true)
  }
  const openEdit = (r: FixtureItem) => {
    setEditing(r)
    setOpen(true)
  }
  const handleCancel = () => {
    setOpen(false)
    setEditing(null)
  }
  const onFinish = async (v: FixtureFormValues) => {
    try {
      if (editing) {
        // 后端 quantity 为总量（在库+借出），编辑在库数量时需保留借出部分
        await itemsApi.update(editing.dbId, {
          name: v.name,
          category: v.category,
          drawing_number: v.drawing ?? '',
          spec: v.spec ?? '',
          quantity: v.inStock + editing.lent,
          location: v.location ?? '',
          min_stock_alert: v.warn,
          notes: v.note ?? '',
        })
        message.success(`已更新治具：${v.name}`)
      } else {
        await itemsApi.create({
          name: v.name,
          type: 'fixture',
          category: v.category,
          drawing_number: v.drawing ?? '',
          brand: '',
          model: '',
          spec: v.spec ?? '',
          quantity: v.inStock,
          location: v.location ?? '',
          min_stock_alert: v.warn,
          notes: v.note ?? '',
        })
        message.success(`已新增治具：${v.name}`)
      }
      setOpen(false)
      setEditing(null)
      void fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    }
  }

  const handleOpConfirm = async (p: OpPayload) => {
    if (!op) return
    const item = op.item
    try {
      if (p.mode === 'lend') {
        await itemsApi.borrow(item.dbId, {
          borrower_name: p.borrower,
          borrower_dept: p.dept,
          borrow_quantity: p.qty,
          purpose: p.purpose,
          expected_return_date: p.expectReturn || undefined,
          operator: p.operator ?? '',
          note: p.note ?? p.purpose,
        })
        message.success(`已借出：${item.name} ×${p.qty}`)
      } else {
        await itemsApi.returnItem(item.dbId, {
          record_no: p.recordId,
          return_quantity: p.qty,
          operator: p.operator ?? '',
          note: p.note ?? '',
        })
        message.success(`已归还：${item.name} ×${p.qty}`)
      }
      setOp(null)
      void fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  const columns: TableProps<FixtureItem>['columns'] = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 96,
      render: (v: string) => <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
      align: 'left',
      // 不设 width，固定布局下吸收剩余空间，避免数字列被等比拉宽
      render: (_v: string, r) => (
        <FixtureNameCell name={r.name} drawing={r.drawing} note={r.note} />
      ),
    },
    { title: '分类', dataIndex: 'category', key: 'category', align: 'left', width: 110 },
    { title: '规格', dataIndex: 'spec', key: 'spec', align: 'left', width: 130 },
    {
      title: '在库',
      dataIndex: 'inStock',
      key: 'inStock',
      align: 'right',
      width: 76,
      render: (v: number, r) => (
        <span style={{ fontFamily: token.fontMono, color: v <= r.warn ? token.danger : undefined }}>
          {v}
        </span>
      ),
    },
    {
      title: '借出',
      dataIndex: 'lent',
      key: 'lent',
      align: 'right',
      width: 76,
      render: (v: number) => <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    {
      title: '警戒',
      dataIndex: 'warn',
      key: 'warn',
      align: 'right',
      width: 76,
      render: (v: number) => <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    { title: '位置', dataIndex: 'location', key: 'location', align: 'left', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 96,
      render: (v: FixtureItem['status']) => (
        <Badge tone={v === '在库' ? 'success' : 'warning'}>{v}</Badge>
      ),
    },
    {
      title: '操作',
      key: 'op',
      align: 'center',
      width: 160,
      render: (r: FixtureItem) => (
        <RowActions
          onLend={() => setOp({ mode: 'lend', item: r })}
          onReturn={() => setOp({ mode: 'return', item: r })}
          onEdit={() => openEdit(r)}
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ height: '100%' }}>
      <PageToolbar
        searchPlaceholder="搜索治具编号、名称、图纸号..."
        searchValue={keyword}
        onSearch={setKeyword}
        filters={(['全部', '在库', '借出'] as Filter[]).map((f) => ({
          label: f,
          active: filter === f,
          onClick: () => {
            setFilter(f)
            setPage(1)
          },
        }))}
        actionNode={
          <Button type="primary" icon={<Plus size={16} />} onClick={openAdd}>
            新增治具
          </Button>
        }
      />

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
        <Table<FixtureItem>
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
        title={editing ? '编辑治具' : '新增治具'}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Form<FixtureFormValues>
          key={editing ? editing.id : 'add'}
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={editing ? { ...editing } : addDefaults}
          onFinish={(v) => void onFinish(v)}
          style={{ marginTop: 8 }}
        >
          <div className="flex gap-3">
            <Form.Item
              name="name"
              label="名称"
              rules={[{ required: true, message: '请输入治具名称' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Input placeholder="请输入治具名称" />
            </Form.Item>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请输入分类' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Input placeholder="如：测试治具" />
            </Form.Item>
          </div>
          <div className="flex gap-3">
            <Form.Item name="drawing" label="图纸号" style={{ flex: 1, minWidth: 0 }}>
              <Input placeholder="如：DWG-2024-001" style={{ fontFamily: token.fontMono }} />
            </Form.Item>
            <Form.Item name="spec" label="规格" style={{ flex: 1, minWidth: 0 }}>
              <Input placeholder="如：300x200x50mm" />
            </Form.Item>
          </div>
          <div className="flex gap-3">
            <Form.Item
              name="inStock"
              label="在库数量"
              rules={[{ required: true, message: '请输入在库数量' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item
              name="warn"
              label="警戒值"
              rules={[{ required: true, message: '请输入警戒值' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <InputNumber min={0} style={{ width: '100%' }} />
            </Form.Item>
          </div>
          <Form.Item name="location" label="位置" rules={[{ required: true, message: '请输入位置' }]}>
            <Input placeholder="例如：A区-01架" />
          </Form.Item>
          <Form.Item name="note" label="备注">
            <Input.TextArea rows={3} placeholder="可选，填写补充说明..." />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              确认{editing ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>

      {op && (
        <BorrowReturnModal
          open
          mode={op.mode}
          item={{
            id: op.item.id,
            name: op.item.name,
            addLabel: '在库',
            addValue: op.item.inStock,
            reduceLabel: '借出',
            reduceValue: op.item.lent,
          }}
          selectRecord
          activeRecords={activeRecords}
          onCancel={() => setOp(null)}
          onConfirm={(p) => void handleOpConfirm(p)}
        />
      )}
    </div>
  )
}