"use client";

import { useMotionValue, useSpring } from "motion/react";
import { CSSProperties, useEffect, useMemo, useRef } from "react";

const CHARACTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
function generateInstanceId() {
    let result = "";
    for (let i = 0; i < 13; i++) {
        result += CHARACTERS.charAt(Math.floor(Math.random() * CHARACTERS.length));
    }
    return result;
}

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number) {
    if (fromLow === fromHigh) {
        return toLow;
    }
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
}

type Props = {
    enabled?: boolean;
    distance?: number;
    hoverArea?: number;
    smoothing?: number;
    style?: CSSProperties;
    children?: {
        scale: number;
        distance: number;
    };
};

export default function MagneticHover(props: Props) {
    const { enabled, distance, hoverArea, smoothing } = {
        ...({
            enabled: true,
            distance: 10,
            hoverArea: 10,
            smoothing: 50,
            children: {
                scale: 1,
                distance: 10,
            },
        } as Required<Props>),
        ...props,
    };
    const id = useMemo(generateInstanceId, []);

    const transition = useMemo(() => ({ damping: 100, stiffness: mapRange(smoothing, 0, 100, 2e3, 50) }), [smoothing]);

    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const springX = useSpring(x, transition);
    const springY = useSpring(y, transition);
    const scale = useMotionValue(1);
    const springScale = useSpring(scale, transition);

    const ref = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLElement | null>(null);
    const parentRef = useRef<HTMLElement | null>(null);
    const isHoveringRef = useRef(false);
    const styleRef = useRef<HTMLStyleElement | null>(null);
    const hasSpringRef = useRef(smoothing !== 0);
    const transformRef = useRef<string | null>(null);

    useEffect(() => {
        const unsubscribeX = mouseX.onChange((v) => x.set(enabled ? v : 0));
        const unsubscribeY = mouseY.onChange((v) => y.set(enabled ? v : 0));
        return () => {
            unsubscribeX();
            unsubscribeY();
        };
    }, [enabled, mouseX, mouseY, x, y]);

    useEffect(() => {
        x.set(enabled ? mouseX.get() : 0);
        y.set(enabled ? mouseY.get() : 0);
        if (!enabled) {
            scale.set(1);
        } else if (isHoveringRef.current && props.children) {
            scale.set(props.children.scale);
        }
    }, [enabled, mouseX, mouseY, props.children, scale, x, y]);

    useEffect(() => {
        hasSpringRef.current = smoothing !== 0;
    }, [smoothing]);

    useEffect(() => {
        let animationFrameId: number;
        const updateTransform = () => {
            animationFrameId = requestAnimationFrame(updateTransform);
            if (!parentRef.current || !styleRef.current) {
                return;
            }
            const xValue = hasSpringRef.current ? springX.get() : x.get();
            const yValue = hasSpringRef.current ? springY.get() : y.get();
            const scaleValue = hasSpringRef.current ? springScale.get() : scale.get();
            const parentTransformValue = parentRef.current.style.transform;
            const parentTransform = `translate(${xValue.toFixed(3)}px, ${yValue.toFixed(3)}px)`;
            let newParentTransform = parentTransformValue;
            if (parentTransformValue === "none") {
                newParentTransform = parentTransform;
            } else {
                newParentTransform = `${parentTransform} ${parentTransformValue}`;
            }
            let childrenStyles = "";
            if (props.children) {
                const children = parentRef.current.children;
                for (let index = 0; index < children.length; index++) {
                    const child = children[index];
                    if (child === containerRef.current) {
                        continue;
                    }
                    const childTransformValue = (child as HTMLElement).style.transform;
                    const magneticChildTransform = `translate(${((xValue * props.children.distance) / distance).toFixed(3)}px,${((yValue * props.children.distance) / distance).toFixed(3)}px) scale(${scaleValue.toFixed(3)})`;
                    let newChildTransform = magneticChildTransform;
                    if (childTransformValue && childTransformValue !== "none") {
                        newChildTransform = `${magneticChildTransform} ${childTransformValue}`;
                    }
                    childrenStyles += `[data-magnetic="${id}"]>:nth-child(${index + 1}){transform:${newChildTransform}!important }`;
                }
            }
            transformRef.current = newParentTransform;
            styleRef.current.textContent = `[data-magnetic="${id}"]{transform:${newParentTransform}!important}${childrenStyles}`;
        };
        if (ref.current) {
            const container = ref.current.parentElement;
            if (container) {
                containerRef.current = container;
                const parent = container.parentElement;
                if (parent) {
                    parentRef.current = parent;
                    parent.setAttribute("data-magnetic", id);
                }
            }
        }
        updateTransform();
        return () => {
            if (animationFrameId) {
                cancelAnimationFrame(animationFrameId);
            }
        };
    }, [distance, id, props.children, scale, springScale, springX, springY, x, y]);

    useEffect(() => {
        const handleMouseMove = (event: MouseEvent) => {
            if (!parentRef.current) {
                return;
            }
            const element = parentRef.current;
            const rect = element.getBoundingClientRect();
            const mouseXPos = event.clientX;
            const mouseYPos = event.clientY;
            const isHovering =
                mouseXPos >= rect.left - hoverArea &&
                mouseXPos <= rect.right + hoverArea &&
                mouseYPos >= rect.top - hoverArea &&
                mouseYPos <= rect.bottom + hoverArea;
            isHoveringRef.current = isHovering;
            if (isHovering) {
                const displacementX = mouseXPos - (rect.left + rect.width / 2);
                const displacementY = mouseYPos - (rect.top + rect.height / 2);
                const normalizedX = (displacementX / (rect.width / 2)) * distance;
                const normalizedY = (displacementY / (rect.height / 2)) * distance;
                mouseX.set(normalizedX);
                mouseY.set(normalizedY);
                scale.set(enabled && props.children ? props.children.scale : 1);
            } else {
                mouseX.set(0);
                mouseY.set(0);
                scale.set(1);
            }
        };
        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [distance, x, y, transition, enabled, props.children, hoverArea, mouseX, mouseY, scale]);

    return (
        <div ref={ref}>
            <style ref={styleRef} />
        </div>
    );
}
