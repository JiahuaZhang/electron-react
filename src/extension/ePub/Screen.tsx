import React from 'react';
import { EPub } from './Book';

interface Props {
  book: EPub;
}

export const Screen: React.FC<Props> = ({ book }) => {
  return <div>in progress -- book content here</div>;
};
