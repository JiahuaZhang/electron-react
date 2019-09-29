import React, { useState, useEffect } from 'react';
import { Tab, Tabs, Grommet, Grid, Box } from 'grommet';
import FileIcon from 'react-file-icon';
import path from 'path';

import extensions from './extensions';
import { FileIconProps } from '../model/FileIcon';

interface Props {
  directory?: string;
}

const fs = window.require('fs');
const getNav = (directory: string): string[] => {
  if (directory.startsWith(path.sep)) {
    directory = directory.replace(path.sep, '');
  }

  return directory ? [path.sep, ...directory.split(path.sep)] : [path.sep];
};

const getFileInfo = (location: string, filename: string): Promise<FileIconProps> => {
  const promise = new Promise<FileIconProps>((resolve, reject) => {
    const directory = path.join(location, filename);
    let result: FileIconProps = {};

    fs.stat(directory, (err, stat) => {
      if (err) {
        reject(err);
      }

      result.key = directory;
      result.parentPath = location;
      result.filename = filename;

      result.extension = filename;
      result.labelColor = '#002cffd6';

      if (stat.isDirectory()) {
        result.type = 'document';
        result.color = '#ffc10799';
      } else if (filename.includes('.')) {
        const extension = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();

        for (const type in extensions) {
          if (extension in extensions[type]) {
            result.type = type;
            break;
          }
        }
      }

      resolve(result);
    });
  });

  return promise;
};

export const Files: React.FC<Props> = ({ directory = '/' }) => {
  const [state, setState] = useState([] as any[]);
  const [index, setIndex] = useState(0);

  const adjustDirectory = (directory: string) => {
    const init_state = getNav(directory).map((tab: string) => ({ tab, files: [] }));
    setState(init_state);
    setIndex(init_state.length - 1);

    fs.readdir(directory, (err: any, files: string[]) => {
      if (err) {
        throw err;
      }

      Promise.all(files.map((f: string) => getFileInfo(directory, f))).then((data: FileIconProps[]) => {
        setState(prev_state => {
          const new_state = [...prev_state];
          new_state[new_state.length - 1].files = data;
          return new_state;
        });
      });
    });
  };

  useEffect(() => adjustDirectory(directory), [directory]);

  const navigate = (index: number) => {
    const array = state.slice(0, index + 1).map(({ tab }) => tab);
    let dir: string;
    if (array[0] === path.sep) {
      dir = '/' + array.slice(1).join('/');
    } else {
      dir = array.join('/');
    }

    fs.readdir(dir, async (err: any, files: string[]) => {
      if (err) {
        throw err;
      }

      Promise.all(files.map((f: string) => getFileInfo(dir, f))).then((data: FileIconProps[]) => {
        setState(prev_state => {
          const new_state = [...prev_state];
          new_state[index].files = data;
          return new_state;
        });
      });
    });

    setIndex(index);
  };

  const handleFileIconClick = (info: FileIconProps) => {
    const { type, parentPath, filename } = info;

    if (type && type === 'document') {
      adjustDirectory(path.join(parentPath as string, filename as string));
    }
  };

  const renderFileIcon = ({ key, ...rest }: FileIconProps, index: number) => {
    return (
      <Box onClick={() => handleFileIconClick(rest)} key={`${index}-${key}`}>
        <FileIcon {...rest} size={60} />
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
      <Tabs justify="start" onActive={navigate} activeIndex={index}>
        {state.map(({ tab, files }) => (
          <Tab key={tab} title={tab}>
            <Grid columns="xsmall" gap="xsmall">
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
