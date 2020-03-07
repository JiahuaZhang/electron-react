export interface HighlightSection {
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

export const highlightSelection = (
  document: Document,
  highlight: HighlightSection,
  parent: Node
) => {
  if (!highlight || !highlight) return;

  const selection = document.getSelection();
  if (!selection) return;

  selection.removeAllRanges();
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

  selection.addRange(range);

  document.designMode = 'on';
  document.execCommand('backColor', false, highlight.color);
  document.designMode = 'off';
};

export const isSameRange = (range1: HighlightSection, range2: HighlightSection) => {
  return (
    range1.start_offset === range2.start_offset &&
    range1.end_offset === range2.end_offset &&
    range1.path_to_start_container.join('') === range2.path_to_start_container.join('') &&
    range1.path_to_end_container.join('') === range2.path_to_end_container.join('')
  );
};
