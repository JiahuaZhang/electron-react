import React, { RefObject, useContext } from 'react';
import { Affix, Checkbox } from 'antd';

import { ImageSelection } from '../utils/note/imageSelection';
import { NoteSelection, compareNote } from '../utils/note/note';
import { BookDataContext } from '../Data/bookDataContext';
import { BookContext } from '../bookContext';
import { BookDataType } from '../Data/bookDataHook';

interface Props {
  panelPosition: { top: number; left: number };
  showImagePanel: boolean;
  imagePanelRef: RefObject<HTMLDivElement>;
  recentImageNote: ImageSelection;
  notes: NoteSelection[];
}

export const ImagePanel = ({
  panelPosition,
  showImagePanel,
  imagePanelRef,
  recentImageNote,
  notes,
}: Props) => {
  const book = useContext(BookContext);
  const { dispatch, state } = useContext(BookDataContext);

  const section = book.flow[state.pageIndex];

  return (
    <Affix
      style={{
        position: 'absolute',
        top: panelPosition.top,
        left: panelPosition.left,
        visibility: showImagePanel ? 'visible' : 'hidden',
      }}>
      <div ref={imagePanelRef}>
        <Checkbox
          checked={
            recentImageNote.kind &&
            notes?.find((note) => compareNote(note, recentImageNote) === 0) !== undefined
          }
          onChange={(event) => {
            if (event.target.checked) {
              dispatch({
                type: BookDataType.update_notes,
                payload: { id: section.id, notes: [...notes, recentImageNote] },
              });
            } else {
              dispatch({
                type: BookDataType.update_notes,
                payload: {
                  id: section.id,
                  notes: notes.filter((note) => compareNote(note, recentImageNote) !== 0),
                },
              });
            }
          }}
          style={{ background: 'white', padding: '.5rem' }}>
          image
        </Checkbox>
      </div>
    </Affix>
  );
};
