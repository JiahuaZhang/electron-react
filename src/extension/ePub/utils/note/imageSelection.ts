export interface ImageSelection {
  kind: 'image';
  path: number[];
}

export const imageSelection = (parent: Node, image: Node): ImageSelection => {
  let current = parent;
  const path: number[] = [];
  while (!current.isSameNode(image) && parent.contains(image)) {
    for (let index = 0; index < current.childNodes.length; ++index) {
      if (current.childNodes[index].contains(image)) {
        path.push(index);
        current = current.childNodes[index];
        break;
      }
    }
  }

  return { kind: 'image', path };
};

export const getImageNode = (imageSelection: ImageSelection, parent: Node) => {
  return imageSelection.path.reduce((current, p) => current.childNodes[p], parent);
};

export const imageSelectionCompare = (a: ImageSelection, b: ImageSelection) => {
  const length = Math.min(a.path.length, b.path.length);
  for (let index = 0; index < length; index++) {
    if (a.path[index] !== b.path[index]) {
      return a.path[index] - b.path[index];
    }
  }

  return a.path.length - b.path.length;
};
