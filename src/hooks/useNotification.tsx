import { useToast, UseToastOptions } from '@chakra-ui/react';

const useNotification = (options?: UseToastOptions) => {
  return useToast({
    containerStyle: {
      display: 'flex',
      alignItems: 'flex-end',
      flexDirection: 'column',
      minW: 'min-content',
    },
    duration: 20000,
    position: 'top-right',
    ...options,
  });
};

export { useNotification };
