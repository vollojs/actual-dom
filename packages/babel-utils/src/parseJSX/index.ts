import parseElement from './parseElement';
import parseFragment from './parseFragment';
import Static from './Static';
import { isComponentTag, jsxElementNameToString } from '..';
import { Element, Component, Text, Fragment, Expression, Comment } from '@actual-dom/shared';
import type { Expression as ExpressionType } from '@babel/types';
import type { Node, NodePath } from '@babel/core';
import type { Binding } from '@babel/traverse';
import parseComponent from './parseComponent';

type Evaluate = () => {
  confident: boolean;
  value: any;
  deopt?: NodePath;
};
type GetBinding = () => false | undefined | Binding;

export interface Prop {
  key: string;
  value: ExpressionType;
  path: NodePath;
  evaluate: Evaluate;
  getBinding: GetBinding;
}
export interface SpreadProp {
  key: ExpressionType;
  value?: undefined;
  path: NodePath;
  evaluate: Evaluate;
  getBinding: GetBinding;
}
export type Props = (Prop | SpreadProp)[];

export type ElementDynamic = [Props | JSXInfo, number[]][];
export type ElementInfo = {
  type: typeof Element;
  tag: string;
  static: Static;
  dynamic: ElementDynamic;
  path: NodePath;
};
export interface ComponentInfo {
  type: typeof Component;
  tag: ExpressionType;
  static: {
    props: [string, string][];
    children: [string, number][];
  };
  dynamic: {
    props: Props;
    children: [JSXInfo, number][];
  };
  path: any;
}
export interface TextInfo {
  type: typeof Text;
  value: string;
  path: NodePath;
}
export interface FragmentInfo {
  type: typeof Fragment;
  staticChildren: [string, number][];
  dynamicChildren: [JSXInfo, number][];
  path: NodePath;
}
export interface ExpressionInfo {
  type: typeof Expression;
  value: Node;
  path: NodePath;
}
export interface CommentInfo {
  type: typeof Comment;
  path: NodePath;
  value: string[];
}
export type JSXInfo =
  | ElementInfo
  | ComponentInfo
  | TextInfo
  | FragmentInfo
  | ExpressionInfo
  | CommentInfo;

export const isElement = (info: JSXInfo): info is ElementInfo => info.type === Element;
export const isComponent = (info: JSXInfo): info is ComponentInfo => info.type === Component;
export const isText = (info: JSXInfo): info is TextInfo => info.type === Text;
export const isComment = (info: JSXInfo): info is CommentInfo => info.type === Comment;
export const isFragment = (info: JSXInfo): info is FragmentInfo => info.type === Fragment;
export const isExpression = (info: JSXInfo): info is ExpressionInfo => info.type === Expression;

export interface Config {
  pureText?: boolean;
  whitespace?: boolean;
}
export const parseJSX = (
  path: NodePath,
  config: Config = {
    pureText: true,
    whitespace: false,
  },
  staticNode?: Static | [string, number][],
  indexArr?: number[],
  dynamic?: ElementDynamic,
): JSXInfo => {
  if (path.isJSXElement()) {
    const tag = jsxElementNameToString(path.get('openingElement.name') as NodePath);
    return isComponentTag(tag)
      ? parseComponent(path, config, tag)
      : parseElement(
          path,
          config,
          tag,
          staticNode instanceof Static && staticNode,
          indexArr,
          dynamic,
        );
  } else if (path.isJSXText()) {
    return {
      type: Text,
      path,
      value: path.node.value,
    };
  } else if (path.isJSXFragment()) {
    return parseFragment(path, config);
  } else if (path.isJSXExpressionContainer()) {
    const expression = path.get('expression');
    return expression.isJSXEmptyExpression()
      ? {
          type: Comment,
          path,
          value: expression.node.innerComments!.map(({ value }) => value),
        }
      : {
          type: Expression,
          path,
          value: expression.node,
        };
  } else {
    throw new Error();
  }
};
