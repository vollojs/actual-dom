import { parseJSX, isText, isComment, type JSXInfo, type Config } from '.';
import { trimWhitespace } from '..';
import type { JSXElement, JSXFragment } from '@babel/types';
import type { NodePath } from '@babel/core';

export default (
  path: NodePath<JSXElement | JSXFragment>,
  config: Config,
  staticChildren: [string | string[], number][],
) =>
  path.get('children').reduce(
    (dynamicChildren, childPath, index) => {
      const info = parseJSX(childPath, config);

      if (isText(info)) {
        const value = config.whitespace ? info.value : trimWhitespace(info.value);
        const append = () => value && staticChildren.push([value, index]);
        config.pureText ? /^[\r\n]\s*$/.test(info.value) || append() : append();
      } else if (isComment(info)) {
        // do nothing
      } else {
        dynamicChildren.push([info, index]);
      }

      return dynamicChildren;
    },
    [] as [JSXInfo, number][],
  );
