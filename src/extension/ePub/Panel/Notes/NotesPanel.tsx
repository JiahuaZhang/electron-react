import React, { useContext, useRef } from 'react';
import { Button, notification } from 'antd';
import { CopyOutlined } from '@ant-design/icons';

import { NotesContext } from './NotesHook';
import { ConfigContext } from '../../Configuration/configContext';
import { default_english_fonts } from '../../model/epubConfig';

interface Props {}

export const NotesPanel = (props: Props) => {
  const { fontSize, chinese_font, english_font } = React.useContext(ConfigContext);
  const { state } = useContext(NotesContext);
  const ref = useRef<HTMLDivElement>(null);

  const fontFamily = [english_font, chinese_font]
    .filter(Boolean)
    .concat(default_english_fonts)
    .join(',');

  return (
    <div style={{ display: 'grid' }}>
      <Button
        style={{ justifySelf: 'center', marginTop: '.5rem' }}
        onClick={() => {
          const range = document.createRange();
          range.selectNode(ref.current as Node);
          const selection = document.getSelection();
          selection?.addRange(range);
          const status = document.execCommand('copy');
          if (status) {
            notification.success({ message: 'copied!', duration: 1.5 });
          } else {
            notification.error({ message: 'failed to copy', duration: 1.5 });
          }
          navigator.clipboard.readText().then(console.log);
          selection?.removeAllRanges();
        }}>
        <CopyOutlined />
        copy all
      </Button>
      <div ref={ref} style={{ fontFamily, fontSize: fontSize && fontSize * 0.8 }}>
        {state.map(({ text, backgroundColor }, index) => (
          <p key={`${index}-${text}`} style={{ backgroundColor, margin: '.4rem auto' }}>
            {text}
          </p>
        ))}
      </div>
    </div>
  );
};
