import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Plus } from 'lucide-react'
import { App, Button, Form, Input, InputNumber, Modal, Popover, Table, type TableProps } from 'antd'
import PageToolbar from '@/components/ui/PageToolbar'
import Badge from '@/components/ui/Badge'
import RowActions from '@/components/ui/RowActions'
import BorrowReturnModal, { type OpPayload } from '@/components/ui/BorrowReturnModal'
import { useAntdFit } from '@/components/ui/useAntdFit'
import type { SupplyItem } from '@/data/supplies'
import { sparesApi } from '@/api/client'
import { toSupplyItem } from '@/api/mappers'
import { token } from '@/components/ui/style'

type Filter = '全部' | '充足' | '紧张' | '缺货'

/** 名称 + 圆圈 i：hover/click 弹出 antd 气泡卡片（autoAdjustOverflow 贴边自动偏移；挂到 body 不被表格滚动裁切） */
function SupplyNameCell({ name, maker, drawing, note }: {
  name: string
  maker: string
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
          <div><b>Maker：</b>{maker || '—'}</div>
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

interface SupplyFormValues {
  name: string
  category: string
  maker?: string
  model?: string
  stock: number
  warn: number
  location?: string
  note?: string
}

const addDefaults: SupplyFormValues = {
  name: '',
  category: '',
  maker: '',
  model: '',
  stock: 0,
  warn: 100,
  location: '',
  note: '',
}

export default function Supplies() {
  const { message } = App.useApp()
  const [data, setData] = useState<SupplyItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('全部')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<SupplyItem | null>(null)
  const [op, setOp] = useState<{ mode: 'lend' | 'return'; item: SupplyItem } | null>(null)
  const [form] = Form.useForm<SupplyFormValues>()
  const wrapRef = useRef<HTMLDivElement>(null)
  const { pageSize, scrollY } = useAntdFit(wrapRef)

  /** 从后端拉取备品列表（全量，本地过滤/分页） */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await sparesApi.list({ page_size: 1000 })
      setData(res.items.map(toSupplyItem))
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载备品列表失败')
    } finally {
      setLoading(false)
    }
  }, [message])

  useEffect(() => {
    void fetchData()
  }, [fetchData])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return data.filter((d) => {
      const okFilter = filter === '全部' || d.status === filter
      const okKw =
        !kw ||
        d.id.toLowerCase().includes(kw) ||
        d.name.toLowerCase().includes(kw) ||
        d.maker.toLowerCase().includes(kw) ||
        d.model.toLowerCase().includes(kw) ||
        d.category.toLowerCase().includes(kw)
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
  const openEdit = (r: SupplyItem) => {
    setEditing(r)
    setOpen(true)
  }
  const handleCancel = () => {
    setOpen(false)
    setEditing(null)
  }
  const onFinish = async (v: SupplyFormValues) => {
    try {
      if (editing) {
        await sparesApi.update(editing.dbId, {
          name: v.name,
          category: v.category,
          maker: v.maker ?? '',
          model: v.model ?? '',
          quantity: v.stock,
          min_stock_alert: v.warn,
          location: v.location ?? '',
          notes: v.note ?? '',
        })
        message.success(`已更新备品：${v.name}`)
      } else {
        await sparesApi.create({
          name: v.name,
          category: v.category,
          maker: v.maker ?? '',
          model: v.model ?? '',
          quantity: v.stock,
          min_stock_alert: v.warn,
          location: v.location ?? '',
          notes: v.note ?? '',
        })
        message.success(`已新增备品：${v.name}`)
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
        await sparesApi.in(item.dbId, {
          quantity: p.qty,
          operator: p.operator ?? '',
          notes: p.note ?? '',
        })
        message.success(`已入库：${item.name} ×${p.qty}`)
      } else {
        await sparesApi.out(item.dbId, {
          quantity: p.qty,
          operator: p.operator ?? '',
          notes: p.note ?? '',
        })
        message.success(`已出库：${item.name} ×${p.qty}`)
      }
      setOp(null)
      void fetchData()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '操作失败')
    }
  }

  const columns: TableProps<SupplyItem>['columns'] = [
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
        <SupplyNameCell name={r.name} maker={r.maker} drawing={r.drawing} note={r.note} />
      ),
    },
    { title: '分类', dataIndex: 'category', key: 'category', align: 'left', width: 110 },
    { title: '型号', dataIndex: 'model', key: 'model', align: 'left', width: 130 },
    {
      title: '库存',
      dataIndex: 'stock',
      key: 'stock',
      align: 'right',
      width: 76,
      render: (v: number, r) => (
        <span style={{ fontFamily: token.fontMono, color: v <= r.warn ? token.danger : undefined }}>
          {v}
        </span>
      ),
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
      render: (v: SupplyItem['status']) => (
        <Badge tone={v === '充足' ? 'success' : v === '紧张' ? 'warning' : 'danger'}>{v}</Badge>
      ),
    },
    {
      title: '操作',
      key: 'op',
      align: 'center',
      width: 160,
      render: (r: SupplyItem) => (
        <RowActions
          onLend={() => setOp({ mode: 'lend', item: r })}
          onReturn={() => setOp({ mode: 'return', item: r })}
          onEdit={() => openEdit(r)}
          lendLabel="入库"
          returnLabel="出库"
        />
      ),
    },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ height: '100%' }}>
      <PageToolbar
        searchPlaceholder="搜索备品编号、名称、型号..."
        searchValue={keyword}
        onSearch={setKeyword}
        filters={(['全部', '充足', '紧张', '缺货'] as Filter[]).map((f) => ({
          label: f,
          active: filter === f,
          onClick: () => {
            setFilter(f)
            setPage(1)
          },
        }))}
        actionNode={
          <Button type="primary" icon={<Plus size={16} />} onClick={openAdd}>
            新增备品
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
        <Table<SupplyItem>
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
        title={editing ? '编辑备品' : '新增备品'}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
        width={560}
      >
        <Form<SupplyFormValues>
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
              rules={[{ required: true, message: '请输入备品名称' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Input placeholder="请输入备品名称" />
            </Form.Item>
            <Form.Item
              name="category"
              label="分类"
              rules={[{ required: true, message: '请输入分类' }]}
              style={{ flex: 1, minWidth: 0 }}
            >
              <Input placeholder="如：紧固件" />
            </Form.Item>
          </div>
          <div className="flex gap-3">
            <Form.Item name="maker" label="Maker" style={{ flex: 1, minWidth: 0 }}>
              <Input placeholder="请输入制造商" />
            </Form.Item>
            <Form.Item name="model" label="型号" style={{ flex: 1, minWidth: 0 }}>
              <Input placeholder="请输入型号" />
            </Form.Item>
          </div>
          <div className="flex gap-3">
            <Form.Item
              name="stock"
              label="库存"
              rules={[{ required: true, message: '请输入库存' }]}
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
            <Input placeholder="例如：E区-A01" />
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
          withPersonnel={false}
          withOperator
          hideDate
          title={op.mode === 'lend' ? '入库登记' : '出库登记'}
          okText={op.mode === 'lend' ? '确认入库' : '确认出库'}
          qtyLabel={op.mode === 'lend' ? '入库数量' : '出库数量'}
          item={{
            id: op.item.id,
            name: op.item.name,
            addLabel: '当前库存',
            addValue: op.item.stock,
            reduceLabel: '当前库存',
            reduceValue: op.item.stock,
          }}
          onCancel={() => setOp(null)}
          onConfirm={(p) => void handleOpConfirm(p)}
        />
      )}
    </div>
  )
}