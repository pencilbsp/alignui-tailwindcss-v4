import { RiCheckLine } from "@remixicon/react";

import { cn } from "@/utils/cn";
import { PolymorphicComponentProps } from "@/utils/polymorphic";

type Props = {
    label: string;
    isActive: boolean;
};

const SettingSelectItem = <T extends React.ElementType>({
    as,
    label,
    isActive,
    className,
    ...rest
}: PolymorphicComponentProps<T, Props>) => {
    const Component = as || "li";

    return (
        <Component className={cn("flex cursor-pointer items-center justify-between gap-2", className)} {...rest}>
            <span>{label}</span>
            {isActive && <RiCheckLine className="size-4 lg:size-5" />}
        </Component>
    );
};

export default SettingSelectItem;
