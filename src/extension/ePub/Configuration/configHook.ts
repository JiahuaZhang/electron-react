import { useReducer, useEffect } from 'react';

import { epubConfig, epubStyle, epubSetting, default_epub_config } from '../model/epubConfig';

const { ipcRenderer } = window.require('electron');

export enum ConfigType {
  init,
  update_last_focus_font_type,
  update_fontSize,
  update_chinese_font_family,
  update_english_font_family
}

export interface ConfigAction {
  type: ConfigType;
  payload?: number | string | epubConfig;
}

const reducer = (state: epubConfig, { type, payload }: ConfigAction): epubConfig => {
  const new_state = { ...state };
  switch (type) {
    case ConfigType.init:
      return payload as epubConfig;
    case ConfigType.update_last_focus_font_type:
      new_state.setting.last_focus_font_type = payload as string;
      return new_state;
    case ConfigType.update_fontSize:
      new_state.style.fontSize = payload as number;
      return new_state;
    case ConfigType.update_chinese_font_family:
      if (new_state.style.fontFamily) {
        new_state.style.fontFamily.chinese = payload as string;
      } else {
        new_state.style.fontFamily = { chinese: payload as string };
      }
      return new_state;
    case ConfigType.update_english_font_family:
      if (new_state.style.fontFamily) {
        new_state.style.fontFamily.english = payload as string;
      } else {
        new_state.style.fontFamily = { english: payload as string };
      }
      return new_state;
    default:
      return new_state;
  }
};

export interface EpubConfigSetting {
  config: epubConfig;
  dispatch: React.Dispatch<ConfigAction>;
  style: epubStyle;
  setting: epubSetting;
  fontSize?: number;
  chinese_font?: string;
  english_font?: string;
}

export const useConfig = (): EpubConfigSetting => {
  const [state, dispatch] = useReducer(reducer, {} as epubConfig);

  const { style, setting } = state;
  const fontSize = style?.fontSize;
  const chinese_font = style?.fontFamily?.chinese;
  const english_font = style?.fontFamily?.english;

  useEffect(() => {
    ipcRenderer.send('load epub config');
    ipcRenderer.once('load epub config', (event, config) => {
      if (!config) {
        dispatch({ type: ConfigType.init, payload: default_epub_config });
      } else {
        config = new TextDecoder('utf-8').decode(config);
        dispatch({ type: ConfigType.init, payload: JSON.parse(config) });
      }
    });
  }, [dispatch]);

  useEffect(() => {
    return () => {
      if (!state || !Object.keys(state).length) return;
      ipcRenderer.send('save epub config', JSON.stringify(state, null, 2));
    };
  }, [state]);

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
