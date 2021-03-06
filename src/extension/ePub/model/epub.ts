export interface fileIconProps {
  color?: string;
  extension?: string;
  fold?: boolean;
  foldColor?: string;
  glyphColor?: string;
  gradientColor?: string;
  gradientOpacity?: number;
  labelColor?: string;
  labelTextColor?: string;
  labelTextStyle?: object;
  labelUppercase?: boolean;
  radius?: number;
  size?: number;
  type?: string;
  key?: string;
  parentPath: string;
  filename: string;
}

export interface fileHandler {
  matcher: (filename: string) => boolean;
  processor: (path: string) => void;
}

export interface controller {
  render: (content: JSX.Element, title?: string) => void;
  discard?: () => void;
}
