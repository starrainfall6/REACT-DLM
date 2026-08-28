import { useEffect, useMemo, useState } from 'react'
import { App } from 'antd'
import dayjs from 'dayjs'
import { Box, LogIn, LogOut, AlertTriangle, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { token } from '@/components/ui/style'
import {
  getCurrentUser,
  inventoryApi,
  statsApi,
  transactionsApi,
  type ApiStats,
  type ApiTransaction,
} from '@/api/client'

/* ---------- count-up 动画 ---------- */
function useCountUp(target: number, duration = 1200) {
  const [val, setVal] = useState(0)
  useEffect(() => {
    const start = performance.now()
    const from = 0
    const ease = (t: number) => 1 - Math.pow(1 - t, 3)
    let raf = 0
    const step = (now: number) => {
      const p = Math.min(1, (now - start) / duration)
      setVal(Math.round(from + (target - from) * ease(p)))
      if (p < 1) raf = requestAnimationFrame(step)
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [target, duration])
  return val.toLocaleString('en-US')
}

function StatCard({
  icon,
  label,
  value,
  unit,
  trend,
  trendUp,
}: {
  icon: React.ReactNode
  label: string
  value: number
  unit: string
  trend: string
  trendUp?: boolean
}) {
  const shown = useCountUp(value)
  const trendColor = trendUp === undefined ? token.text3 : trendUp ? token.success : token.danger
  const TrendIcon = trendUp === undefined ? null : trendUp ? ArrowUpRight : ArrowDownRight
  return (
    <Card className="hoverable" style={{ padding: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: token.accentSoft ?? 'rgba(0,113,227,0.1)', color: token.accent, display: 'grid', placeItems: 'center' }}>{icon}</div>
      </div>
      <div style={{ fontSize: 13, color: token.mutedFg }}>{label}</div>
      <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.02em', color: token.text1, marginTop: 4 }}>
        {shown}
        <span style={{ fontSize: 14, fontWeight: 500, color: token.mutedFg, marginLeft: 4 }}>{unit}</span>
      </div>
      <div style={{ marginTop: 10, fontSize: 13, color: trendColor, display: 'flex', alignItems: 'center', gap: 4 }}>
        {TrendIcon && <TrendIcon width={14} height={14} />}
        {trend}
      </div>
    </Card>
  )
}

/* ---------- 环形图 ---------- */
function Donut({
  percent,
  inStock,
  borrowed,
  alertCount,
}: {
  percent: number
  inStock: number
  borrowed: number
  alertCount: number
}) {
  const r = 15.5
  const c = 2 * Math.PI * r
  const offset = c * (1 - percent / 100)
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
      <div style={{ position: 'relative', width: 120, height: 120 }}>
        <svg viewBox="0 0 36 36" style={{ width: 120, height: 120, transform: 'rotate(-90deg)' }}>
          <circle cx="18" cy="18" r={r} fill="none" stroke={token.surface2 ?? '#f5f5f7'} strokeWidth={3.4} />
          <circle
            cx="18"
            cy="18"
            r={r}
            fill="none"
            stroke={token.accent}
            strokeWidth={3.4}
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', textAlign: 'center' }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 700, color: token.text1 }}>{percent}%</div>
            <div style={{ fontSize: 11, color: token.mutedFg }}>在库率</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Legend color={token.accent} label="在库" value={`${inStock.toLocaleString('en-US')} 件`} />
        <Legend color={token.success} label="借出" value={`${borrowed.toLocaleString('en-US')} 件`} />
        <Legend color={token.danger} label="预警" value={`${alertCount.toLocaleString('en-US')} 件`} />
      </div>
    </div>
  )
}

function Legend({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}>
      <span style={{ width: 10, height: 10, borderRadius: 3, background: color }} />
      <span style={{ color: token.text2 }}>{label}</span>
      <span style={{ color: token.text1, fontWeight: 600, marginLeft: 'auto' }}>{value}</span>
    </div>
  )
}

/* ---------- 柱状图 ---------- */
interface DayBar {
  day: string
  in: number
  out: number
}

const weekLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

/** 近 7 日（含今天）按天聚合出入库数量 */
function buildWeekBars(txs: ApiTransaction[]): DayBar[] {
  const today = dayjs().startOf('day')
  const bars: DayBar[] = []
  for (let i = 6; i >= 0; i--) {
    const d = today.subtract(i, 'day')
    bars.push({ day: weekLabels[d.day()], in: 0, out: 0 })
  }
  for (const t of txs) {
    const dt = dayjs(t.created_at)
    if (!dt.isValid()) continue
    const idx = today.diff(dt.startOf('day'), 'day')
    if (idx >= 0 && idx < 7) {
      const bar = bars[6 - idx]
      if (t.tx_type === '入库') bar.in += t.quantity
      else bar.out += t.quantity
    }
  }
  return bars
}

function Bars({ data }: { data: DayBar[] }) {
  const max = Math.max(1, ...data.flatMap((d) => [d.in, d.out]))
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10, height: 160 }}>
        {data.map((d) => (
          <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: 130 }}>
              <div title={`入库 ${d.in}`} style={{ width: 12, height: `${(d.in / max) * 130}px`, background: token.accent, borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }} />
              <div title={`出库 ${d.out}`} style={{ width: 12, height: `${(d.out / max) * 130}px`, background: token.success, borderRadius: '4px 4px 0 0', transition: 'height 1s ease' }} />
            </div>
            <span style={{ fontSize: 11, color: token.mutedFg }}>{d.day}</span>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 12, color: token.mutedFg }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: token.accent }} /> 入库
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ width: 10, height: 10, borderRadius: 3, background: token.success }} /> 出库
        </span>
      </div>
    </div>
  )
}

