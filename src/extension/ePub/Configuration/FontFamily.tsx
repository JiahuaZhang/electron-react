import React, { useState } from 'react';
import { Tabs, Radio } from 'antd';

import './FontFamily.sass';

const { TabPane } = Tabs;

interface Props {}

export const FontFamily: React.FC<Props> = () => {
  const [english_font, setEnglish_font] = useState('');
  const [chinese_font, setChinese_font] = useState('');

  const default_english_fonts = ['Arial', 'Georgia', 'Helvetica', 'Tahoma'];
  const default_chinese_fonts = [
    '方正黑体',
    '方正书宋',
    '方正仿宋',
    '方正楷体',
    '思源黑体',
    '思源宋体'
  ];

  return (
    <Tabs defaultActiveKey="chinese">
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
        <Radio.Group buttonStyle="solid" value={chinese_font}>
          {default_chinese_fonts.map(font => (
            <Radio.Button
              key={`chinese-${font}`}
              value={font}
              onClick={event => {
                event.persist();
                const { value } = event.target as HTMLInputElement;
                if (value === chinese_font) {
                  setChinese_font('');
                } else {
                  setChinese_font(value);
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
        <p style={{ fontFamily: chinese_font }}>
          天地玄黄，宇宙洪荒。
          <br />
          日月盈昃，辰宿列张。
          <br />
          寒来暑往，秋收冬藏。
          <br />
          闰余成岁，律吕调阳。
        </p>
      </TabPane>
    </Tabs>
  );
};
