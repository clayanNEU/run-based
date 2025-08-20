export {};

declare global {
  interface Window {
    minikit?: {
      composeCast: (args: { text: string; embeds?: string[] }) => void;
    };
  }
}
