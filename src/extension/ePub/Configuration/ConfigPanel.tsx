import React from 'react';

import { FontSizeConfig } from './FontSizeConfig';

interface Props {}

export const ConfigPanel: React.FC<Props> = () => {
  return (
    <div>
      <FontSizeConfig />
    </div>
  );
};
