import React, { useState, useEffect, useRef } from 'react';
import { Tabs, Layout, Icon, Menu } from 'antd';
import 'antd/dist/antd.css';

import './App.sass';
import { FolderPage } from './Page/FolderPage';
import { ePub } from './extension/ePub/ePub.handler';
import { renderer } from './model/renderer';

const { TabPane } = Tabs;
const { Sider } = Layout;

const App: React.FC = () => {
  const [tabs, setTabs] = useState<{ title: string; content: JSX.Element; key: number }[]>([]);
  const id = useRef(0);
  const [activeKey, setActiveKey] = useState('0');

  const addTab: renderer = async (title: string, content: JSX.Element) => {
    setTabs(prev_state => {
      setActiveKey(id.current.toString());
      return prev_state.concat({
        title,
        content,
        key: id.current++
      });
    });
  };

  useEffect(() => {
    setTabs([{ title: 'FolderPage', content: <FolderPage fileHandlers={[ePub(addTab)]} />, key: -1 }]);
  }, []);

  const onEdit = (
    targetKey: string | React.MouseEvent<HTMLElement>,
    action: 'add' | 'remove'
  ): void => {
    if (action === 'add') {
      setTabs(tabs =>
        tabs.concat({
          title: 'FolderPage',
          content: <FolderPage fileHandlers={[ePub(addTab)]} />,
          key: id.current++
        })
      );
    } else if (action === 'remove') {
      setTabs(tabs => tabs.filter(({ key }) => key.toString() !== targetKey));
      if (activeKey === targetKey) {
        const first_available_tab = tabs.find(({ key }) => key.toString() !== targetKey);
        if (first_available_tab) {
          setActiveKey(first_available_tab.key.toString());
        }
      }
    }
  };

  return (
    <Layout
      style={{
        width: '100vw',
        height: '100vh',
        display: 'grid',
        gridTemplateColumns: 'max-content 1fr'
      }}>
      <Layout
        style={{
          display: 'grid',
          gridTemplateRows: 'max-content 1fr',
          overflow: 'auto',
          height: '100%'
        }}>
        <Icon
          style={{ fontSize: '1.5rem', background: 'white', padding: '.5rem', textAlign: 'left' }}
          type="fullscreen"
        />
        <Sider theme="light" collapsible>
          <Menu defaultSelectedKeys={['home']}>
            <Menu.Item key="home">
              <Icon type="home" />
            </Menu.Item>
          </Menu>
        </Sider>
      </Layout>
      <Layout style={{ overflow: 'auto', background: 'white' }}>
        <FolderPage />
      </Layout>
    </Layout>
  );
};

export default App;
