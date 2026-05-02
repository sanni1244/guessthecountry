declare namespace JSX {
  interface IntrinsicElements {
    'tv-mini-chart': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement>,
      HTMLElement
    > & {
      symbol?: string;
    };
  }
}
