// import './App.css';
import { Address, BaseAssetId, bn } from 'fuels';
import add from './assets/icons/add.svg';
import { myContract } from './contracts/contract-ids.json';
import { MyContractAbi__factory } from './contracts/contracts/factories/MyContractAbi__factory';
import { BakoSafe } from 'bakosafe';
/* eslint-disable no-console */
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
import { FuelWalletProvider } from '@fuel-wallet/sdk';
import {
  useAccount,
  useDisconnect,
  useFuel,
  useIsConnected,
} from '@fuels/react';
import { useEffect, useState } from 'react';
import { AddressCopy } from './components/addressCopy';
import { Toast } from './components/toast';
import { useNotification } from './hooks/useNotification';
import { ConnectionScreen } from './pages/connection';
import { AddressUtils } from './utils/address';

function App() {
  const { fuel } = useFuel();
  const { account } = useAccount();
  const { disconnect } = useDisconnect();
  const { isConnected } = useIsConnected();
  const { isOpen, onOpen, onClose } = useDisclosure();

  BakoSafe.setup({
    PROVIDER: import.meta.env.VITE_PROVIDER,
    SERVER_URL: import.meta.env.VITE_BSAFE_API,
    CLIENT_URL: import.meta.env.VITE_BSAFE_APP,
  })


  const toast = useNotification();

  const [balance, setBalance] = useState('');
  const [addressInput, setAddressInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [addressError, setAddressError] = useState(false);
  const [amountError, setAmountError] = useState(false);

  const disableSubmit =
    amountError ||
    addressError ||
    !amountInput ||
    !addressInput ||
    !Number(amountInput);

  async function handleGetBalance() {
    if (!account) return;

    const provider = await FuelWalletProvider.create(
      BakoSafe.get('PROVIDER')
    );
    const wallet = await fuel.getWallet(account, provider);
    const balance = await wallet.getBalance();

    setBalance(
      bn(bn.parseUnits(balance.format() ?? '0.000')).format({
        precision: 4,
      })
    );
  }

  async function handleContractCall() {
    if (!account) return;
    const provider = await FuelWalletProvider.create(
      BakoSafe.get('PROVIDER')
    );
    //console.log(provider);
    const wallet = await fuel.getWallet(account, provider);
    const contract = MyContractAbi__factory.connect(myContract, wallet);

    setTimeout(() => {
      toast({
        isClosable: true,
        duration: 60000,
        render: () => (
          <Box cursor="pointer" onClick={() => toast.closeAll()}>
            <Toast
              title="Transaction created"
              description="You've created a transaction. Review your vault and approve this
              transfer for sending."
              action={() =>
                window.open(`${import.meta.env.VITE_BSAFE_APP}/home`, '_blank')
              }
              actionTitle="Access transaction"
            />
          </Box>
        ),
      });
    }, 10000);

    // await wallet.getBalance(); -> recive balance of predicate
    const { transactionId } = await contract.functions
      .return_true(10)
      .txParams({
        gasPrice: bn(1),
        gasLimit: bn(1_000_000),
      })
      .call();
    // transactionId vai ser o txID do banco de dados

    handleGetBalance();

    toast({
      isClosable: true,
      render: () => (
        <Box cursor="pointer" onClick={() => toast.closeAll()}>
          <Toast
            title="Transaction completed"
            description="One transaction has been completed. "
            action={() =>
              window.open(
                `${import.meta.env.VITE_BLOCK_EXPLORER}/${transactionId}`,
                '_blank'
              )
            }
            actionTitle="Block explorer"
          />
        </Box>
      ),
    });

    //console.log('[PAGE]: sendTransaction');
  }

  async function handleTransfer() {
    // --> BSafeProvider -> extends FuelWalletProvider -> getTransactionResponse -> TransactionReponse -> waitForApproval.
    //console.log(account, defaultConfigurable['provider']);
    if (!account) return;
    const amount = bn.parseUnits(amountInput) ?? bn(1_000);

    const provider = await FuelWalletProvider.create(
      BakoSafe.get('PROVIDER')
    );
    //console.log(provider);
    const wallet = await fuel.getWallet(account, provider);
    // await wallet.getBalance(); -> recive balance of predicate

    onClose();
    setAddressInput('');
    setAmountInput('');
    setAddressError(false);
    setAmountError(false);

    const result = await wallet.transfer(
      Address.fromString(addressInput),
      amount,
      BaseAssetId,
      {
        // !! In case of error, use the provider
        
        // gasPrice: bn(1),
        // gasLimit: bn(1_000_000),
      }
    );

    setTimeout(() => {
      toast({
        isClosable: true,
        render: () => (
          <Box cursor="pointer" onClick={() => toast.closeAll()}>
            <Toast
              title="Transaction created"
              description="You've created a transaction. Review your vault and approve this
              transfer for sending."
              action={() =>
                window.open(`${import.meta.env.VITE_BSAFE_APP}/home`, '_blank')
              }
              actionTitle="Access transaction"
            />
          </Box>
        ),
      });
    }, 3000);

    try {
      const { id, status } = await result.waitForResult();
      console.log('result: ', { id, status });

      handleGetBalance();

      toast({
        isClosable: true,
        render: () => (
          <Box cursor="pointer" onClick={() => toast.closeAll()}>
            <Toast
              title="Transaction completed"
              description="One transaction has been completed. "
              action={() =>
                window.open(
                  `${import.meta.env.VITE_BLOCK_EXPLORER}/${id}`,
                  '_blank'
                )
              }
              actionTitle="Block explorer"
            />
          </Box>
        ),
      });
    } catch (e) {
      console.log('error: ', e);
      // TODO: 'dispatch toast with error message';
    }
  }

  useEffect(() => {
    const balanceInterval = setInterval(() => {
      handleGetBalance();
    }, 5000);

    handleGetBalance();

    return () => {
      clearInterval(balanceInterval);
    };
  }, [account]);
  // Inputs validations
  useEffect(() => {
    if (addressInput && !AddressUtils.isValid(addressInput!))
      setAddressError(true);
    if (Number(amountInput) > Number(balance)) setAmountError(true);
  }, [addressInput, amountInput, balance]);

  return (
    <Center bg="#0F0F0F" h="100vh">
      {!isConnected && <ConnectionScreen />}

      <Modal
        isOpen={isOpen}
        onClose={() => {
          setAmountError(false);
          setAddressError(false);
          onClose();
        }}
      >
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

              {/* FORM */}
              <Box w="full">
                <FormControl isInvalid={addressError} isRequired={true}>
                  <Input
                    onChange={(e) => {
                      setAddressError(false);
                      setAddressInput(e.target.value);
                    }}
                    placeholder=" "
                  />
                  <FormLabel>Address</FormLabel>
                  {addressError && (
                    <FormHelperText color="error.600">
                      Invalid address
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>

              <Box w="full" mt={4}>
                <FormControl isInvalid={amountError} isRequired={true}>
                  <Input
                    step={0.000000001}
                    type="number"
                    onChange={(e) => {
                      setAmountError(false);
                      const [a, b] = e.target.value.split('.');

                      setAmountInput(`${a}.${b.slice(0, 9) ?? '000000000'}`);
                    }}
                    placeholder=" "
                  />
                  <FormLabel>Amount</FormLabel>
                  {!amountError && (
                    <FormHelperText color="#696B65">
                      {balance} ETH available
                    </FormHelperText>
                  )}
                  {amountError && (
                    <FormHelperText color="error.600">
                      You don't have enough funds
                    </FormHelperText>
                  )}
                </FormControl>
              </Box>

              {/* ACTIONS */}
              <HStack
                w="full"
                justifyContent="center"
                borderTop="1px solid #2C2C2C"
                pt={8}
                mt={8}
              >
                <Button
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
                  bg="brand.500"
                  px={6}
                  py={2}
                  gap={2}
                  fontSize="sm"
                  fontWeight="bold"
                  borderRadius={10}
                  onClick={() => handleTransfer()}
                  isDisabled={disableSubmit}
                  color="#121212"
                  _hover={{ backgroundColor: 'brand.600' }}
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

      {/* Logged screen */}
      {isConnected && (
        <VStack spacing={0}>
          <HStack w="full" spacing={6} justifyContent={'flex-start'}>
            <AddressCopy
              w={44}
              address={account ?? ''}
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
                bg="brand.500"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                _hover={{ backgroundColor: 'brand.600' }}
                onClick={() =>
                  window.open(
                    `${import.meta.env.VITE_FAUCET}?address=${account}`,
                    '_blank'
                  )
                }
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
                bg="brand.500"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                onClick={onOpen}
                _hover={{ backgroundColor: 'brand.600' }}
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
                bg="grey.300"
                color="grey.200"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                onClick={() => disconnect()}
                _hover={{ backgroundColor: 'grey.900' }}
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
                bg="brand.500"
                px={4}
                py={1}
                fontSize="sm"
                fontWeight="bold"
                borderRadius={10}
                onClick={() => handleContractCall()}
                _hover={{ backgroundColor: 'brand.600' }}
              >
                Call Contract
              </Button>
              <Text color="#696B65" fontSize="xs" maxW={44}>
                Call an example contract to use this on Bako Safe
              </Text>
            </VStack>
          </HStack>
        </VStack>
      )}
    </Center>
  );
}

export default App;
