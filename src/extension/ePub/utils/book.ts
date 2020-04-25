import { EPub } from '../model/book.type';

const { ipcRenderer } = window.require('electron');

export const redirectedHref = (book: EPub, href: string): Promise<string> =>
  new Promise<string>((res) => {
    const fileName = href.split('/').pop() || '';
    if (!Object.values(book.manifest).find((m) => m.href.includes(fileName))) {
      res(href);
    }

    ipcRenderer.send('resource loaded?', book.metadata.title, fileName);
    ipcRenderer.once(`${book.metadata.title}/${fileName} loaded`, () =>
      res(`assets/${book.metadata.title}/${fileName}`)
    );
  });

export const transformHtml = async (book: EPub, text: string) => {
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

  return text;
};
