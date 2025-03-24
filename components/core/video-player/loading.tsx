import { memo } from "react";

const VideoPlayerLoading = memo(() => {
    // console.log("rendering VideoPlayerLoading...");

    return <div>Loading...</div>;
});

VideoPlayerLoading.displayName = "VideoPlayerLoading";

export default VideoPlayerLoading;
