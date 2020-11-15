// @flow

import * as React from 'react'
import AutoSizer from 'react-virtualized-auto-sizer'

import CKEditor from '@ckeditor/ckeditor5-react'

import MapHubsEditor from '@maphubs/maphubs-story-editor'

type Props = {
  initialData?: string,
  onChange?: Function,
  language?: string
}

export default class NoteCKEditor extends React.Component<Props, void> {
  editorInstance: any
  domContainer: any

  static defaultProps: {|initialData: string, language: string|} = {
    initialData: '',
    language: 'en'
  }

  shouldComponentUpdate (): boolean {
    return false
  }

  render (): React.Node {
    const { initialData, language } = this.props
    const editorConfiguration = {
      language,
      toolbar: {
        items: [
          'heading',
          '|',
          'bold',
          'italic',
          'underline',
          'link',
          'bulletedList',
          'numberedList',
          'blockQuote',
          'insertTable',
          'highlight',
          'alignment',
          'removeFormat',
          '|',
          'undo',
          'redo'
        ]
      }
    }

    return (
      <AutoSizer>
        {({ height, width }) => (
          <div style={{width: `${width}px`, height: `${height - 40}px`}}>
            <style jsx global>{`
              .ck.ck-editor__main>.ck-editor__editable {
                height: ${height - 40}px;
                overflow-y: scroll;
              }
            `}
            </style>
            <CKEditor
              editor={MapHubsEditor}
              config={editorConfiguration}
              data={initialData}
              onInit={editor => {
                this.editorInstance = editor
                console.log('Init.', editor)
              }}
              onChange={(event, editor) => {
                const data = editor.getData()
                // console.log(data)
                if (this.props.onChange) this.props.onChange(data)
              }}
              onBlur={editor => {
                // console.log('Blur.', editor)
              }}
              onFocus={editor => {
                // console.log('Focus.', editor)
              }}
            />
          </div>
        )}
      </AutoSizer>
    )
  }
}
