import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { Row, Col, List, Button, Empty, message, notification } from 'antd'
import LocalizedCodeEditor from '../src/components/forms/LocalizedCodeEditor'
import request from 'superagent'
import shortid from 'shortid'

import ErrorBoundary from '../src/components/ErrorBoundary'
import dynamic from 'next/dynamic'

import { checkClientError } from '../src/services/client-error-response'
const CodeEditor = dynamic(
  () => import('../src/components/LayerDesigner/CodeEditor'),
  {
    ssr: false
  }
)

type Props = {
  locale: string
  page_id: string
  pageConfig: Record<string, any>
  footerConfig: Record<string, any>
  headerConfig: Record<string, any>
  _csrf: string
  user: Record<string, any>
}
type State = {
  pageConfig: Record<string, any>
  editingComponent?: Record<string, any>
}
export default class PageEdit extends React.Component<Props, State> {
  static async getInitialProps({
    req,
    query
  }: {
    req: any
    query: Record<string, any>
  }): Promise<any> {
    const isServer = !!req

    if (isServer) {
      return query.props
    } else {
      console.error('getInitialProps called on client')
    }
  }

  state: State

  constructor(props: Props) {
    super(props)

    const pageConfig = props.pageConfig || {}
    if (!pageConfig.components) pageConfig.components = []
    pageConfig.components.map((c) => {
      if (!c.id) c.id = shortid()
    })
    this.state = {
      pageConfig
    }
  }

  savePageConfig = (pageConfig: string): void => {
    const { t, props, state, setState } = this
    const { page_id } = props
    const { _csrf } = state

    request
      .post('/api/page/save')
      .type('json')
      .accept('json')
      .send({
        page_id: page_id,
        pageConfig,
        _csrf
      })
      .end((err, res) => {
        checkClientError(
          res,
          err,
          () => {},
          (cb) => {
            setState({
              pageConfig: JSON.parse(pageConfig)
            })

            if (err) {
              notification.error({
                message: t('Server Error'),
                description: err.message || err.toString() || err,
                duration: 0
              })
            } else {
              message.success(t('Page Saved'), 3)
            }

            cb()
          }
        )
      })
  }

  updateComponent(component: Record<string, any>): void {
    const { pageConfig } = this.state
    pageConfig.components = pageConfig.components.map((c) => {
      return c.id === component.id ? component : c
    })
    this.setState({
      pageConfig,
      editingComponent: null
    })
  }

  render(): JSX.Element {
    const { t, props, state, savePageConfig } = this
    const { headerConfig, page_id, footerConfig } = props
    const { pageConfig, editingComponent } = state
    const components = pageConfig.components
    return (
      <ErrorBoundary t={t}>
        <Header {...headerConfig} />
        <main
          style={{
            height: 'calc(100% - 100px)',
            padding: '20px'
          }}
        >
          <Row
            style={{
              height: '100%'
            }}
          >
            <Col
              span={12}
              style={{
                height: '100%',
                padding: '20px'
              }}
            >
              <Row
                style={{
                  height: '50%',
                  overflow: 'auto'
                }}
              >
                <List
                  header={<b>Components</b>}
                  bordered
                  dataSource={components}
                  style={{
                    width: '100%'
                  }}
                  renderItem={(item) => (
                    <List.Item>
                      <Row
                        style={{
                          width: '100%'
                        }}
                      >
                        <Col span={8}>ID: {item.id}</Col>
                        <Col span={8}>Type: {item.type}</Col>
                        <Col span={8}>
                          <Button
                            type='primary'
                            size='small'
                            onClick={() => {
                              this.setState({
                                editingComponent: item
                              })
                            }}
                          >
                            Edit
                          </Button>
                        </Col>
                      </Row>
                    </List.Item>
                  )}
                />
              </Row>
              <Row
                style={{
                  height: '50%'
                }}
              >
                <CodeEditor
                  ref='pageEditor'
                  id='layer-style-editor'
                  mode='json'
                  code={JSON.stringify(pageConfig, undefined, 2)}
                  title={t('Editing Page Config: ') + page_id}
                  onSave={savePageConfig}
                  modal={false}
                  visible
                  t={t}
                />
              </Row>
            </Col>
            <Col
              span={12}
              style={{
                height: '100%',
                padding: '20px'
              }}
            >
              <ErrorBoundary t={t}>
                <Row
                  style={{
                    height: '100%'
                  }}
                >
                  {editingComponent && editingComponent.type === 'html' && (
                    <LocalizedCodeEditor
                      id='component-html-editor'
                      mode='html'
                      localizedCode={editingComponent.html}
                      title={`Editing ${editingComponent.id}`}
                      onSave={(html) => {
                        editingComponent.html = html
                        this.updateComponent(editingComponent)
                      }}
                    />
                  )}
                  {editingComponent && editingComponent.type !== 'html' && (
                    <CodeEditor
                      visible
                      id='component-config-editor'
                      mode='json'
                      code={JSON.stringify(editingComponent, undefined, 2)}
                      title={`Editing ${editingComponent.id}`}
                      onSave={(json) => {
                        this.updateComponent(editingComponent)
                      }}
                      modal={false}
                      t={t}
                    />
                  )}
                  {!editingComponent && <Empty />}
                </Row>
              </ErrorBoundary>
            </Col>
          </Row>
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
