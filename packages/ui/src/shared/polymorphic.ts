import type * as React from "react";

export type PolymorphicRef<T extends React.ElementType> = React.ComponentPropsWithRef<T>["ref"];

export type PolymorphicProps<T extends React.ElementType, OwnProps> = OwnProps & {
  as?: T;
  ref?: PolymorphicRef<T>;
} & Omit<React.ComponentPropsWithoutRef<T>, keyof OwnProps | "as" | "ref">;
