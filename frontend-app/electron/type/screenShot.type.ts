export interface pickDesktopSourceParam {
    display: Electron.Display;
    sources: Electron.DesktopCapturerSource[];
    thumbnailSize: { width: number; height: number };
}

export interface captureDisplayParam {
    display: Electron.Display;
    x: number;
    y: number;
    width: number;
    height: number;
}