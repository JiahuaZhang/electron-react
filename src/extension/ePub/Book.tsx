import React, { useEffect, useState } from 'react';

import { Section } from './Section';
import { BookContext } from './BookContext';
import { manifest } from './book.type';

export const img = (data: Buffer, mimeType: string, alt: string) => (
  <img alt={alt} src={`data:${mimeType};base64, ${data.toString('base64')}`} />
);

interface Props {}

export const Book: React.FC<Props> = () => {
  const [sections, setSections] = useState([{}] as {
    flow: manifest;
    section: null | JSX.Element;
  }[]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const book = React.useContext(BookContext);

  useEffect(() => {
    const init_sections = book.flow.map(flow => ({
      flow,
      section: null as (null | JSX.Element)
    }));

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
