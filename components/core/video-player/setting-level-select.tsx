import { memo } from "react";

import { cn } from "@/utils/cn";
import { useVideoPlayer } from "./store";
import SettingSelectItem from "./setting-select-item";
import { PolymorphicComponentProps } from "@/utils/polymorphic";

const SettingLevelSelect = memo(({ as, className, ...rest }: PolymorphicComponentProps<"ul">) => {
    const manifest = useVideoPlayer((state) => state.manifest);
    const currentLevel = useVideoPlayer((state) => state.currentLevel);
    const setCurrentLevel = useVideoPlayer((state) => state.setCurrentLevel);

    const Component = as || "ul";

    if (!manifest || !currentLevel) return null;

    return (
        <Component className={cn("flex min-w-36 flex-col gap-2", className)} {...rest}>
            <SettingSelectItem isActive={currentLevel.auto} onClick={() => setCurrentLevel(-1)} label="Tự động" />

            {manifest.levels.map((level, index) => {
                const isActive = currentLevel.auto ? false : currentLevel.id === index;

                return (
                    <SettingSelectItem
                        key={level.label}
                        label={level.label}
                        isActive={isActive}
                        onClick={() => setCurrentLevel(index)}
                    />
                );
            })}
        </Component>
    );
});

SettingLevelSelect.displayName = "SettingLevelSelect";

export default SettingLevelSelect;
