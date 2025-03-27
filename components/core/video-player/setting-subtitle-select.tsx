import { memo } from "react";

import { cn } from "@/utils/cn";
import { useVideoPlayer } from "./store";
import SettingSelectItem from "./setting-select-item";
import { PolymorphicComponentProps } from "@/utils/polymorphic";

const SettingSubtitleSelect = memo(({ as, className, ...rest }: PolymorphicComponentProps<"ul">) => {
    const manifest = useVideoPlayer((state) => state.manifest);
    const subtitleTrack = useVideoPlayer((state) => state.subtitleTrack);
    const setSubtitleTrack = useVideoPlayer((state) => state.setSubtitleTrack);

    const Component = as || "ul";

    if (!manifest || !manifest.subtitleTracks.length) return null;

    return (
        <Component className={cn("flex min-w-36 flex-col gap-2", className)} {...rest}>
            <SettingSelectItem isActive={!subtitleTrack} onClick={() => setSubtitleTrack(-1)} label="Tắt" />

            {manifest.subtitleTracks.map((subtitle, index) => {
                const isActive = index === subtitleTrack?.id;

                return (
                    <SettingSelectItem
                        isActive={isActive}
                        label={subtitle.name}
                        key={subtitle.name + index}
                        onClick={() => setSubtitleTrack(index)}
                    />
                );
            })}
        </Component>
    );
});

SettingSubtitleSelect.displayName = "SettingSubtitleSelect";

export default SettingSubtitleSelect;
