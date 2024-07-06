import { cloneNode, type VariableDeclaration, type Identifier } from '@babel/types';
import { addNamed } from '@babel/helper-module-imports';
import type { NodePath } from '@babel/core';
import type { Scope } from '@babel/traverse';

const importsMap = new WeakMap<Scope, Record<string, Identifier>>();
export const registerImportMethod = (path: NodePath, name: string, moduleName: string) => {
  const programParent = path.scope.getProgramParent();
  importsMap.has(programParent) || importsMap.set(programParent, {});
  const imports = importsMap.get(programParent)!;
  const key = `${moduleName}:${name}`;

  return imports[key]
    ? cloneNode(imports[key])
    : (imports[key] = addNamed(path, name, moduleName, { nameHint: '_' + name }) as Identifier);
};

export const isComponentTag = (tagName: string) =>
  (tagName[0] && tagName[0].toLowerCase() !== tagName[0]) ||
  tagName.includes('.') ||
  /[^a-zA-Z]/.test(tagName[0]);

export const jsxElementNameToString = (path: NodePath): string => {
  const { node } = path as any;
  if (path.isJSXMemberExpression())
    return `${jsxElementNameToString(path.get('object'))}.${node.property.name}`;
  if (path.isJSXIdentifier() || path.isIdentifier()) return node.name;
  return `${node.namespace.name}:${node.name.name}`;
};

export const trimWhitespace = (text: string) => {
  text = text.replace(/\r/g, '');

  /\n/g.test(text) &&
    (text = text
      .split('\n')
      .map((t, i) => (i ? t.replace(/^\s*/g, '') : t))
      .filter(s => !/^\s*$/.test(s))
      .join(' '));

  return text.replace(/\s+/g, ' ');
};

export const getRootPath = (path: any) => {
  while (path.parentPath) {
    path = path.parentPath;
  }
  return path;
};

const declMap = new WeakMap<any, VariableDeclaration>();
export const rootDecl = (path: any, decl: VariableDeclaration) => {
  const programParent = path.scope.getProgramParent();
  if (declMap.has(programParent))
    declMap.get(programParent)!.declarations.push(...decl.declarations);
  else {
    declMap.set(programParent, decl);
    getRootPath(path).get('body')[0].insertBefore(decl);
  }
};

export const escapeHTML = (str: string, isAttr?: true) => {
  if (typeof str !== 'string') return str;
  const delim = '<';
  const escDelim = '&lt;';
  let iDelim = str.indexOf(delim);
  let iAmp = str.indexOf('&');

  if (iDelim < 0 && iAmp < 0) return str;

  let left = 0;
  let out = '';

  if (isAttr) return str.replace("'", '&apos;').replace('"', '&quot;');
  else {
    while (iDelim >= 0 && iAmp >= 0) {
      if (iDelim < iAmp) {
        if (left < iDelim) out += str.substring(left, iDelim);
        out += escDelim;
        left = iDelim + 1;
        iDelim = str.indexOf(delim, left);
      } else {
        if (left < iAmp) out += str.substring(left, iAmp);
        out += '&amp;';
        left = iAmp + 1;
        iAmp = str.indexOf('&', left);
      }
    }

    if (iDelim >= 0)
      do {
        if (left < iDelim) out += str.substring(left, iDelim);
        out += escDelim;
        left = iDelim + 1;
        iDelim = str.indexOf(delim, left);
      } while (iDelim >= 0);
    else
      while (iAmp >= 0) {
        if (left < iAmp) out += str.substring(left, iAmp);
        out += '&amp;';
        left = iAmp + 1;
        iAmp = str.indexOf('&', left);
      }

    return left < str.length ? out + str.substring(left) : out;
  }
};

export * from './parseJSX';
