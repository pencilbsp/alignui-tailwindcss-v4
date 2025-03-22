// fullscreen-extensions.d.ts
declare global {
    interface Document {
        msExitFullscreen?: () => void;
        mozCancelFullScreen?: () => void;
        webkitExitFullscreen?: () => void;
        mozRequestFullScreen?: () => void;
    }

    interface HTMLElement {
        msRequestFullscreen?: () => void;
        mozRequestFullScreen?: () => void;
        webkitRequestFullscreen?: () => void;
    }

    interface HTMLVideoElement {
        webkitExitFullscreen?: () => void;
        webkitEnterFullScreen?: () => void;
    }
}

export {};
