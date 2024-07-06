import parseAttributes from './parseAttributes';
import parseChildren from './parseChildren';
import {
  identifier,
  memberExpression,
  type JSXElement,
  type Expression,
  type Identifier,
} from '@babel/types';
import { Component } from '@actual-dom/shared';
import type { ComponentInfo, CommentInfo, Config } from '.';
import type { NodePath } from '@babel/core';

export default (path: NodePath<JSXElement>, config: Config, tag: string): ComponentInfo => {
  const props: [string, string][] = [];
  const children: (string | CommentInfo)[] = [];
  return {
    type: Component,
    tag: tag.includes('.')
      ? (tag
          .split('.')
          .reduce(
            (prev, cur, index) =>
              memberExpression(
                index === 1 ? identifier(prev) : (prev as unknown as Identifier),
                identifier(cur),
              ) as unknown as string,
          ) as unknown as Expression)
      : identifier(tag),
    static: {
      props,
      children,
    },
    dynamic: {
      props: parseAttributes(path, props),
      children: parseChildren(path, config, children),
    },
    path,
  };
};
