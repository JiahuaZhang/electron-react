import React, { useState, useRef } from 'react';
import { Button, Row, Col } from 'antd';

import { Files } from '../Components/Files/Files';
import { fileHandler } from '../model/fileHandler';

interface Props {
  fileHandlers?: fileHandler[];
}

export const FolderPage: React.FC<Props> = ({ fileHandlers }) => {
  const [state, setState] = useState([{ key: -1, content: <Files fileHandlers={fileHandlers} /> }]);
  const key = useRef(0);

  const newFolderPanel = () =>
    setState(prev =>
      prev.concat({
        key: key.current++,
        content: <Files fileHandlers={fileHandlers} />
      })
    );

  const removePanel = (key: number) => setState(prevState => prevState.filter(s => s.key !== key));

  return (
    <Row>
      <Button type="primary" icon="plus" onClick={newFolderPanel} style={{ margin: '.75rem' }}>
        New Foldr Panel
      </Button>
      {state.map(({ key, content }) => (
        <Col key={key}>
          <div
            style={{
              background: '#75ff8133',
              display: 'grid',
              justifyItems: 'end',
              padding: '.5rem 1rem'
            }}>
            <Button onClick={() => removePanel(key)} icon="close" type="danger" shape="circle" />
          </div>
          {content}
        </Col>
      ))}
    </Row>
  );
};
