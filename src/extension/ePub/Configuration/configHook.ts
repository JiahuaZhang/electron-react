import { useReducer, useCallback } from 'react';

import { epubConfig, action, epubStyle, epubSetting } from '../../../model/epubConfig';

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
  style: epubStyle;
  setting: epubSetting;
  fontSize?: number;
  chinese_font?: string;
  english_font?: string;
  init: (payload: epubConfig) => void;
  updateLastFocusFont: (payload: string) => void;
  updateFontSize: (payload: number) => void;
  updateChineseFont: (payload: string) => void;
  updateEnglishFont: (payload: string) => void;
}

const default_epub_config: epubConfig = {
  style: {
    fontSize: 16,
    fontFamily: {}
  },
  setting: {}
};

export const useConfig = (): EpubConfigSetting => {
  const [state = default_epub_config, dispatch] = useReducer(reducer, {} as epubConfig);

  const { style, setting } = state;
  const fontSize = style && style.fontSize;
  const chinese_font = style && style.fontFamily && style.fontFamily.chinese;
  const english_font = style && style.fontFamily && style.fontFamily.english;

  const init = (payload: epubConfig) => dispatch({ type: 'init', payload });
  const updateLastFocusFont = (payload: string) =>
    dispatch({ type: 'update last focus font type', payload });
  const updateFontSize = (payload: number) => dispatch({ type: 'update fontSize', payload });
  const updateChineseFont = (payload: string) =>
    dispatch({ type: 'update chinese font family', payload });
  const updateEnglishFont = (payload: string) =>
    dispatch({ type: 'update english font family', payload });

  return {
    config: state,
    style,
    setting,
    fontSize,
    chinese_font,
    english_font,
    init: useCallback(init, []),
    updateLastFocusFont: useCallback(updateLastFocusFont, []),
    updateFontSize: useCallback(updateFontSize, []),
    updateChineseFont: useCallback(updateChineseFont, []),
    updateEnglishFont: useCallback(updateEnglishFont, [])
  };
};
