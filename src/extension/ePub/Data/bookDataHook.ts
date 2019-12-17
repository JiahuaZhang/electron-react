import { useReducer, useEffect } from 'react';

import { BookData, defaultBookData } from '../../../model/bookData';
import { EPub, manifest } from '../book.type';

const { ipcRenderer } = window.require('electron');

export enum BookDataType {
  load,
  init_with_default,
  update_page
}

export interface BookDataAction {
  type: BookDataType;
  payload?: number | string | BookData;
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
      new_state.index = payload as number;
      return new_state;

    default:
      return state;
  }
};

export const useBookData = (book: EPub): BookDataHook => {
  const [state, dispatch] = useReducer(reducer, defaultBookData);

  useEffect(() => {
    ipcRenderer.send('add reference', book.metadata.title);

    const assets: { [key: string]: manifest } = {};
    Object.values(book.manifest).forEach(m => {
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
        ipcRenderer.send('store asset', book.metadata.title, fileName, data);
      })
    );

    return () => ipcRenderer.send('remove reference', book.metadata.title);
  }, [book]);

  useEffect(() => {
    ipcRenderer.send('load book data', book.metadata.title);
    ipcRenderer.once(`load book ${book.metadata.title} data`, (event, data) => {
      data = JSON.parse(data);
      if (!data) {
        dispatch({ type: BookDataType.init_with_default });
      } else {
        dispatch({ type: BookDataType.load, payload: data });
      }
    });
  }, [dispatch]);

  useEffect(() => {
    return () =>
      ipcRenderer.send('save book data', book.metadata.title, JSON.stringify(state, null, 2));
  }, [state]);

  return { state, dispatch };
};
