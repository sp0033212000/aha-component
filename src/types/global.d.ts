export declare global {
  type ElementTag = keyof JSX.IntrinsicElements;
  type ElementProps<Tag extends ElementTag> = Omit<
    JSX.IntrinsicElements[Tag],
    'ref'
  >;
}
