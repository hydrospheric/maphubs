// @flow
import React from 'react'
import MapHubsComponent from './MapHubsComponent'
import DebugService from '../services/debug'
const debug = DebugService('react-error-boundary')

type Props = {
  children: any
}

type State = {
  error?: any
}

export default class ErrorBoundary extends MapHubsComponent<Props, State> {
  constructor (props: Props) {
    super(props)
    this.state = {error: null}
  }

  componentDidCatch (error: any, errorInfo: any) {
    this.setState({error})
    debug.error(error)
    if (Raven && Raven.isSetup && Raven.isSetup()) {
      Raven.captureException(error, {extra: errorInfo})
    } else {
      console.error('Raven not found')
    }
  }

  render () {
    if (this.state.error) {
      return (
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100%'
        }}>
          <svg xmlns='http://www.w3.org/2000/svg' version='1.1'
            width={100} height={100} x='0px' y='0px'
            viewBox='0 0 362.504 453.1293875' preserveAspectRatio='xMidYMid meet'>
            <path d='m 269.88,92.3938 -111.635,65.438 -65.713,111.9105 111.865,-65.7135 65.483,-111.635 0,0 z M 53.085,53.0851 C 85.873,20.2513 131.198,0 181.252,0 c 50.054,0 95.379,20.2513 128.167,53.0851 32.788,32.7879 53.085,78.1123 53.085,128.1666 0,50.0544 -20.297,95.3329 -53.085,128.1667 -32.788,32.7878 -78.113,53.0851 -128.167,53.0851 -50.054,0 -95.379,-20.2973 -128.167,-53.0851 C 20.298,276.5846 0,231.3061 0,181.2517 0,131.1974 20.252,85.873 53.085,53.0851 l 0,0 z m 3.353,119.9008 0,0 c -4.546,0 -8.22,3.7196 -8.22,8.2658 0,4.5003 3.719,8.22 8.22,8.22 l 0,0 c 4.546,0 8.22,-3.6737 8.22,-8.22 0,-4.5462 -3.72,-8.2658 -8.22,-8.2658 l 0,0 z m 249.628,16.4858 0,0 c 4.501,0 8.22,-3.7197 8.22,-8.22 0,-4.5462 -3.719,-8.2658 -8.22,-8.2658 l 0,0 c -4.546,0 -8.219,3.7196 -8.219,8.2658 0,4.5003 3.673,8.22 8.219,8.22 l 0,0 z m -133.034,116.5944 0,0 c 0,4.5462 3.674,8.2199 8.22,8.2199 4.546,0 8.22,-3.6737 8.22,-8.2199 l 0,0 c 0,-4.5462 -3.674,-8.2199 -8.22,-8.2199 -4.546,0 -8.22,3.6737 -8.22,8.2199 l 0,0 z M 189.426,56.07 l 0,0.3215 c 0,-4.5463 -3.674,-8.22 -8.22,-8.22 -4.546,0 -8.22,3.6737 -8.22,8.22 l 0,-0.3215 c 0,4.5462 3.674,8.2199 8.22,8.2199 4.546,0 8.22,-3.6737 8.22,-8.2199 l 0,0 z m 89.639,27.3232 c 12.766,12.7662 23.006,28.0121 30.032,44.9571 6.751,16.2562 10.47,34.1655 10.47,52.9014 0,18.736 -3.719,36.5994 -10.47,52.8556 -7.026,16.945 -17.266,32.145 -30.032,44.957 -12.766,12.8121 -28.012,23.0526 -44.911,30.0326 l -0.781,0.3215 -0.781,0.3214 -0.78,0.3215 -0.781,0.2755 -0.781,0.3214 -0.78,0.3215 -0.781,0.2755 -0.781,0.2756 -0.826,0.2755 -0.781,0.2755 -0.781,0.3215 -0.826,0.2296 -0.781,0.2755 -0.826,0.2755 -0.781,0.2296 -0.827,0.2756 -0.78,0.2296 -0.827,0.2296 -0.827,0.2755 0,0 -0.826,0.2296 -0.827,0.2296 -0.826,0.2296 -0.827,0.1837 -0.826,0.2296 -0.827,0.1837 -0.827,0.2296 -0.826,0.1837 0,0 -0.827,0.1837 -0.826,0.2296 0,0 -0.827,0.1378 0,0 -0.827,0.1836 0,0 -0.826,0.1837 -0.827,0.1837 -0.826,0.1378 -0.827,0.1837 0,0 -0.827,0.1377 -0.872,0.1378 -0.827,0.1378 -0.826,0.1377 -0.873,0.1378 -0.872,0.1377 -0.873,0.1378 -0.826,0.092 0,0 -0.873,0.092 0,0 -0.826,0.1378 0,0 -0.873,0.092 0,0 -0.872,0.092 -0.873,0.092 -0.826,0.092 -0.873,0.092 -0.873,0.046 -0.872,0.092 -0.873,0.046 -0.872,0.046 -0.873,0.092 -0.872,0 0,0 -0.873,0.046 -0.872,0.046 -0.873,0.046 -0.872,0 -0.873,0.046 -0.918,0 -0.873,0 -0.872,0.046 c -18.736,0 -36.599,-3.7655 -52.901,-10.516 -16.9,-6.98 -32.145,-17.2664 -44.912,-30.0326 -12.766,-12.7661 -23.052,-27.9661 -30.032,-44.957 -6.751,-16.2562 -10.47,-34.1196 -10.47,-52.8556 0,-18.7359 3.719,-36.6452 10.47,-52.9014 6.98,-16.8991 17.266,-32.145 30.032,-44.9571 12.767,-12.7202 27.967,-23.0525 44.912,-30.0326 16.302,-6.7045 34.165,-10.47 52.901,-10.47 l 0.872,0 0.873,0 0.918,0 0.873,0.046 0.872,0 0.873,0.046 0.872,0.046 0.873,0.046 0,0 0.872,0.046 0.873,0.046 0.872,0.046 0.873,0.092 0.872,0.046 0.873,0.046 0.873,0.092 0.826,0.092 0.873,0.092 0.872,0.092 0,0 0.873,0.092 0,0 0.826,0.1378 0,0 0.873,0.092 0,0 0.826,0.1378 0.873,0.092 0.872,0.1378 0.873,0.1378 0.826,0.1377 0.827,0.1378 0.872,0.1378 0.827,0.1377 0,0 0.827,0.1837 0.826,0.1378 0.827,0.1837 0.826,0.1836 0,0 0.827,0.1837 0,0 0.827,0.1837 0,0 0.826,0.1837 0.827,0.1837 0,0 0.826,0.1837 0.827,0.2296 0.827,0.1837 0.826,0.2296 0.827,0.2296 0.826,0.2296 0.827,0.2296 0.826,0.2296 0,0 0.827,0.2296 0.827,0.2296 0.78,0.2296 0.827,0.2755 0.781,0.2296 0.826,0.2756 0.781,0.2755 0.826,0.2755 0.781,0.2756 0.781,0.2755 0.826,0.2755 0.781,0.3215 0.781,0.2755 0.78,0.2755 0.781,0.3215 0.781,0.3214 0.78,0.2756 0.781,0.3214 0.781,0.3215 c 16.899,6.5208 32.145,16.8531 44.911,29.5733 l 0,0 z m -51.478,51.2942 -34.166,58.2743 -24.108,-24.0628 58.274,-34.2115 z'
              clipRule='evenodd' fill={MAPHUBS_CONFIG.primaryColor} fillRule='evenodd' />
          </svg>
          <div style={{padding: '12px'}}>
            <p style={{margin: 0}}>{this.__('We\'re sorry - something\'s gone wrong.')}</p>
            <p style={{margin: 0}}>{this.__('Our team has been notified, but click  ')}<button onClick={() => Raven.lastEventId() && Raven.showReportDialog()}>
              {this.__('here')}
            </button> {this.__('to fill out a report.')}
            </p>
          </div>

        </div>
      )
    } else {
      return this.props.children
    }
  }
}
