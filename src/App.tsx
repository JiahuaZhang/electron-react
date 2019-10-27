import React, { useState, useEffect, useRef } from 'react';
import { Tabs } from 'antd';
import 'antd/dist/antd.css';

import './App.sass';
import { FolderPage } from './Page/FolderPage';
import { ePub } from './extension/ePub/ePub.handler';
import { renderer } from './model/renderer';

const { TabPane } = Tabs;

const App: React.FC = () => {
  const [tabs, setTabs] = useState([] as { title: string; content: JSX.Element; key: number }[]);
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

  const onEdit = (targetKey: string | React.MouseEvent<HTMLElement>, action: 'add' | 'remove'): void => {
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

  return tabs.length === 1 ? (
    tabs[0].content
  ) : (
    <Tabs
      tabBarStyle={{ margin: 0 }}
      type="editable-card"
      onEdit={onEdit}
      activeKey={activeKey}
      onChange={activeKey => setActiveKey(activeKey)}>
      {tabs.map(({ title, content, key }) => (
        <TabPane tab={title} key={key.toString()}>
          {content}
        </TabPane>
      ))}
    </Tabs>
  );
};

export default App;
