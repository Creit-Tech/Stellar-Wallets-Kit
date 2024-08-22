import esbuild from 'rollup-plugin-esbuild';
import terser from '@rollup/plugin-terser';

const bundle = config => ({
  ...config,
  input: ['src/index.ts', 'src/modules/walletconnect.module.ts'],
  external: id => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [esbuild(), terser()],
    output: [
      {
        dir: 'build',
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        entryFileNames: '[name].cjs',
      },
      {
        dir: 'build',
        format: 'es',
        sourcemap: true,
        preserveModules: true,
        entryFileNames: '[name].js',
      },
    ],
  }),
];
