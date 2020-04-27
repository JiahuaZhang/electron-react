import React, { useState, useEffect, useContext, useRef } from 'react';
import { Modal, notification } from 'antd';

import { manifest } from '../model/book.type';
import { BookContext } from '../bookContext';
import { BookDataContext } from '../Data/bookDataContext';
import { BookDataType } from '../Data/bookDataHook';
import { NotesContext, NotesType } from '../Panel/Notes/NotesHook';
import {
  NoteSelection,
  compareNote,
  highlightNote,
  getContent,
  isNoteClickInside,
} from '../utils/note/note';
import { TextSelection, textSelection, highlightSelection } from '../utils/note/textSelection';
import { ImageSelection, imageSelection } from '../utils/note/imageSelection';
import { ColorPanel } from './ColorPanel';
import { ImagePanel } from './ImagePanel';
import { transformHtml } from '../utils/book';

const { nativeImage, clipboard } = window.require('electron');

interface Props {
  section: manifest;
}

export interface TextSelectionWrapper extends TextSelection {
  status?: 'add' | 'update' | 'delete' | 'chose';
}

const getAbsolutePanelPosistion = (
  parent: HTMLElement,
  panel: HTMLElement,
  event: MouseEvent,
  window: Window
) => {
  const rect = parent.getBoundingClientRect();

  let left =
    event.offsetX + panel.clientWidth > rect.width ? rect.width - panel.clientWidth : event.offsetX;
  const top =
    event.y + panel.clientHeight > window.innerHeight
      ? (parent.parentElement?.parentElement?.scrollTop as number) +
        event.y -
        parent.offsetTop -
        panel.clientHeight
      : (parent.parentElement?.parentElement?.scrollTop as number) + event.y - parent.offsetTop;

  const element = event.target as HTMLElement;
  if (element.tagName === 'IMG') {
    const { offsetLeft } = element;

    left =
      event.offsetX + offsetLeft + panel.clientWidth > rect.width
        ? rect.width - panel.clientWidth
        : event.offsetX + offsetLeft;
  }

  return { left, top };
};

