import React, { useState } from 'react';
import { Button, Row, Col } from 'antd';

import { Files } from '../Component/Files/Files';
import { FileHandler } from '../model/FileHandler';

interface Props {
  FileHandlers?: FileHandler[];
}

export const FolderPage: React.FC<Props> = ({ FileHandlers }) => {
  const [state, setState] = useState([<Files FileHandlers={FileHandlers} />]);

  const newFolderPanel = () => setState(prev => prev.concat(<Files FileHandlers={FileHandlers} />));

  const removePanel = (panel: JSX.Element) => setState(prevState => prevState.filter(s => s !== panel));

  return (
    <div>
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
    </div>
  );
};
