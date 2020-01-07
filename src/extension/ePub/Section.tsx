import React, { useState, useEffect, useContext, useRef } from 'react';
import { Affix } from 'antd';

import { manifest, EPub } from './model/book.type';
import { BookContext } from './bookContext';

const { ipcRenderer } = window.require('electron');
const default_highlight_colors = ['#ffeb3b', '#ff9800', '#ff5722', '#673ab7', '#03a9f4', '#4caf50'];

interface Props {
  section: manifest;
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

export const Section: React.FC<Props> = ({ section }) => {
  const [html, setHtml] = useState(<></>);
  const book = useContext(BookContext);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const [selectPanel, setSelectPanel] = useState({ top: 0, left: 0 });

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
          }
        },
        { once: true }
      );
    };

    wrapperRef.current?.addEventListener('selectstart', onSelectStart);
  }, []);

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <Affix style={{ position: 'absolute', top: selectPanel.top, left: selectPanel.left }}>
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
              onClick={() => {
                // console.log(color); todo
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
