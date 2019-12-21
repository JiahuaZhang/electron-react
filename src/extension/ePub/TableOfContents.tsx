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
  const {
    dispatch,
    state: { page }
  } = React.useContext(BookDataContext);
  const contents = getNestedContents(filterDuplicateContent(book.toc));

  const navigate = ({ key }: { key: string }) => {
    const pageIndex = book.flow.findIndex(({ href }) => key.includes(href));
    dispatch({
      type: BookDataType.update_page,
      payload: {
        page: key,
        pageIndex
      }
    });
  };

  const renderContents = (content: content): JSX.Element => {
    const { href, title, children } = content;
    if (children.length) {
      return (
        <SubMenu
          style={{ color: href.includes(page) ? '#1890ff' : '' }}
          title={title}
          key={href}
          onTitleClick={navigate}>
          {children.map(renderContents)}
        </SubMenu>
      );
    } else {
      return <Menu.Item key={href}>{title}</Menu.Item>;
    }
  };

  const getSelectedKey = (page: string) => {
    const key = book.toc.filter(({ href }) => href.includes(page));
    if (key.length === 1) {
      return [key[0].href];
    }
    return [page];
  };

  const selected_key = getSelectedKey(page);

  return (
    <Menu selectedKeys={selected_key} onClick={navigate} mode="inline">
      {contents.map(renderContents)}
    </Menu>
  );
};
