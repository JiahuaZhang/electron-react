import { HighlightSection } from '../utils/highlight';

export interface BookData {
  page: string;
  pageIndex: number;
  sections: {
    id: string;
    highlights: HighlightSection[];
  }[];
}

export const defaultBookData: BookData = {
  page: '',
  pageIndex: 0,
  sections: []
};
