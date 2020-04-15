import React, { useState, useEffect, useContext, useRef } from 'react';
import { Affix, Modal, notification, Checkbox } from 'antd';
import { CloseOutlined, DeleteOutlined } from '@ant-design/icons';

import { manifest, EPub } from './model/book.type';
import { BookContext } from './bookContext';
import {
  highlightSelection,
  HighlightSection,
  isSameRange,
  generateHighlight,
  isClickInside,
  getRange,
  compareHighlight,
} from './utils/highlight';
import { BookDataContext } from './Data/bookDataContext';
import { BookDataType } from './Data/bookDataHook';
import { NotesContext, NotesType, Notes } from './Panel/Notes/NotesHook';

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

interface HighlighAction extends HighlightSection {
  status?: 'add' | 'update' | 'delete';
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
  const [html, setHtml] = useState(<></>);
  const book = useContext(BookContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imagePanelRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const [showPanel, setShowPanel] = useState(false);
  const [showImagePanel, setshowImagePanel] = useState(false);
  const [highlights, setHighlights] = useState<HighlightSection[]>([]);
  const [recentHighlight, setRecentHighlight] = useState({} as HighlighAction);
  const [refresh, setRefresh] = useState(false);
  const { dispatch, state } = React.useContext(BookDataContext);
  const [hasInitHighlights, setHasInitHighlights] = useState(false);
  const { dispatch: notesDispatch } = React.useContext(NotesContext);
  const [zoomInImage, setZoomInImage] = useState({ src: '', show: false });

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
          const highlightAction = generateHighlight(range, section_ref) as HighlighAction;

          highlightAction.status = 'add';
          setRecentHighlight(highlightAction);

          setPanelPosition(
            getAbsolutePanelPosistion(
              wrapperRef.current as HTMLDivElement,
              panelRef.current as HTMLDivElement,
              event,
              window
            )
          );
          setShowPanel(true);
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
    if (result?.highlights.length) {
      setHighlights(result.highlights);
      setRefresh(true);
    }
    setHasInitHighlights(true);
  }, [state.sections, section.id, highlights, html, hasInitHighlights]);

  useEffect(
    () => () =>
      dispatch({ type: BookDataType.update_highlights, payload: { id: section.id, highlights } }),
    [highlights, dispatch, section.id]
  );

  useEffect(() => {
    if (!recentHighlight.color) {
      return;
    }

    const content_ref = contentRef.current as HTMLDivElement;
    if (!content_ref) return;

    switch (recentHighlight?.status) {
      case 'add':
        highlightSelection(document, recentHighlight, content_ref);
        setHighlights((values) => [...values, recentHighlight]);
        break;

      case 'update':
        highlightSelection(document, recentHighlight, content_ref);
        setHighlights((values) => {
          values = values.filter((value) => !isSameRange(value, recentHighlight));
          return [...values, recentHighlight];
        });
        break;

      case 'delete':
        setHighlights((values) =>
          values.reduce<HighlightSection[]>((accumulator, current) => {
            if (isSameRange(current, recentHighlight)) {
              return [{ ...current, color: 'white' }, ...accumulator];
            }
            return [...accumulator, current];
          }, [])
        );
        setRefresh(true);
        break;

      default:
        break;
    }
  }, [recentHighlight]);

  useEffect(() => {
    if (refresh) {
      const content_ref = contentRef.current as HTMLDivElement;
      if (!content_ref) return;
      for (const h of highlights) {
        highlightSelection(document, h, content_ref);
      }
      document.getSelection()?.removeAllRanges();
      setHighlights((values) => values.filter((highlight) => highlight.color !== 'white'));
    }
    setRefresh(false);
  }, [refresh, highlights]);

  useEffect(() => {
    const content_ref = contentRef.current as HTMLDivElement;
    const payload = highlights.sort(compareHighlight).map((highlight) => {
      const range = getRange(document, highlight, content_ref);
      return { text: range?.toString(), backgroundColor: highlight.color } as Notes;
    });
    notesDispatch({ type: NotesType.persist, payload });
  }, [highlights, notesDispatch]);

  const closeShowPanel = (event: React.MouseEvent) => {
    if (!showPanel) {
      return;
    }

    const target = event.target as HTMLDivElement;
    if (target.parentElement === panelRef.current) {
      return;
    }

    if (document.getSelection()?.toString()) {
      highlightSelection(document, recentHighlight, contentRef.current as Node);
    } else {
      setShowPanel(false);
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

    for (const highlight of highlights.reverse()) {
      if (isClickInside(content_ref, target, highlight)) {
        setPanelPosition(
          getAbsolutePanelPosistion(
            wrapperRef.current as HTMLDivElement,
            panelRef.current as HTMLDivElement,
            event.nativeEvent,
            window
          )
        );
        setShowPanel(true);
        setRecentHighlight({ ...highlight, status: 'update' });
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
          visibility: showPanel ? 'visible' : 'hidden',
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
                setRecentHighlight((highlight) => ({ ...highlight, color }));
                setShowPanel(false);
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
          {recentHighlight.status === 'add' ? (
            <CloseOutlined
              onClick={() => setShowPanel(false)}
              style={{ width: 18, cursor: 'pointer' }}
            />
          ) : (
            <DeleteOutlined
              style={{ width: 18, cursor: 'pointer' }}
              onClick={() => {
                setShowPanel(false);
                setRecentHighlight((highlight) => ({ ...highlight, status: 'delete' }));
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
          <Checkbox style={{ background: 'white', padding: '.5rem' }}>image</Checkbox>
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
