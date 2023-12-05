import { useToast, UseToastOptions } from '@chakra-ui/react';
import { Notification } from '../components/notification';

const useNotification = (options?: UseToastOptions) => {
  return useToast({
    containerStyle: {
      display: 'flex',
      alignItems: 'flex-end',
      flexDirection: 'column',
      minW: 'min-content',
    },
    position: 'top-right',
    render: (props) => <Notification {...props} />,
    ...options,
  });
};

export { useNotification };
