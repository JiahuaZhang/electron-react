import React, { useEffect, useState } from 'react';

import './Book.sass';
import { Section } from './Section';
import { BookContext } from './bookContext';
import { manifest } from './model/book.type';
import { ConfigContext } from './Configuration/configContext';
import { BookDataType } from './Data/bookDataHook';
import { BookDataContext } from './Data/bookDataContext';

interface Props {}

const default_english_fonts = [
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica',
  'Arial',
  'sans-serif',
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Segoe UI Symbol'
];

const initSections = (flows: manifest[]): { flow: manifest; section?: JSX.Element }[] =>
  flows.map(flow => ({ flow }));

export const Book: React.FC<Props> = () => {
  const book = React.useContext(BookContext);
  const { fontSize, chinese_font, english_font } = React.useContext(ConfigContext);
  const [sections, setSections] = useState(initSections(book.flow));
  const bookData = React.useContext(BookDataContext);
  const { state, dispatch } = bookData;
  const { page, pageIndex } = state;

  const fontFamily = english_font
    ? `${english_font}, ${chinese_font}`
    : default_english_fonts.concat(chinese_font || '').join(',');

  useEffect(() => {
    if (!sections[pageIndex]?.section) {
      setSections(prev => {
        const next = [...prev];
        next[pageIndex].section = <Section section={next[pageIndex].flow} />;
        return next;
      });
    } else {
      console.debug(`section pageIndex: ${pageIndex}, page: ${page}`);
    }
  }, [page, pageIndex, sections, dispatch]);

  return (
    <div
      style={{ fontSize, fontFamily }}
      className="book"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowRight' && pageIndex + 1 < sections.length) {
          dispatch({
            type: BookDataType.update_page,
            payload: {
              page: sections[pageIndex + 1].flow.href,
              pageIndex: pageIndex + 1
            }
          });
        } else if (event.key === 'ArrowLeft' && pageIndex - 1 >= 0) {
          dispatch({
            type: BookDataType.update_page,
            payload: {
              page: sections[pageIndex - 1].flow.href,
              pageIndex: pageIndex - 1
            }
          });
        }
      }}>
      {sections[pageIndex]?.section}
    </div>
  );
};
