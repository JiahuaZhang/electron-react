import React from 'react';

import { FontSizeConfig } from './FontSizeConfig';
import { FontFamily } from './FontFamily';

interface Props {}

export const ConfigPanel: React.FC<Props> = () => {
  return (
    <div>
      <FontSizeConfig />
      <FontFamily />
    </div>
  );
};
