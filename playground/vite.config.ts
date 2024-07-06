import { defineConfig } from 'vite';
import jsx from 'vite-plugin-jsx';

export default defineConfig({
  plugins: [jsx({ template: false })],
});
