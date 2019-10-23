import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, Row, Col, Typography, message } from 'antd';
import FileIcon from 'react-file-icon';
import path from 'path';

import { getType } from './extensions';
import { FileIconProps } from '../../model/FileIcon';
import { FileHandler } from '../../model/FileHandler';

const { TabPane } = Tabs;
const { Text } = Typography;

interface Props {
  directory?: string;
  fileHandlers?: FileHandler[];
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

export const Files: React.FC<Props> = ({ directory = '/', fileHandlers }) => {
  const [state, setState] = useState([] as any[]);
  const [activeKey, setActiveKey] = useState('');

  const adjustDirectory = useCallback((directory: string) => {
    const init_state = getNav(directory).map((tab: string) => ({ tab, files: [] }));
    setState(init_state);
    const index = init_state.length - 1;
    setActiveKey(`${init_state[index].tab}-${index}`);

    updateTabFiles(init_state.length - 1, directory);
  }, []);

  useEffect(() => adjustDirectory(directory), [directory, adjustDirectory]);

  const updateTabFiles = async (index: number, directory: string) => {
    const file_names = await fs.promises
      .readdir(directory, { withFileTypes: true })
      .then(data => data.map(d => getFileInfo(directory, d)))
      .catch((err: Error) => {
        message.error(err.message);
        return [];
      });

    setState(prev_state => {
      const new_state = [...prev_state];
      new_state[index].files = file_names;
      return new_state;
    });
  };

  const navigate = (activeKey: string) => {
    const index = Number(activeKey.split('-')[1]);
    const array = state.slice(0, index + 1).map(({ tab }) => tab);
    let dir: string;
    if (array[0] === path.sep) {
      dir = '/' + array.slice(1).join('/');
    } else {
      dir = array.join('/');
    }

    updateTabFiles(index, dir);
    setActiveKey(activeKey);
  };

  const handleFileIconClick = (info: FileIconProps) => {
    const { type, parentPath, filename } = info;

    if (type && type === 'document') {
      return adjustDirectory(path.join(parentPath, filename));
    }

    if (!fileHandlers) return;

    fileHandlers.forEach(({ matcher, processor }) => {
      if (matcher(info.filename)) {
        processor(path.join(info.parentPath, info.filename));
      }
    });
  };

  const renderFileIcon = ({ key, ...rest }: FileIconProps, index: number) => {
    return (
      <Col
        key={`${index}-${key}`}
        onClick={() => handleFileIconClick(rest)}
        xs={24}
        sm={12}
        md={8}
        lg={6}
        xl={4}
        style={{ cursor: 'pointer' }}>
        <FileIcon {...rest} size={65} />
        <br />
        {rest.filename && rest.filename.length > 7 && <Text>{rest.filename}</Text>}
      </Col>
    );
  };

  return (
    <Tabs onChange={navigate} activeKey={activeKey}>
      {state.map(({ tab, files }, index) => (
        <TabPane key={`${tab}-${index}`} tab={tab}>
          <Row key={index} type="flex" justify="space-between" gutter={[{ xs: 8, sm: 16, md: 24, lg: 32 }, 20]}>
            {files.map((f: FileIconProps, index: number) => renderFileIcon(f, index))}
          </Row>
        </TabPane>
      ))}
    </Tabs>
  );
};
