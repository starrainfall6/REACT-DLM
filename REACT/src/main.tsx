import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { StyleProvider } from '@ant-design/cssinjs'
import { UIProvider } from './context/UIContext'
import { AntdProvider } from './components/AntdProvider'
import { AppRoutes } from './routes'
import './styles/index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      {/* layer 开启后 antd 样式封装进 @layer antd，与 Tailwind 层级互不干扰 */}
      <StyleProvider layer>
        <UIProvider>
          <AntdProvider>
            <AppRoutes />
          </AntdProvider>
        </UIProvider>
      </StyleProvider>
    </BrowserRouter>
  </StrictMode>
)
