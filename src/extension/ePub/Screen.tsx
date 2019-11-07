import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { fromEvent, Subscription } from 'rxjs';
import { throttleTime, tap } from 'rxjs/operators';

import './Screen.sass';
import { EPub } from './book.type';
import { TableOfContents } from './TableOfContents';
import { Book } from './Book';
import { BookContext } from './BookContext';

const { Header, Content, Sider } = Layout;

interface Props {
  book: EPub;
}

export const Screen: React.FC<Props> = ({ book }) => {
  const [tableOfContents, setTableOfContents] = useState(<TableOfContents tableOfContents={[]} />);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['']);
  const [siderWidth, setSiderWidth] = useState(200);
  const changingSiderWidth = useRef<Subscription>(new Subscription());

  useEffect(() => {
    setTableOfContents(<TableOfContents tableOfContents={book.toc} />);
  }, [book]);

  useEffect(() => {
    const onMouseUp = () => changingSiderWidth.current.unsubscribe();

    window.addEventListener('mouseup', onMouseUp);

    return () => window.removeEventListener('mouseup', onMouseUp);
  }, []);

  return (
    <BookContext.Provider value={book}>
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
          <Menu mode="horizontal" selectedKeys={selectedKeys}>
            <Menu.Item
              onClick={({ key }) => {
                if (showTableOfContents) {
                  setSelectedKeys([]);
                  setShowTableOfContents(false);
                } else {
                  setSelectedKeys([key]);
                  setShowTableOfContents(true);
                }
              }}>
              <Icon type="menu" />
            </Menu.Item>
          </Menu>
        </Header>
        <Layout style={{ overflow: 'hidden' }}>
          <Sider
            width={showTableOfContents ? siderWidth : 0}
            style={{ overflow: 'auto' }}
            theme="light">
            {tableOfContents}
          </Sider>
          <Content
            style={{
              overflow: 'auto',
              display: 'grid',
              gridTemplateColumns: 'max-content 1fr'
            }}>
            <div
              style={{ width: showTableOfContents ? '7px' : 0 }}
              className="draggable"
              onMouseDown={() => {
                changingSiderWidth.current = fromEvent<MouseEvent>(document, 'mousemove')
                  .pipe<MouseEvent, MouseEvent>(
                    tap(event => event.preventDefault()),
                    throttleTime<MouseEvent>(100)
                  )
                  .subscribe(event => {
                    if (event.clientX >= 100 && event.clientX < window.innerWidth) {
                      setSiderWidth(event.clientX);
                    }
                  });
              }}></div>
            <Book />
          </Content>
        </Layout>
      </Layout>
    </BookContext.Provider>
  );
};
