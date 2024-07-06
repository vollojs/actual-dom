import { NodePath } from '@babel/core';
import { isJSXNamespacedName, stringLiteral } from '@babel/types';
import type { Props } from '.';
import type Static from './Static';
import type {
  Expression,
  JSXElement,
  JSXAttribute,
  JSXSpreadAttribute,
  JSXExpressionContainer,
  StringLiteral,
} from '@babel/types';

export default (path: NodePath<JSXElement>, staticNode: Static | [string, string][]) =>
  (
    path.get('openingElement.attributes') as unknown as NodePath<
      JSXAttribute | JSXSpreadAttribute
    >[]
  ).reduce((props, attrPath) => {
    if (attrPath.isJSXSpreadAttribute()) {
      const arg = attrPath.get('argument');
      props.push({
        key: arg.node,
        path: attrPath,
        evaluate: () => arg.evaluate(),
        getBinding: () => arg.isIdentifier() && arg.scope.getBinding(arg.node.name),
      });
    } else {
      const { node } = attrPath as NodePath<JSXAttribute>;
      const attrValue = attrPath.get('value') as NodePath<JSXExpressionContainer | StringLiteral>;
      const expr = attrPath.get('expression') as NodePath<Expression>;
      const key = isJSXNamespacedName(node.name)
        ? `${node.name.namespace.name}:${node.name.name.name}`
        : node.name.name;
      if (attrValue.isJSXExpressionContainer()) {
        props.push({
          key,
          path: attrPath,
          value: attrValue.node.expression as Expression,
          evaluate: () => expr.evaluate(),
          getBinding: () => expr.isIdentifier() && expr.scope.getBinding(expr.node.name),
        });
      } else {
        (Array.isArray(staticNode) ? staticNode : staticNode.props).push([
          key,
          (attrValue as NodePath<StringLiteral>).node?.value || '',
        ]);
      }
    }
    return props;
  }, [] as Props);
