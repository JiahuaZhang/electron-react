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

export interface action {
  type:
    | 'init'
    | 'update last focus font type'
    | 'update fontSize'
    | 'update chinese font family'
    | 'update english font family';
  payload: number | string | epubConfig;
}
