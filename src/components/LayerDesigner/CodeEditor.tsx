import React from 'react'
import { Modal, Button } from 'antd'
import _isequal from 'lodash.isequal'
import AceEditor from 'react-ace'
import 'ace-builds/src-noconflict/mode-json'
import 'ace-builds/src-noconflict/mode-html'
import 'ace-builds/src-noconflict/theme-monokai'
import 'ace-builds/src-min-noconflict/ext-language_tools'
import 'ace-builds/src-min-noconflict/ext-spellcheck'
import 'ace-builds/src-min-noconflict/ext-searchbox'

const ace = require('ace-builds/src-noconflict/ace')

ace.config.set(
  'basePath',
  'https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/'
)
ace.config.setModuleUrl(
  'ace/mode/javascript_worker',
  'https://cdn.jsdelivr.net/npm/ace-builds@1.4.3/src-noconflict/worker-javascript.js'
)
type Props = {
  id: string
  onSave: (...args: Array<any>) => void
  onCancel?: (...args: Array<any>) => void
  title: string
  code: string
  mode: string
  theme?: string
  modal?: boolean
  visible: boolean
  t: (...args: Array<any>) => any
}
type State = {
  code: string
  canSave: boolean
}
export default class CodeEditor extends React.Component<Props, State> {
  static defaultProps: {
    id: string
    modal: boolean
    mode: string
    theme: string
    visible: boolean
  } = {
    id: 'code-editor',
    mode: 'json',
    theme: 'monokai',
    modal: true,
    visible: false
  }
  editor: any

  constructor(props: Props) {
    super(props)
    this.state = {
      code: props.code,
      canSave: true,
      show: props.visible
    }
  }

  componentWillReceiveProps(nextProps: Props): void {
    this.setState({
      code: nextProps.code
    })
  }

  shouldComponentUpdate(nextProps: Props, nextState: State): boolean {
    // only update if something changes
    if (!_isequal(this.props, nextProps)) {
      return true
    }

    if (!_isequal(this.state, nextState)) {
      return true
    }

    return false
  }

  onChange = (code: any): void => {
    this.setState({
      code
    })
  }
  onSave = (): void => {
    if (this.state.canSave) {
      this.props.onSave(this.state.code)
    }
  }

  render(): JSX.Element {
    const { title, modal, t, mode, theme, id, onCancel, visible } = this.props
    const { canSave, code } = this.state
    let editor = <></>

    if (visible) {
      editor = (
        <AceEditor
          ref='ace'
          mode={mode}
          theme={theme}
          onChange={this.onChange}
          name={id}
          width='100%'
          height='100%'
          highlightActiveLine
          enableBasicAutocompletion
          enableLiveAutocompletion
          value={code}
          editorProps={{
            $blockScrolling: true
          }}
          onValidate={(annotations) => {
            let canSave = true

            if (annotations?.length > 0) {
              for (const anno of annotations) {
                if (anno.type === 'error') {
                  canSave = false
                }
              }
            }

            this.setState({
              canSave
            })
          }}
        />
      )
    }

    return modal ? (
      <>
        <style jsx global>
          {' '}
          {`
            .ant-modal-content {
              height: 100%;
            }
          `}
        </style>
        <Modal
          title={title}
          visible={visible}
          centered
          height='90vh'
          width='60vw'
          bodyStyle={{
            height: 'calc(100% - 110px)',
            padding: '0px'
          }}
          onCancel={() => {
            if (onCancel) onCancel()
          }}
          footer={[
            <Button
              key='back'
              onClick={() => {
                if (onCancel) onCancel()
              }}
            >
              {t('Cancel')}
            </Button>,
            <Button
              key='submit'
              type='primary'
              disabled={!canSave}
              onClick={this.onSave}
            >
              {t('Save')}
            </Button>
          ]}
        >
          <div
            style={{
              height: '100%'
            }}
          >
            {editor}
          </div>
        </Modal>
      </>
    ) : (
      <div
        style={{
          height: 'calc(100% - 100px)',
          width: '100%'
        }}
      >
        <p>{title}</p>
        {editor}
        <div
          style={{
            float: 'right'
          }}
        >
          <Button
            type='primary'
            style={{
              float: 'none',
              marginTop: '15px'
            }}
            disabled={!canSave}
            onClick={this.onSave}
          >
            {t('Save')}
          </Button>
        </div>
      </div>
    )
  }
}
