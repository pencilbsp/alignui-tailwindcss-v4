import { memo, useEffect, useRef, useState } from "react";

import { cn } from "@/utils/cn";
import { useVideoPlayer } from "./store";

const VideoPlayerSubtitle = memo(() => {
    const trackRef = useRef<TextTrack | null>(null);
    const [cues, setCues] = useState<TextTrackCue[] | null>(null);
    const videoElement = useVideoPlayer((state) => state.videoElement);
    const controlsVisible = useVideoPlayer((state) => state.controlsVisible);

    useEffect(() => {
        if (!videoElement) return;

        const handleCueChange = () => {
            if (!trackRef.current) return;

            const activeCues = trackRef.current.activeCues;
            if (activeCues && activeCues.length > 0) {
                // Chuyển đổi sang mảng
                setCues(Array.from(activeCues));
            } else {
                setCues(null);
            }
        };

        const handleTextTracksChange = () => {
            if (!videoElement) return;

            const currentTrack = Array.from(videoElement.textTracks).find((track) => track.mode === "showing");

            if (currentTrack) {
                if (trackRef.current !== currentTrack) {
                    // Nếu đã có listener trên track cũ, gỡ nó đi
                    if (trackRef.current) {
                        trackRef.current.removeEventListener("cuechange", handleCueChange);
                    }
                    trackRef.current = currentTrack;
                    trackRef.current.addEventListener("cuechange", handleCueChange);
                }
            } else {
                setCues(null);
            }
        };

        videoElement.textTracks.addEventListener("change", handleTextTracksChange);

        return () => {
            if (videoElement) {
                videoElement.textTracks.removeEventListener("change", handleTextTracksChange);
            }

            if (trackRef.current) {
                trackRef.current.removeEventListener("cuechange", handleCueChange);
            }
        };
    }, [videoElement]);

    return (
        <div
            className={cn(
                "absolute bottom-0 flex w-full justify-center transition-all",
                controlsVisible ? "mb-17 lg:mb-20" : "mb-3",
            )}
        >
            <div className="cue">
                {cues &&
                    Array.from(cues).map((cue) => {
                        const vttCue = cue as VTTCue;
                        return (
                            <span className="whitespace-pre-wrap" key={vttCue.id}>
                                {vttCue.text}
                            </span>
                        );
                    })}
            </div>
        </div>
    );
});
VideoPlayerSubtitle.displayName = "VideoPlayerSubtitle";

export default VideoPlayerSubtitle;
