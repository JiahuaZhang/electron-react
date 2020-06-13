import React, { useContext, useRef, useEffect, useState } from 'react';
import { Button, notification, Checkbox } from 'antd';
import { CopyOutlined, DeleteOutlined } from '@ant-design/icons';
import { CheckboxChangeEvent } from 'antd/lib/checkbox';

import { NotesContext, Notes, note2id } from './NotesHook';
import { ConfigContext } from '../../Configuration/configContext';
import { default_english_fonts } from '../../model/epubConfig';
import { BookContext } from '../../bookContext';
import { BookDataContext } from '../../Data/bookDataContext';
import { BookDataType } from '../../Data/bookDataHook';

const { clipboard } = window.require('electron');

interface Props {}

export const NotesPanel = (props: Props) => {
  const book = useContext(BookContext);
  const bookData = useContext(BookDataContext);
  const { fontSize, chinese_font, english_font } = useContext(ConfigContext);
  const { state } = useContext(NotesContext);
  const ref = useRef<HTMLDivElement>(null);
  const [noteStatus, setNoteStatus] = useState(new Map<string, boolean>());
  const [selectMode, setSelectMode] = useState({
    all: true,
    indeterminate: false,
  });
  const section = book.flow[bookData.state.pageIndex];

  const fontFamily = [english_font, chinese_font]
    .filter(Boolean)
    .concat(default_english_fonts)
    .join(',');

  useEffect(() => {
    let need_update = false;
    const new_note_status = state.map<[string, boolean]>((note) => {
      const id = note2id(note);
      if (!noteStatus.has(id)) {
        need_update = true;
        return [id, true];
      }

      return [id, noteStatus.get(id) as boolean];
    });

    if (need_update) {
      setNoteStatus(new Map(new_note_status));
    }
  }, [state, noteStatus]);

  useEffect(() => {
    let mode = { all: true, indeterminate: false };

    const status = new Set<boolean>();
    noteStatus.forEach((note) => status.add(note));

    if (status.size === 2) {
      mode.indeterminate = true;
    } else if (status.has(false)) {
      mode.all = false;
    }

    setSelectMode(mode);
  }, [noteStatus]);

  const renderCheckbox = (note: Notes, index: number) => {
    const onChange = (event: CheckboxChangeEvent) =>
      setNoteStatus(new Map(noteStatus.set(note2id(note), event.target.checked)));

    switch (note.type) {
      case 'image':
        return (
          <Checkbox
            key={`${index}-${note.src}`}
            onChange={onChange}
            style={{ marginLeft: 0, display: 'block' }}
            checked={selectMode.indeterminate ? noteStatus.get(note2id(note)) : selectMode.all}>
            <img src={note.src} alt="" style={{ width: '100%' }} />;
          </Checkbox>
        );
      case 'text':
        return (
          <Checkbox
            key={`${index}-${note.text}`}
            onChange={onChange}
            checked={selectMode.indeterminate ? noteStatus.get(note2id(note)) : selectMode.all}
            style={{ display: 'block', marginLeft: 0, backgroundColor: note.backgroundColor }}>
            {note.text}
          </Checkbox>
        );
      default:
        return <></>;
    }
  };

  const toggleSelectMode = () =>
    setSelectMode(({ all, indeterminate }) => {
      if (indeterminate) {
        const new_status = state.map<[string, boolean]>((note) => [note2id(note), true]);
        setNoteStatus(new Map(new_status));
        return { all: true, indeterminate: false };
      } else {
        const new_status = state.map<[string, boolean]>((note) => [note2id(note), !all]);
        setNoteStatus(new Map(new_status));
        return { all: !all, indeterminate: false };
      }
    });

  const copyNotes = () => {
    if (!selectMode.indeterminate && !selectMode.all) {
      return notification.error({ message: 'nothing selected to copy', duration: 1.5 });
    }

    const paragraph = (note: Notes) => {
      const p = document.createElement('p');
      p.textContent = note.text as string;
      p.style.backgroundColor = note.backgroundColor as string;
      return p;
    };

    const image = (note: Notes) => {
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
    for (const s of state) {
      if (selectMode.indeterminate && !noteStatus.get(note2id(s))) {
        continue;
      }
      div.appendChild(s.type === 'image' ? image(s) : paragraph(s));
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
            const foundSection = bookData.state.sections.find((value) => value.id === section.id);
            if (!foundSection) {
              return;
            }

            if (selectMode.all) {
              bookData.dispatch({
                type: BookDataType.update_notes,
                payload: { id: section.id, notes: [] },
              });
            }
          }}>
          <DeleteOutlined style={{ color: 'red' }} />
        </Button>
      </header>
      <section ref={ref} style={{ fontFamily, fontSize: fontSize && fontSize * 0.8 }}>
        {state.map(renderCheckbox)}
      </section>
    </div>
  );
};
