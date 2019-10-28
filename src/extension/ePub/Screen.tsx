import React, { useState, useEffect } from 'react';
import { Layout, Menu } from 'antd';

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

  return (
    <Layout className="header">
      <Header>
        <Menu mode="horizontal">
          <Menu.Item>table of contents</Menu.Item>
        </Menu>
      </Header>
      <Layout>
        <Sider>{tableOfContents}</Sider>
        <Content>{cover}</Content>
      </Layout>
    </Layout>
  );
};
