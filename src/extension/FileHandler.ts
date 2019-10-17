export interface FileHandler {
  matcher: (filename: string) => boolean;
  processor: (path: string) => void;
}