/* ---------- 低库存预警 ---------- */
interface LowRow {
  name: string
  sku: string
  qty: number
  warn: number
  status: '缺货' | '偏低'
}

function toLowRows(stats: ApiStats | null): LowRow[] {
  if (!stats) return []
  const rows: LowRow[] = []
  for (const i of stats.low_stock_items) {
    rows.push({ name: i.name, sku: i.code, qty: i.quantity, warn: i.min_stock_alert, status: i.quantity <= 0 ? '缺货' : '偏低' })
  }
  for (const s of stats.low_stock_spares) {
    rows.push({ name: s.name, sku: s.code, qty: s.quantity, warn: s.min_stock_alert, status: s.quantity <= 0 ? '缺货' : '偏低' })
  }
  return rows
}

/* ---------- 近期动态 ---------- */
interface Activity {
  type: 'out' | 'in' | 'alert' | 'check'
  text: React.ReactNode
  time: string
}

const activityColor: Record<string, string> = {
  out: token.danger,
  in: token.success,
  alert: token.warning,
  check: token.accent,
}

export default function Dashboard() {
  const { message } = App.useApp()
  const [stats, setStats] = useState<ApiStats | null>(null)
  const [txs, setTxs] = useState<ApiTransaction[]>([])
  const [pendingChecks, setPendingChecks] = useState(0)

  useEffect(() => {
    let cancelled = false
    void (async () => {
      try {
        const [s, t, checks] = await Promise.all([
          statsApi.stats(),
          transactionsApi.list({ page_size: 1000 }),
          inventoryApi.checks(),
        ])
        if (cancelled) return
        setStats(s)
        setTxs(t.items)
        setPendingChecks(checks.items.filter((c) => c.status === '待同步').length)
      } catch (err) {
        message.error(err instanceof Error ? err.message : '加载统计数据失败')
      }
    })()
    return () => {
      cancelled = true
    }
  }, [message])

  const totalItems = stats ? stats.total_tools + stats.total_fixtures + stats.total_spares : 0
  const borrowed = stats?.borrowed_items ?? 0
  const overdue = stats?.overdue_items ?? 0
  const lowCount = stats ? stats.low_stock_items.length + stats.low_stock_spares.length : 0
  const inStockRate = totalItems > 0 ? Math.round(((totalItems - borrowed) / totalItems) * 100) : 0

  const weekBars = useMemo(() => buildWeekBars(txs), [txs])
  const weekIn = weekBars.reduce((s, d) => s + d.in, 0)
  const weekOut = weekBars.reduce((s, d) => s + d.out, 0)
  const todayKey = dayjs().format('YYYY-MM-DD')
  const todayTxs = useMemo(() => txs.filter((t) => t.created_at.startsWith(todayKey)), [txs, todayKey])
  const todayIn = todayTxs.filter((t) => t.tx_type === '入库').reduce((s, t) => s + t.quantity, 0)
  const todayOut = todayTxs.filter((t) => t.tx_type === '出库').reduce((s, t) => s + t.quantity, 0)

  const lowRows = useMemo(() => toLowRows(stats), [stats])

  const activities = useMemo<Activity[]>(() => {
    return txs.slice(0, 6).map((t) => ({
      type: t.tx_type === '入库' ? ('in' as const) : ('out' as const),
      text: (
        <>
          <b>{t.operator || '系统'}</b> {t.tx_type} <b>{t.item_name}</b> ×{t.quantity}
        </>
      ),
      time: `${t.created_at} · ${t.ref_no || '—'}`,
    }))
  }, [txs])

  const displayName = getCurrentUser()?.display_name || '张工'

  return (
    <div>
      {/* 页头 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: token.text1, margin: 0 }}>
            上午好，<span style={{ color: token.accent }}>{displayName}</span>。
          </h1>
          <p style={{ fontSize: 14, color: token.mutedFg, margin: '6px 0 0' }}>
            今日有 <b style={{ color: token.warning }}>{lowCount} 项</b> 低库存预警与{' '}
            <b style={{ color: token.accent }}>{pendingChecks} 项</b> 待办盘点任务。
          </p>
        </div>
      </div>

      {/* 统计卡 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 16 }}>
        <StatCard icon={<Box width={20} height={20} />} label="在库总数" value={totalItems} unit="件" trend={`${borrowed} 件借出中`} />
        <StatCard icon={<LogIn width={20} height={20} />} label="今日入库" value={todayIn} unit="件" trend={`近7日 ${weekIn} 件`} />
        <StatCard icon={<LogOut width={20} height={20} />} label="今日出库" value={todayOut} unit="件" trend={`近7日 ${weekOut} 件`} />
        <StatCard icon={<AlertTriangle width={20} height={20} />} label="低库存预警" value={lowCount} unit="项" trend={`${overdue} 条逾期`} trendUp={overdue === 0} />
      </div>

      {/* 图表行 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 1fr) minmax(320px, 1.4fr)', gap: 16, marginBottom: 16 }}>
        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: token.text1 }}>在库状态分布</div>
              <div style={{ fontSize: 12, color: token.mutedFg, marginTop: 2 }}>按状态聚合 · 实时</div>
            </div>
            <span className="chip" style={chip}>共 {totalItems.toLocaleString('en-US')} 件</span>
          </div>
          <Donut percent={inStockRate} inStock={Math.max(0, totalItems - borrowed)} borrowed={borrowed} alertCount={lowCount} />
        </Card>

        <Card style={{ padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: token.text1 }}>近 7 日出入库趋势</div>
              <div style={{ fontSize: 12, color: token.mutedFg, marginTop: 2 }}>每日入库 vs 出库</div>
            </div>
            <span className="chip" style={chip}>本周</span>
          </div>
          <Bars data={weekBars} />
        </Card>
      </div>

      {/* 表格 + 活动 */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1fr) minmax(320px, 1fr)', gap: 16, gridTemplateRows: 'minmax(0, 460px)' }}>
        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: token.text1 }}>低库存预警</div>
              <div style={{ fontSize: 12, color: token.mutedFg, marginTop: 2 }}>当前库存 ≤ 安全阈值</div>
            </div>
            <button className="chip" style={{ ...chip, cursor: 'pointer', border: 'none', background: 'transparent' }}>查看全部</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={thStyle}>备品</th>
                <th style={thStyle}>当前 / 阈值</th>
                <th style={thStyle}>状态</th>
              </tr>
            </thead>
            <tbody>
              {lowRows.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ ...tdStyle, textAlign: 'center', color: token.mutedFg }}>
                    暂无低库存预警
                  </td>
                </tr>
              ) : (
                lowRows.map((r) => (
                  <tr key={r.sku} style={{ borderTop: `1px solid ${token.border}` }}>
                    <td style={tdStyle}>
                      <div style={{ color: token.text1, fontWeight: 500 }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: token.mutedFg, fontFamily: token.fontMono }}>SKU · {r.sku}</div>
                    </td>
                    <td style={{ ...tdStyle, color: r.qty <= r.warn ? token.danger : token.text1, fontFamily: token.fontMono }}>
                      {r.qty} <span style={{ color: token.mutedFg }}>/ {r.warn}</span>
                    </td>
                    <td style={tdStyle}>
                      <Badge tone={r.status === '缺货' ? 'danger' : 'warning'}>{r.status}</Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          </div>
        </Card>

        <Card style={{ padding: 20, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: token.text1 }}>近期动态</div>
              <div style={{ fontSize: 12, color: token.mutedFg, marginTop: 2 }}>最近出入库流水</div>
            </div>
            <button className="chip" style={{ ...chip, cursor: 'pointer', border: 'none', background: 'transparent' }}>流水记录</button>
          </div>
          <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {activities.length === 0 ? (
              <div style={{ fontSize: 13, color: token.mutedFg }}>暂无出入库流水</div>
            ) : (
              activities.map((a, i) => (
                <div key={i} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, flexShrink: 0, background: `${activityColor[a.type]}22`, color: activityColor[a.type], display: 'grid', placeItems: 'center' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: activityColor[a.type] }} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13, color: token.text1 }}>{a.text}</div>
                    <div style={{ fontSize: 12, color: token.mutedFg, marginTop: 2 }}>{a.time}</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  )
}

const chip: React.CSSProperties = {
  fontSize: 12,
  color: token.mutedFg,
  background: token.surface2 ?? '#f5f5f7',
  padding: '4px 10px',
  borderRadius: 999,
}
const thStyle: React.CSSProperties = {
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 500,
  color: token.mutedFg,
  padding: '8px 8px',
}
const tdStyle: React.CSSProperties = {
  fontSize: 13,
  color: token.text1,
  padding: '10px 8px',
  verticalAlign: 'middle',
}