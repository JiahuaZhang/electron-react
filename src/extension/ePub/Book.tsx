import React, { useEffect, useState } from 'react';

import { Section } from './Section';
import { BookContext } from './BookContext';

const img = (data: Buffer, mimeType: string, alt: string) => (
  <img alt={alt} src={`data:${mimeType};base64, ${data.toString('base64')}`} />
);

interface Props {}

export const Book: React.FC<Props> = () => {
  const [cover, setCover] = useState(<img alt="" />);

  const book = React.useContext(BookContext);

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
    <div>
      {cover}
      <Section section={book.flow[0]} />
    </div>
  );
};
