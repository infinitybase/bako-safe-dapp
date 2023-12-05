// import './App.css';
import { bn, Address, BaseAssetId } from 'fuels';
import { defaultConfigurable } from 'bsafe';
import { MyContractAbi__factory } from './contracts/contracts/factories/MyContractAbi__factory';
import contractIds from './contracts/contract-ids.json';
import logo from './assets/logo-bsafe.svg';
import link from './assets/icons/link.svg';
import add from './assets/icons/add.svg';

/* eslint-disable no-console */
import {
  useDisconnect,
  useConnectUI,
  useIsConnected,
  useFuel,
  useAccount,
  //useNetwork,
} from '@fuel-wallet/react';
import { FuelWalletProvider } from '@fuel-wallet/sdk';
import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Center,
  FormControl,
  FormHelperText,
  FormLabel,
  HStack,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  Text,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { AddressCopy } from './components/addressCopy';
import { AddressUtils } from './utils/address';
//import { useEffect } from 'react';

interface IHandleTransfer {
  assetId?: string;
  amount?: string;
}

function App() {
  const { connect } = useConnectUI();
  const { fuel } = useFuel();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { account } = useAccount();
  const [balance, setBalance] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  //  const { network } = useNetwork();

  const faucetUrl = 'https://faucet-beta-4.fuel.network/?address=';

  // useEffect(() => {
  //   console.log('[network]: ', network);
  // }, [isConnected]);

  async function handleContractCall() {
    if (!account) return;
    const provider = await FuelWalletProvider.create(
      defaultConfigurable['provider']
    );
    //console.log(provider);
    const wallet = await fuel.getWallet(account, provider);
    const contract = MyContractAbi__factory.connect(
      contractIds.myContract,
      wallet
    );
    // await wallet.getBalance(); -> recive balance of predicate
    const { value, transactionId } = await contract.functions
      .return_true(10)
      .txParams({
        gasPrice: bn(1),
        gasLimit: bn(1_000_000),
      })
      .call();
    // TODO: Dispatch success or error toasts (use then + catch)
    // transactionId vai ser o txID do banco de dados
    console.log(value);
    console.log(transactionId);
    //console.log('[PAGE]: sendTransaction');
  }

  async function handleTransfer(params?: IHandleTransfer) {
    // --> BSafeProvider -> extends FuelWalletProvider -> getTransactionResponse -> TransactionReponse -> waitForApproval.
    const { amount } = params ?? {};
    //console.log(account, defaultConfigurable['provider']);
    if (!account) return;
    const provider = await FuelWalletProvider.create(
      defaultConfigurable['provider']
    );
    //console.log(provider);
    const wallet = await fuel.getWallet(account, provider);
    // await wallet.getBalance(); -> recive balance of predicate

    const result = await wallet.transfer(
      Address.fromString(
        'fuel1rjlvmq9q25l4388940wpepyceksex5la0wd7093vgwmar0tqn0yscnd0u2'
      ), // todo: move to dynamic this address, this static address is from 'STORE' in mock API
      bn(amount ?? 1_000),
      BaseAssetId,
      {
        // In case of error, use the provider
        gasPrice: defaultConfigurable['gasPrice'],
        gasLimit: defaultConfigurable['gasLimit'],
        // gasPrice: bn(1),
        // gasLimit: bn(1_000_000),
      }
    );
    //console.log('result: ', result);
    try {
      const { id, status } = await result.waitForResult();
      console.log('result: ', {
        id,
        status,
      });
      //todo: dispatch toast with transaction status and redirect to block explorer
    } catch (e) {
      console.log('error: ', e);
      //todo: 'dispatch toast with error message';
    }
  }

  async function handleGetBalance() {
    if (!account) return;

    const provider = await FuelWalletProvider.create(
      defaultConfigurable['provider']
    );
    const wallet = await fuel.getWallet(account, provider);
    const balance = await wallet.getBalance();

    setBalance(
      bn(bn.parseUnits(balance.format() ?? '0.000')).format({
        precision: 4,
      })
    );
  }

  useEffect(() => {
    handleGetBalance();
  }, [account]);

  return (
    <Center bg="#0F0F0F" h="100vh">
      <Modal isOpen={isOpen} onClose={onClose}>
        {/* <ModalOverlay /> */}
        <ModalContent alignSelf="center">
          <ModalBody w="full" h="full" bg="#0F0F0F" color="white">
            <VStack alignItems="flex-start">
              <Box borderBottom="1px solid #2C2C2C" pb={10} mb={6}>
                <Text fontSize="xx-large" fontWeight="bold" color="#C0C0C0">
                  Create Transaction
                </Text>
                <Text fontSize="sm" color="#696B65">
                  Unlock Multisig Capabilities. Experience seamless transactions
                  in our test application using the Wallet Connector.
                </Text>
              </Box>

              <Text fontWeight="bold" color="#C0C0C0">
                Who for?
              </Text>
              <Text fontSize="sm" color="#696B65">
                Set the recipient for this transfer.
              </Text>

              <Box w="full">
                <FormControl isInvalid={false}>
                  <Input
                    // value={field.value}
                    // onChange={field.onChange}
                    placeholder=" "
                  />
                  <FormLabel>Vault name</FormLabel>
                  <FormHelperText color="error.500">
                    Error message
                  </FormHelperText>
                </FormControl>
              </Box>

              <HStack
                w="full"
                justifyContent="center"
                borderTop="1px solid #2C2C2C"
                pt={8}
                mt={8}
              >
                <Button
                  bg="#2C2C2C"
                  color="#C0C0C0"
                  px={4}
                  py={2}
                  fontSize="sm"
                  fontWeight="bold"
                  borderRadius={10}
                  onClick={onClose}
                >
                  Cancel
                </Button>
                <Button
                  bg="#49F8AE"
                  px={6}
                  py={2}
                  gap={2}
                  fontSize="sm"
                  fontWeight="bold"
                  borderRadius={10}
                  onClick={() => handleTransfer()}
                  color="#121212"
                >
                  <Box fontSize={12}>
                    <img src={add} />
                  </Box>
                  Create transaction
                </Button>
              </HStack>
            </VStack>
          </ModalBody>
        </ModalContent>
      </Modal>

      {isConnected && (
        <VStack spacing={0}>
          <HStack spacing={6}>
            <AddressCopy
              w={52}
              address={AddressUtils.format(account!)!}
              bg="#2C2C2C"
              color="#696B65"
            />

            <VStack alignItems="flex-start" spacing={0}>
              <HStack>
                <Text color="#FFFFFF" fontWeight="bold">
                  {balance}
                </Text>
                <Text color="#FFFFFF">ETH</Text>
              </HStack>
              <Text color="#696B65" w={32} fontSize="sm">
                Vault balance
              </Text>
            </VStack>
          </HStack>

          <HStack mt={6} spacing={6}>
            <VStack alignItems="flex-start">
              <Button
                w={130}
                bg="#49F8AE"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                onClick={() => window.open(`${faucetUrl}${account}`, '_blank')}
              >
                Faucet
              </Button>
              <Text color="#696B65" fontSize="xs" maxW={44}>
                Add assets to the vault. Choose the asset you prefer.
              </Text>
            </VStack>

            <VStack alignItems="flex-start">
              <Button
                w={130}
                bg="#49F8AE"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                // onClick={() => handleTransfer()}
                onClick={onOpen}
              >
                Send
              </Button>
              <Text color="#696B65" fontSize="xs" maxW={44}>
                Send single or batch payments with multi assets.
              </Text>
            </VStack>
          </HStack>

          <HStack mt={4} spacing={6}>
            <VStack alignItems="flex-start">
              <Button
                w={130}
                bg="#2C2C2C"
                color="#C0C0C0"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                onClick={() => disconnect()}
              >
                Disconnect
              </Button>
              <Text color="#696B65" fontSize="xs" maxW={44}>
                Disconnect your wallet of the example application.
              </Text>
            </VStack>

            <VStack alignItems="flex-start">
              <Button
                w={130}
                bg="#49F8AE"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                onClick={() => handleContractCall()}
              >
                Call Contract
              </Button>
              <Text color="#696B65" fontSize="xs" maxW={44}>
                Call an example contract to use this on Bsafe
              </Text>
            </VStack>
          </HStack>
        </VStack>
      )}

      {!isConnected && (
        <VStack spacing={16}>
          <Box w={230}>
            <img src={logo} />
          </Box>
          <Button
            bg="#49F8AE"
            px={4}
            py={3}
            gap={2}
            fontWeight="bold"
            borderRadius={10}
            onClick={async () => {
              connect();
            }}
          >
            <Box>
              <img src={link} />
            </Box>
            Connect wallet
          </Button>
        </VStack>
      )}
    </Center>
  );
}

export default App;
