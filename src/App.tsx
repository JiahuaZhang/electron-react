import React, { useState, useEffect, useRef } from 'react';
import 'antd/dist/antd.css';
import { Layout, Menu } from 'antd';
import { BookOutlined, HomeOutlined } from '@ant-design/icons';

import './App.sass';
import { FolderPage } from './Page/FolderPage';
import { ePub } from './extension/ePub/ePub.handler';
import { controller } from './extension/ePub/model/epub';

const { Sider } = Layout;

// if (process.env.NODE_ENV !== 'production') {
//   const whyDidYouRender = require('@welldone-software/why-did-you-render');
//   whyDidYouRender(React, {
//     include: [
//       /Screen/,
//       /Book/,
//       /Section/,
//       /TableOfContents/,
//       /ConfigPanel/,
//       /FontFamily/,
//       /FontSizeConfig/,
//       /App/
//     ]
//   });
// }

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
        setState((prev_state) => {
          setActiveKey(currentId);
          id.current++;
          return prev_state.concat({
            title,
            content,
            key: currentId,
            type: 'book',
          });
        });
      },
      discard: () => {
        setActiveKey(-1);
        setState((prevState) => {
          return prevState.filter(({ key }) => key !== currentId);
        });
      },
    };
  };

  useEffect(() => {
    setState([
      { type: 'home', key: -1, content: <FolderPage fileHandlers={[ePub(getController)]} /> },
    ]);
    // ePub(getController).processor('/Users/jzhang016/Documents/Books/毛泽东选集-毛泽东.epub');
    ePub(getController).processor(
      '/Users/jzhang016/Documents/Books/读完/奇迹之书：一本图文并茂的幻想文学创作指南-杰夫·范德米尔.epub'
    );
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
        gridTemplateColumns: 'max-content 1fr',
      }}>
      <Sider theme="light" collapsible defaultCollapsed>
        <Menu selectedKeys={[activeKey.toString()]}>
          {state.map(({ key, type, title }) => (
            <Menu.Item key={key} onClick={() => setActiveKey(key)}>
              {type === 'book' && <BookOutlined />}
              {type === 'home' && <HomeOutlined />}
              {title}
            </Menu.Item>
          ))}
        </Menu>
      </Sider>
      <Layout style={{ overflow: 'auto', backgroundColor: 'white' }}>
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
