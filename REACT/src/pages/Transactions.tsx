import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { App, Table, type TableProps } from 'antd'
import PageToolbar from '@/components/ui/PageToolbar'
import Badge from '@/components/ui/Badge'
import { useAntdFit } from '@/components/ui/useAntdFit'
import type { TransactionItem } from '@/data/transactions'
import { transactionsApi } from '@/api/client'
import { toTransactionItem } from '@/api/mappers'
import { token } from '@/components/ui/style'

type Filter = '全部' | '入库' | '出库'

const mono = (v: string) => <span style={{ fontFamily: token.fontMono }}>{v}</span>
const dash = <span style={{ color: token.mutedFg }}>—</span>

export default function Transactions() {
  const { message } = App.useApp()
  const [data, setData] = useState<TransactionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('全部')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { pageSize, scrollY } = useAntdFit(wrapRef)

  /** 从后端拉取出入库流水（全量，本地过滤/分页） */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await transactionsApi.list({ page_size: 1000 })
      setData(res.items.map(toTransactionItem))
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载出入库流水失败')
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
      const okFilter = filter === '全部' || d.type === filter
      const okKw =
        !kw ||
        d.id.toLowerCase().includes(kw) ||
        d.item.toLowerCase().includes(kw) ||
        d.operator.toLowerCase().includes(kw) ||
        d.refNo.toLowerCase().includes(kw)
      return okFilter && okKw
    })
  }, [data, filter, keyword])
  const total = filtered.length
  const ps = total > 0 ? Math.min(pageSize, total) : pageSize

  // 过滤 / 每页行数变化后，避免停留在已不存在的页码
  useEffect(() => {
    const tp = Math.max(1, Math.ceil(total / ps))
    if (page > tp) setPage(tp)
  }, [total, ps, page])

  const columns: TableProps<TransactionItem>['columns'] = [
    {
      title: '流水号',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 140,
      render: (v: string) => mono(v),
    },
    {
      title: '物品名称',
      dataIndex: 'item',
      key: 'item',
      align: 'left',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      align: 'center',
      width: 80,
      render: (v: TransactionItem['type']) => (
        <Badge tone={v === '入库' ? 'success' : 'info'}>{v}</Badge>
      ),
    },
    {
      title: '数量',
      dataIndex: 'qty',
      key: 'qty',
      align: 'right',
      width: 80,
      render: (v: number) => <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    {
      title: '关联单号',
      dataIndex: 'refNo',
      key: 'refNo',
      align: 'left',
      width: 140,
      render: (v: string) => (v ? mono(v) : dash),
    },
    {
      title: '操作人',
      dataIndex: 'operator',
      key: 'operator',
      align: 'left',
      width: 90,
      render: (v: string) => v || dash,
    },
    {
      title: '部门',
      dataIndex: 'dept',
      key: 'dept',
      align: 'left',
      width: 100,
      render: (v: string) => v || dash,
    },
    { title: '操作时间', dataIndex: 'time', key: 'time', align: 'center', width: 150, render: (v: string) => mono(v) },
    {
      title: '备注',
      dataIndex: 'note',
      key: 'note',
      align: 'left',
      width: 180,
      ellipsis: true,
      render: (v?: string) => (v ? <span style={{ color: token.mutedFg }}>{v}</span> : dash),
    },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ height: '100%' }}>
      <PageToolbar
        searchPlaceholder="搜索流水号、物品名称、操作人..."
        searchValue={keyword}
        onSearch={setKeyword}
        filters={(['全部', '入库', '出库'] as Filter[]).map((f) => ({
          label: f,
          active: filter === f,
          onClick: () => {
            setFilter(f)
            setPage(1)
          },
        }))}
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
        <Table<TransactionItem>
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
    </div>
  )
}