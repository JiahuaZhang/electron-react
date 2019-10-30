import React, { useState } from 'react';
import { Button, Row, Col } from 'antd';

import { Files } from '../Components/Files/Files';
import { fileHandler } from '../model/fileHandler';

interface Props {
  fileHandlers?: fileHandler[];
}

export const FolderPage: React.FC<Props> = ({ fileHandlers }) => {
  const [state, setState] = useState([<Files fileHandlers={fileHandlers} />]);

  const newFolderPanel = () => setState(prev => prev.concat(<Files fileHandlers={fileHandlers} />));

  const removePanel = (panel: JSX.Element) => setState(prevState => prevState.filter(s => s !== panel));

  return (
    <Row>
      <Button type="primary" icon="plus" onClick={newFolderPanel} style={{ margin: '.75rem' }}>
        New Foldr Panel
      </Button>
      {state.map((s, index) => (
        <Col key={index}>
          <div style={{ background: '#75ff8133', display: 'grid', justifyItems: 'end', padding: '.5rem 1rem' }}>
            <Button onClick={() => removePanel(s)} icon="close" type="danger" shape="circle" />
          </div>
          {s}
        </Col>
      ))}
    </Row>
  );
};
