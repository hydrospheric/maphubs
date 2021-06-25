import * as React from 'react'
import { PlusOutlined } from '@ant-design/icons'
import { Tag, Input, Tooltip } from 'antd'
import getConfig from 'next/config'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
type Props = {
  initialTags?: Array<string>
  onChange?: (...args: Array<any>) => any
}
type State = {
  tags: Array<string>
  inputVisible: boolean
  inputValue: string
}
export default class Tags extends React.Component<Props, State> {
  constructor(props: Props) {
    super()
    this.state = {
      tags: props.initialTags || [],
      inputVisible: false,
      inputValue: ''
    }
  }

  input: any
  handleClose: (removedTag: string) => void = (removedTag: string) => {
    const tags = this.state.tags.filter((tag) => tag !== removedTag)
    console.log(tags)
    this.setState({
      tags
    })
    if (this.props.onChange) this.props.onChange(tags)
  }
  showInput: () => void = () => {
    this.setState(
      {
        inputVisible: true
      },
      () => this.input.focus()
    )
  }
  handleInputChange: (e: any) => void = (e: any) => {
    this.setState({
      inputValue: e.target.value
    })
  }
  handleInputConfirm: () => void = () => {
    const { inputValue } = this.state
    let { tags } = this.state

    if (inputValue && !tags.includes(inputValue)) {
      tags = [...tags, inputValue]
    }

    console.log(tags)
    this.setState({
      tags,
      inputVisible: false,
      inputValue: ''
    })
    if (this.props.onChange) this.props.onChange(tags)
  }
  saveInputRef: (input: any) => any = (input: any) => (this.input = input)

  render(): React.ReactElement<'div'> {
    const { tags, inputVisible, inputValue } = this.state
    return (
      <div>
        {tags.map((tag, index) => {
          if (!tag) return ''
          const isLongTag = tag.length > 20
          const tagElem = (
            <Tag
              key={tag}
              color={MAPHUBS_CONFIG.primaryColor}
              closable
              onClose={() => this.handleClose(tag)}
            >
              {isLongTag ? `${tag.slice(0, 20)}...` : tag}
            </Tag>
          )
          return isLongTag ? (
            <Tooltip title={tag} key={tag}>
              {tagElem}
            </Tooltip>
          ) : (
            tagElem
          )
        })}
        {inputVisible && (
          <Input
            ref={this.saveInputRef}
            type='text'
            size='small'
            style={{
              width: 78
            }}
            value={inputValue}
            onChange={this.handleInputChange}
            onBlur={this.handleInputConfirm}
            onPressEnter={this.handleInputConfirm}
          />
        )}
        {!inputVisible && (
          <Tag
            onClick={this.showInput}
            style={{
              background: '#fff',
              borderStyle: 'dashed'
            }}
          >
            <PlusOutlined /> New Tag
          </Tag>
        )}
      </div>
    )
  }
}