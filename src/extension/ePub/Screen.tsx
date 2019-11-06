import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Icon } from 'antd';
import { fromEvent } from 'rxjs';
import { throttleTime } from 'rxjs/operators';

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
  const isResizing = useRef(false);

  useEffect(() => {
    setTableOfContents(<TableOfContents tableOfContents={book.toc} />);
  }, [book]);

  useEffect(() => {
    const subscription = fromEvent(document, 'mousemove')
      .pipe(throttleTime(100))
      .subscribe((event: any) => {
        if (isResizing.current) {
          if (event.clientX >= 100 && event.clientX < window.innerWidth) {
            setSiderWidth(event.clientX);
          }
        }
      });

    const onMouseUp = () => (isResizing.current = false);
    const resizeSider = event => {
      if (isResizing.current) {
        event.preventDefault();
      }
    };
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', resizeSider);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', resizeSider);
      subscription.unsubscribe();
    };
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
              onMouseDown={() => (isResizing.current = true)}></div>
            <Book />
          </Content>
        </Layout>
      </Layout>
    </BookContext.Provider>
  );
};
