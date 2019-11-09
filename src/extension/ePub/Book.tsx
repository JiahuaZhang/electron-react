import React, { useEffect, useState, useRef } from 'react';

import { Section } from './Section';
import { BookContext } from './BookContext';
import { manifest, EPub } from './book.type';

const getCss = (book: EPub, id: string): Promise<string> =>
  new Promise<string>((res, rej) => {
    book.getFile(id, (err, text, mimeType) => {
      if (err) {
        alert(`failed to get css for ${id}`);
        console.error(err);
        rej(err);
      }

      res(text.toString());
    });
  });

interface Props {}

export const Book: React.FC<Props> = () => {
  const [sections, setSections] = useState([{}] as {
    flow: manifest;
    section: null | JSX.Element;
  }[]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const book = React.useContext(BookContext);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const css = Object.values(book.manifest).filter(({ href }) => href.endsWith('.css'));

    Promise.all(css.map(c => getCss(book, c.id)))
      .then(arr => arr.join('\n'))
      .then(styles => {
        if (!ref.current) return;
        ref.current.setAttribute('style', styles);
      });
  }, [book]);

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
      ref={ref}
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
