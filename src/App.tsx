import React, { useState, useEffect } from 'react';

import './App.sass';
import { FolderPage } from './Page/FolderPage';
import { Tabs, Tab, Grid } from 'grommet';
import { ePub } from './extension/ePub/ePub';
import { renderer } from './model/renderer';

const App: React.FC = () => {
  const [tabs, setTabs] = useState([] as { tab: string; content: JSX.Element }[]);

  const addTab: renderer = (tab: string, content: JSX.Element) =>
    setTabs(prev_state =>
      prev_state.concat({
        tab,
        content
      })
    );

  useEffect(() => {
    setTabs([{ tab: 'FolderPage', content: <FolderPage FileHandlers={[ePub(addTab)]} /> }]);
  }, []);

  return (
    <>
      {tabs.length === 1 ? (
        tabs[0].content
      ) : (
        <Tabs>
          {tabs.map(({ tab, content }) => (
            <Tab title={tab}>
              <Grid>{content}</Grid>
            </Tab>
          ))}
        </Tabs>
      )}
    </>
  );
};

export default App;
