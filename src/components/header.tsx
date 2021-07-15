import React, { useState } from 'react'
import { MenuOutlined } from '@ant-design/icons'
import { Layout, Menu, Drawer } from 'antd'
import useT from '../hooks/useT'
import ExploreDropdown from './Header/ExploreDropdown'
import AddDropdown from './Header/AddDropdown'
import HelpDropdown from './Header/HelpDropdown'
import SearchButton from './Header/SearchButton'
import LocaleChooser from './LocaleChooser'
import UserMenu from './Header/UserMenu'
import getConfig from 'next/config'
import { LocalizedString } from '../types/LocalizedString'
const MAPHUBS_CONFIG = getConfig().publicRuntimeConfig
const { Header } = Layout
type Link = {
  href: string
  label: LocalizedString
}

export type HeaderConfig = {
  logoLinkUrl?: string
  showSearch?: boolean
  showHelp?: boolean
  customSearchLink?: string
  customHelpLink?: string
  showMakeAMap?: boolean
  showExplore?: boolean
  showAdd?: boolean
  customLinks?: Array<Link>
  theme?: {
    backgroundColor?: string
    fontColor?: string
  }
}
type Props = {
  activePage?: string
} & HeaderConfig

const MapHubsHeader = ({
  customHelpLink,
  showHelp,
  activePage,
  customLinks,
  showMakeAMap,
  showSearch,
  customSearchLink,
  showExplore,
  logoLinkUrl,
  theme,
  showAdd
}: Props): JSX.Element => {
  const [visible, setVisible] = useState(false)

  const { t } = useT()

  const renderMenu = (className: string, mode: any): JSX.Element => {
    return (
      <Menu
        mode={mode}
        className={`${className} nav-menu`}
        defaultSelectedKeys={[activePage]}
        style={{
          height: '50px',
          lineHeight: '50px',
          textAlign: mode === 'vertical' ? 'left' : 'right',
          borderBottom: 'none'
        }}
      >
        {showMakeAMap && (
          <Menu.Item
            key='makeamap'
            style={{
              height: '50px'
            }}
          >
            <a href='/map/new'>{t('Make a Map')}</a>
          </Menu.Item>
        )}
        {showExplore && (
          <Menu.Item
            key='explore'
            style={{
              height: '50px'
            }}
          >
            <ExploreDropdown t={t} />
          </Menu.Item>
        )}
        {customLinks.map((link, i) => {
          return (
            <Menu.Item
              key={`nav-custom-link-${i}`}
              style={{
                height: '50px'
              }}
            >
              <a href={link.href}>{t(link.label)}</a>
            </Menu.Item>
          )
        })}
        <Menu.Item
          key='locale'
          style={{
            padding: '0 20px',
            height: '50px'
          }}
        >
          <LocaleChooser />
        </Menu.Item>
        {showAdd && (
          <Menu.Item
            key='add'
            style={{
              padding: mode === 'vertical' ? '0 20px' : '0 5px',
              height: '50px'
            }}
          >
            <AddDropdown t={t} sidenav={mode === 'vertical'} />
          </Menu.Item>
        )}
        {showSearch && (
          <Menu.Item
            key='search'
            style={{
              padding: mode === 'vertical' ? '0 20px' : '0 5px',
              height: '50px'
            }}
          >
            {mode === 'vertical' && (
              <a href={customSearchLink || '/search'}>{t('Search')}</a>
            )}
            {mode !== 'vertical' && (
              <SearchButton t={t} searchLink={customSearchLink || '/search'} />
            )}
          </Menu.Item>
        )}
        {showHelp && (
          <Menu.Item
            key='help'
            style={{
              padding: mode === 'vertical' ? '0 20px' : '0 5px',
              height: '50px'
            }}
          >
            <HelpDropdown t={t} customHelpLink={customHelpLink} />
          </Menu.Item>
        )}
        <Menu.Item
          key='user'
          style={{
            height: '50px',
            overflow: 'hidden'
          }}
        >
          <UserMenu sidenav={mode === 'vertical'} />
        </Menu.Item>
      </Menu>
    )
  }

  const { fontColor } = theme || {}
  const NavMenu = renderMenu('desktop-menu', 'horizontal')
  const MobileMenu = renderMenu('mobile-menu', 'vertical')
  return (
    <Header
      style={{
        padding: 0,
        height: '50px'
      }}
    >
      <div
        className='logo'
        style={{
          float: 'left'
        }}
      >
        <a className='valign-wrapper' href={logoLinkUrl}>
          <img
            className='valign'
            width={MAPHUBS_CONFIG.logoWidth}
            height={MAPHUBS_CONFIG.logoHeight}
            style={{
              margin: '5px'
            }}
            src={MAPHUBS_CONFIG.logo}
            alt={MAPHUBS_CONFIG.productName + ' ' + t('Logo')}
          />
          <small
            id='beta-text'
            style={{
              position: 'absolute',
              top: '12px',
              left: MAPHUBS_CONFIG.logoWidth + 5 + 'px',
              fontSize: '12px'
            }}
          >
            {MAPHUBS_CONFIG.betaText}
          </small>
        </a>
      </div>
      <style jsx global>
        {`
          .ant-menu-horizontal > .ant-menu-item {
            vertical-align: top;
          }

          .ant-menu-horizontal > .ant-menu-item:hover {
            border-bottom: none;
          }

          .ant-menu-horizontal > .ant-menu-item-selected {
            border-bottom: none;
          }

          @media (max-width: 1000px) {
            .hamburger-menu {
              display: block !important;
            }
            .desktop-menu {
              display: none;
            }
          }
        `}
      </style>
      {NavMenu}

      <MenuOutlined
        className='hamburger-menu'
        style={{
          fontSize: '24px',
          color: fontColor || 'inherit',
          position: 'absolute',
          top: '10px',
          right: '10px',
          display: 'none'
        }}
        onClick={() => {
          setVisible(true)
        }}
      />
      <Drawer
        bodyStyle={{
          padding: 0,
          height: '100%'
        }}
        placement='right'
        closable={false}
        onClose={() => {
          setVisible(false)
        }}
        visible={visible}
      >
        <div
          className='nav-menu'
          style={{
            height: '100%'
          }}
        >
          {MobileMenu}
        </div>
      </Drawer>
    </Header>
  )
}
MapHubsHeader.defaultProps = {
  logoLinkUrl: '/',
  showSearch: true,
  showHelp: true,
  showMakeAMap: true,
  showExplore: true,
  showAdd: true,
  customLinks: []
}
export default MapHubsHeader
