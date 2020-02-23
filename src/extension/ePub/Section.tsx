import React, { useState, useEffect, useContext, useRef } from 'react';
import { Affix } from 'antd';

import { manifest, EPub } from './model/book.type';
import { BookContext } from './bookContext';

const { ipcRenderer } = window.require('electron');
const default_highlight_colors = ['#ffeb3b', '#ff9800', '#ff5722', '#673ab7', '#03a9f4', '#4caf50'];

interface Props {
  section: manifest;
}

interface HighlightSection {
  path_to_start_container: number[];
  start_offset: number;
  path_to_end_container: number[];
  end_offset: number;
  color?: string;
}

const getAdjustedNodePath = (parent: Node, child: Node, offset: number): [number[], number] => {
  if (parent.firstChild?.nodeName === 'SPAN') {
    let current_node = parent.firstChild;

    while (!current_node.isEqualNode(child)) {
      if (current_node.contains(child)) {
        current_node = current_node.childNodes[0];
      } else {
        offset += current_node.textContent?.length as number;
        current_node = current_node.nextSibling as ChildNode;
      }
    }

    return [[0], offset];
  }

  for (const index in Array.from(parent.childNodes)) {
    const current = parent.childNodes[index];
    if (current.isEqualNode(child)) {
      return [[Number(index)], offset];
    }

    if (current.contains(child)) {
      const [path, adjusted_offset] = getAdjustedNodePath(current, child, offset);
      return [[Number(index), ...path], adjusted_offset];
    }
  }

  console.error(parent, child, offset);
  throw Error('Unreachable case for getAdjustedNodePath!');
};

const getAdjustedNode = (parent: Node, path: number[], offset: number): [Node, number] => {
  let current = path.reduce((node, index) => node.childNodes[index], parent);

  if (current.nodeName === 'SPAN') {
    while (current.hasChildNodes() || offset > (current.textContent?.length as number)) {
      if (offset <= (current.textContent?.length as number)) {
        current = current.firstChild as Node;
      } else {
        offset -= current.textContent?.length as number;
        current = current.nextSibling as Node;
      }
    }
    return [current, offset];
  }

  return [current, offset];
};

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

export const Section: React.FC<Props> = ({ section }) => {
  const [html, setHtml] = useState(<></>);
  const book = useContext(BookContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectPanel, setSelectPanel] = useState({ top: 0, left: 0 });
  const [showPanel, setShowPanel] = useState(false);
  const [highlight, setHighlight] = useState({} as HighlightSection);

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

          const range = selection.getRangeAt(0);
          const highlightSection = {} as HighlightSection;

          const section_ref = (wrapperRef.current as HTMLDivElement).childNodes[1];

          let [path, adjusted_offset] = getAdjustedNodePath(
            section_ref,
            range.startContainer,
            range.startOffset
          );
          highlightSection.path_to_start_container = path;
          highlightSection.start_offset = adjusted_offset;

          [path, adjusted_offset] = getAdjustedNodePath(
            section_ref,
            range.endContainer,
            range.endOffset
          );
          highlightSection.path_to_end_container = path;
          highlightSection.end_offset = adjusted_offset;

          setHighlight(highlightSection);

          const rect = wrapperRef.current?.getBoundingClientRect();
          if (
            rect &&
            panelRef.current &&
            wrapperRef.current &&
            wrapperRef.current.parentElement?.parentElement
          ) {
            const left =
              event.offsetX + panelRef.current.clientWidth > rect.width
                ? rect.width - panelRef.current.clientWidth
                : event.offsetX;

            const top =
              event.y + panelRef.current.clientHeight > window.innerHeight
                ? wrapperRef.current.parentElement.parentElement.scrollTop +
                  event.y -
                  wrapperRef.current.offsetTop -
                  panelRef.current.clientHeight
                : wrapperRef.current.parentElement.parentElement.scrollTop +
                  event.y -
                  wrapperRef.current.offsetTop;

            setSelectPanel({ left, top });
            setShowPanel(true);
          }
        },
        { once: true }
      );
    };

    wrapperRef.current?.addEventListener('selectstart', onSelectStart);
  }, []);

  useEffect(() => {
    if (!highlight || !highlight.color) return;

    const selection = document.getSelection();
    if (!selection) return;

    const section_ref = wrapperRef.current?.children[1];
    if (!section_ref) return;

    selection.removeAllRanges();
    const [start_container, start_offset] = getAdjustedNode(
      section_ref,
      highlight.path_to_start_container,
      highlight.start_offset
    );
    const [end_container, end_offset] = getAdjustedNode(
      section_ref,
      highlight.path_to_end_container,
      highlight.end_offset
    );

    const range = document.createRange();
    range.setStart(start_container, start_offset);
    range.setEnd(end_container, end_offset);

    selection.addRange(range);

    document.designMode = 'on';
    document.execCommand('backColor', false, highlight.color);
    document.designMode = 'off';
  }, [highlight]);

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

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }} onClick={closeShowPanel}>
      <Affix
        style={{
          position: 'absolute',
          top: selectPanel.top,
          left: selectPanel.left,
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
            background: 'linear-gradient(to right, #e0eafc, #cfdef3)'
          }}>
          {default_highlight_colors.map(color => (
            <span
              onClick={event => {
                setHighlight(highlight => ({ ...highlight, color }));
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
        </div>
      </Affix>
      {html}
    </div>
  );
};
