import { createConfig } from 'fuels';

export default createConfig({
  providerUrl: 'https://beta-4.fuel.network/graphql',
  //useBuiltinFuelCore: false,
  output: './src/contracts/',
  contracts: ['./sway'],
  privateKey:
    '0xb52a8d9eaa90e36baf43404d488e7c45cb612b9a035af8761d02b39fd630b0c3',
});
