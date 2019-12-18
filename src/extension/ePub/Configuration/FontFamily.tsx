import React, { useState, useContext, useEffect } from 'react';
import { Tabs, Radio } from 'antd';

import './FontFamily.sass';
import { ConfigContext } from './configContext';
import { ConfigType } from './configHook';

const { TabPane } = Tabs;

interface Props {}

export const FontFamily: React.FC<Props> = () => {
  const { setting = {}, dispatch, english_font, chinese_font } = useContext(ConfigContext);
  const [activeKey, setActiveKey] = useState('english');

  useEffect(() => {
    setActiveKey(setting.last_focus_font_type || 'english');
  }, [setting]);

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
    <Tabs
      activeKey={activeKey}
      onTabClick={(fontKey: string) => {
        dispatch({ type: ConfigType.update_last_focus_font_type, payload: fontKey });
        setActiveKey(fontKey);
      }}>
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
                  dispatch({ type: ConfigType.update_english_font_family, payload: '' });
                } else {
                  dispatch({ type: ConfigType.update_english_font_family, payload: value });
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
                  dispatch({ type: ConfigType.update_chinese_font_family, payload: '' });
                } else {
                  dispatch({ type: ConfigType.update_chinese_font_family, payload: value });
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
