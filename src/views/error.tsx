import React from 'react'

import Header from '../components/header'
import Reflux from '../components/Rehydrate'
import LocaleStore from '../stores/LocaleStore'
import ErrorBoundary from '../components/ErrorBoundary'
import UserStore from '../stores/UserStore'
type Props = {
  title: string
  error: string
  url: Record<string, any>
  locale: string
  _csrf: string
  eventId: string
  headerConfig: Record<string, any>
  user: Record<string, any>
}
export default class Error extends React.Component<Props, void> {
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

  constructor(props: Props) {
    super(props)
    Reflux.rehydrate(LocaleStore, {
      locale: props.locale,
      _csrf: props._csrf
    })

    if (props.user) {
      Reflux.rehydrate(UserStore, {
        user: props.user
      })
    }
  }

  componentDidMount() {
    //TODO: Show Sentry dialog
  }

  render(): JSX.Element {
    return (
      <ErrorBoundary>
        <Header {...this.props.headerConfig} />
        <main>
          <div className='container s12'>
            <h3 className='center-align'>{this.props.title}</h3>
            <p className='flow-text center-align'>{this.props.error}</p>
            <p className='flow-text center-align'>
              <a
                href={this.props.url.asPath}
                target='_blank'
                rel='noopener noreferrer'
              >
                {this.props.url.asPath}
              </a>
            </p>
          </div>
        </main>
      </ErrorBoundary>
    )
  }
}
