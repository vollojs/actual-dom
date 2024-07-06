import type { Plugin } from 'vite';
import type { TransformOptions } from '@babel/core';
import type { Config } from 'babel-plugin-jsx2dom';
import { transformAsync } from '@babel/core';

export default (config: Partial<Config> = {}): Plugin => ({
  name: 'jsx',
  enforce: 'pre',
  /**
   * We only need esbuild on .ts or .js files.
   * .tsx & .jsx files are handled by us
   */
  config: () => ({ esbuild: { include: /\.[jt]s$/ } }),
  async transform(source, id) {
    if (!/\.[jt]sx?$/.test(id)) return null;

    const result = await transformAsync(source, {
      babelrc: false,
      configFile: false,
      root: process.cwd(),
      filename: id,
      sourceFileName: id,
      plugins: [['jsx2dom', config]],
      sourceMaps: true,
      // Vite handles sourcemap flattening
      inputSourceMap: false,
    } as unknown as TransformOptions);

    if (result?.code) return { code: result.code, map: result.map };
  },
});
