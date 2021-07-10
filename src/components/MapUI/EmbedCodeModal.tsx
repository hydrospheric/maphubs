import React from 'react'
import { Modal, Switch, Row, message, Alert, Tooltip } from 'antd'
import { htmlEncode } from 'js-htmlencode'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  show?: boolean
  onClose: (...args: Array<any>) => any
  share_id?: string
  map_id: number
  t: (v: string | LocalizedString) => string
}
type State = {
  interactive?: boolean
  show?: boolean
}
export default class EmbedCodeModal extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      show: props.show
    }
  }

  clipboard: any

  componentDidMount(): void {
    this.clipboard = require('clipboard-polyfill').default
  }

  componentWillReceiveProps(nextProps: Props): void {
    if (nextProps.show !== this.state.show) {
      this.setState({
        show: nextProps.show
      })
    }
  }

  onClose: () => void = () => {
    this.setState({
      show: false
    })
    this.props.onClose()
  }

  render(): JSX.Element {
    const { share_id, map_id, t } = this.props
    const { interactive, show } = this.state
    const baseUrl = urlUtil.getBaseUrl()
    const mode = interactive ? 'interactive' : 'static'

    const url = share_id
      ? `${baseUrl}/map/public-embed/${share_id}/${mode}`
      : `${baseUrl}/map/embed/${map_id}/${mode}`

    const code = `
  <iframe src="${url}"
    style="width: 100%; height: 350px;" frameborder="0" 
    allowFullScreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"
  >
  </iframe>
  `
    return (
      <Modal
        visible={show}
        title={t('Embed Code')}
        width='75%'
        afterClose={this.onClose}
        onOk={() => {
          this.clipboard.writeText(code)
          this.onClose()
          message.info('Copied')
        }}
        okText={t('Copy to Clipboard')}
        onCancel={this.onClose}
        cancelText={t('Cancel')}
      >
        <Row>
          <p>
            {t('Paste the following code into your website to embed a map:')}
          </p>
        </Row>
        <Row
          style={{
            overflow: 'auto'
          }}
        >
          <pre
            style={{
              width: '100%'
            }}
          >
            <code
              style={{
                width: '100%'
              }}
              dangerouslySetInnerHTML={{
                __html: htmlEncode(code)
              }}
            />
          </pre>
        </Row>
        {!share_id && MAPHUBS_CONFIG.requireLogin && (
          <Row
            style={{
              marginBottom: '20px'
            }}
          >
            <Alert
              message={t(
                'Login required to view this embed, enable sharing for public embeds.'
              )}
              type='warning'
            />
          </Row>
        )}
        <Row>
          <Tooltip
            title={t('Map image with play button (best performance)')}
            placement='left'
          >
            <span
              style={{
                marginRight: '10px'
              }}
            >
              {t('Normal')}
            </span>
          </Tooltip>
          <Switch
            checked={interactive}
            onChange={(checked) => {
              this.setState({
                interactive: checked
              })
            }}
          />
          <Tooltip
            title={t('Interactive map (no play button)')}
            placement='right'
          >
            <span
              style={{
                marginLeft: '10px'
              }}
            >
              {t('Interactive')}
            </span>
          </Tooltip>
        </Row>
      </Modal>
    )
  }
}