export const Section: React.FC<Props> = ({ section }) => {
  const book = useContext(BookContext);
  const { dispatch, state } = React.useContext(BookDataContext);
  const { dispatch: notesDispatch } = React.useContext(NotesContext);
  const [html, setHtml] = useState(<></>);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const [showTextPanel, setshowTextPanel] = useState(false);
  const [showImagePanel, setshowImagePanel] = useState(false);
  const [notes, setNotes] = useState<NoteSelection[]>([]);
  const [recentTextNote, setRecentTextNote] = useState({} as TextSelectionWrapper);
  const [refresh, setRefresh] = useState(false);
  const [hasInitHighlights, setHasInitHighlights] = useState(false);
  const [zoomInImage, setZoomInImage] = useState({ src: '', show: false });
  const [recentImageNote, setRecentImageNote] = useState({} as ImageSelection);

  useEffect(() => {
    if (!book) {
      return;
    }

    book.getChapterRaw(section.id, async (err, text) => {
      if (err) {
        console.error(err, book.manifest.title, section.id, book);
        return;
      }

      const html = (await transformHtml(book, text)) as string;

      setHtml(<div dangerouslySetInnerHTML={{ __html: html }}></div>);
    });
  }, [section, book]);

  useEffect(() => {
    const onSelectStart = (event: Event) => {
      contentRef.current?.addEventListener(
        'mouseup',
        (event) => {
          const selection = document.getSelection();
          if (!selection?.toString().trim()) {
            return;
          }

          const content_ref = contentRef.current as HTMLDivElement;
          if (
            !content_ref.contains(selection.anchorNode) ||
            !content_ref.contains(selection.focusNode)
          ) {
            return;
          }

          const range = selection.getRangeAt(0);
          const note = textSelection(range, content_ref) as TextSelectionWrapper;
          note.status = 'add';

          setRecentTextNote(note);

          setPanelPosition(
            getAbsolutePanelPosistion(
              wrapperRef.current as HTMLDivElement,
              panelRef.current as HTMLDivElement,
              event,
              window
            )
          );
          setshowTextPanel(true);
          event.stopImmediatePropagation();
        },
        { once: true }
      );
    };

    contentRef.current?.addEventListener('selectstart', onSelectStart);
  }, []);

  useEffect(() => {
    if (hasInitHighlights || !html.props['dangerouslySetInnerHTML']) {
      return;
    }

    const result = state.sections.find(({ id }) => id === section.id);
    if (result?.notes?.length) {
      setNotes(result.notes);
      setRefresh(true);
    }
    setHasInitHighlights(true);
  }, [state.sections, section.id, notes, html, hasInitHighlights]);

  useEffect(
    () => () => dispatch({ type: BookDataType.update_notes, payload: { id: section.id, notes } }),
    [notes, dispatch, section.id]
  );

  useEffect(() => {
    if (!recentTextNote.color) {
      return;
    }

    const content_ref = contentRef.current as HTMLDivElement;
    if (!content_ref) return;

    switch (recentTextNote.status) {
      case 'chose':
        highlightSelection(document, recentTextNote, content_ref);
        break;

      case 'add':
        highlightSelection(document, recentTextNote, content_ref);
        setNotes((values) => [...values, recentTextNote]);
        break;

      case 'update':
        highlightSelection(document, recentTextNote, content_ref);
        setNotes((values) => {
          values = values.filter((value) => !compareNote(recentTextNote, value));
          return [...values, recentTextNote];
        });
        break;

      case 'delete':
        setNotes((values) =>
          values.reduce<NoteSelection[]>((accumulator, current) => {
            if (compareNote(recentTextNote, current) === 0) {
              return [...accumulator, { ...current, color: 'white' }];
            }
            return [...accumulator, current];
          }, [])
        );
        setRefresh(true);
        break;

      default:
        break;
    }
  }, [recentTextNote]);

  useEffect(() => {
    if (refresh) {
      const content_ref = contentRef.current as HTMLDivElement;
      if (!content_ref) return;
      for (const note of notes) {
        highlightNote(document, note, content_ref);
      }
      document.getSelection()?.removeAllRanges();
      setNotes((values) =>
        values.filter((note) => note.kind === 'image' || note.color !== 'white')
      );
    }
    setRefresh(false);
  }, [refresh, notes]);

  useEffect(() => {
    const content_ref = contentRef.current as HTMLDivElement;
    const payload = notes.sort(compareNote).map((note) => getContent(document, note, content_ref));
    notesDispatch({ type: NotesType.persist, payload });
  }, [notes, notesDispatch]);

  const closeShowPanel = (event: React.MouseEvent) => {
    if (!showTextPanel) {
      return;
    }

    const target = event.target as HTMLDivElement;
    if (target.parentElement === panelRef.current) {
      return;
    }

    if (document.getSelection()?.toString()) {
      highlightSelection(document, recentTextNote, contentRef.current as Node);
    } else {
      setshowTextPanel(false);
    }
  };

  const clickHighlight = (event: React.MouseEvent) => {
    const target = event.target as Node;
    const content_ref = contentRef.current as HTMLDivElement;

    if (
      target.nodeName !== 'SPAN' ||
      target === content_ref ||
      panelRef.current?.contains(target) ||
      !content_ref
    ) {
      return;
    }

    for (const note of notes.reverse()) {
      if (isNoteClickInside(content_ref, target, note)) {
        setPanelPosition(
          getAbsolutePanelPosistion(
            wrapperRef.current as HTMLDivElement,
            panelRef.current as HTMLDivElement,
            event.nativeEvent,
            window
          )
        );
        setshowTextPanel(true);
        setRecentTextNote({ ...note, status: 'chose' } as TextSelectionWrapper);
        return;
      }
    }
  };

  const clickOnImage = (event: React.MouseEvent) => {
    const { target } = event;
    if ((target as HTMLElement).tagName === 'IMG') {
      const { src } = target as HTMLImageElement;
      setZoomInImage({ show: true, src });
    }
  };

  const closeImagePanel = (event: React.MouseEvent) => {
    if (imagePanelRef.current?.contains(event.target as Node)) {
      return;
    }

    setshowImagePanel(false);
  };

  const onRightClickImage = (event: React.MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.tagName !== 'IMG') {
      return;
    }

    const recentImage = imageSelection(contentRef.current as Node, target as HTMLImageElement);
    setRecentImageNote(recentImage);
    setPanelPosition(
      getAbsolutePanelPosistion(
        wrapperRef.current as HTMLDivElement,
        imagePanelRef.current as HTMLDivElement,
        event.nativeEvent,
        window
      )
    );
    setshowImagePanel(true);
  };

  const onDoubleClickImage = (event: React.MouseEvent) => {
    const { src } = zoomInImage;
    const path = `public/${decodeURI(src.substring(src.indexOf('assets')))}`;
    const image = nativeImage.createFromPath(path);
    clipboard.writeImage(image);
    notification.success({ message: 'Image copied!', duration: 1.5 });
  };

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative', backgroundColor: 'white' }}
      onClick={(event) => {
        closeShowPanel(event);
        clickHighlight(event);
        closeImagePanel(event);
      }}
      onDoubleClick={clickOnImage}
      onAuxClick={onRightClickImage}>
      <ColorPanel
        panelPosition={panelPosition}
        panelRef={panelRef}
        recentTextNote={recentTextNote}
        setRecentTextNote={setRecentTextNote}
        setshowTextPanel={setshowTextPanel}
        showTextPanel={showTextPanel}
      />
      <ImagePanel
        imagePanelRef={imagePanelRef}
        notes={notes}
        panelPosition={panelPosition}
        recentImageNote={recentImageNote}
        setNotes={setNotes}
        showImagePanel={showImagePanel}
      />
      <Modal
        visible={zoomInImage.show}
        footer={null}
        onCancel={() => setZoomInImage({ src: '', show: false })}>
        <img
          onDoubleClick={onDoubleClickImage}
          style={{ marginTop: '1rem' }}
          src={zoomInImage.src}
          alt=""
        />
      </Modal>
      <div ref={contentRef}>{html}</div>
    </div>
  );
};
