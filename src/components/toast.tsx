import { CheckCircleIcon } from '@chakra-ui/icons';
import { Box, Button, HStack, Text } from '@chakra-ui/react';

interface ToastProps {
  title: string;
  description?: string;
  actionTitle?: string;
  action?: () => void;
}

const Toast = ({ description, title, actionTitle, action }: ToastProps) => {
  return (
    <HStack
      padding={5}
      spacing={4}
      boxShadow="lg"
      borderWidth={1}
      borderRadius={10}
      borderColor={'success.900'}
      bg={'success.900'}
      position="relative"
      backdropFilter="blur(17px)"
      maxW={310}
    >
      <CheckCircleIcon fontSize={24} color="brand.600" />

      <Box>
        <Text fontSize="lg" fontWeight="bold" color="brand.500">
          {title}
        </Text>

        <Text fontSize="sm" color="grey.200">
          {description}
        </Text>

        {action && (
          <Box mt={2}>
            <Button
              onClick={action}
              w={'100%'}
              bg="brand.500"
              borderRadius={10}
              _hover={{ backgroundColor: 'brand.600' }}
            >
              {actionTitle}
            </Button>
          </Box>
        )}
      </Box>
    </HStack>
  );
};

export { Toast };
