import React from 'react'
import Header from '../src/components/header'
import Footer from '../src/components/footer'
import { message, notification } from 'antd'
import request from 'superagent'

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
  pageConfig?: Record<string, any>
}
export default class ConfigEdit extends React.Component<Props, State> {
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

    this.state = {
      pageConfig: props.pageConfig
    }
  }

  savePageConfig = (pageConfig: string): void => {
    const { t, props, state, setState } = this

    request
      .post('/api/page/save')
      .type('json')
      .accept('json')
      .send({
        page_id: props.page_id,
        pageConfig,
        _csrf: state._csrf
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

  render(): JSX.Element {
    const { t, props, state, savePageConfig } = this
    const { headerConfig, page_id, footerConfig } = props
    const { pageConfig } = state
    return (
      <ErrorBoundary t={t}>
        <Header {...headerConfig} />
        <main
          className='container'
          style={{
            height: 'calc(100% - 100px)'
          }}
        >
          <CodeEditor
            id='layer-style-editor'
            mode='json'
            code={JSON.stringify(pageConfig, undefined, 2)}
            title={t('Editing Page Config: ') + page_id}
            onSave={savePageConfig}
            modal={false}
            visible
            t={t}
          />
        </main>
        <Footer t={t} {...footerConfig} />
      </ErrorBoundary>
    )
  }
}
