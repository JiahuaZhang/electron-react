import React from 'react';
import { Menu } from 'antd';

import { TocElement } from './book.type';

const { SubMenu } = Menu;

interface Props {
  tableOfContents: TocElement[];
}

interface content {
  title: string;
  children: content[];
}

const getNestedContents = (contents: TocElement[]): content[] => {
  const tracker: content[] = [];
  const result: content[] = [];
  contents.forEach(({ title, level }) => {
    const current = { title, children: [] };
    if (!tracker[level - 1]) {
      result.push(current);
    } else {
      tracker[level - 1].children.push(current);
    }
    tracker[level] = current;
  });
  return result;
};

const renderContents = (content: content): JSX.Element => {
  const { title, children } = content;
  if (children.length) {
    return (
      <SubMenu title={title} key={title}>
        {children.map(renderContents)}
      </SubMenu>
    );
  } else {
    return <Menu.Item key={title}>{title}</Menu.Item>;
  }
};

export const TableOfContents: React.FC<Props> = ({ tableOfContents }) => {
  const contents = getNestedContents(tableOfContents);
  return <Menu mode="inline">{contents.map(renderContents)}</Menu>;
};
