import { useReducer } from 'react';

import { epubConfig, action, epubStyle } from '../../model/epubConfig';

const reducer = (state: epubConfig, action: action): epubConfig => {
  switch (action.type) {
    case 'init':
      return action.payload as epubConfig;
    case 'update fontSize':
      return { ...state, style: { fontSize: action.payload as number } };
    default:
      return state;
  }
};

export interface EpubConfigSetting {
  init: (payload: epubConfig) => void;
  style: epubStyle;
  updateFontSize: (payload: number) => void;
  fontSize: number;
}

export const useConfig = (): EpubConfigSetting => {
  const [state, dispatch] = useReducer(reducer, {} as epubConfig);

  const init = (payload: epubConfig) => dispatch({ type: 'init', payload });

  const updateFontSize = (payload: number) => dispatch({ type: 'update fontSize', payload });

  const style = state.style;

  const fontSize = style && style.fontSize;

  return { init, style, updateFontSize, fontSize };
};
