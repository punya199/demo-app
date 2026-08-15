import {
  CalculatorOutlined,
  DeleteOutlined,
  EditOutlined,
  EyeOutlined,
  HomeOutlined,
  PlusOutlined,
  SafetyCertificateOutlined,
  SaveOutlined,
  UserOutlined,
} from '@ant-design/icons'
import { capitalCase } from 'change-case'
import { Button, Form, message, Switch, Tooltip } from 'antd'
import { motion } from 'motion/react'
import { Fragment, ReactNode, useCallback } from 'react'
import { EnumPermissionFeatureName } from '../../services/permission/permission.params'
import { IEditUserPermissionsParams } from '../../services/user/user.params'
import { useEditUserPermissions } from '../../services/user/user.query'

export type IUserPermissionFormValues = IEditUserPermissionsParams

interface IUserPermissionFormProps {
  userId: string
  initialValues: IUserPermissionFormValues
  disabled?: boolean
}

const featureIcon: Partial<Record<EnumPermissionFeatureName, ReactNode>> = {
  [EnumPermissionFeatureName.HOUSE_RENT]: <HomeOutlined />,
  [EnumPermissionFeatureName.BILL]: <CalculatorOutlined />,
  [EnumPermissionFeatureName.USER]: <UserOutlined />,
  [EnumPermissionFeatureName.USER_PERMISSIONS]: <SafetyCertificateOutlined />,
}

const actionColumns = [
  { key: 'canRead', label: 'Read', icon: <EyeOutlined /> },
  { key: 'canCreate', label: 'Create', icon: <PlusOutlined /> },
  { key: 'canUpdate', label: 'Update', icon: <EditOutlined /> },
  { key: 'canDelete', label: 'Delete', icon: <DeleteOutlined /> },
] as const

export const UserPermissionForm = (props: IUserPermissionFormProps) => {
  const { userId, initialValues, disabled } = props
  const { mutate: editUserPermissions, isPending } = useEditUserPermissions(userId)

  const onFinish = useCallback(
    (values: IUserPermissionFormValues) => {
      editUserPermissions(values, {
        onSuccess: () => {
          message.success('User permissions updated successfully')
        },
        onError: () => {
          message.error('User permissions updated failed')
        },
      })
    },
    [editUserPermissions]
  )

  return (
    <Form initialValues={initialValues} layout="vertical" onFinish={onFinish} disabled={disabled}>
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div className="grid grid-cols-[minmax(160px,auto)_64px_repeat(4,64px)] items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold text-slate-500 uppercase dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
              <span>Feature</span>
              <span className="text-center">All</span>
              {actionColumns.map((col) => (
                <Tooltip key={col.key} title={col.label}>
                  <span className="flex items-center justify-center gap-1">{col.icon}</span>
                </Tooltip>
              ))}
            </div>

            <Form.List name="permissions">
              {(fields) =>
                fields.map((field, index) => (
                  <Fragment key={field.key}>
                    <Form.Item name={[field.name, 'featureName']} noStyle>
                      <input type="hidden" />
                    </Form.Item>
                    <div
                      className={`grid grid-cols-[minmax(160px,auto)_64px_repeat(4,64px)] items-center gap-2 px-4 py-3 transition-colors hover:bg-blue-50/60 dark:hover:bg-blue-950/20 ${
                        index % 2 === 1 ? 'bg-slate-50/60 dark:bg-slate-800/30' : ''
                      }`}
                    >
                      <Form.Item shouldUpdate noStyle>
                        {({ getFieldValue }) => {
                          const featureName = getFieldValue([
                            'permissions',
                            field.name,
                            'featureName',
                          ]) as EnumPermissionFeatureName
                          return (
                            <div className="flex items-center gap-2 font-medium text-slate-800 dark:text-slate-100">
                              <span className="text-blue-600 dark:text-blue-400">
                                {featureIcon[featureName] ?? <SafetyCertificateOutlined />}
                              </span>
                              <span className="truncate">{capitalCase(featureName || '')}</span>
                            </div>
                          )
                        }}
                      </Form.Item>

                      <div className="flex justify-center">
                        <Form.Item shouldUpdate noStyle>
                          {({ getFieldValue, setFieldValue }) => {
                            const action = getFieldValue(['permissions', field.name, 'action'])
                            const canAll = Object.values(action || {}).every((value) => value)
                            return (
                              <Switch
                                size="small"
                                checked={canAll}
                                onClick={() => {
                                  setFieldValue(['permissions', field.name, 'action'], {
                                    canRead: !canAll,
                                    canCreate: !canAll,
                                    canUpdate: !canAll,
                                    canDelete: !canAll,
                                  })
                                }}
                              />
                            )
                          }}
                        </Form.Item>
                      </div>

                      {actionColumns.map((col) => (
                        <div key={col.key} className="flex justify-center">
                          <Form.Item
                            name={[field.name, 'action', col.key]}
                            valuePropName="checked"
                            noStyle
                          >
                            <Switch size="small" />
                          </Form.Item>
                        </div>
                      ))}
                    </div>
                  </Fragment>
                ))
              }
            </Form.List>
          </div>
        </div>
      </div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="mt-4 inline-block"
      >
        <Button type="primary" htmlType="submit" icon={<SaveOutlined />} loading={isPending}>
          Save
        </Button>
      </motion.div>
    </Form>
  )
}
