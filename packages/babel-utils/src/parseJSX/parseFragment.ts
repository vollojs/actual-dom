import { Fragment } from '@actual-dom/shared';
import parseChildren from './parseChildren';
import type { NodePath } from '@babel/core';
import type { JSXFragment } from '@babel/types';
import type { Config, FragmentInfo } from '.';

export default (path: NodePath<JSXFragment>, config: Config): FragmentInfo => {
  const staticChildren = <[string, number][]>[];
  return {
    type: Fragment,
    path,
    staticChildren,
    dynamicChildren: parseChildren(path, config, staticChildren),
  };
};
