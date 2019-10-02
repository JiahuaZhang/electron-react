const epub = window.require('epub');

export const matcher = (filename: string): boolean => filename.endsWith('.epub');

export const processor = (direcotry: string) => {
  const book = new epub(direcotry);
  book.parse();
  // console.log(book);
};

export const ePub = { matcher, processor };
