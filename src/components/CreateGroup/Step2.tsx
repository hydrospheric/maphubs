import React, { useState } from 'react'
import { Row, Col, Button, message, notification } from 'antd'
import ImageCrop from '../ImageCrop'
import GroupActions from '../../actions/GroupActions'
import classNames from 'classnames'
import GroupIcon from '@material-ui/icons/Group'
import useT from '../../hooks/useT'
import { useSelector } from 'react-redux'

type Props = {
  onSubmit: (group_id: string) => void
  active?: boolean
  showPrev?: boolean
  onPrev: () => void
}

const CreateGroupStep2 = ({
  showPrev,
  onPrev,
  active,
  onSubmit
}: Props): JSX.Element => {
  const { t } = useT()
  const [canSubmit, setCanSubmit] = useState(false)
  const [showImageCrop, setShowImageCrop] = useState(false)

  const group_id = useSelector((state: { group: any }) => state.group.group_id)
  const hasImage = useSelector((state: { group: any }) => state.group.hasImage)

  const onCrop = (data: string): void => {
    // send data to server
    setShowImageCrop(false)
    GroupActions.setGroupImage(data, (err) => {
      if (err) {
        notification.error({
          message: t('Server Error'),
          description: err.message || err.toString(),
          duration: 0
        })
      } else {
        message.success(t('Image Saved'), 3)
      }
    })
  }

  // hide if not active
  let className = classNames('row')

  if (!active) {
    className = classNames('row', 'hidden')
  }

  // if group has an image use link,
  const groupImage =
    group_id && hasImage ? (
      <img
        className='responsive-img'
        width={200}
        height={200}
        src={`/group/${group_id}/image.png?cacheBreak=${Date.now()}`}
      />
    ) : (
      <div
        className='circle valign-wrapper'
        style={{
          width: '200px',
          height: '200px'
        }}
      >
        <GroupIcon
          style={{
            fontSize: '100px',
            margin: 'auto'
          }}
        />
      </div>
    )

  return (
    <div className={className}>
      <div className='container'>
        <Row
          style={{
            marginBottom: '20px',
            padding: '20px'
          }}
        >
          <Col span={12}>{groupImage}</Col>
          <Col span={12}>
            <Button
              type='primary'
              onClick={() => {
                setShowImageCrop(true)
              }}
            >
              {t('Add Image')}
            </Button>
            <p>{t('Upload an Image or Logo for Your Group (Optional)')}</p>
          </Col>
        </Row>
        <Row
          justify='center'
          align='middle'
          style={{
            marginBottom: '20px'
          }}
        >
          {showPrev && (
            <Col span={4}>
              <Button type='primary' onClick={onPrev}>
                {t('Previous Step')}
              </Button>
            </Col>
          )}
          <Col span={4} offset={16}>
            <Button
              type='primary'
              onClick={() => {
                onSubmit(group_id)
              }}
            >
              {t('Save')}
            </Button>
          </Col>
        </Row>
      </div>
      <ImageCrop
        visible={showImageCrop}
        onCancel={() => {
          setShowImageCrop(false)
        }}
        aspectRatio={1}
        lockAspect
        resize_width={600}
        resize_height={600}
        onCrop={onCrop}
      />
    </div>
  )
}
export default CreateGroupStep2
