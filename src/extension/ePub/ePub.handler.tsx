import React from 'react';
import path from 'path';

import { fileHandler, controller } from './model/epub';
import { EPub } from './model/book.type';
import { Screen } from './Screen';

const epub = window.require('epub');

export const ePub = (control: () => controller): fileHandler => {
  const matcher = (filename: string): boolean => filename.endsWith('.epub');

  const processor = (direcotry: string) => {
    const book: EPub = new epub(direcotry);
    book.parse();
    const book_name = direcotry
      .split(path.sep)
      .slice(-1)[0]
      .split(/.epub/i)[0];

    book.on('end', () => {
      for (const key in book.manifest) {
        book.manifest[key].href = decodeURIComponent(book.manifest[key].href);
      }

      const { render, discard } = control();
      render(<Screen book={book} discard={discard} />, book_name);
    });
  };

  return {
    matcher,
    processor
  };
};
