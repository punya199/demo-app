import { css } from '@emotion/react'
import { Button, Divider, Flex, Form, message, Switch, Typography } from 'antd'
import { Fragment, useCallback } from 'react'
import { IEditUserPermissionsParams } from '../../services/user/user.params'
import { useEditUserPermissions } from '../../services/user/user.query'

export type IUserPermissionFormValues = IEditUserPermissionsParams

interface IUserPermissionFormProps {
  userId: string
  initialValues: IUserPermissionFormValues
  disabled?: boolean
}

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
      <div
        css={css`
          display: grid;
          grid-template-columns: minmax(max-content, auto) auto auto auto auto auto;
          column-gap: 8px;
        `}
      >
        <Flex justify="start">
          <Typography.Title level={5}>Feature Name</Typography.Title>
        </Flex>
        <Flex justify="center">
          <Typography.Title level={5}>All</Typography.Title>
        </Flex>
        <Typography.Title level={5}>Can Read</Typography.Title>
        <Flex justify="center">
          <Typography.Title level={5}>Can Create</Typography.Title>
        </Flex>
        <Flex justify="center">
          <Typography.Title level={5}>Can Update</Typography.Title>
        </Flex>
        <Flex justify="center">
          <Typography.Title level={5}>Can Delete</Typography.Title>
        </Flex>
        <Divider
          size="small"
          css={css`
            grid-column: 1 / -1;
          `}
        />
        <Form.List name="permissions">
          {(fields) =>
            fields.map((field) => (
              <Fragment key={field.key}>
                <div>
                  <Form.Item name={[field.name, 'featureName']} valuePropName="children" noStyle>
                    <Typography.Text />
                  </Form.Item>
                </div>
                <Flex justify="center">
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
                </Flex>
                <Flex justify="center">
                  <Form.Item
                    name={[field.name, 'action', 'canRead']}
                    label="Can Read"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch size="small" />
                  </Form.Item>
                </Flex>

                <Flex justify="center">
                  <Form.Item
                    name={[field.name, 'action', 'canCreate']}
                    label="Can Create"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch size="small" />
                  </Form.Item>
                </Flex>

                <Flex justify="center">
                  <Form.Item
                    name={[field.name, 'action', 'canUpdate']}
                    label="Can Update"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch size="small" />
                  </Form.Item>
                </Flex>

                <Flex justify="center">
                  <Form.Item
                    name={[field.name, 'action', 'canDelete']}
                    label="Can Delete"
                    valuePropName="checked"
                    noStyle
                  >
                    <Switch size="small" />
                  </Form.Item>
                </Flex>
                <Divider
                  size="small"
                  css={css`
                    grid-column: 1 / -1;
                  `}
                />
              </Fragment>
            ))
          }
        </Form.List>
      </div>
      <Button type="primary" htmlType="submit" loading={isPending}>
        Save
      </Button>
    </Form>
  )
}
