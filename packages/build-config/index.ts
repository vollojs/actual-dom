import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  externals: ['vite'],
  clean: true,
  declaration: true,
  rollup: {
    emitCJS: true,
  },
});
