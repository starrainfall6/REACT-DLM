import type { ReactNode } from 'react'
import { App, ConfigProvider, theme as antdTheme } from 'antd'
import { useUI } from '@/context/UIContext'

/**
 * antd 主题桥：将工程现有设计令牌（theme.css 中的 CSS 变量值）
 * 映射为 antd ConfigProvider token，并跟随应用的 light/dark 切换。
 * 职责边界：Tailwind 管布局，antd 管组件，本文件管“品牌视觉对齐”。
 */

const FONT_FAMILY =
  "'Manrope','Noto Sans SC',-apple-system,BlinkMacSystemFont,'PingFang SC','Microsoft YaHei',sans-serif"

const lightToken = {
  colorPrimary: '#0071e3',
  colorInfo: '#0071e3',
  colorSuccess: '#34c759',
  colorWarning: '#ff9f0a',
  colorError: '#ff3b30',
  colorTextBase: '#1d1d1f',
  colorBgLayout: '#fbfbfd',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBorder: 'rgba(0,0,0,0.12)',
  colorBorderSecondary: 'rgba(0,0,0,0.08)',
}

const darkToken = {
  colorPrimary: '#0a84ff',
  colorInfo: '#0a84ff',
  colorSuccess: '#30d158',
  colorWarning: '#ff9f0a',
  colorError: '#ff453a',
  colorTextBase: '#f5f5f7',
  colorBgLayout: '#000000',
  colorBgContainer: '#1c1c1e',
  colorBgElevated: '#2c2c2e',
  colorBorder: 'rgba(255,255,255,0.16)',
  colorBorderSecondary: 'rgba(255,255,255,0.1)',
}

export function AntdProvider({ children }: { children: ReactNode }) {
  const { theme } = useUI()
  const dark = theme === 'dark'
  return (
    <ConfigProvider
      theme={{
        algorithm: dark ? antdTheme.darkAlgorithm : antdTheme.defaultAlgorithm,
        token: {
          ...(dark ? darkToken : lightToken),
          fontFamily: FONT_FAMILY,
          fontSize: 14,
          borderRadius: 10,
          controlHeight: 36,
        },
        components: {
          Form: {
            itemMarginBottom: 16,
            labelFontSize: 13,
            verticalLabelPadding: '0 0 8px',
          },
        },
      }}
    >
      <App>{children}</App>
    </ConfigProvider>
  )
}
