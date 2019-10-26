const audio = ['mp3', 'wav', 'aac', 'ogg', 'flac'];

const code = [
  'js',
  'ts',
  'jsx',
  'tsx',
  'cpp',
  'c',
  'c++',
  'python',
  'python3',
  'html',
  'css',
  'sass',
  'scss',
  'json',
  'jsonc',
  'rb',
  'java',
  'cs',
  'go',
  'bat',
  'clj',
  'cljs',
  'cljc',
  'edn',
  'coffee',
  'groovy',
  'less',
  'lua',
  'h',
  'm',
  'mm',
  'php',
  'pl',
  'r',
  'rs',
  'rlib',
  'sql',
  'swift',
  'xml',
  'yml'
];

const compressed = ['zip', 'tar', 'rar', 'jar', 'war'];

const font = ['otf', 'ttf', 'fnt'];

const image = ['tiff', 'png', 'jpg', 'jpeg', 'gif', 'psd', 'eps', 'ai'];

const spreadsheet = ['docx', 'xls', 'xlt', 'xlm', 'xlsx', 'xlsm', 'xltx', 'ppt', 'pptx', 'pub', 'xps'];

const video = ['mp4', 'webm', 'mkv', 'flv', 'vob', 'ogv', 'ogg', 'avi', 'wmv', 'rm', 'rmvb', 'mpg', '3gp', ''];

export const getType = (filename: string): string => {
  const name = filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
  const mapping = {};

  Object.entries({
    audio,
    code,
    compressed,
    font,
    image,
    spreadsheet,
    video
  }).forEach(([key, values]) => {
    values.forEach(value => (mapping[value] = key));
  });

  return mapping[name];
};
