import React, { useContext } from 'react';
import { Button } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import { NotesContext } from './NotesHook';
import { ConfigContext } from '../../Configuration/configContext';
import { default_english_fonts } from '../../model/epubConfig';

interface Props {}

export const NotesPanel = (props: Props) => {
  const { fontSize, chinese_font, english_font } = React.useContext(ConfigContext);
  const { state } = useContext(NotesContext);

  const fontFamily = english_font
    ? `${english_font}, ${chinese_font}`
    : default_english_fonts.concat(chinese_font || '').join(',');

  return (
    <div style={{ display: 'grid' }}>
      <Button style={{ justifySelf: 'center', marginTop: '.5rem' }}>
        <CopyOutlined />
        copy all
      </Button>
      <ul
        style={{
          listStyle: 'none',
          padding: '.4rem',
          fontFamily,
          fontSize: fontSize && fontSize * 0.8
        }}>
        {state.map(({ text, backgroundColor }) => (
          <li style={{ backgroundColor, margin: '.4rem auto' }}>{text}</li>
        ))}
      </ul>
    </div>
  );
};
