"use client";

import React, { useEffect, useRef, HTMLAttributes } from "react";
import { motion, useMotionValue, useSpring, type SpringOptions, type MotionProps } from "motion/react";

function mapRange(value: number, fromLow: number, fromHigh: number, toLow: number, toHigh: number): number {
    if (fromLow === fromHigh) return toLow;
    const percentage = (value - fromLow) / (fromHigh - fromLow);
    return toLow + percentage * (toHigh - toLow);
}

export type MagneticHoverProps = MotionProps &
    HTMLAttributes<HTMLDivElement> & {
        enabled?: boolean;
        distance?: number;
        hoverArea?: number;
        scaleValue?: number;
        smoothing?: number;
    };

export function MagneticHover({
    children,
    enabled = true,
    distance = 10,
    smoothing = 50,
    hoverArea = 10,
    scaleValue = 1,
    ...rest
}: MagneticHoverProps) {
    const ref = useRef<HTMLDivElement>(null);
    const x = useMotionValue(0);
    const y = useMotionValue(0);
    const scale = useMotionValue(1);

    // Transition được tính dựa trên prop smoothing
    const transition: SpringOptions = {
        damping: 100,
        stiffness: mapRange(smoothing, 0, 100, 2000, 50),
    };

    // Dùng spring để tạo hiệu ứng mượt cho các giá trị x, y và scale
    const springX = useSpring(x, transition);
    const springY = useSpring(y, transition);
    const springScale = useSpring(scale, transition);

    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (!ref.current) return;

            // Lấy bounding box của phần tử
            const rect = ref.current.getBoundingClientRect();
            const mouseXPos = e.clientX;
            const mouseYPos = e.clientY;

            // Kiểm tra xem chuột có nằm trong vùng mở rộng hoverArea không
            const isHovering =
                mouseXPos >= rect.left - hoverArea &&
                mouseXPos <= rect.right + hoverArea &&
                mouseYPos >= rect.top - hoverArea &&
                mouseYPos <= rect.bottom + hoverArea;

            if (enabled && isHovering) {
                // Tính tâm của phần tử
                const centerX = rect.left + rect.width / 2;
                const centerY = rect.top + rect.height / 2;
                const dx = mouseXPos - centerX;
                const dy = mouseYPos - centerY;

                // Chuẩn hóa khoảng cách theo bán kính của phần tử và nhân với distance
                const normalizedX = (dx / (rect.width / 2)) * distance;
                const normalizedY = (dy / (rect.height / 2)) * distance;
                x.set(normalizedX);
                y.set(normalizedY);
                scale.set(scaleValue);
            } else {
                // Nếu không hover, đặt lại giá trị
                x.set(0);
                y.set(0);
                scale.set(1);
            }
        };

        window.addEventListener("mousemove", handleMouseMove);
        return () => window.removeEventListener("mousemove", handleMouseMove);
    }, [enabled, distance, hoverArea, scaleValue, x, y, scale]);

    return (
        <motion.div
            ref={ref}
            style={{
                x: springX,
                y: springY,
                scale: springScale,
            }}
            {...rest}
        >
            {children}
        </motion.div>
    );
}
