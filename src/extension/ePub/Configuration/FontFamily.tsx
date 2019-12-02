import React, { useState } from 'react';
import { Tabs } from 'antd';

const { TabPane } = Tabs;

interface Props {}

export const FontFamily: React.FC<Props> = () => {
  const [english_font, setEnglish_font] = useState('');

  const default_english_fonts = ['Arial', 'Georgia', 'Helvetica', 'Tahoma'];

  return (
    <Tabs>
      <TabPane tab="English" key="english">
        {default_english_fonts.map(font => (
          <div key={`english-${font}`}>
            <label>
              <input
                type="radio"
                name="english"
                value={font}
                onClick={event => {
                  const { value } = event.target as HTMLInputElement;
                  if (value === english_font) {
                    (event.target as HTMLInputElement).checked = false;
                    setEnglish_font('');
                  } else {
                    setEnglish_font(value);
                  }
                }}
              />
              {font}
            </label>
            <br />
          </div>
        ))}
        <p style={{ fontFamily: english_font }}>The quick brown fox jumped over the lazy dog</p>
      </TabPane>
      <TabPane tab="中文" key="chinese">
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
