export interface TextSelection {
  kind: 'text';
  path_to_start_container: number[];
  start_offset: number;
  path_to_end_container: number[];
  end_offset: number;
  color?: string;
}

export const getAdjustedNodePath = (
  parent: Node,
  child: Node,
  offset: number
): [number[], number] => {
  if (parent.firstChild?.nodeName === 'SPAN') {
    let current_node = parent.firstChild;

    while (!current_node.isEqualNode(child)) {
      if (current_node.contains(child)) {
        current_node = current_node.childNodes[0];
      } else {
        offset += current_node.textContent?.length as number;
        current_node = current_node.nextSibling as ChildNode;
      }
    }

    return [[0], offset];
  }

  for (const index in Array.from(parent.childNodes)) {
    const current = parent.childNodes[index];
    if (current.isEqualNode(child)) {
      return [[Number(index)], offset];
    }

    if (current.contains(child)) {
      const [path, adjusted_offset] = getAdjustedNodePath(current, child, offset);
      return [[Number(index), ...path], adjusted_offset];
    }
  }

  console.error(parent, child, offset);
  throw Error('Unreachable case for getAdjustedNodePath!');
};

export const getAdjustedNode = (parent: Node, path: number[], offset: number): [Node, number] => {
  let current = path.reduce((node, index) => node.childNodes[index], parent);

  if (current.nodeName === 'SPAN') {
    while (current.hasChildNodes() || offset > (current.textContent?.length as number)) {
      if (offset <= (current.textContent?.length as number)) {
        current = current.firstChild as Node;
      } else {
        offset -= current.textContent?.length as number;
        current = current.nextSibling as Node;
      }
    }
    return [current, offset];
  }

  return [current, offset];
};

export const textSelection = (range: Range, node: Node) => {
  const textSelection = { kind: 'text' } as TextSelection;

  let [path, adjusted_offset] = getAdjustedNodePath(node, range.startContainer, range.startOffset);
  textSelection.path_to_start_container = path;
  textSelection.start_offset = adjusted_offset;

  [path, adjusted_offset] = getAdjustedNodePath(node, range.endContainer, range.endOffset);
  textSelection.path_to_end_container = path;
  textSelection.end_offset = adjusted_offset;

  return textSelection;
};

export const getRange = (document: Document, highlight: TextSelection, parent: Node) => {
  if (!highlight) return;

  const [start_container, start_offset] = getAdjustedNode(
    parent,
    highlight.path_to_start_container,
    highlight.start_offset
  );
  const [end_container, end_offset] = getAdjustedNode(
    parent,
    highlight.path_to_end_container,
    highlight.end_offset
  );

  const range = document.createRange();
  range.setStart(start_container, start_offset);
  range.setEnd(end_container, end_offset);

  return range;
};

export const highlightSelection = (
  document: Document,
  textSelection: TextSelection,
  parent: Node
) => {
  const range = getRange(document, textSelection, parent);
  if (!range) return;

  const selection = document.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
  selection.addRange(range);

  document.designMode = 'on';
  document.execCommand('backColor', false, textSelection.color);
  document.designMode = 'off';
};

export const isSameRange = (range1: TextSelection, range2: TextSelection) => {
  return (
    range1.start_offset === range2.start_offset &&
    range1.end_offset === range2.end_offset &&
    range1.path_to_start_container.join('') === range2.path_to_start_container.join('') &&
    range1.path_to_end_container.join('') === range2.path_to_end_container.join('')
  );
};

export const isClickInside = (parent: Node, target: Node, highlight: TextSelection) => {
  const [path, offset] = getAdjustedNodePath(parent, target, 0);
  if (path.join(',') === highlight.path_to_start_container.join(',')) {
    if (offset === highlight.start_offset) {
      return true;
    } else if (offset < highlight.start_offset) {
      return false;
    }
  }

  if (path.join(',') === highlight.path_to_end_container.join(',')) {
    if (offset < highlight.end_offset) {
      return true;
    } else if (offset >= highlight.end_offset) {
      return false;
    }
  }

  let is_after_start = false;
  for (let i = 0; i < path.length; ++i) {
    if (path[i] > highlight.path_to_start_container[i]) {
      is_after_start = true;
      break;
    } else if (path[i] < highlight.path_to_start_container[i]) {
      break;
    }
  }

  if (!is_after_start) {
    return false;
  }

  let is_before_end = false;
  for (let i = 0; i < path.length; ++i) {
    if (path[i] < highlight.path_to_end_container[i]) {
      is_before_end = true;
      break;
    } else if (path[i] > highlight.path_to_end_container[i]) {
      break;
    }
  }

  return is_before_end;
};

export const textSelectionCompare = (a: TextSelection, b: TextSelection) => {
  for (let i = 0; i < a.path_to_start_container.length; ++i) {
    if (a.path_to_start_container[i] !== b.path_to_start_container[i]) {
      return a.path_to_start_container[i] - b.path_to_start_container[i];
    }
  }

  if (a.path_to_start_container.length !== b.path_to_start_container.length) {
    return a.path_to_start_container.length - b.path_to_start_container.length;
  }

  if (a.start_offset !== b.start_offset) {
    return a.start_offset - b.start_offset;
  }

  for (let i = 0; i < a.path_to_end_container.length; ++i) {
    if (a.path_to_end_container[i] !== b.path_to_end_container[i]) {
      return a.path_to_end_container[i] - b.path_to_end_container[i];
    }
  }

  if (a.path_to_end_container.length !== b.path_to_end_container.length) {
    return a.path_to_end_container.length - b.path_to_end_container.length;
  }

  return a.end_offset - b.end_offset;
};
