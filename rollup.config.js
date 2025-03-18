import typescript from '@rollup/plugin-typescript';
import esbuild from 'rollup-plugin-esbuild';

const bundle = config => ({
  ...config,
  input: [
    'src/index.ts',
    'src/modules/walletconnect.module.ts',
    'src/modules/ledger.module.ts',
    'src/modules/trezor.module.ts',
  ],
  external: id => !/^[./]/.test(id),
});

export default [
  bundle({
    plugins: [esbuild()],
    output: [
      {
        dir: 'build',
        format: 'es',
        sourcemap: true,
        preserveModules: true,
        entryFileNames: '[name].mjs',
        validate: true,
      },
    ],
  }),
  bundle({
    plugins: [typescript()],
    output: [
      {
        dir: 'build',
        format: 'cjs',
        sourcemap: true,
        preserveModules: true,
        entryFileNames: '[name].cjs',
        validate: true,
      },
    ],
  }),
];
