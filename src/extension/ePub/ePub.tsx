import React from 'react';
import path from 'path';

import { FileHandler } from '../../model/FileHandler';
import { renderer } from '../../model/renderer';

const epub = window.require('epub');

export const ePub = (displayer: renderer): FileHandler => {
  const matcher = (filename: string): boolean => filename.endsWith('.epub');

  const processor = (direcotry: string) => {
    const book = new epub(direcotry);
    book.parse();
    const book_name = direcotry
      .split(path.sep)
      .slice(-1)[0]
      .split(/.epub/i)[0];
    displayer(book_name, <div>in progress</div>);
  };

  return {
    matcher,
    processor
  };
};
