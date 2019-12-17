import { useReducer } from 'react';

import {
  epubConfig,
  action,
  epubStyle,
  epubSetting,
  default_epub_config
} from '../model/epubConfig';

const reducer = (state: epubConfig, act: action): epubConfig => {
  const new_state = { ...state };
  switch (act.type) {
    case 'init':
      return act.payload as epubConfig;
    case 'update last focus font type':
      new_state.setting.last_focus_font_type = act.payload as string;
      return new_state;
    case 'update fontSize':
      new_state.style.fontSize = act.payload as number;
      return new_state;
    case 'update chinese font family':
      if (new_state.style.fontFamily) {
        new_state.style.fontFamily.chinese = act.payload as string;
      } else {
        new_state.style.fontFamily = { chinese: act.payload as string };
      }
      return new_state;
    case 'update english font family':
      if (new_state.style.fontFamily) {
        new_state.style.fontFamily.english = act.payload as string;
      } else {
        new_state.style.fontFamily = { english: act.payload as string };
      }
      return new_state;
    default:
      return new_state;
  }
};

export interface EpubConfigSetting {
  config: epubConfig;
  dispatch: React.Dispatch<action>;
  style: epubStyle;
  setting: epubSetting;
  fontSize?: number;
  chinese_font?: string;
  english_font?: string;
}

export const useConfig = (): EpubConfigSetting => {
  const [state = default_epub_config, dispatch] = useReducer(reducer, {} as epubConfig);

  const { style, setting } = state;
  const fontSize = style?.fontSize;
  const chinese_font = style?.fontFamily?.chinese;
  const english_font = style?.fontFamily?.english;

  return {
    config: state,
    dispatch,
    style,
    setting,
    fontSize,
    chinese_font,
    english_font
  };
};
