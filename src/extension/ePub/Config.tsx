import { useReducer, useCallback } from 'react';

import { epubConfig, action, epubStyle } from '../../model/epubConfig';

const reducer = (state: epubConfig, act: action): epubConfig => {
  switch (act.type) {
    case 'init':
      return act.payload as epubConfig;
    case 'update fontSize':
      return { ...state, style: { fontSize: act.payload as number } };
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

  return {
    init: useCallback(init, []),
    style,
    updateFontSize: useCallback(updateFontSize, []),
    fontSize
  };
};
