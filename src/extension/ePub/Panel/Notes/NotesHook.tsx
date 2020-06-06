import { useReducer, createContext, Dispatch } from 'react';

export enum NotesType {
  persist,
}

export interface Notes {
  type: 'text' | 'image';
  src?: string;
  text?: string;
  backgroundColor?: string;
}

export const note2id = (note: Notes) =>
  note.type === 'text' ? `${note.type}-${note.text}` : `${note.type}-${note.src}`;

export interface NotesAction {
  type: NotesType;
  payload: Notes[];
}

interface NotesHook {
  state: Notes[];
  dispatch: Dispatch<NotesAction>;
}

const reducer = (state: Notes[] = [], action: NotesAction) => {
  switch (action.type) {
    case NotesType.persist:
      return action.payload as Notes[];
    default:
      return state;
  }
};

export const useNotes = () => {
  const [state, dispatch] = useReducer(reducer, []);

  return { state, dispatch };
};

export const NotesContext = createContext({} as NotesHook);
