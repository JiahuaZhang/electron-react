import React, { useState, useEffect } from 'react';
import { EPub } from './book.type';

interface Props {
  book: EPub;
}

const img = (data: Buffer, mimeType: string, alt: string) => (
  <img alt={alt} src={`data:${mimeType};base64, ${data.toString('base64')}`} />
);

export const Screen: React.FC<Props> = ({ book }) => {
  const [cover, setCover] = useState(<img alt="" />);

  useEffect(() => {
    book.getImage(book.metadata.cover, (err, data, mimeType) => {
      if (err) {
        console.error(err);
        return;
      }

      if (data) setCover(img(data, mimeType, 'cover'));
    });
  }, [book]);

  return (
    <>
      {book.toc.map(toc => (
        <ul key={toc.id}>
          <li>title: {toc.title}</li>
          <li>level: {toc.level}</li>
        </ul>
      ))}
      {cover}
      <ul>
        {Object.entries(book.metadata).map(([key, value]) => (
          <li key={key}>
            {key} : {value}
          </li>
        ))}
      </ul>
    </>
  );
};
