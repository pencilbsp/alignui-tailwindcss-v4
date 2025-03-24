// import Carousel from "@/components/ui/carousel";
// import Slide from "@/components/ui/slide";
// import NativeCarousel from "@/components/ui/native-carousel";

import VideoPlayer from "@/components/ui/video-player";
import VideoPlayerProvider from "@/components/core/video-player/zustand-provider";

export default function Home() {
    return (
        <div className="flex w-full flex-col justify-center">
            {/* <Carousel /> */}

            {/* <Slide /> */}

            <div className="aspect-video h-full w-full max-w-4xl">
                <VideoPlayerProvider src="https://vip.opstream12.com/20250323/26539_b8ba4466/index.m3u8">
                    <VideoPlayer />
                </VideoPlayerProvider>
            </div>
        </div>
    );
}
