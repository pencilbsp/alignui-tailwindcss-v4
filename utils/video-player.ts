import { Level } from "hls.js";

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);

    const timeString = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

    return { minutes, seconds, timeString };
};

const requestFullscreen = (element: HTMLElement) => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
        return true;
    } else if (element.mozRequestFullScreen) {
        // Firefox
        element.mozRequestFullScreen();
        return true;
    } else if (element.webkitRequestFullscreen) {
        // Chrome, Safari, Opera
        element.webkitRequestFullscreen();
        return true;
    } else if (element.msRequestFullscreen) {
        // IE/Edge
        element.msRequestFullscreen();
        return true;
    } else {
        if (element.tagName !== "VIDEO") {
            const video = element.querySelector("video");

            if (video && video.webkitEnterFullScreen) {
                video.webkitEnterFullScreen();
                return true;
            }
        }

        console.warn("Fullscreen API is not supported on this browser.");
        return false;
    }
};

const exitFullscreen = () => {
    if (document.exitFullscreen) {
        document.exitFullscreen();
        return false;
    } else if (document.mozCancelFullScreen) {
        // Firefox
        document.mozCancelFullScreen();
        return false;
    } else if (document.webkitExitFullscreen) {
        // Chrome, Safari, Opera (nếu hỗ trợ chuẩn)
        document.webkitExitFullscreen();
        return false;
    } else if (document.msExitFullscreen) {
        // IE/Edge
        document.msExitFullscreen();
        return false;
    } else if (document.activeElement && document.activeElement.tagName === "VIDEO") {
        const video = document.activeElement as HTMLVideoElement;
        // iOS Safari: nếu video đang ở fullscreen sử dụng webkitEnterFullScreen
        if (video.webkitExitFullscreen) {
            video.webkitExitFullscreen();
            return false;
        }
    }

    console.warn("Fullscreen exit API is not supported on this browser.");
    return true;
};

function formatBitrate(bitrate: number) {
    if (bitrate >= 1000000) {
        // Chuyển sang mbps
        return (bitrate / 1000000).toFixed(2) + "Mbps";
    } else if (bitrate >= 1000) {
        // Chuyển sang kbps
        return (bitrate / 1000).toFixed(0) + "kbps";
    } else {
        // Để ở dạng bps
        return bitrate + "bps";
    }
}

const getLevelResolution = (lavels: Level[]) => {
    const seen = new Map<number, number[]>();
    return lavels
        .map((level, index) => {
            const { width, height } = level;
            const pixels = width > height ? height : width;

            const indexes = seen.get(pixels);
            if (indexes) {
                seen.set(pixels, [...indexes, index]);
            } else {
                seen.set(pixels, [index]);
            }

            return { ...level, label: pixels };
        })
        .map((level, index) => {
            const indexes = seen.get(level.label);

            if (indexes && indexes.length > 1 && indexes.includes(index)) {
                return { ...level, label: `${level.label}p (${formatBitrate(level.bitrate)})` } as Level;
            }

            return { ...level, label: `${level.label}p` } as Level;
        });
};

export { requestFullscreen, exitFullscreen, formatTime, getLevelResolution };
