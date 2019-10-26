export interface fileHandler {
  matcher: (filename: string) => boolean;
  processor: (path: string) => void;
}
