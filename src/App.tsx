import React, { useState, useEffect } from 'react';

import './App.sass';
import { FolderPage } from './Page/FolderPage';
import { Tabs, Tab, Grid } from 'grommet';
import { ePub } from './extension/ePub/ePub';
import { renderer } from './model/renderer';

const App: React.FC = () => {
  const [tabs, setTabs] = useState([] as { tab: string; content: JSX.Element }[]);
  const [tabIndex, setTabIndex] = useState(0);

  const addTab: renderer = async (tab: string, content: JSX.Element) => {
    setTabs(prev_state => {
      setTabIndex(prev_state.length);
      return prev_state.concat({
        tab,
        content
      });
    });
  };

  useEffect(() => {
    setTabs([{ tab: 'FolderPage', content: <FolderPage FileHandlers={[ePub(addTab)]} /> }]);
  }, []);

  return (
    <>
      {tabs.length === 1 ? (
        tabs[0].content
      ) : (
        <Tabs activeIndex={tabIndex} onActive={index => setTabIndex(index)}>
          {tabs.map(({ tab, content }, index) => (
            <Tab title={tab} key={index}>
              <Grid>{content}</Grid>
            </Tab>
          ))}
        </Tabs>
      )}
    </>
  );
};

export default App;
