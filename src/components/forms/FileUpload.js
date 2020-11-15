// @flow
import type {Node} from "React";import React from 'react'
import { Button, Upload, Progress, message } from 'antd'
import { UploadOutlined } from '@ant-design/icons'
// import FileUploadProgress from 'react-fileupload-progress'

type Props = {|
  action: string,
  onUpload: Function,
  t: Function,
  beforeUpload?: Function
|}

type State = {
  status?: string,
  progress?: number
}

export default class FileUpload extends React.Component<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {}
  }

  render (): Node {
    const { action, onUpload, beforeUpload, t } = this.props
    const { progress } = this.state
    return (
      <>
        <Upload
          name='file'
          action={action}
          beforeUpload={(file) => {
            if (beforeUpload) beforeUpload(file)
          }}
          onChange={(info) => {
            if (info.file.status !== 'uploading') {
              console.log(info.file, info.fileList)
            }
            if (info.file.status === 'done') {
              message.success(`${info.file.name} file uploaded successfully`)
              onUpload(info.file.response)
            } else if (info.file.status === 'error') {
              message.error(`${info.file.name} file upload failed.`)
            }
            this.setState({status: info.file.status, progress: info.file.progress})
          }}
        >
          <Button>
            <UploadOutlined /> {t('Choose File')}
          </Button>
        </Upload>
        {progress &&
          <Progress percent={progress} status='active' />}
      </>
    )
  }
}
