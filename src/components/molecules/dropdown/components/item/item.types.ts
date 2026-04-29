type RenderModal = (onClose: () => void) => React.ReactNode;

export type DropdownItemProps =
  | {
      icon: string;
      label: string;
      disabled?: boolean;
      danger?: boolean;
      portalModal: true;
      render: RenderModal;
      className?: string;
    }
  | {
      icon: string;
      label: string;
      disabled?: boolean;
      danger?: boolean;
      portalModal?: false;
      children?: React.ReactNode;
      onClick: React.MouseEventHandler<Element>;
      className?: string;
    };
