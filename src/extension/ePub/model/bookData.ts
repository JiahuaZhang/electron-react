import { NoteSelection } from '../utils/note/note';

export interface BookData {
  page: string;
  pageIndex: number;
  sections: {
    id: string;
    notes: NoteSelection[];
  }[];
}

export const defaultBookData: BookData = {
  page: '',
  pageIndex: 0,
  sections: [],
};
