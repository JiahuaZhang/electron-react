import React, { useState, useEffect, useRef } from 'react';
import { Layout, Icon, Menu } from 'antd';
import 'antd/dist/antd.css';

import './App.sass';
import { FolderPage } from './Page/FolderPage';
import { ePub } from './extension/ePub/ePub.handler';
import { controller } from './extension/ePub/model/epub';

const { Sider } = Layout;

if (process.env.NODE_ENV !== 'production') {
  const whyDidYouRender = require('@welldone-software/why-did-you-render');
  whyDidYouRender(React, {
    include: [
      /Screen/,
      /Book/,
      /Section/,
      /TableOfContents/,
      /ConfigPanel/,
      /FontFamily/,
      /FontSizeConfig/
    ]
  });
}

const App: React.FC = () => {
  const [state, setState] = useState<
    { type?: string; title?: string; key: number; content: JSX.Element }[]
  >([]);
  const id = useRef(0);
  const [activeKey, setActiveKey] = useState(-1);

  const getController = (): controller => {
    const currentId = id.current;
    return {
      render: (content: JSX.Element, title?: string) => {
        setState(prev_state => {
          setActiveKey(currentId);
          id.current++;
          return prev_state.concat({
            title,
            content,
            key: currentId,
            type: 'book'
          });
        });
      },
      discard: () => {
        setActiveKey(-1);
        setState(prevState => {
          return prevState.filter(({ key }) => key !== currentId);
        });
      }
    };
  };

  useEffect(() => {
    setState([
      { type: 'home', key: -1, content: <FolderPage fileHandlers={[ePub(getController)]} /> }
    ]);
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
      <Sider theme="light" collapsible defaultCollapsed>
        <Menu selectedKeys={[activeKey.toString()]}>
          {state.map(({ key, type, title }) => (
            <Menu.Item key={key} onClick={() => setActiveKey(key)}>
              <Icon type={type} />
              {title}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout style={{ overflow: 'auto', background: 'white' }}>
        {
          <div style={{ width: '100%', height: '100%' }} key={activeKey}>
            {renderedContent()}
          </div>
        }
      </Layout>
    </Layout>
  );
};

export default App;
