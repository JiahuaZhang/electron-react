import React, { useState, useEffect, useRef } from 'react';
import { Layout, Icon, Menu } from 'antd';
import 'antd/dist/antd.css';

import './App.sass';
import { FolderPage } from './Page/FolderPage';
import { ePub } from './extension/ePub/ePub.handler';
import { renderer } from './model/renderer';

const { Sider } = Layout;

const App: React.FC = () => {
  const [state, setState] = useState<
    { type?: string; title?: string; key: number; content: JSX.Element }[]
  >([]);
  const id = useRef(0);
  const [activeKey, setActiveKey] = useState(-1);

  const addContent: renderer = async (title: string, content: JSX.Element) => {
    setState(prev_state => {
      setActiveKey(id.current);
      return prev_state.concat({
        title,
        content,
        key: id.current++,
        type: 'book'
      });
    });
  };

  useEffect(() => {
    setTabs([{ title: 'FolderPage', content: <FolderPage fileHandlers={[ePub(addTab)]} />, key: -1 }]);
  }, []);

  const renderedContent = () => {
    const current = state.find(({ key }) => key === activeKey);
    return current ? current.content : null;
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
        <Sider theme="light" collapsible defaultCollapsed>
          <Menu defaultSelectedKeys={[activeKey.toString()]}>
            {state.map(({ key, type, title }) => (
              <Menu.Item key={key} onClick={() => setActiveKey(key)}>
                <Icon type={type} />
                {title}
              </Menu.Item>
            ))}
          </Menu>
        </Sider>
      </Layout>
      <Layout style={{ overflow: 'auto', background: 'white' }}>{renderedContent()}</Layout>
    </Layout>
  );
};

export default App;
