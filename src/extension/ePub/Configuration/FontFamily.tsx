import React, { useState } from 'react';
import { Tabs, Radio } from 'antd';

import './FontFamily.sass';

const { TabPane } = Tabs;

interface Props {}

export const FontFamily: React.FC<Props> = () => {
  const [english_font, setEnglish_font] = useState('');

  const default_english_fonts = ['Arial', 'Georgia', 'Helvetica', 'Tahoma'];

  return (
    <Tabs>
      <TabPane tab="Font" key="english">
        <Radio.Group buttonStyle="solid" value={english_font}>
          {default_english_fonts.map(font => (
            <Radio.Button
              key={`english-${font}`}
              value={font}
              onClick={event => {
                event.persist();
                const { value } = event.target as HTMLInputElement;
                if (value === english_font) {
                  setEnglish_font('');
                } else {
                  setEnglish_font(value);
                }
              }}
              style={{
                display: 'block',
                margin: '5px'
              }}>
              {font}
            </Radio.Button>
          ))}
        </Radio.Group>
        <p style={{ fontFamily: english_font }}>The quick brown fox jumped over the lazy dog</p>
      </TabPane>
      <TabPane tab="字体" key="chinese">
        <ul>
          <li>font1</li>
          <li>font2</li>
          <li>font3</li>
          <li>font4</li>
          <li>font5</li>
        </ul>
      </TabPane>
    </Tabs>
  );
};
