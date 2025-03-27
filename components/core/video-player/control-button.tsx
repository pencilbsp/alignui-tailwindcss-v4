import { ElementType } from "react";

import { cn } from "@/utils/cn";
import { RemixiconComponentType } from "@remixicon/react";

import { PolymorphicComponentProps } from "@/utils/polymorphic";

type Props = { icon: RemixiconComponentType };

const ControlButton = <T extends ElementType>({
    as,
    children,
    className,
    icon: Icon,
    ...rest
}: PolymorphicComponentProps<T, Props>) => {
    const Component = as || "button";

    return (
        <Component className={cn("cursor-pointer", className)} {...rest}>
            <Icon className="size-6 lg:size-8" />
            {children}
        </Component>
    );
};

export default ControlButton;
