import React, { useState, useEffect, useContext } from 'react';

import { manifest, EPub } from './book.type';
import { BookContext } from './BookContext';

interface Props {
  section: manifest;
}

const getImage = (book: EPub, fileName: string): Promise<string> => {
  return new Promise((res, rej) => {
    fileName = fileName.includes('.') ? fileName.split('.')[0] : fileName;
    book.getImage(fileName, (err, data, mimeType) => {
      if (err) {
        console.error(`failed to getImage for ${fileName}`);
        rej(err);
      }
      res(`data:${mimeType};base64, ${data.toString('base64')}`);
    });
  });
};

export const Section: React.FC<Props> = ({ section }) => {
  const [html, setHtml] = useState(<></>);

  const book = useContext(BookContext);

  useEffect(() => {
    const load = async () => {
      try {
        book.getChapterRaw(section.id, async (err, text) => {
          if (err) {
            console.error(err);
            alert(err.message);
            return;
          }

          if (text.includes('<image')) {
            const matches = text.match(/<image.*\/>/g) || [];

            for (const match of matches) {
              const attributes = match.match(/xlink:href="(.*)"/);
              if (!attributes) return;
              const imageString = await getImage(book, attributes[1]);
              text = text.replace(attributes[0], `xlink:href="${imageString}"`);
            }
          }

          setHtml(<div dangerouslySetInnerHTML={{ __html: text }}></div>);
        });
      } catch (error) {
        console.error(section);
        console.error(error);
      }
    };

    load();
  }, [section, book]);

  return html;
};
