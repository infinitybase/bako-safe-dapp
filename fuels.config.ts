import { createConfig } from 'fuels';

export default createConfig({
  providerUrl: 'https://beta-5.fuel.network/graphql',
  useBuiltinFuelCore: false,
  output: './src/contracts/',
  contracts: ['./sway'],
  privateKey:
    '0x2676bd551fdfe92b496d6c3af652c52b1d06f2f1990a4422bd542831262ad526',
});
