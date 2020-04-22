import React, { useState, useEffect, useContext, useRef } from 'react';
import { Affix, Modal, notification, Checkbox } from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';

import { manifest, EPub } from './model/book.type';
import { BookContext } from './bookContext';
import { BookDataContext } from './Data/bookDataContext';
import { BookDataType } from './Data/bookDataHook';
import { NotesContext, NotesType } from './Panel/Notes/NotesHook';
import {
  NoteSelection,
  compareNote,
  highlightNote,
  getContent,
  isNoteClickInside,
} from './utils/note/note';
import { TextSelection, textSelection, highlightSelection } from './utils/note/textSelection';
import { ImageSelection, imageSelection } from './utils/note/imageSelection';

const { ipcRenderer, nativeImage, clipboard } = window.require('electron');
const default_highlight_colors = [
  '#ffeb3b',
  '#ff9800',
  '#f72a1b',
  '#a900ff5e',
  '#03a9f466',
  '#15ff1e',
];

interface Props {
  section: manifest;
}

interface TextSelectionWrapper extends TextSelection {
  status?: 'add' | 'update' | 'delete' | 'chose';
}

const redirectedHref = (book: EPub, href: string): Promise<string> =>
  new Promise<string>((res) => {
    const fileName = href.split('/').pop() || '';
    if (!Object.values(book.manifest).find((m) => m.href.includes(fileName))) {
      res(href);
    }

    ipcRenderer.send('resource loaded?', book.metadata.title, fileName);
    ipcRenderer.once(`${book.metadata.title}/${fileName} loaded`, () =>
      res(`assets/${book.metadata.title}/${fileName}`)
    );
  });

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
        console.error(err);
        alert(err.message);
        console.log(book.manifest.title, section.id);
        console.log(book);
        return;
      }

      let matches = text.match(/src="(.*?)"/g) || [];
      for (const match of matches) {
        const attributes = match.match(/src="(?<src>.*?)"/);
        if (!attributes || !attributes.groups) {
          return;
        }
        const href = await redirectedHref(book, attributes.groups.src);
        text = text.replace(attributes[0], `src="${href}"`);
      }

      matches = text.match(/link.*href="(.*?)"/g) || [];
      for (const match of matches) {
        const attributes = match.match(/href="(?<href>.*?)"/);
        if (!attributes || !attributes.groups) {
          return;
        }
        const href = await redirectedHref(book, attributes.groups.href);
        text = text.replace(attributes[0], `href="${href}"`);
      }

      setHtml(<div dangerouslySetInnerHTML={{ __html: text }}></div>);
    });
  }, [section, book]);

  useEffect(() => {
    const onSelectStart = (event: Event) => {
      wrapperRef.current?.addEventListener(
        'mouseup',
        (event) => {
          const selection = document.getSelection();
          if (!selection?.toString().trim()) {
            return;
          }

          const section_ref = contentRef.current as HTMLDivElement;
          if (
            !section_ref.contains(selection.anchorNode) ||
            !section_ref.contains(selection.focusNode)
          ) {
            return;
          }

          const range = selection.getRangeAt(0);
          const note = textSelection(range, section_ref) as TextSelectionWrapper;
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

    wrapperRef.current?.addEventListener('selectstart', onSelectStart);
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
    console.log(notes);
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
      onAuxClick={(event) => {
        const target = event.target as HTMLElement;
        if (target.tagName === 'IMG') {
          const recentImage = imageSelection(contentRef.current as Node, target);
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
        }
      }}>
      <Affix
        style={{
          position: 'absolute',
          top: panelPosition.top,
          left: panelPosition.left,
          visibility: showTextPanel ? 'visible' : 'hidden',
        }}>
        <div
          ref={panelRef}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(20px, 1fr))',
            position: 'relative',
            minWidth: 200,
            gap: 5,
            padding: 5,
            border: '1px solid #1890ff5c',
            borderRadius: 7,
            background: 'linear-gradient(to right, #e0eafc, #cfdef3)',
            alignItems: 'center',
          }}>
          {default_highlight_colors.map((color) => (
            <span
              onClick={(event) => {
                setRecentTextNote((note) => ({ ...note, color }));
                setshowTextPanel(false);
                setTimeout(() => {
                  document.getSelection()?.removeAllRanges();
                }, 0);
              }}
              key={color}
              style={{
                width: 18,
                height: 18,
                borderRadius: '50%',
                backgroundColor: color,
                display: 'inline-block',
                cursor: 'pointer',
              }}></span>
          ))}
          {recentTextNote.status === 'add' ? (
            <CloseOutlined
              onClick={() => setshowTextPanel(false)}
              style={{ width: 18, cursor: 'pointer' }}
            />
          ) : (
            <DeleteOutlined
              style={{ width: 18, cursor: 'pointer' }}
              onClick={() => {
                setshowTextPanel(false);
                setRecentTextNote((note) => ({ ...note, status: 'delete' }));
              }}
            />
          )}
        </div>
      </Affix>
      <Affix
        style={{
          position: 'absolute',
          top: panelPosition.top,
          left: panelPosition.left,
          visibility: showImagePanel ? 'visible' : 'hidden',
        }}>
        <div ref={imagePanelRef}>
          <Checkbox
            checked={
              recentImageNote.kind &&
              notes?.find((note) => compareNote(note, recentImageNote) === 0) !== undefined
            }
            onChange={(event) => {
              if (event.target.checked) {
                setNotes((notes) => [...notes, recentImageNote]);
              } else {
                setNotes(notes.filter((note) => compareNote(note, recentImageNote) !== 0));
              }
            }}
            style={{ background: 'white', padding: '.5rem' }}>
            image
          </Checkbox>
          )
        </div>
      </Affix>
      <Modal
        visible={zoomInImage.show}
        footer={null}
        onCancel={() => setZoomInImage({ src: '', show: false })}>
        <img
          onDoubleClick={() => {
            const { src } = zoomInImage;
            const path = `public/${decodeURI(src.substring(src.indexOf('assets')))}`;
            const image = nativeImage.createFromPath(path);
            clipboard.writeImage(image);
            notification.success({ message: 'Image copied!', duration: 1.5 });
          }}
          style={{ marginTop: '1rem' }}
          src={zoomInImage.src}
          alt=""
        />
      </Modal>
      <div ref={contentRef}>{html}</div>
    </div>
  );
};
