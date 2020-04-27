import { ImageSelection, imageSelectionCompare } from './imageSelection';
import {
  TextSelection,
  textSelectionCompare,
  highlightSelection,
  getRange,
  isClickInside,
} from './textSelection';

import { Notes } from '../../Panel/Notes/NotesHook';

export type NoteSelection = TextSelection | ImageSelection;

export const isTextSelection = (selection: NoteSelection): selection is TextSelection =>
  selection.kind === 'text';

export const isImageSelection = (selection: NoteSelection): selection is ImageSelection =>
  selection.kind === 'image';

const textSelectionCompareImageSelection = (a: TextSelection, b: ImageSelection) => {
  const length = Math.min(a.path_to_start_container.length, b.path.length);
  for (let index = 0; index < length; ++index) {
    if (a.path_to_start_container[index] !== b.path[index]) {
      return a.path_to_start_container[index] - b.path[index];
    }
  }

  return a.path_to_start_container.length - b.path.length;
};

export const compareNote = (a: NoteSelection, b: NoteSelection) => {
  if (isTextSelection(a) && isTextSelection(b)) {
    return textSelectionCompare(a, b);
  }

  if (isImageSelection(a) && isImageSelection(b)) {
    return imageSelectionCompare(a, b);
  }

  if (isTextSelection(a)) {
    return textSelectionCompareImageSelection(a, b as ImageSelection);
  } else {
    return -textSelectionCompareImageSelection(b as TextSelection, a);
  }
};

export const highlightNote = (document: Document, note: NoteSelection, parent: Node) => {
  if (isTextSelection(note)) {
    highlightSelection(document, note, parent);
  }
};

export const getContent = (document: Document, note: NoteSelection, parent: Node): Notes => {
  if (isTextSelection(note)) {
    const range = getRange(document, note, parent);
    return { type: 'text', text: range?.toString(), backgroundColor: note.color };
  }

  if (isImageSelection(note)) {
    return { type: 'image', src: note.src };
  }

  throw Error('invalid note selection type');
};

export const isNoteClickInside = (parent: Node, target: Node, note: NoteSelection) => {
  if (isTextSelection(note)) {
    return isClickInside(parent, target, note);
  }

  return false;
};
