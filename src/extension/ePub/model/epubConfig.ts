export interface epubStyle {
  fontSize?: number;
  fontFamily?: {
    chinese?: string;
    english?: string;
  };
}

export interface epubSetting {
  last_focus_font_type?: string;
}

export interface epubConfig {
  style: epubStyle;
  setting: epubSetting;
}

export const default_epub_config: epubConfig = {
  style: {
    fontSize: 16,
    fontFamily: {
      chinese: '方正楷体'
    }
  },
  setting: {}
};

export const default_english_fonts = [
  '-apple-system',
  'BlinkMacSystemFont',
  'Segoe UI',
  'Roboto',
  'Helvetica',
  'Arial',
  'sans-serif',
  'Apple Color Emoji',
  'Segoe UI Emoji',
  'Segoe UI Symbol'
];
