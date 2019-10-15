import React, { useState } from 'react';
import { Button, Box, Grid } from 'grommet';
import { Add, Close } from 'grommet-icons';

import { Files } from '../Component/Files/Files';
import { ePub } from '../extension/ePub/ePub';

interface Props {}

export const FolderPage: React.FC<Props> = () => {
  const [state, setState] = useState([<Files openFileHandlers={[ePub]} />]);

  const newFolderPanel = () => setState(prev => [...prev, <Files openFileHandlers={[ePub]} />]);

  return (
    <div>
      <Box align="start" pad="xsmall">
        <Button icon={<Add />} label="New Folder Panel" onClick={newFolderPanel} primary />
      </Box>
      {state.map(s => s)}
    </div>
  );
};
