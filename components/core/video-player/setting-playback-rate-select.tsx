import { memo } from "react";

import { cn } from "@/utils/cn";
import { useVideoPlayer } from "./store";
import SettingSelectItem from "./setting-select-item";
import { PolymorphicComponentProps } from "@/utils/polymorphic";

const SettingPlaybackRateSelect = memo(({ as, className, ...rest }: PolymorphicComponentProps<"ul">) => {
    const defaultRates = useVideoPlayer((state) => state.defaultRates);
    const playbackRate = useVideoPlayer((state) => state.playbackRate);
    const setPlaybackRate = useVideoPlayer((state) => state.setPlaybackRate);

    const Component = as || "ul";

    return (
        <Component className={cn("flex min-w-36 flex-col gap-1", className)} {...rest}>
            {defaultRates.map((rate) => {
                const label = rate.label || rate.value.toString();
                const isActive = playbackRate.value === rate.value;
                return (
                    <SettingSelectItem key={rate.value} isActive={isActive} onClick={() => setPlaybackRate(rate)}>
                        <span>{label}</span>
                    </SettingSelectItem>
                );
            })}
        </Component>
    );
});

SettingPlaybackRateSelect.displayName = "SettingPlaybackRateSelect";

export default SettingPlaybackRateSelect;
