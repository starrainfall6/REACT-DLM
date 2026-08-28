import { useEffect, useMemo, useRef, useState } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import {
  App,
  Button,
  Form,
  Input,
  Modal,
  Popconfirm,
  Select,
  Table,
  type TableProps,
} from 'antd'
import PageToolbar from '@/components/ui/PageToolbar'
import Badge from '@/components/ui/Badge'
import { useAntdFit } from '@/components/ui/useAntdFit'
import { token } from '@/components/ui/style'
import { usersApi, type ApiUser } from '@/api/client'

type Filter = '全部' | '管理员' | '普通用户'

const roleLabel: Record<ApiUser['role'], string> = {
  super_admin: '超级管理员',
  admin: '管理员',
  user: '普通用户',
}

interface UserFormValues {
  username: string
  password?: string
  display_name?: string
  role: ApiUser['role']
}

const addDefaults: UserFormValues = {
  username: '',
  password: '',
  display_name: '',
  role: 'user',
}

export default function Users() {
  const { message } = App.useApp()
  const [data, setData] = useState<ApiUser[]>([])
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<Filter>('全部')
  const [keyword, setKeyword] = useState('')
  const [page, setPage] = useState(1)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<ApiUser | null>(null)
  const [form] = Form.useForm<UserFormValues>()
  const wrapRef = useRef<HTMLDivElement>(null)
  const { pageSize, scrollY } = useAntdFit(wrapRef)

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const res = await usersApi.list({ page_size: 1000 })
      setData(res.items)
    } catch (err) {
      message.error(err instanceof Error ? err.message : '加载用户列表失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void fetchUsers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const filtered = useMemo(() => {
    const kw = keyword.trim().toLowerCase()
    return data.filter((d) => {
      const okRole =
        filter === '全部' ||
        (filter === '管理员' ? d.role === 'admin' : d.role === 'user')
      const okKw =
        !kw ||
        d.username.toLowerCase().includes(kw) ||
        d.display_name.toLowerCase().includes(kw)
      return okRole && okKw
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
  const openEdit = (r: ApiUser) => {
    setEditing(r)
    setOpen(true)
  }
  const handleCancel = () => {
    setOpen(false)
    setEditing(null)
  }

  const onFinish = async (v: UserFormValues) => {
    try {
      if (editing) {
        await usersApi.update(editing.id, {
          display_name: v.display_name ?? '',
          role: v.role,
          password: v.password || undefined,
        })
        message.success(`已更新用户：${editing.username}`)
      } else {
        await usersApi.create({
          username: v.username.trim(),
          password: v.password ?? '',
          display_name: v.display_name ?? '',
          role: v.role,
        })
        message.success(`已新增用户：${v.username.trim()}`)
      }
      setOpen(false)
      setEditing(null)
      void fetchUsers()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '保存失败')
    }
  }

  const onDelete = async (r: ApiUser) => {
    try {
      await usersApi.remove(r.id)
      message.success(`已删除用户：${r.username}`)
      void fetchUsers()
    } catch (err) {
      message.error(err instanceof Error ? err.message : '删除失败')
    }
  }

  const columns: TableProps<ApiUser>['columns'] = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      align: 'left',
      width: 72,
      render: (v: number) => <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    {
      title: '用户名',
      dataIndex: 'username',
      key: 'username',
      align: 'left',
      width: 140,
      render: (v: string) => <span style={{ fontFamily: token.fontMono }}>{v}</span>,
    },
    {
      title: '显示名称',
      dataIndex: 'display_name',
      key: 'display_name',
      align: 'left',
      render: (v: string) => <span>{v || '—'}</span>,
    },
    {
      title: '角色',
      dataIndex: 'role',
      key: 'role',
      align: 'center',
      width: 120,
      render: (v: ApiUser['role']) => (
        <Badge tone={v === 'super_admin' ? 'danger' : v === 'admin' ? 'info' : 'neutral'}>{roleLabel[v]}</Badge>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      key: 'created_at',
      align: 'left',
      width: 160,
      render: (v: string) => <span style={{ fontFamily: token.fontMono }}>{v || '—'}</span>,
    },
    {
      title: '操作',
      key: 'op',
      align: 'center',
      width: 120,
      render: (_v: unknown, r: ApiUser) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            type="text"
            size="small"
            title="编辑"
            style={{ fontSize: 12, height: 22, paddingInline: 6, lineHeight: '20px' }}
            icon={<Pencil width={13} height={13} />}
            onClick={() => openEdit(r)}
          />
          <Popconfirm
            title="删除用户"
            description={`确定删除用户「${r.username}」吗？`}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
            onConfirm={() => void onDelete(r)}
          >
            <Button
              type="text"
              size="small"
              title="删除"
              danger
              style={{ fontSize: 12, height: 22, paddingInline: 6, lineHeight: '20px' }}
              icon={<Trash2 width={13} height={13} />}
            />
          </Popconfirm>
        </div>
      ),
    },
  ]

  return (
    <div className="flex flex-col flex-1 min-h-0" style={{ height: '100%' }}>
      <PageToolbar
        searchPlaceholder="搜索用户名、显示名称..."
        searchValue={keyword}
        onSearch={setKeyword}
        filters={(['全部', '管理员', '普通用户'] as Filter[]).map((f) => ({
          label: f,
          active: filter === f,
          onClick: () => {
            setFilter(f)
            setPage(1)
          },
        }))}
        actionNode={
          <Button type="primary" icon={<Plus size={16} />} onClick={openAdd}>
            新增用户
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
        <Table<ApiUser>
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
        title={editing ? '编辑用户' : '新增用户'}
        onCancel={handleCancel}
        footer={null}
        destroyOnHidden
        width={480}
      >
        <Form<UserFormValues>
          key={editing ? editing.id : 'add'}
          form={form}
          layout="vertical"
          requiredMark={false}
          initialValues={editing ? { ...editing } : addDefaults}
          onFinish={(v) => void onFinish(v)}
          style={{ marginTop: 8 }}
        >
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="登录账号" disabled={!!editing} />
          </Form.Item>
          <Form.Item name="display_name" label="显示名称">
            <Input placeholder="例如：张三" />
          </Form.Item>
          <Form.Item name="role" label="角色" rules={[{ required: true, message: '请选择角色' }]}>
            <Select
              options={[
                { value: 'admin', label: '管理员' },
                { value: 'user', label: '普通用户' },
              ]}
            />
          </Form.Item>
          <Form.Item
            name="password"
            label={editing ? '重置密码' : '密码'}
            rules={editing ? undefined : [{ required: true, message: '请输入密码' }]}
            extra={editing ? '留空则不修改密码' : undefined}
          >
            <Input.Password placeholder={editing ? '留空则不修改密码' : '设置登录密码'} />
          </Form.Item>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 4 }}>
            <Button onClick={handleCancel}>取消</Button>
            <Button type="primary" htmlType="submit">
              确认{editing ? '更新' : '添加'}
            </Button>
          </div>
        </Form>
      </Modal>
    </div>
  )
}
