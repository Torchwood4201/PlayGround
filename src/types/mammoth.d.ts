declare module 'mammoth' {
  export interface MammothResult {
    value: string;
    messages: Array<{ type: string; message: string }>;
  }
  export function extractRawText(input: {
    arrayBuffer?: ArrayBuffer;
    buffer?: Uint8Array;
    path?: string;
  }): Promise<MammothResult>;
  export function convertToHtml(
    input: { arrayBuffer?: ArrayBuffer; buffer?: Uint8Array; path?: string },
    options?: unknown,
  ): Promise<MammothResult>;
  const mammoth: {
    extractRawText: typeof extractRawText;
    convertToHtml: typeof convertToHtml;
  };
  export default mammoth;
}
