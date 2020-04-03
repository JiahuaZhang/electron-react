import { useReducer, createContext, Dispatch } from 'react';

export enum NotesType {
  persist
}

export interface Notes {
  text: string;
  backgroundColor: string;
}

interface NotesAction {
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