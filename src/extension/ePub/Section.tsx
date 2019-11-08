import React, { useState, useEffect, useContext } from 'react';

import { manifest, EPub } from './book.type';
import { BookContext } from './BookContext';

interface Props {
  section: manifest;
}

const getImageString = (book: EPub, fileName: string): Promise<string> =>
  new Promise<string>((res, rej) => {
    const manifest = Object.values(book.manifest).find(manifest =>
      manifest.href.includes(fileName)
    );
    if (!manifest) {
      rej(`failed to find relevant manifest for ${fileName}`);
      console.error(`failed to find relevant manifest for ${fileName}`);
      return;
    }

    book.getImage(manifest.id, (err, data, mimeType) => {
      if (err) {
        console.error(err);
        rej(err);
      }

      res(`data:${mimeType};base64, ${data.toString('base64')}`);
    });
  });

const getImgString = (book: EPub, fileName: string): Promise<string> =>
  new Promise<string>((res, rej) => {
    const manifest = Object.values(book.manifest).find(value => value.href === fileName);
    if (!manifest) {
      alert(`fail to find img for ${fileName}`);
      rej(`fail to find img for ${fileName}`);
      return;
    }

    book.getImage(manifest.id, (err, data, mimeType) => {
      if (err) {
        alert(`failed to load image in book for ${fileName} with id: ${manifest.id}`);
        console.error(err);
        rej(err);
      }

      res(`data:${mimeType};base64, ${data.toString('base64')}`);
    });
  });

export const Section: React.FC<Props> = ({ section }) => {
  const [html, setHtml] = useState(<></>);

  const book = useContext(BookContext);

  useEffect(() => {
    book.getChapterRaw(section.id, async (err, text) => {
      if (err) {
        console.error(err);
        alert(err.message);
        return;
      }

      if (text.includes('<image')) {
        const matches = text.match(/<image.*>/g) || [];

        for (const match of matches) {
          const attributes = match.match(/xlink:href="(.*)"/);
          if (!attributes) return;
          const imageString = await getImageString(book, attributes[1]);
          text = text.replace(attributes[0], `xlink:href="${imageString}"`);
        }
      }

      if (text.includes('<img')) {
        const matches = text.match(/<img.*>/g) || [];
        for (const match of matches) {
          const attributes = match.match(/src=".*(images\/.*?)"/);
          if (!attributes) return;
          const imgString = await getImgString(book, attributes[1]);
          text = text.replace(attributes[0], `src="${imgString}"`);
        }
      }

      setHtml(<div dangerouslySetInnerHTML={{ __html: text }}></div>);
    });
  }, [section, book]);

  return html;
};
