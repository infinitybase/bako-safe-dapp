import {
  Box,
  HStack,
  Icon,
  StackProps,
  Text,
  useClipboard,
} from '@chakra-ui/react';

import { useNotification } from '../hooks/useNotification';
import { CopyIcon } from '../assets/icons/copy';
import { Toast } from './toast';
import { AddressUtils } from '../utils/address';

interface Props extends StackProps {
  address: string;
}

function AddressCopy({ address, ...rest }: Props) {
  const clipboard = useClipboard(address);
  const toast = useNotification();

  if (!address.length) return;

  return (
    <HStack
      p={3}
      spacing={4}
      cursor="pointer"
      borderRadius={10}
      justifyContent="center"
      backgroundColor="dark.100"
      onClick={() => {
        clipboard.onCopy();

        toast({
          duration: 3000,
          render: () => <Toast title="Copied to clipboard" />,
        });
      }}
      {...rest}
    >
      <Icon color="#C0C0C0" fontSize="md" as={CopyIcon} />
      <Box maxWidth="145px" w="full">
        <Text noOfLines={1} color="grey.500">
          {AddressUtils.format(address)}
        </Text>
      </Box>
    </HStack>
  );
}

export { AddressCopy };
