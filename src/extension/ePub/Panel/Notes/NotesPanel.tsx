import React, { useContext, useEffect, useState } from 'react';
import { Button, notification, Checkbox } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import { ConfigContext } from '../../Configuration/configContext';
import { default_english_fonts } from '../../model/epubConfig';
import { BookDataContext } from '../../Data/bookDataContext';
import { BookDataType } from '../../Data/bookDataHook';
import { NoteContext, SideNote } from './NotesHook';
import { NoteSelection, note2key } from '../../utils/note/note';

const { clipboard } = window.require('electron');

interface Props {}

interface Status {
  [key: string]: boolean;
}

export const NotesPanel = (props: Props) => {
  const bookData = useContext(BookDataContext);
  const { fontSize, chinese_font, english_font } = useContext(ConfigContext);
  const [selectMode, setSelectMode] = useState({
    all: true,
    indeterminate: false,
  });
  const { section, sideNotes } = useContext(NoteContext);
  const [noteStatus, setNoteStatus] = useState<Status>({});

  const fontFamily = [english_font, chinese_font]
    .filter(Boolean)
    .concat(default_english_fonts)
    .join(',');

  useEffect(() => {
    const newStatus: Status = {};

    let needUpdate = false;
    for (const note of sideNotes) {
      const key = note2key(note as NoteSelection);
      if (key in noteStatus) {
        newStatus[key] = noteStatus[key];
      } else {
        needUpdate = true;
        newStatus[key] = true;
      }
    }

    if (needUpdate) setNoteStatus(newStatus);
  }, [noteStatus, sideNotes]);

  useEffect(() => {
    let mode = { all: false, indeterminate: false };

    const status = new Set<boolean>();
    Object.values(noteStatus).forEach((val) => status.add(val));

    if (status.size === 2) {
      mode.indeterminate = true;
    } else if (status.has(true)) {
      mode.all = true;
    }

    setSelectMode(mode);
  }, [noteStatus]);

  const renderCheckbox = (note: SideNote) => {
    const onChange = (event: CheckboxChangeEvent) =>
      setNoteStatus((status) => {
        const new_status = { ...status };
        const key = note2key(note as NoteSelection);
        new_status[key] = !status[key];
        return new_status;
      });

    switch (note.kind) {
      case 'image':
        return (
          <Checkbox
            key={note2key(note as NoteSelection)}
            onChange={onChange}
            style={{
              display: 'grid',
              gridTemplateColumns: 'max-content 1fr',
              alignItems: 'center',
              margin: 0,
              padding: '.5rem 0',
              borderTop: '1px solid #ffc107',
            }}
            checked={
              selectMode.indeterminate
                ? noteStatus[note2key(note as NoteSelection)]
                : selectMode.all
            }>
            <img src={note.src} alt="" style={{ width: '100%' }} />
          </Checkbox>
        );
      case 'text':
        return (
          <Checkbox
            key={note2key(note as NoteSelection)}
            onChange={onChange}
            checked={
              selectMode.indeterminate
                ? noteStatus[note2key(note as NoteSelection)]
                : selectMode.all
            }
            style={{
              display: 'grid',
              gridTemplateColumns: 'max-content 1fr',
              alignItems: 'center',
              margin: 0,
              padding: '.5rem 0',
              borderTop: '1px solid #ffc107',
            }}>
            <span
              style={{ whiteSpace: 'pre-wrap', backgroundColor: note.color }}
              dangerouslySetInnerHTML={{ __html: note.text as string }}
            />
          </Checkbox>
        );
      default:
        return <></>;
    }
  };

  const toggleSelectMode = () =>
    setSelectMode(({ all, indeterminate }) => {
      if (indeterminate) {
        setNoteStatus((status) => {
          const new_status = { ...status };
          for (const key in new_status) {
            new_status[key] = true;
          }
          return new_status;
        });
        return { all: true, indeterminate: false };
      } else {
        setNoteStatus((status) => {
          const new_status = { ...status };
          for (const key in new_status) {
            new_status[key] = !all;
          }
          return new_status;
        });
        return { all: !all, indeterminate: false };
      }
    });

  const copyNotes = () => {
    if (!selectMode.indeterminate && !selectMode.all) {
      return notification.error({ message: 'nothing selected to copy', duration: 1.5 });
    }

    const paragraph = (note: SideNote) => {
      const p = document.createElement('p');
      p.innerHTML = note.text?.replace(/\n/g, '<br/>') as string;
      p.style.whiteSpace = 'pre-wrap';
      p.style.backgroundColor = note.color as string;
      return p;
    };

    const image = (note: SideNote) => {
      const i = document.createElement('img');
      i.src = note.src as string;
      i.src = getBase64Image(i);
      return i;
    };

    const getBase64Image = (img: HTMLImageElement) => {
      const canvas = document.createElement('canvas');
      [canvas.width, canvas.height] = [img.width, img.height];

      const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
      ctx.drawImage(img, 0, 0);

      return canvas.toDataURL('image/png');
    };

    const div = document.createElement('div');
    for (const s of sideNotes) {
      if (selectMode.indeterminate && !noteStatus[note2key(s as NoteSelection)]) {
        continue;
      }
      div.appendChild(s.kind === 'image' ? image(s) : paragraph(s));
    }

    clipboard.writeHTML(div.outerHTML);
    notification.success({ message: 'copied!', duration: 1.5 });
  };

  return (
    <div style={{ display: 'grid' }}>
      <header
        style={{
          display: 'grid',
          justifyContent: 'end',
          alignItems: 'center',
          gridTemplateColumns: '1fr repeat(2, max-content)',
          margin: '.25rem .5rem',
          gap: '.5rem',
        }}>
        <Checkbox
          onChange={toggleSelectMode}
          indeterminate={selectMode.indeterminate}
          checked={selectMode.all}></Checkbox>
        <Button onClick={copyNotes}>
          <CopyOutlined style={{ color: '#3f51b5' }} />
        </Button>
        <Button
          onClick={() => {
            if (!selectMode.indeterminate && !selectMode.all) {
              return notification.error({ message: 'nothing selected to delete', duration: 1.5 });
            }

            console.log(selectMode);
            if (selectMode.all) {
              bookData.dispatch({
                type: BookDataType.update_notes,
                payload: { id: section.id, notes: [] },
              });
              return;
            }

            const notes = sideNotes.filter(
              (note) => !noteStatus[note2key(note as NoteSelection)]
            ) as NoteSelection[];
            bookData.dispatch({
              type: BookDataType.update_notes,
              payload: { id: section.id, notes },
            });
          }}>
          <DeleteOutlined style={{ color: 'red' }} />
        </Button>
      </header>
      <section style={{ fontFamily, fontSize: fontSize && fontSize * 0.8 }}>
        {sideNotes.map(renderCheckbox)}
      </section>
    </div>
  );
};
