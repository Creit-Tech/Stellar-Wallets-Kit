import esbuild from 'rollup-plugin-esbuild';

const bundle = config => ({
  ...config,
  input: ['src/index.ts', 'src/modules/walletconnect.module.ts'],
  external: id => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [esbuild()],
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
