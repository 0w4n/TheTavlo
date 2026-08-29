import React from "react";

export default function ComposeProviders({
  providers,
  children,
}: {
  providers: React.ReactElement[];
  children: React.ReactNode;
}) {
  return (
    <>
      {providers.reduceRight((child, parent) => {
        return React.cloneElement(parent, {}, child);
      }, children)}
    </>
  );
}
