declare module "tiny-flag-react" {
  import * as React from "react";

  export interface TinyFlagProps {
    country: string; // ISO2 or similar
    size?: number | string;
    style?: React.CSSProperties;
    className?: string;
  }

  const TinyFlag: React.FC<TinyFlagProps>;
  export default TinyFlag;
}
