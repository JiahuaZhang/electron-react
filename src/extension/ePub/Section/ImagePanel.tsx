import React, { RefObject, Dispatch, SetStateAction } from 'react';
import { Affix, Checkbox } from 'antd';
import { ImageSelection } from '../utils/note/imageSelection';
import { NoteSelection, compareNote } from '../utils/note/note';

interface Props {
  panelPosition: { top: number; left: number };
  showImagePanel: boolean;
  imagePanelRef: RefObject<HTMLDivElement>;
  recentImageNote: ImageSelection;
  notes: NoteSelection[];
  setNotes: Dispatch<SetStateAction<NoteSelection[]>>;
}

export const ImagePanel = ({
  panelPosition,
  showImagePanel,
  imagePanelRef,
  recentImageNote,
  notes,
  setNotes,
}: Props) => {
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
              setNotes((notes) => [...notes, recentImageNote]);
            } else {
              setNotes(notes.filter((note) => compareNote(note, recentImageNote) !== 0));
            }
          }}
          style={{ background: 'white', padding: '.5rem' }}>
          image
        </Checkbox>
      </div>
    </Affix>
  );
};
