import { Box, Button, VStack, Image } from '@chakra-ui/react';

import logo from '../assets/logo-bsafe.svg';
import link from '../assets/icons/link.svg';
import { useConnectUI } from '@fuels/react';

export const ConnectionScreen = () => {
  const { connect } = useConnectUI();

  return (
    <VStack spacing={20}>
      <Box w="full">
        <Image w={300} src={logo} />
      </Box>
      <Button
        bg="brand.500"
        px={4}
        py={3}
        gap={2}
        fontWeight="bold"
        borderRadius={10}
        onClick={async () => connect()}
        _hover={{ backgroundColor: 'brand.600' }}
      >
        <Box>
          <Image src={link} />
        </Box>
        Connect wallet
      </Button>
    </VStack>
  );
};
