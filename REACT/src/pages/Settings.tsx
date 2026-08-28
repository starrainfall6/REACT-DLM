import { useState } from 'react'
import { App } from 'antd'
import { UserRound, KeyRound, Save } from 'lucide-react'
import Card from '@/components/ui/Card'
import { Field, Input } from '@/components/ui/Field'
import { PrimaryButton } from '@/components/ui/Button'
import { token } from '@/components/ui/style'
import { authApi, getCurrentUser, updateStoredUser } from '@/api/client'

export default function Settings() {
  const { message } = App.useApp()
  const user = getCurrentUser()

  const [username, setUsername] = useState(user?.username ?? '')
  const [displayName, setDisplayName] = useState(user?.display_name ?? '')
  const [savingName, setSavingName] = useState(false)

  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  const cardHead = (icon: React.ReactNode, title: string) => (
    <div className="flex items-center gap-2" style={{ marginBottom: 16 }}>
      <span style={{ color: token.primary, display: 'inline-flex' }}>{icon}</span>
      <h2 style={{ fontSize: 16, fontWeight: 600, color: token.text1, margin: 0 }}>{title}</h2>
    </div>
  )

  const handleSaveName = async () => {
    const name = username.trim()
    const shown = displayName.trim()
    if (!name) {
      message.warning('请输入登录账号')
      return
    }
    if (!shown) {
      message.warning('请输入显示名称')
      return
    }
    setSavingName(true)
    try {
      const res = await authApi.updateProfile({ username: name, display_name: shown })
      updateStoredUser({ username: res.username, display_name: res.display_name })
      message.success('用户名称已更新')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '更新失败')
    } finally {
      setSavingName(false)
    }
  }

  const handleSavePassword = async () => {
    if (!oldPassword) {
      message.warning('请输入当前密码')
      return
    }
    if (!newPassword) {
      message.warning('请输入新密码')
      return
    }
    if (newPassword !== confirmPassword) {
      message.warning('两次输入的新密码不一致')
      return
    }
    setSavingPwd(true)
    try {
      await authApi.updateProfile({ old_password: oldPassword, new_password: newPassword })
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
      message.success('密码已修改，下次登录请使用新密码')
    } catch (err) {
      message.error(err instanceof Error ? err.message : '修改失败')
    } finally {
      setSavingPwd(false)
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 560 }}>
      {/* 修改用户名称 */}
      <Card style={{ padding: 24 }}>
        {cardHead(<UserRound width={20} height={20} />, '修改用户名称')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="登录账号" required>
            <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="用于登录的账号" />
          </Field>
          <Field label="显示名称" required>
            <Input value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="系统内显示的名称" />
          </Field>
          <div style={{ fontSize: 12, color: token.mutedFg }}>
            修改登录账号后，下次登录请使用新的账号。
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PrimaryButton icon={<Save width={14} height={14} />} onClick={handleSaveName}>
              {savingName ? '保存中...' : '保存'}
            </PrimaryButton>
          </div>
        </div>
      </Card>

      {/* 修改密码 */}
      <Card style={{ padding: 24 }}>
        {cardHead(<KeyRound width={20} height={20} />, '修改密码')}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Field label="当前密码" required>
            <Input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              placeholder="请输入当前密码"
              autoComplete="current-password"
            />
          </Field>
          <Field label="新密码" required>
            <Input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="请输入新密码"
              autoComplete="new-password"
            />
          </Field>
          <Field label="确认新密码" required>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="请再次输入新密码"
              autoComplete="new-password"
            />
          </Field>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <PrimaryButton icon={<Save width={14} height={14} />} onClick={handleSavePassword}>
              {savingPwd ? '保存中...' : '保存'}
            </PrimaryButton>
          </div>
        </div>
      </Card>
    </div>
  )
}
