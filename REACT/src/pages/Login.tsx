import { useState } from 'react'
import { useNavigate, Navigate } from 'react-router-dom'
import { User, Lock } from 'lucide-react'
import { token } from '@/components/ui/style'
import { authApi, isLoggedIn, saveAuth } from '@/api/client'

export default function Login() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // 已登录用户再次访问登录页时直接跳转到工作台
  if (isLoggedIn()) {
    return <Navigate to="/dashboard" replace />
  }

  const doLogin = async () => {
    if (!username.trim() || !password) {
      setError('请输入用户名和密码')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await authApi.login(username.trim(), password)
      saveAuth(res.access_token, res.user, remember)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="flex items-center justify-center"
      style={{
        minHeight: '100vh',
        backgroundImage: 'url(/login.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div
        style={{
          width: 360,
          boxSizing: 'border-box',
          padding: '36px 32px',
          borderRadius: token.radius,
          background: 'var(--surface-glass)',
          backdropFilter: 'blur(16px) saturate(160%)',
          WebkitBackdropFilter: 'blur(16px) saturate(160%)',
          border: '1px solid var(--border)',
          boxShadow: '0 12px 40px rgba(0,0,0,0.18)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <span style={{ fontSize: 22, fontWeight: 600, color: token.text1, letterSpacing: 0.5 }}>
          DemoLineManager
        </span>

        <h1 style={{ fontSize: 26, fontWeight: 700, color: token.text1, textAlign: 'center', margin: '24px 0 0' }}>
          欢迎登录
        </h1>
        <p style={{ fontSize: 14, color: token.mutedFg, marginTop: 6, textAlign: 'center' }}>
          请输入您的账号信息以继续
        </p>

        <div
          className="flex items-center gap-3 w-full px-4"
          style={{ height: 46, marginTop: 24, border: `1px solid var(--input, #e2e3e4)`, borderRadius: token.radius, background: token.surface }}
        >
          <User width={18} height={18} color={token.mutedFg} style={{ flexShrink: 0 }} />
          <input
            type="text"
            placeholder="请输入用户名"
            value={username}
            onChange={(e) => {
              setUsername(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && void doLogin()}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: token.text1, fontSize: 15, fontFamily: token.fontSans, minWidth: 0 }}
          />
        </div>

        <div
          className="flex items-center gap-3 w-full px-4"
          style={{ height: 46, marginTop: 16, border: `1px solid var(--input, #e2e3e4)`, borderRadius: token.radius, background: token.surface }}
        >
          <Lock width={18} height={18} color={token.mutedFg} style={{ flexShrink: 0 }} />
          <input
            type="password"
            placeholder="请输入密码"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value)
              setError('')
            }}
            onKeyDown={(e) => e.key === 'Enter' && void doLogin()}
            style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', color: token.text1, fontSize: 15, fontFamily: token.fontSans, minWidth: 0 }}
          />
        </div>

        <div className="flex items-center justify-between w-full" style={{ marginTop: 16 }}>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              style={{ accentColor: token.primary, width: 16, height: 16, cursor: 'pointer' }}
            />
            <span style={{ fontSize: 14, color: token.mutedFg }}>记住我</span>
          </label>
          <a href="#" onClick={(e) => e.preventDefault()} style={{ fontSize: 14, color: token.primary, textDecoration: 'none' }}>
            忘记密码?
          </a>
        </div>

        {error && (
          <div style={{ width: '100%', marginTop: 12, color: token.danger, fontSize: 13, textAlign: 'center' }}>{error}</div>
        )}

        <button
          onClick={() => void doLogin()}
          disabled={loading}
          className="flex items-center justify-center w-full whitespace-nowrap"
          style={{ height: 48, marginTop: 24, background: token.primary, color: token.primaryFg, borderRadius: token.radius, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1, fontSize: 16, fontWeight: 600, fontFamily: token.fontSans, letterSpacing: 0.5 }}
        >
          {loading ? '登录中...' : '登录'}
        </button>
      </div>
    </div>
  )
}