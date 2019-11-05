import React, { useState, useEffect, useRef } from 'react';
import { Layout, Menu, Icon } from 'antd';

import './Screen.sass';
import { EPub } from './book.type';
import { TableOfContents } from './TableOfContents';

const { Header, Content, Sider } = Layout;
const img = (data: Buffer, mimeType: string, alt: string) => (
  <img alt={alt} src={`data:${mimeType};base64, ${data.toString('base64')}`} />
);

interface Props {
  book: EPub;
}

export const Screen: React.FC<Props> = ({ book }) => {
  const [cover, setCover] = useState(<img alt="" />);
  const [tableOfContents, setTableOfContents] = useState(<TableOfContents tableOfContents={[]} />);
  const [showTableOfContents, setShowTableOfContents] = useState(false);
  const [selectedKeys, setSelectedKeys] = useState(['']);
  const [siderWidth, setSiderWidth] = useState(200);
  const isResizing = useRef(false);

  useEffect(() => {
    book.getImage(book.metadata.cover, (err, data, mimeType) => {
      if (err) {
        console.error(err);
        return;
      }

      if (data) setCover(img(data, mimeType, 'cover'));
    });

    setTableOfContents(<TableOfContents tableOfContents={book.toc} />);
  }, [book]);

  useEffect(() => {
    const onMouseUp = () => (isResizing.current = false);
    const resizeSider = event => {
      if (isResizing.current) {
        event.preventDefault();
        if (event.clientX >= 100) {
          setSiderWidth(event.clientX);
        }
      }
    };
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', resizeSider);

    return () => {
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', resizeSider);
    };
  }, []);

  return (
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
        {showTableOfContents && (
          <Sider width={siderWidth} style={{ overflow: 'auto' }} theme="light">
            {tableOfContents}
          </Sider>
        )}
        <Content style={{ overflow: 'auto', display: 'grid', gridTemplateColumns: '7px 1fr' }}>
          <div className="draggable" onMouseDown={() => (isResizing.current = true)}></div>
          {cover}
        </Content>
      </Layout>
    </Layout>
  );
};
