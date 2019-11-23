import React, { useState } from 'react';

import './ConfigPanel.sass';

interface Props {}

export const ConfigPanel: React.FC<Props> = () => {
  const [fontSize, setFontSize] = useState(16);

  return (
    <div className="fontSize">
      <div
        style={{
          color: fontSize === 8 ? '#80808033' : '#00000080',
          fontSize: fontSize > 8 ? fontSize - 2 : 8
        }}
        onClick={() => setFontSize(size => (size > 8 ? size - 2 : size))}>
        a
      </div>
      <div style={{ fontSize }}>
        {fontSize}
        <span style={{ fontSize: 13 }}>px</span>
      </div>
      <div
        style={{
          fontSize: fontSize < 72 ? fontSize + 2 : 72,
          color: fontSize === 72 ? '#80808033' : '#000000'
        }}
        onClick={() => setFontSize(size => (size < 72 ? size + 2 : size))}>
        A
      </div>
    </div>
  );
};
