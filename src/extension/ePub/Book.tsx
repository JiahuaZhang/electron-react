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
  const { page } = state;

  const fontFamily = english_font
    ? `${english_font}, ${chinese_font}`
    : default_english_fonts.concat(chinese_font || '').join(',');

  useEffect(() => {
    if (!page) {
      return dispatch({ type: BookDataType.update_page, payload: sections[0].flow.href });
    }

    if (!sections.find(({ flow: { href } }) => page.includes(href))?.section) {
      setSections(prev =>
        prev.map(section => {
          if (page.includes(section.flow.href)) {
            const newSection = { ...section };
            newSection.section = <Section section={newSection.flow} />;
            return newSection;
          }
          return section;
        })
      );
    }
  }, [page, sections]);

  return (
    <div
      style={{ fontSize: fontSize, fontFamily }}
      className="book"
      tabIndex={0}
      onKeyDown={event => {
        const index = book.flow.findIndex(({ href }) => page.includes(href));
        if (event.key === 'ArrowRight' && index + 1 < sections.length) {
          dispatch({ type: BookDataType.update_page, payload: sections[index + 1].flow.href });
        } else if (event.key === 'ArrowLeft' && index - 1 >= 0) {
          dispatch({ type: BookDataType.update_page, payload: sections[index - 1].flow.href });
        }
      }}>
      {sections.find(({ flow: { href } }) => page.includes(href))?.section}
    </div>
  );
};
