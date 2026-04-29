export interface ModalPortalProps {
  className?: string;

  iconName: string;

  label?: string;

  children: (onClose: () => void) => React.ReactNode;
}
