import { memo } from "react";
import { useVideoPlayer } from "./store";

const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60)
        .toString()
        .padStart(2, "0");
    const seconds = Math.floor(time % 60)
        .toString()
        .padStart(2, "0");

    return minutes + ":" + seconds;
};

const VideoPlayerTime = memo(() => {
    const duration = useVideoPlayer((state) => state.duration);

    const currentTime = useVideoPlayer((state) => state.currentTime);

    return (
        <div className="text-subheading-sm lg:text-subheading-md flex items-center gap-1">
            <span>{formatTime(currentTime)}</span>
            <span>/</span>
            <span>{formatTime(duration || 0)}</span>
        </div>
    );
});

VideoPlayerTime.displayName = "VideoPlayerTime";

export { formatTime };
export default VideoPlayerTime;
