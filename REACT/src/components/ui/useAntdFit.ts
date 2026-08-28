import { useState, useLayoutEffect, type RefObject } from 'react'

/**
 * 自适应每页行数（适配 antd Table）：
 * 测「稳定的父容器（页面内容区中的表格外框）」高度，而非 antd 内部滚动容器自身——
 * 滚动容器高度由 scroll.y 锁死、不随行数变化，避免自激抖动。
 * 行高/表头高实测 DOM，不做写死；scroll.y 由容器高度推导，分页器随之贴底、表格填满。
 * 同时把 scroll.y 经 CSS 变量 --fit-y 下发给 .ant-table-body 的 min-height，
 * 抵消 rc-table 用 max-height 导致的「末页行少→表体收缩→底部间距变化」。
 *
 * 使用方约定：表格外框 div 加 className="tools-fit"，并内联 style 传入 '--fit-y': `${scrollY}px`。
 */
export function useAntdFit(wrapRef: RefObject<HTMLDivElement | null>) {
  const [fit, setFit] = useState({ pageSize: 12, scrollY: 480 })
  useLayoutEffect(() => {
    const el = wrapRef.current
    if (!el) return
    const outerH = (node: HTMLElement) => {
      const cs = getComputedStyle(node)
      return node.offsetHeight + parseFloat(cs.marginTop || '0') + parseFloat(cs.marginBottom || '0')
    }
    const measure = () => {
      const wh = el.clientHeight
      if (!wh) return
      const thead = el.querySelector('.ant-table-thead') as HTMLElement | null
      const row = el.querySelector('.ant-table-tbody .ant-table-row') as HTMLElement | null
      const pag = el.querySelector('.ant-table-pagination') as HTMLElement | null
      const headH = thead?.getBoundingClientRect().height ?? 47
      const rowH = row?.getBoundingClientRect().height ?? 46
      const pagH = pag ? outerH(pag) : 0
      const bodyH = wh - headH - pagH
      if (bodyH <= 0 || !rowH) return
      let n = Math.ceil(bodyH / rowH)
      if (!isFinite(n) || n < 5) n = 5
      const nextScrollY = Math.round(bodyH)
      setFit((f) =>
        f.pageSize === n && f.scrollY === nextScrollY ? f : { pageSize: n, scrollY: nextScrollY },
      )
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return fit
}
