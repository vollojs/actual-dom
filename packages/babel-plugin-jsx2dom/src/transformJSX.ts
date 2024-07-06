import {
  isElement,
  isFragment,
  isComponent,
  isExpression,
  parseJSX,
  rootUnshift,
  registerImportMethod,
  type ElementInfo,
  type ComponentInfo,
  type Static,
} from '@actual-dom/babel-utils';
import { isEvent, getEventName, SVGElements, Text } from '@actual-dom/shared';
import config, { type Config } from './config';
import {
  callExpression,
  arrowFunctionExpression,
  expressionStatement,
  variableDeclaration,
  variableDeclarator,
  stringLiteral,
  blockStatement,
  returnStatement,
  valueToNode,
  objectExpression,
  objectProperty,
  identifier,
  spreadElement,
  arrayExpression,
  nullLiteral,
  type ObjectProperty,
  type SpreadElement,
  type Statement,
  type Identifier,
  type CallExpression,
  booleanLiteral,
} from '@babel/types';

const ACTUAL_DOM = 'actual-dom';
const SHARED = '@actual-dom/shared';
const TEMPLATE = 'template';
const CREATE_ELEMENT = 'createElement';
const ON = 'on';
const SET_PROP = 'setProp';
const SET_PROPS = 'setProps';
const GET_CHILD = 'getChild';
const APPEND_CHILD = 'appendChild';
const CREATE_TEXT = 'createText';
const CREATE_COMMENT = 'createComment';
const CREATE_FRAGMENT = 'createFragment';
const CREATE_COMPONENT = 'createComponent';
const COMMENT = 'Comment';

const createElementAST = (path: any, info: ElementInfo, config: Config) => {
  const importActualDOM = (name: string) => registerImportMethod(path, name, ACTUAL_DOM);
  const importShared = (name: string) => registerImportMethod(path, name, SHARED);

  const createElID = path.scope.generateUidIdentifier('_createEl');
  const el = path.scope.generateUidIdentifier('_el');
  const createElements = ({ type, props, children }: Static): CallExpression =>
    typeof type === 'string'
      ? callExpression(importActualDOM(CREATE_ELEMENT), [
          stringLiteral(type),
          objectExpression(
            props.reduce(
              (objectProps, [key, value]) => {
                objectProps.push(objectProperty(identifier(key), stringLiteral(value)));
                return objectProps;
              },
              [] as (ObjectProperty | SpreadElement)[],
            ),
          ),
          arrayExpression(
            children.map(child =>
              typeof child === 'string'
                ? stringLiteral(child)
                : child.type === COMMENT
                ? nullLiteral()
                : createElements(child),
            ),
          ),
          ...(SVGElements.includes(type) ? [booleanLiteral(true)] : []),
        ])
      : callExpression(
          importActualDOM(type === Text ? CREATE_TEXT : CREATE_COMMENT),
          type === Text ? [stringLiteral(children[0] as string)] : [],
        );

  config.template &&
    rootUnshift(
      path,
      variableDeclaration('const', [
        variableDeclarator(
          createElID,
          callExpression(importActualDOM(TEMPLATE), [
            stringLiteral(info.static.toString(config.template)),
          ]),
        ),
      ]),
    );

  return callExpression(
    arrowFunctionExpression(
      [],
      blockStatement([
        variableDeclaration('const', [
          variableDeclarator(
            el,
            config.template ? callExpression(createElID, []) : createElements(info.static),
          ),
        ]),
        ...info.dynamic.reduce((statementArr, [item, indexArr]) => {
          const element = indexArr.length
            ? callExpression(importActualDOM(GET_CHILD), [el, valueToNode(indexArr)])
            : el;
          if (Array.isArray(item)) {
            item.forEach(({ key, value }) =>
              statementArr.push(
                expressionStatement(
                  callExpression(
                    importActualDOM(value ? (isEvent(key) ? ON : SET_PROP) : SET_PROPS),
                    [
                      element,
                      ...(value
                        ? [stringLiteral(isEvent(key) ? getEventName(key) : key), value]
                        : [key]),
                    ],
                  ),
                ),
              ),
            );
          } else {
            if (isExpression(item)) {
              statementArr.push(
                expressionStatement(
                  callExpression(importActualDOM(APPEND_CHILD), [item.value, element]),
                ),
              );
            } else if (isComponent(item)) {
              statementArr.push(
                expressionStatement(
                  callExpression(importActualDOM(APPEND_CHILD), [
                    createComponentAST(item, importActualDOM, importShared),
                    element,
                  ]),
                ),
              );
            }
          }
          return statementArr;
        }, [] as Statement[]),
        returnStatement(el),
      ]),
    ),
    [],
  );
};

