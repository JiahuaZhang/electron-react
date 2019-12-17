import React, { useEffect, useState } from 'react';

import './Book.sass';
import { Section } from './Section';
import { BookContext } from './BookContext';
import { manifest } from './book.type';
import { ConfigContext } from './Configuration/configContext';
import { useBookData, BookDataType } from './Data/bookDataHook';
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
  const bookData = useBookData(book);
  const { state, dispatch } = bookData;
  const { index } = state;

  const fontFamily = english_font
    ? `${english_font}, ${chinese_font}`
    : default_english_fonts.concat(chinese_font || '').join(',');

  useEffect(() => {
    if (!sections[index].section) {
      setSections(prev => {
        const new_state = [...prev];
        new_state[index].section = <Section section={new_state[index].flow} />;
        return new_state;
      });
    }
  }, [index, sections]);

  return (
    <BookDataContext.Provider value={bookData}>
      <div
        style={{ fontSize: fontSize, fontFamily }}
        className="book"
        tabIndex={0}
        onKeyDown={event => {
          if (event.key === 'ArrowRight' && index + 1 < sections.length) {
            dispatch({ type: BookDataType.update_page, payload: index + 1 });
          } else if (event.key === 'ArrowLeft' && index - 1 >= 0) {
            dispatch({ type: BookDataType.update_page, payload: index - 1 });
          }
        }}>
        {sections[index].section}
      </div>
    </BookDataContext.Provider>
  );
};
