interface TocElement {
  level: number;
  order: number;
  title: string;
  id: string;
  href?: string;
}

export interface EPub {
  metadata: Object;
  manifest: Object;
  spine: Object;
  flow: Object[];
  toc: TocElement[];

  parse(): void;

  getChapter(chapterId: string, callback: (error: Error, text: string) => void): void;

  getChapterRaw(chapterId: string, callback: (error: Error, text: string) => void): void;

  getImage(id: string, callback: (error: Error, data: Buffer, mimeType: string) => void): void;

  getFile(id: string, callback: (error: Error, data: Buffer, mimeType: string) => void): void;
}
