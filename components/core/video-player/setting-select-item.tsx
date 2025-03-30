import { RiCheckLine } from "@remixicon/react";

import { cn } from "@/utils/cn";
import { PolymorphicComponentProps } from "@/utils/polymorphic";

type Props = {
    isActive?: boolean;
};

const SettingSelectItem = <T extends React.ElementType>({
    as,
    isActive,
    children,
    className,
    ...rest
}: PolymorphicComponentProps<T, Props>) => {
    const Component = as || "li";

    return (
        <Component
            className={cn(
                "flex cursor-pointer items-center justify-between gap-3 rounded-md px-2 py-1.5 transition-colors hover:bg-neutral-700",
                className,
            )}
            {...rest}
        >
            {children}
            {isActive && <RiCheckLine className="size-4 lg:size-5" />}
        </Component>
    );
};

export default SettingSelectItem;
