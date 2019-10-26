interface metadata {
  ISBN: string;
  UUID: string;
  'calibre:timestamp': string;
  'calibre:title_sort': string;
  cover: string;
  creator: string;
  creatorFileAs: string;
  date: string;
  language: string;
  publisher: string;
  title: string;
  'calibre:author_link_map'?: string;
  'primary-writing-mode'?: string;
}

interface manifest {
  href: string;
  id: string;
  'media-type': string;
  level?: number;
  order?: number;
  title?: number;
}

export interface TocElement {
  level: number;
  order: number;
  title: string;
  id: string;
  href?: string;
}

export interface EPub {
  metadata: metadata;
  manifest: { [key: string]: manifest };
  spine: {
    contents: manifest[];
    toc: { href: string; title: string; type: string };
  };
  flow: manifest[];
  toc: TocElement[];
  containerFile: string;
  filename: string;
  guide: { href: string; title: string; type: string }[];
  imageroot: string;
  linkroot: string;
  mimeFile: string;
  rootFile: string;

  parse(): void;

  getChapter(chapterId: string, callback: (error: Error, text: string) => void): void;

  getChapterRaw(chapterId: string, callback: (error: Error, text: string) => void): void;

  getImage(id: string, callback: (error: Error, data: Buffer, mimeType: string) => void): void;

  getFile(id: string, callback: (error: Error, data: Buffer, mimeType: string) => void): void;

  on(event: string, callback: () => void): void;
}
