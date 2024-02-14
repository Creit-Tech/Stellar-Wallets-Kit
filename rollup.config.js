import typescript from '@rollup/plugin-typescript';
import commonjs from '@rollup/plugin-commonjs';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default [
  {
    input: 'src/index.ts',
    output: {
      dir: 'build',
      format: 'umd',
      name: 'SWK',
    },
    plugins: [
      commonjs({ extensions: ['.js', '.ts'] }),
      typescript({
        tsconfig: './tsconfig.json',
      }),
      nodeResolve(),
    ],
  },
];
