import React, { Dispatch, SetStateAction, RefObject } from 'react';
import { Affix } from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';

import { TextSelectionWrapper } from '../Section';

interface Props {
  panelPosition: { top: number; left: number };
  showTextPanel: boolean;
  panelRef: RefObject<HTMLDivElement>;
  recentTextNote: TextSelectionWrapper;
  setRecentTextNote: Dispatch<SetStateAction<TextSelectionWrapper>>;
  setshowTextPanel: Dispatch<SetStateAction<boolean>>;
}

const default_highlight_colors = [
  '#ffeb3b',
  '#ff9800',
  '#f72a1b',
  '#a900ff5e',
  '#03a9f466',
  '#15ff1e',
];

export const ColorPanel = ({
  panelPosition,
  showTextPanel,
  panelRef,
  recentTextNote,
  setRecentTextNote,
  setshowTextPanel,
}: Props) => {
  return (
    <Affix
      style={{
        position: 'absolute',
        top: panelPosition.top,
        left: panelPosition.left,
        visibility: showTextPanel ? 'visible' : 'hidden',
      }}>
      <div
        ref={panelRef}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(20px, 1fr))',
          position: 'relative',
          minWidth: 200,
          gap: 5,
          padding: 5,
          border: '1px solid #1890ff5c',
          borderRadius: 7,
          background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
          alignItems: 'center',
        }}>
        {default_highlight_colors.map((color) => (
          <span
            onClick={(event) => {
              setRecentTextNote((note) => ({ ...note, color }));
              setshowTextPanel(false);
              setTimeout(() => document.getSelection()?.removeAllRanges(), 0);
            }}
            key={color}
            style={{
              width: 18,
              height: 18,
              borderRadius: '50%',
              backgroundColor: color,
              display: 'inline-block',
              cursor: 'pointer',
            }}></span>
        ))}
        {recentTextNote.status === 'add' ? (
          <CloseOutlined
            onClick={() => setshowTextPanel(false)}
            style={{ width: 18, cursor: 'pointer' }}
          />
        ) : (
          <DeleteOutlined
            style={{ width: 18, cursor: 'pointer' }}
            onClick={() => {
              setshowTextPanel(false);
              setRecentTextNote((note) => ({ ...note, status: 'delete' }));
            }}
          />
        )}
      </div>
    </Affix>
  );
};