const createComponentAST = (
  info: ComponentInfo,
  importActualDOM: (name: string) => Identifier,
  importShared: (name: string) => Identifier,
) =>
  callExpression(importActualDOM(CREATE_COMPONENT), [
    info.tag,
    objectExpression(
      info.dynamic.props.reduce(
        (objectProps, { key, value }) => {
          objectProps.push(
            value
              ? objectProperty(
                  identifier(key),
                  typeof value === 'string' ? stringLiteral(value) : value,
                )
              : spreadElement(key),
          );
          return objectProps;
        },
        info.static.props.reduce(
          (objectProps, [key, value]) => {
            objectProps.push(objectProperty(identifier(key), stringLiteral(value)));
            return objectProps;
          },
          [] as (ObjectProperty | SpreadElement)[],
        ),
      ),
    ),
    arrayExpression(
      info.dynamic.children
        .reduce(
          (children, [child, index]) => {
            isExpression(child) && (children[index] = child.value);
            return children;
          },
          info.static.children.reduce((children, [child, index]) => {
            children[index] = Array.isArray(child)
              ? arrayExpression(
                  child.reduce((comments, comment) => {
                    comments.push(
                      objectExpression([
                        objectProperty(stringLiteral('type'), importShared(COMMENT)),
                        objectProperty(stringLiteral('value'), stringLiteral(comment)),
                      ]),
                    );
                    return comments;
                  }, []),
                )
              : stringLiteral(child);
            return children;
          }, [] as any[]),
        )
        .filter(item => item),
    ),
  ]);

export default (path: any, { opts }: { opts: Config }) => {
  const importActualDOM = (name: string) => registerImportMethod(path, name, ACTUAL_DOM);
  const importShared = (name: string) => registerImportMethod(path, name, SHARED);
  const configuration = Object.assign(config, opts);
  const info = parseJSX(path, configuration);
  if (isElement(info)) {
    path.replaceWith(createElementAST(path, info, configuration));
  } else if (isComponent(info)) {
    path.replaceWith(createComponentAST(info, importActualDOM, importShared));
  } else if (isFragment(info)) {
    path.replaceWith(
      callExpression(
        importActualDOM(CREATE_FRAGMENT),
        info.dynamicChildren
          .reduce(
            (children, [child, index]) => {
              children[index] = isExpression(child)
                ? child.value
                : isElement(child)
                ? createElementAST(path, child, configuration)
                : createComponentAST(child as ComponentInfo, importActualDOM, importShared);
              return children;
            },
            info.staticChildren.reduce((children, [child, index]) => {
              children[index] = Array.isArray(child)
                ? arrayExpression(
                    child.reduce((comments, comment) => {
                      comments.push(
                        objectExpression([
                          objectProperty(stringLiteral('type'), importShared(COMMENT)),
                          objectProperty(stringLiteral('value'), stringLiteral(comment)),
                        ]),
                      );
                      return comments;
                    }, []),
                  )
                : callExpression(importActualDOM(CREATE_TEXT), [stringLiteral(child)]);
              return children;
            }, [] as any[]),
          )
          .filter(item => item),
      ),
    );
  }
};
