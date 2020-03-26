import React, { useState, useEffect, useRef } from 'react';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime, tap } from 'rxjs/operators';
import { Layout, Menu } from 'antd';
import { MenuOutlined, CloseCircleFilled, SettingOutlined } from '@ant-design/icons';

import './Screen.sass';
import { EPub } from './model/book.type';
import { TableOfContents } from './TableOfContents';
import { Book } from './Book';
import { BookContext } from './bookContext';
import { ConfigPanel } from './Configuration/ConfigPanel';
import { useConfig } from './Configuration/configHook';
import { ConfigContext } from './Configuration/configContext';
import { BookDataContext } from './Data/bookDataContext';
import { useBookData } from './Data/bookDataHook';

const { Header, Content, Sider } = Layout;

interface Props {
  book: EPub;
  discard?: () => void;
}

export const Screen: React.FC<Props> = ({ book, discard }) => {
  const [activePanel, setActivePanel] = useState('tableOfContents');
  const [panels, setPanels] = useState([
    { id: 'tableOfContents', content: <></> },
    { id: 'configuration', content: <ConfigPanel /> }
  ]);
  const [showPanel, setShowPanel] = useState(false);
  const sider = useRef<HTMLDivElement>(null);
  const [selectedKeys, setSelectedKeys] = useState(['']);
  const [siderWidth, setSiderWidth] = useState(200);
  const changingSiderWidth = useRef<Subscription>(new Subscription());
  const epubConfig = useConfig();
  const bookData = useBookData(book);

  useEffect(
    () =>
      setPanels(panels =>
        panels.map(panel =>
          panel.id === 'tableOfContents'
            ? { id: 'tableOfContents', content: <TableOfContents /> }
            : panel
        )
      ),
    [book]
  );

  useEffect(() => {
    const onMouseUp = () => changingSiderWidth.current.unsubscribe();
    window.addEventListener('mouseup', onMouseUp);
    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  const getCurrentPanel = () => {
    const panel = panels.find(({ id }) => id === activePanel);
    return panel ? panel.content : <></>;
  };

  const togglePanel = (key: string, id: string) => {
    if (showPanel) {
      if (id === activePanel) {
        setShowPanel(false);
        setSelectedKeys([]);
      } else {
        setSelectedKeys([key]);
        setActivePanel(id);
      }
    } else {
      setShowPanel(true);
      setSelectedKeys([key]);
      setActivePanel(id);
    }
  };

  const result = (
    <Layout
      className="screen"
      style={{
        maxHeight: '100%',
        display: 'grid',
        gridTemplateRows: 'max-content 1fr',
        minHeight: 0,
        minWidth: 0
      }}>
      <Header>
        <Menu mode="horizontal" selectedKeys={selectedKeys} style={{ display: 'flex' }}>
          <Menu.Item onClick={({ key }) => togglePanel(key, 'tableOfContents')}>
            <MenuOutlined />
          </Menu.Item>
          <Menu.Item onClick={({ key }) => togglePanel(key, 'configuration')}>
            <SettingOutlined />
          </Menu.Item>
          {discard && (
            <Menu.Item style={{ marginLeft: 'auto' }}>
              <CloseCircleFilled
                onClick={discard}
                style={{ fontSize: '2rem', verticalAlign: 'middle', color: 'red' }}
              />
            </Menu.Item>
          )}
        </Menu>
      </Header>
      <Layout style={{ overflow: 'hidden', backgroundColor: 'white' }}>
        <Sider width={showPanel ? siderWidth : 0} style={{ overflow: 'auto' }} theme="light">
          <div ref={sider}>{getCurrentPanel()}</div>
        </Sider>
        <Content
          style={{
            overflow: 'auto',
            display: 'grid',
            gridTemplateColumns: 'max-content 1fr'
          }}>
          <div
            style={{ width: showPanel ? '7px' : 0 }}
            className="draggable"
            onMouseDown={() => {
              changingSiderWidth.current = fromEvent<MouseEvent>(document, 'mousemove')
                .pipe<MouseEvent, MouseEvent>(
                  tap(event => event.preventDefault()),
                  throttleTime<MouseEvent>(100)
                )
                .subscribe(event => {
                  if (!sider.current) {
                    return;
                  }

                  const newWidth = event.clientX - sider.current.getBoundingClientRect().left;
                  if (newWidth >= 100 && newWidth < window.innerWidth) {
                    setSiderWidth(newWidth);
                  }
                });
            }}></div>
          <Book />
        </Content>
      </Layout>
    </Layout>
  );

  return (
    <ConfigContext.Provider value={epubConfig}>
      <BookContext.Provider value={book}>
        <BookDataContext.Provider value={bookData}>{result}</BookDataContext.Provider>
      </BookContext.Provider>
    </ConfigContext.Provider>
  );
};
