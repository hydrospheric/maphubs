// @flow
import React from 'react'
import slugify from 'slugify'
import StoryHeader from './StoryHeader'
import ShareButtons from '../../components/ShareButtons'
import urlUtil from '@bit/kriscarle.maphubs-utils.maphubs-utils.url-util'
import {Typography} from 'antd'
const { Title } = Typography

type Props = {|
  story: Object,
  baseUrl: string,
  t: Function
|}

export default class StorySummary extends React.Component<Props, void> {
  static defaultProps = {
    baseUrl: ''
  }

  render () {
    const { story, t } = this.props
    const baseUrl = urlUtil.getBaseUrl()
    const linkUrl = `${baseUrl}/story/${slugify(t(story.title))}/${story.story_id}`

    let imageUrl
    if (story.firstimage) {
      imageUrl = story.firstimage.replace(/\/image\//i, '/thumbnail/')
      if (imageUrl.startsWith(baseUrl)) {
        imageUrl = imageUrl.replace(baseUrl, '')
      }
      if (!imageUrl.startsWith('https')) {
        imageUrl = '/img/resize/1200?quality=80&progressive=true&url=' + imageUrl
      }
    }

    let title = t(story.title)
    title = title
      .replace('<br>', '')
      .replace('<br />', '')
      .replace('<p>', '')
      .replace('</p>', '')

    return (
      <div>
        <StoryHeader story={story} baseUrl={this.props.baseUrl} />
        {story.firstimage &&
          <div style={{marginBottom: '10px'}}>
            <a href={linkUrl}>
              <div style={{height: '160px', width: '100%', backgroundImage: 'url(' + imageUrl + ')', backgroundSize: 'cover', backgroundPosition: 'center'}} />
            </a>
          </div>}
        <a href={linkUrl}>
          <Title level={3}>{title}</Title>
        </a>
        <div className='story-content'>
          <p className='fade'>
            {t(story.summary)}
          </p>
        </div>
        <a href={linkUrl} style={{fontSize: '12px', color: 'rgba(0, 0, 0, 0.45)'}}>
          {t('Read more...')}
        </a>
        {!story.published &&
          <p style={{position: 'absolute', top: '15px', left: '50%', right: '50%'}}>
            <b style={{color: 'red', textTransform: 'uppercase'}}>{t('Draft')}</b>
          </p>}
        <ShareButtons
          title={story.title} t={t} iconSize={24}
          style={{position: 'absolute', right: '10px', bottom: '10px'}}
        />
      </div>
    )
  }
}
