import React, { useState, useEffect } from 'react';
import { Button, Box, Grid } from 'grommet';
import { Add, Close } from 'grommet-icons';

import { Files } from '../Component/Files/Files';
import { ePub } from '../extension/ePub/ePub';

interface Props {}

export const FolderPage: React.FC<Props> = () => {
  const [state, setState] = useState([<Files openFileHandlers={[ePub]} />]);

  useEffect(() => {
    console.log('state changed?');
  }, [state]);

  const newFolderPanel = () => setState(prev => prev.concat(<Files openFileHandlers={[ePub]} />));

  const removePanel = (panel: JSX.Element) => setState(prevState => prevState.filter(s => s !== panel));

  return (
    <div>
      <Box align="start" pad="xsmall">
        <Button icon={<Add />} label="New Folder Panel" onClick={newFolderPanel} primary />
      </Box>
      {state.map((s, index) => (
        <Grid key={index}>
          <Box align="end">
            <Button
              icon={<Close color="white" style={{ backgroundColor: 'red', borderRadius: '50%', padding: '.25rem' }} />}
              type="button"
              onClick={() => removePanel(s)}
            />
          </Box>
          {s}
        </Grid>
      ))}
    </div>
  );
};
