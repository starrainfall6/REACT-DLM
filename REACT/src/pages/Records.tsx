import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { App, Table, type TableProps } from 'antd'
import PageToolbar from '@/components/ui/PageToolbar'
import Badge from '@/components/ui/Badge'
import { useAntdFit } from '@/components/ui/useAntdFit'
import type { RecordItem } from '@/data/records'
import { recordsApi } from '@/api/client'
import { toRecordItem } from '@/api/mappers'
import { token } from '@/components/ui/style'

type Filter = '全部' | '借用中' | '已归还' | '逾期'

const mono = (v: string) => <span style={{ fontFamily: token.fontMono }}>{v}</span>

export default function Records() {
  const { message } = App.useApp()
  const [data, setData] = useState<RecordItem[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('全部')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const wrapRef = useRef<HTMLDivElement>(null)
  const { pageSize, scrollY } = useAntdFit(wrapRef)

  /** 从后端拉取借用记录（全量，本地过滤/分页） */
  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const res = await recordsApi.list({ page_size: 1000 })
      setData(res.items.map(toRecordItem))
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载借用记录失败')
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
        d.item.toLowerCase().includes(kw) ||
        d.borrower.toLowerCase().includes(kw)
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

  const columns: TableProps<RecordItem>['columns'] = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 130,
      render: (v: string) => mono(v),
    },
    {
      title: '物品名称',
      dataIndex: 'item',
      key: 'item',
      align: 'left',
      render: (v: string) => <span style={{ fontWeight: 500 }}>{v}</span>,
    },
    { title: '借用人', dataIndex: 'borrower', key: 'borrower', align: 'left', width: 90 },
    { title: '部门', dataIndex: 'dept', key: 'dept', align: 'left', width: 100 },
    {
      title: '归还/借出',
      key: 'qty',
      align: 'center',
      width: 100,
      render: (r: RecordItem) => (
        <span style={{ fontFamily: token.fontMono, whiteSpace: 'nowrap' }}>
          <span style={{ color: r.returned > 0 ? token.success : token.mutedFg }}>{r.returned}</span>
          <span style={{ color: token.mutedFg }}> / </span>
          <span>{r.lent}</span>
        </span>
      ),
    },
    { title: '用途', dataIndex: 'purpose', key: 'purpose', align: 'left', width: 160 },
    { title: '借出日期', dataIndex: 'lendDate', key: 'lendDate', align: 'center', width: 100, render: (v: string) => mono(v) },
    { title: '预计归还', dataIndex: 'expectReturn', key: 'expectReturn', align: 'center', width: 100, render: (v: string) => mono(v) },
    { title: '实际归还', dataIndex: 'actualReturn', key: 'actualReturn', align: 'center', width: 100, render: (v: string) => mono(v) },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      width: 90,
      render: (v: RecordItem['status']) => (
        <Badge tone={v === '借用中' ? 'info' : v === '已归还' ? 'success' : 'danger'}>{v}</Badge>
      ),
    },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ height: '100%' }}>
      <PageToolbar
        searchPlaceholder="搜索编号、物品名称、借用人..."
        searchValue={keyword}
        onSearch={setKeyword}
        filters={(['全部', '借用中', '已归还', '逾期'] as Filter[]).map((f) => ({
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
        <Table<RecordItem>
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