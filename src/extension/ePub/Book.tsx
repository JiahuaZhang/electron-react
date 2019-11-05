import React, { useEffect, useState } from 'react';

import { EPub } from './book.type';

const img = (data: Buffer, mimeType: string, alt: string) => (
  <img alt={alt} src={`data:${mimeType};base64, ${data.toString('base64')}`} />
);

interface Props {
  book: EPub;
}

export const Book: React.FC<Props> = ({ book }) => {
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

  return <div>{cover}</div>;
};
