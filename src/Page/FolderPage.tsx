import React from 'react';

import { Files } from '../Component/Files/Files';
import { ePub } from '../extension/ePub/ePub';

interface Props {}

export const FolderPage: React.FC<Props> = () => {
  return (
    <div>
      <Files openFileHandlers={[ePub]} />
    </div>
  );
};
