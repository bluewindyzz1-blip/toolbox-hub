declare module "pdfjs-dist/build/pdf.mjs" {
  export const GlobalWorkerOptions: { workerSrc: string };
  export function getDocument(params: { data: ArrayBuffer }): { promise: Promise<{
    numPages: number;
    getPage(pageNumber: number): Promise<{
      getTextContent(): Promise<{ items: unknown[] }>;
      getViewport(params: { scale: number }): { width: number; height: number };
      render(params: { canvas: HTMLCanvasElement; canvasContext: CanvasRenderingContext2D; viewport: { width: number; height: number } }): { promise: Promise<void> };
    }>;
  }> };
}

declare module "pdfjs-dist/build/pdf.worker.min.mjs?url" {
  const workerUrl: string;
  export default workerUrl;
}
