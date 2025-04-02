"use client";

// import Image from "next/image";

import Flower from "@/assets/images/flower.png";
// import MagneticHover from "../core/magneti-hover";
import MagnetButton from "./magnet-button";

export default function MotionTabButton() {
    return (
        <div className="flex max-w-6xl">
            {/* <div className="ring-stroke-soft-200 rounded-4xl ring-2 ring-inset">
                <div>
                    <MagneticHover>
                        {{
                            scale: 0.8,
                            distance: 10,
                        }}
                    </MagneticHover>
                </div>
                <div className="">
                    <Image width={56} height={56} src={Flower} alt="Flower" />
                </div>
            </div> */}

            <div style={{ padding: 20 }}>
                <MagnetButton image={Flower} alt="Flower" text="Beautiful visuals for your store" />
            </div>
        </div>
    );
}
