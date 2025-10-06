import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

const AppLayout = ({ children }: Props) => {
  return <>{children}</>;
};

export default AppLayout;
