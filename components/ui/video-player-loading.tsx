import { PlayIcon } from "@heroicons/react/24/outline";

import { cn } from "@/utils/cn";
import { Spinner } from "../core/spinner";
import { useVideoPlayer } from "./video-player-provider";

export default function VideoPlayerLoading() {
    const { isPlaying, isLoading, handlePlay } = useVideoPlayer();

    return (
        <div
            className={cn(
                "absolute top-0 left-0 flex h-full w-full items-center justify-center transition-all",
                isPlaying && "invisible opacity-0",
            )}
        >
            {isLoading ? (
                <Spinner loading className="bg-static-white" size="lg" />
            ) : (
                <button className="cursor-pointer" type="button" onClick={handlePlay} aria-label="Play Button">
                    <PlayIcon className="size-12 lg:size-14" />
                </button>
            )}
        </div>
    );
}
