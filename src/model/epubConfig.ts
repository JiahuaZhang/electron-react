export interface epubStyle {
  fontSize: number;
}

export interface epubConfig {
  style: epubStyle;
}

export interface action {
  type: 'update fontSize' | 'init';
  payload: number | string | epubConfig;
}
