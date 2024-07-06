import parseAttributes from './parseAttributes';
import Static from './Static';
import { trimWhitespace } from '..';
import { Text, Element, Comment } from '@actual-dom/shared';
import { parseJSX, isElement, isText, isComment } from '.';
import type { Config, ElementInfo, ElementDynamic } from '.';
import type { NodePath } from '@babel/core';
import type { JSXElement } from '@babel/types';

const map = new WeakMap<NodePath[], number>();

export default (
  path: NodePath<JSXElement>,
  config: Config,
  tag: string,
  staticNode: Static | false,
  indexArr: number[] = [],
  dynamic?: ElementDynamic,
): ElementInfo => {
  const node = staticNode || new Static(tag);
  const attrs = parseAttributes(path, node);
  return {
    type: Element,
    tag,
    static: node,
    dynamic: path.get('children').reduce(
      (children, childPath, index, arr) => {
        const i = map.get(arr);
        const dynamicIndex = i === undefined ? index : i + 1;
        const indexArray = (indexArr || []).concat(dynamicIndex);
        const info = parseJSX(childPath, config, new Static(), indexArray, children);
        map.set(arr, dynamicIndex);

        if (isElement(info)) {
          const childNode = new Static(info.tag, info.static.props, info.static.children);
          node.children.push(childNode);

          const attributes = parseAttributes(childPath as NodePath<JSXElement>, childNode);
          attributes.length && children.push([attributes, indexArray]);
        } else if (isText(info)) {
          const value = config.whitespace ? info.value : trimWhitespace(info.value);
          const append = () =>
            value
              ? node.children.push(new Static(Text, undefined, [value]))
              : map.set(arr, dynamicIndex - 1);

          config.pureText
            ? /^[\r\n]\s*$/.test(info.value)
              ? map.set(arr, dynamicIndex - 1)
              : append()
            : append();
        } else if (isComment(info)) {
          info.value.forEach(comment =>
            node.children.push(new Static(Comment, undefined, [comment])),
          );
        } else {
          children.push([info, indexArray]);
          node.children.push(new Static(Comment));
        }

        return children;
      },
      dynamic || (attrs.length ? [[attrs, []]] : []),
    ),
    path,
  };
};
