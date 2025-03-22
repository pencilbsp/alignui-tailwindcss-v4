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

export { requestFullscreen, exitFullscreen, formatTime };
