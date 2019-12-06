import React, { useEffect, useState } from 'react';

import './Book.sass';
import { Section } from './Section';
import { BookContext } from './BookContext';
import { manifest } from './book.type';
import { ConfigContext } from './Configuration/configContext';

const { ipcRenderer } = window.require('electron');

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

export const Book: React.FC<Props> = () => {
  const [sections, setSections] = useState([{}] as {
    flow: manifest;
    section?: JSX.Element;
  }[]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const book = React.useContext(BookContext);
  const { fontSize, chinese_font, english_font } = React.useContext(ConfigContext);

  const fontFamily = english_font
    ? `${english_font}, ${chinese_font}`
    : default_english_fonts.concat(chinese_font || '').join(',');

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
    const init_sections = book.flow.map<{
      flow: manifest;
      section?: JSX.Element;
    }>(flow => ({ flow }));

    init_sections[currentIndex].section = <Section section={init_sections[currentIndex].flow} />;
    setSections(init_sections);
  }, [book, currentIndex]);

  useEffect(() => {
    if (!sections[currentIndex].section) {
      setSections(prev => {
        const new_state = [...prev];
        new_state[currentIndex].section = <Section section={new_state[currentIndex].flow} />;
        return new_state;
      });
    }
  }, [currentIndex, sections]);

  return (
    <div
      style={{ fontSize: fontSize, fontFamily }}
      className="book"
      tabIndex={0}
      onKeyDown={event => {
        if (event.key === 'ArrowRight') {
          if (currentIndex + 1 < sections.length) {
            setCurrentIndex(currentIndex + 1);
          }
        } else if (event.key === 'ArrowLeft') {
          if (currentIndex - 1 >= 0) {
            setCurrentIndex(currentIndex - 1);
          }
        }
      }}>
      {sections[currentIndex].section}
    </div>
  );
};
