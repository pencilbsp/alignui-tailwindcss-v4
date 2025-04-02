// import Carousel from "@/components/ui/carousel";
// import Slide from "@/components/ui/slide";
// import NativeCarousel from "@/components/ui/native-carousel";

import MotionTabButton from "@/components/ui/motion-tab-button";
// import VideoPlayer from "@/components/ui/video-player";
// import VideoPlayerProvider from "@/components/core/video-player/provider";

export default function Home() {
    return (
        <div className="flex w-full flex-col justify-center bg-bg-strong-950">
            {/* <Carousel /> */}

            {/* <Slide /> */}

            {/* <div className="mx-auto aspect-video h-full w-full max-w-6xl">
                <VideoPlayerProvider src="http://localhost:3001/public/videos/test/GT102.m3u8">
                    <VideoPlayer />
                </VideoPlayerProvider>
            </div> */}

            <MotionTabButton />

            {/* <MagnetButton /> */}
        </div>
    );
}
