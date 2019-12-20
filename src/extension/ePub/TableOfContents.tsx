import React from 'react';
import { Menu } from 'antd';

import { TocElement } from './model/book.type';
import { BookContext } from './bookContext';
import { BookDataContext } from './Data/bookDataContext';
import { BookDataType } from './Data/bookDataHook';

const { SubMenu } = Menu;

interface Props {}

interface content {
  title: string;
  href: string;
  children: content[];
}

const filterDuplicateContent = (contents: TocElement[]): TocElement[] => {
  const result: TocElement[] = [];
  const keys = new Set();
  contents.forEach(content => {
    if (!keys.has(content.id)) {
      keys.add(content.id);
      result.push(content);
    }
  });
  return result;
};

const getNestedContents = (contents: TocElement[]): content[] => {
  const tracker: content[] = [];
  const result: content[] = [];
  contents.forEach(({ href, title, level }) => {
    const current = { href, title, children: [] };
    if (!tracker[level - 1]) {
      result.push(current);
    } else {
      tracker[level - 1].children.push(current);
    }
    tracker[level] = current;
  });
  return result;
};

export const TableOfContents: React.FC<Props> = () => {
  const book = React.useContext(BookContext);
  const { dispatch } = React.useContext(BookDataContext);
  const contents = getNestedContents(filterDuplicateContent(book.toc));

  const renderContents = (content: content): JSX.Element => {
    const { href, title, children } = content;
    if (children.length) {
      return (
        <SubMenu
          title={title}
          key={href}
          onTitleClick={({ key }) => {
            dispatch({ type: BookDataType.update_page, payload: key });
          }}>
          {children.map(renderContents)}
        </SubMenu>
      );
    } else {
      return <Menu.Item key={href}>{title}</Menu.Item>;
    }
  };

  return (
    <Menu
      onClick={({ key }) => {
        dispatch({ type: BookDataType.update_page, payload: key });
      }}
      mode="inline">
      {contents.map(renderContents)}
    </Menu>
  );
};
