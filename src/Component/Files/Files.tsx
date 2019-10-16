import React, { useState, useEffect, useCallback } from 'react';
import { Tab, Tabs, Grommet, Grid, Box, Text, Layer, Button } from 'grommet';
import { FormClose, StatusWarning } from 'grommet-icons';
import FileIcon from 'react-file-icon';
import path from 'path';

import { getType } from './extensions';
import { FileIconProps } from '../../model/FileIcon';

interface Props {
  directory?: string;
  openFileHandlers?: { matcher: (filename: string) => boolean; processor: (directory: string) => void }[];
}

const fs = window.require('fs');
const getNav = (directory: string): string[] => {
  if (directory.startsWith(path.sep)) {
    directory = directory.replace(path.sep, '');
  }

  return directory ? [path.sep, ...directory.split(path.sep)] : [path.sep];
};

const getFileInfo = (parentPath: string, dirEnt: { name: string; isDirectory: () => boolean }): FileIconProps => {
  let result = {} as FileIconProps;

  result.key = dirEnt.name;
  result.parentPath = parentPath;
  result.filename = dirEnt.name;

  result.extension = dirEnt.name;
  result.labelColor = '#002cffd6';

  if (dirEnt.isDirectory()) {
    result.type = 'document';
    result.color = '#ffc10799';
  } else if (dirEnt.name.includes('.')) {
    result.type = getType(dirEnt.name);
  }

  return result;
};

export const Files: React.FC<Props> = ({ directory = '/', openFileHandlers }) => {
  const [state, setState] = useState([] as any[]);
  const [index, setIndex] = useState(0);
  const [error, setError] = useState(null as (Error | null));

  const adjustDirectory = useCallback((directory: string) => {
    const init_state = getNav(directory).map((tab: string) => ({ tab, files: [] }));
    setState(init_state);
    setIndex(init_state.length - 1);

    updateTabFiles(init_state.length - 1, directory);
  }, []);

  useEffect(() => adjustDirectory(directory), [directory, adjustDirectory]);

  const updateTabFiles = async (index: number, directory: string) => {
    const file_names =
      (await fs.promises
        .readdir(directory, { withFileTypes: true })
        .then(data => data.map(d => getFileInfo(directory, d)))
        .catch(setError)) || [];

    setState(prev_state => {
      const new_state = [...prev_state];
      new_state[index].files = file_names;
      return new_state;
    });
  };

  const navigate = (index: number) => {
    const array = state.slice(0, index + 1).map(({ tab }) => tab);
    let dir: string;
    if (array[0] === path.sep) {
      dir = '/' + array.slice(1).join('/');
    } else {
      dir = array.join('/');
    }

    updateTabFiles(index, dir);
    setIndex(index);
  };

  const handleFileIconClick = (info: FileIconProps) => {
    const { type, parentPath, filename } = info;

    if (type && type === 'document') {
      return adjustDirectory(path.join(parentPath, filename));
    }

    if (!openFileHandlers) return;

    openFileHandlers.forEach(({ matcher, processor }) => {
      if (matcher(info.filename)) {
        processor(path.join(info.parentPath, info.filename));
      }
    });
  };

  const renderFileIcon = ({ key, ...rest }: FileIconProps, index: number) => {
    return (
      <Box onClick={() => handleFileIconClick(rest)} key={`${index}-${key}`}>
        <FileIcon {...rest} size={60} />
        <Text size="xsmall">{rest.filename && rest.filename.length > 7 && rest.filename}</Text>
      </Box>
    );
  };

  return (
    <Grommet
      theme={{
        tab: {
          border: { color: '#ec8093' },
          color: '#ec8093'
        }
      }}>
      {error && (
        <Layer
          onEsc={() => setError(null)}
          onClickOutside={() => setError(null)}
          position="top"
          modal={true}
          margin={{ vertical: 'medium', horizontal: 'small' }}
          responsive={true}
          plain>
          <Box
            direction="row"
            gap="xsmall"
            round="medium"
            elevation="medium"
            pad={{ vertical: 'xsmall', horizontal: 'small' }}
            background="status-warning">
            <Box align="center" direction="row" gap="xsmall">
              <StatusWarning color="light-2" />
              <Text color="light-2">{error.message}</Text>
              <Button icon={<FormClose color="light-2" />} plain onClick={() => setError(null)} />
            </Box>
          </Box>
        </Layer>
      )}

      <Tabs justify="start" onActive={navigate} activeIndex={index}>
        {state.map(({ tab, files }) => (
          <Tab key={tab} title={tab}>
            <Grid columns="xsmall" gap="small">
              {files.map((f: FileIconProps, index: number) => {
                return renderFileIcon(f, index);
              })}
            </Grid>
          </Tab>
        ))}
      </Tabs>
    </Grommet>
  );
};
