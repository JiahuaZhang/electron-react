import React, { useState, useEffect, useContext, useRef } from 'react';
import { Affix, Icon } from 'antd';

import { manifest, EPub } from './model/book.type';
import { BookContext } from './bookContext';
import {
  highlightSelection,
  HighlightSection,
  isSameRange,
  generateHighlight,
  isClickInside
} from './utils/highlight';
import { BookDataContext } from './Data/bookDataContext';
import { BookDataType } from './Data/bookDataHook';

const { ipcRenderer } = window.require('electron');
const default_highlight_colors = ['#ffeb3b', '#ff9800', '#ff5722', '#673ab7', '#03a9f4', '#4caf50'];

interface Props {
  section: manifest;
}

interface HighlighAction extends HighlightSection {
  status?: 'add' | 'update' | 'delete';
}

const redirectedHref = (book: EPub, href: string): Promise<string> =>
  new Promise<string>(res => {
    const fileName = href.split('/').pop() || '';
    if (!Object.values(book.manifest).find(m => m.href.includes(fileName))) {
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
  const left =
    event.offsetX + panel.clientWidth > rect.width ? rect.width - panel.clientWidth : event.offsetX;
  const top =
    event.y + panel.clientHeight > window.innerHeight
      ? (parent.parentElement?.parentElement?.scrollTop as number) +
        event.y -
        parent.offsetTop -
        panel.clientHeight
      : (parent.parentElement?.parentElement?.scrollTop as number) + event.y - parent.offsetTop;

  return { left, top };
};

export const Section: React.FC<Props> = ({ section }) => {
  const [html, setHtml] = useState(<></>);
  const book = useContext(BookContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [panelPosition, setPanelPosition] = useState({ top: 0, left: 0 });
  const [showPanel, setShowPanel] = useState(false);
  const [highlights, setHighlights] = useState<HighlightSection[]>([]);
  const [recentHighlight, setRecentHighlight] = useState({} as HighlighAction);
  const [refresh, setRefresh] = useState(false);
  const { dispatch, state } = React.useContext(BookDataContext);
  const [hasInitHighlights, setHasInitHighlights] = useState(false);

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
        event => {
          const selection = document.getSelection();
          if (!selection?.toString().trim()) {
            return;
          }

          const section_ref = (wrapperRef.current as HTMLDivElement).childNodes[1];
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

    const section_ref = wrapperRef.current?.children[1];
    if (!section_ref) return;

    switch (recentHighlight?.status) {
      case 'add':
        highlightSelection(document, recentHighlight, section_ref);
        setHighlights(values => [...values, recentHighlight]);
        break;

      case 'update':
        highlightSelection(document, recentHighlight, section_ref);
        setHighlights(values => {
          values = values.filter(value => !isSameRange(value, recentHighlight));
          return [...values, recentHighlight];
        });
        break;

      case 'delete':
        setHighlights(values =>
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
      const section_ref = wrapperRef.current?.children[1];
      if (!section_ref) return;
      for (const h of highlights) {
        highlightSelection(document, h, section_ref);
      }
      document.getSelection()?.removeAllRanges();
      setHighlights(values => values.filter(highlight => highlight.color !== 'white'));
    }
    setRefresh(false);
  }, [refresh, highlights]);

  useEffect(() => () => setShowPanel(false), []);

  const closeShowPanel = (event: React.MouseEvent) => {
    if (!showPanel) {
      return;
    }

    const target = event.target as HTMLDivElement;
    if (target.parentElement === panelRef.current) {
      return;
    }

    if (!document.getSelection()?.toString()) {
      setShowPanel(false);
    }
  };

  const clickHighlight = (event: React.MouseEvent) => {
    const target = event.target as Node;
    const section_ref = wrapperRef.current?.children[1];

    if (
      target.nodeName !== 'SPAN' ||
      target === section_ref ||
      panelRef.current?.contains(target) ||
      !section_ref
    ) {
      return;
    }

    for (const highlight of highlights.reverse()) {
      if (isClickInside(section_ref, target, highlight)) {
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

  return (
    <div
      ref={wrapperRef}
      style={{ position: 'relative' }}
      onClick={event => {
        closeShowPanel(event);
        clickHighlight(event);
      }}>
      <Affix
        style={{
          position: 'absolute',
          top: panelPosition.top,
          left: panelPosition.left,
          visibility: showPanel ? 'visible' : 'hidden'
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
            alignItems: 'center'
          }}>
          {default_highlight_colors.map(color => (
            <span
              onClick={event => {
                setRecentHighlight(highlight => ({ ...highlight, color }));
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
                cursor: 'pointer'
              }}></span>
          ))}
          {recentHighlight.status === 'add' ? (
            <Icon
              type="close"
              style={{ width: 18, cursor: 'pointer' }}
              onClick={() => setShowPanel(false)}
            />
          ) : (
            <Icon
              type="delete"
              style={{ width: 18, cursor: 'pointer' }}
              onClick={() => {
                setShowPanel(false);
                setRecentHighlight(highlight => ({ ...highlight, status: 'delete' }));
              }}
            />
          )}
        </div>
      </Affix>
      {html}
    </div>
  );
};
