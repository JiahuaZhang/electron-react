import React from 'react';

import './Book.sass';
import { Section } from './Section/Section';
import { BookContext } from './bookContext';
import { ConfigContext } from './Configuration/configContext';
import { BookDataType } from './Data/bookDataHook';
import { BookDataContext } from './Data/bookDataContext';
import { default_english_fonts } from './model/epubConfig';

interface Props {}

export const Book: React.FC<Props> = () => {
  const book = React.useContext(BookContext);
  const { fontSize, chinese_font, english_font } = React.useContext(ConfigContext);
  const bookData = React.useContext(BookDataContext);
  const { state, dispatch } = bookData;
  const { pageIndex } = state;

  const fontFamily = english_font
    ? `${english_font}, ${chinese_font}`
    : default_english_fonts.concat(chinese_font || '').join(',');

  return (
    <div
      style={{ fontSize, fontFamily }}
      className="book"
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowRight' && pageIndex + 1 < book.flow.length) {
          dispatch({
            type: BookDataType.update_page,
            payload: {
              page: book.flow[pageIndex + 1].href,
              pageIndex: pageIndex + 1,
            },
          });
        } else if (event.key === 'ArrowLeft' && pageIndex - 1 >= 0) {
          dispatch({
            type: BookDataType.update_page,
            payload: {
              page: book.flow[pageIndex - 1].href,
              pageIndex: pageIndex - 1,
            },
          });
        }
      }}>
      <Section section={book.flow[pageIndex]} key={book.flow[pageIndex].id} />
    </div>
  );
};
