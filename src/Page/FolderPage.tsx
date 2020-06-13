import React, { useState, useRef } from 'react';
import { Button, Row, Col } from 'antd';
import { CloseOutlined, PlusOutlined } from '@ant-design/icons';

import { Files } from '../Components/Files/Files';
import { fileHandler } from '../extension/ePub/model/epub';

interface Props {
  fileHandlers?: fileHandler[];
}

export const FolderPage: React.FC<Props> = ({ fileHandlers }) => {
  const [state, setState] = useState([
    {
      key: -1,
      content: <Files directory="/Users/jzhang016/Documents/Books" fileHandlers={fileHandlers} />,
    },
  ]);
  const key = useRef(0);

  const newFolderPanel = () =>
    setState((prev) =>
      prev.concat({
        key: key.current++,
        content: <Files fileHandlers={fileHandlers} />,
      })
    );

  const removePanel = (key: number) =>
    setState((prevState) => prevState.filter((s) => s.key !== key));

  return (
    <Row>
      {state.map(({ key, content }) => (
        <Col key={key}>
          <div
            style={{
              background: '#75ff8133',
              display: 'grid',
              justifyItems: 'end',
              padding: '.5rem 1rem',
            }}>
            <Button
              onClick={() => removePanel(key)}
              icon={<CloseOutlined />}
              danger
              shape="circle"
            />
          </div>
          {content}
        </Col>
      ))}
      <Button
        type="primary"
        icon={<PlusOutlined />}
        onClick={newFolderPanel}
        style={{ margin: '.75rem' }}>
        New Foldr Panel
      </Button>
    </Row>
  );
};
