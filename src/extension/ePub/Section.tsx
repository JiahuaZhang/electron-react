import React, { useState, useEffect, useContext } from 'react';

import { manifest, EPub } from './book.type';
import { BookContext } from './BookContext';

const { ipcRenderer } = window.require('electron');

interface Props {
  section: manifest;
}

const redirectedHref = (book: EPub, href: string): Promise<string> =>
  new Promise<string>(res => {
    const fileName = href.split('/').pop() || '';
    ipcRenderer.send('resource loaded?', book.metadata.title, fileName);
    ipcRenderer.once(`${book.metadata.title}/${fileName} loaded`, () =>
      res(`assets/${book.metadata.title}/${fileName}`)
    );
  });

export const Section: React.FC<Props> = ({ section }) => {
  const [html, setHtml] = useState(<></>);
  const book = useContext(BookContext);

  useEffect(() => {
    if (!book) {
      return;
    }

    book.getChapterRaw(section.id, async (err, text) => {
      if (err) {
        console.error(err);
        alert(err.message);
        return;
      }

      let matches = text.match(/xlink:href="(.*)"/g) || [];
      for (const match of matches) {
        const attributes = match.match(/xlink:href="(?<href>.*)"/);
        if (!attributes || !attributes.groups) {
          return;
        }
        const href = await redirectedHref(book, attributes.groups.href);
        text = text.replace(attributes[0], `xlink:href="${href}"`);
      }

      matches = text.match(/src="(.*?)"/g) || [];
      for (const match of matches) {
        const attributes = match.match(/src="(?<src>.*?)"/);
        if (!attributes || !attributes.groups) {
          return;
        }
        const href = await redirectedHref(book, attributes.groups.src);
        text = text.replace(attributes[0], `src="${href}"`);
      }

      setHtml(<div dangerouslySetInnerHTML={{ __html: text }}></div>);
    });
  }, [section, book]);

  return html;
};
