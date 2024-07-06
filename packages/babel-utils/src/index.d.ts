import type { Expression as ExpressionType, Identifier, VariableDeclaration } from '@babel/types';
import { Element, Component, Text, Fragment, Expression, Comment } from '@actual-dom/shared';

type Evaluate = () => {
  confident: boolean;
  value: any;
  deopt?: any;
};
type GetBinding = () => any;

export interface TemplateConfig {
  encode?: boolean;
  comments?: boolean;
}
export interface Static {
  type: typeof Text | typeof Comment | string;
  props: [string, string][];
  children: (Static | string)[];
  toString(config: TemplateConfig): string;
}

export interface Prop {
  key: string;
  value: ExpressionType;
  path: any;
  evaluate: Evaluate;
  getBinding: GetBinding;
}
export interface SpreadProp {
  key: ExpressionType;
  value?: undefined;
  path: any;
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
  path: any;
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
  path: any;
}
export interface FragmentInfo {
  type: typeof Fragment;
  staticChildren: [string, number][];
  dynamicChildren: [JSXInfo, number][];
  path: any;
}
export interface ExpressionInfo {
  type: typeof Expression;
  value: Node;
  path: any;
}
export interface CommentInfo {
  type: typeof Comment;
  value: string[];
  path: any;
}
export type JSXInfo =
  | ElementInfo
  | ComponentInfo
  | TextInfo
  | FragmentInfo
  | ExpressionInfo
  | CommentInfo;

export const registerImportMethod: (path: any, name: string, moduleName: string) => Identifier;
export const isComponentTag: (tagName: string) => boolean;
export const jsxElementNameToString: (path: any) => string;
export const trimWhitespace: (text: string) => string;
export const getRootPath: (path: any) => any;
export const rootUnshift: (path: any, expression: VariableDeclaration) => VariableDeclaration;

export const isElement: (info: JSXInfo) => info is ElementInfo;
export const isComponent: (info: JSXInfo) => info is ComponentInfo;
export const isText: (info: JSXInfo) => info is TextInfo;
export const isFragment: (info: JSXInfo) => info is FragmentInfo;
export const isExpression: (info: JSXInfo) => info is ExpressionInfo;

export interface Config {
  pureText?: boolean;
  whitespace?: boolean;
}
export const parseJSX: (
  staticNode?: Static | [string, number][],
  config?: Config,
  indexArr?: number[],
  dynamic?: ElementDynamic,
) => JSXInfo;
