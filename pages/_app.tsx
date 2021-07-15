import Head from 'next/head'
import React from 'react'

import { Provider as NextAuthProvider } from 'next-auth/client'

// redux
import { Provider } from 'react-redux'
import { useStore } from '../src/redux/store'

//SWR
import SWRConfig from '../src/components/SWRConfig'

import '../src/maphubs.scss'

const MapHubs = ({ Component, pageProps, err }: any): JSX.Element => {
  const { session, initialReduxState } = pageProps
  const store = useStore(initialReduxState)
  return (
    <>
      <Head>
        <meta name='viewport' content='width=device-width, initial-scale=1' />
        <title>{'MapHubs'}</title>
      </Head>
      <NextAuthProvider
        session={session}
        options={{
          basePath: `/api/auth`
        }}
      >
        <Provider store={store}>
          <SWRConfig>
            <Component {...pageProps} err={err} />
          </SWRConfig>
        </Provider>
      </NextAuthProvider>
    </>
  )
}
export default MapHubs
