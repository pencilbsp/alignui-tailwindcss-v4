// AlignUI Divider v0.0.0

import { tv, type VariantProps } from "tailwind-variants";

const DIVIDER_ROOT_NAME = "DividerRoot";

export const dividerVariants = tv({
    base: "relative flex w-full items-center",
    variants: {
        variant: {
            line: "before:bg-stroke-soft-200 h-0 before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:-translate-y-1/2",
            "line-spacing": [
                // base
                "h-1",
                // before
                "before:bg-stroke-soft-200 before:absolute before:top-1/2 before:left-0 before:h-px before:w-full before:-translate-y-1/2",
            ],
            "line-text": [
                // base
                "gap-2.5",
                "text-subheading-2xs text-text-soft-400",
                // before
                "before:bg-stroke-soft-200 before:h-px before:w-full before:flex-1",
                // after
                "after:bg-stroke-soft-200 after:h-px after:w-full after:flex-1",
            ],
            content: [
                // base
                "gap-2.5",
                // before
                "before:bg-stroke-soft-200 before:h-px before:w-full before:flex-1",
                // after
                "after:bg-stroke-soft-200 after:h-px after:w-full after:flex-1",
            ],
            text: [
                // base
                "px-2 py-1",
                "text-subheading-xs text-text-soft-400",
            ],
            "solid-text": [
                // base
                "bg-bg-weak-50 px-5 py-1.5 uppercase",
                "text-subheading-xs text-text-soft-400",
            ],
        },
    },
    defaultVariants: {
        variant: "line",
    },
});

function Divider({
    className,
    variant,
    ...rest
}: React.HTMLAttributes<HTMLDivElement> & VariantProps<typeof dividerVariants>) {
    return <div role="separator" className={dividerVariants({ variant, class: className })} {...rest} />;
}
Divider.displayName = DIVIDER_ROOT_NAME;

export { Divider as Root };
