import { Box, Button, VStack } from '@chakra-ui/react';

import logo from '../assets/logo-bsafe.svg';
import link from '../assets/icons/link.svg';
import { useConnectUI } from '@fuel-wallet/react';

export const ConnectionScreen = () => {
  const { connect } = useConnectUI();

  return (
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
        onClick={async () => connect()}
        _hover={{ backgroundColor: 'brand.600' }}
      >
        <Box>
          <img src={link} />
        </Box>
        Connect wallet
      </Button>
    </VStack>
  );
};
