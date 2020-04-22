import { useReducer, useEffect } from 'react';

import { BookData, defaultBookData } from '../model/bookData';
import { EPub, manifest } from '../model/book.type';
import { NoteSelection } from '../utils/note/note';

const { ipcRenderer } = window.require('electron');

export enum BookDataType {
  load,
  init_with_default,
  update_page,
  update_notes,
}

interface PagePayload {
  page: string;
  pageIndex: number;
}

interface NotePayload {
  id: string;
  notes: NoteSelection[];
}

export interface BookDataAction {
  type: BookDataType;
  payload?: BookData | PagePayload | NotePayload;
}

export interface BookDataHook {
  state: BookData;
  dispatch: React.Dispatch<BookDataAction>;
}

const reducer = (state: BookData, { type, payload }: BookDataAction) => {
  const new_state = { ...state };
  switch (type) {
    case BookDataType.load:
      return payload as BookData;
    case BookDataType.init_with_default:
      return defaultBookData;
    case BookDataType.update_page:
      const { page, pageIndex } = payload as PagePayload;
      new_state.page = page;
      new_state.pageIndex = pageIndex;
      return new_state;
    case BookDataType.update_notes:
      const { id, notes } = payload as NotePayload;
      new_state.sections = new_state.sections.filter((section) => section.id !== id);
      new_state.sections = [...new_state.sections, { id, notes }];
      return new_state;
    default:
      return state;
  }
};

export const useBookData = (book: EPub): BookDataHook => {
  const [state, dispatch] = useReducer(reducer, defaultBookData);
  const { title } = book.metadata;

  useEffect(() => {
    ipcRenderer.send('add reference', title);

    const assets: { [key: string]: manifest } = {};
    Object.values(book.manifest).forEach((m) => {
      if (m['media-type'].match(/(css|image|font)/i)) {
        const fileName = m.href.split('/').pop() || '';
        assets[fileName] = m;
      }
    });

    Object.entries(assets).map(([fileName, asset]) =>
      book.getFile(asset.id, (error: Error, data: Buffer, mimeType: string) => {
        if (error) {
          console.error(`failed to load ${asset.title}`);
          console.error(error);
          return;
        }
        ipcRenderer.send('store asset', title, fileName, data);
      })
    );

    return () => ipcRenderer.send('remove reference', title);
  }, [book, title]);

  useEffect(() => {
    ipcRenderer.send('load book data', title);
    ipcRenderer.once(`load book ${title} data`, (event, data) => {
      if (!data) {
        dispatch({ type: BookDataType.init_with_default });
      } else {
        data = new TextDecoder('utf-8').decode(data);
        dispatch({ type: BookDataType.load, payload: JSON.parse(data) });
      }
    });
  }, [dispatch, title]);

  useEffect(() => {
    return () => ipcRenderer.send('save book data', title, JSON.stringify(state, null, 2));
  }, [state, title]);

  return { state, dispatch };
};
