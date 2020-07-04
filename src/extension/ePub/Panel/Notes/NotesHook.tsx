import React, { useContext, useState, createContext, ReactNode, useEffect } from 'react';

import { BookContext } from '../../bookContext';
import { BookDataContext } from '../../Data/bookDataContext';
import { NoteSelection } from '../../utils/note/note';
import { manifest } from '../../model/book.type';

export interface SideNote {
  kind: 'text' | 'image';
  path_to_start_container?: number[];
  start_offset?: number;
  path_to_end_container?: number[];
  end_offset?: number;
  color?: string;
  path?: number[];
  src?: string;
  text?: string;
}

export const useNote = () => {
  const book = useContext(BookContext);
  const { state } = useContext(BookDataContext);
  const [notes, setNotes] = useState<NoteSelection[]>([]);
  const [sideNotes, setSideNotes] = useState<SideNote[]>([]);

  const section = book.flow[state.pageIndex];

  useEffect(() => {
    setNotes(state.sections.find(({ id }) => id === section.id)?.notes || []);
  }, [state.sections, section]);

  return { section, notes, sideNotes, setSideNotes };
};

export const NoteContext = createContext(
  {} as {
    section: manifest;
    notes: NoteSelection[];
    sideNotes: SideNote[];
    setSideNotes: React.Dispatch<React.SetStateAction<SideNote[]>>;
  }
);

export const NoteProvider = ({ children }: { children: ReactNode }) => (
  <NoteContext.Provider value={useNote()}>{children}</NoteContext.Provider>
);
