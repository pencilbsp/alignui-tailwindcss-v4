import { memo, useMemo } from "react";
import { RiPlayLargeLine } from "@remixicon/react";

import { cn } from "@/utils/cn";
import { Spinner } from "../spinner";
import { useVideoPlayer, State } from "./store";

const VideoPlayerPoster = memo(() => {
    const state = useVideoPlayer((state) => state.state);
    const togglePlay = useVideoPlayer((state) => state.togglePlay);
    const settingsVisible = useVideoPlayer((state) => state.settingsVisible);

    const isLoading = useMemo(() => state === State.LOADING || state === State.BUFFERING, [state]);

    return (
        <div
            onClick={togglePlay}
            className={cn("absolute top-0 left-0 z-0 flex h-full w-full", settingsVisible && "pointer-events-none")}
        >
            <div className="flex-1" />
            <div className="flex flex-1 items-center justify-center">
                {isLoading && <Spinner loading className="bg-static-white" size="lg" />}
                {state === State.PAUSED && (
                    <button className="cursor-pointer" type="button" aria-label="Play Button">
                        <RiPlayLargeLine className="size-12 lg:size-14" />
                    </button>
                )}
            </div>
            <div className="flex-1" />
        </div>
    );
});

VideoPlayerPoster.displayName = "VideoPlayerPoster";

export default VideoPlayerPoster;
