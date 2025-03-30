// import Carousel from "@/components/ui/carousel";
// import Slide from "@/components/ui/slide";
// import NativeCarousel from "@/components/ui/native-carousel";

import VideoPlayer from "@/components/ui/video-player";
import VideoPlayerProvider from "@/components/core/video-player/provider";

export default function Home() {
    return (
        <div className="flex w-full flex-col justify-center">
            {/* <Carousel /> */}

            {/* <Slide /> */}

            <div className="mx-auto aspect-video h-full w-full max-w-6xl">
                <VideoPlayerProvider
                    // subtitles={[
                    //     {
                    //         lang: "en",
                    //         name: "English",
                    //         src: "https://test.trollhub.me/public/subtitles/video.vtt",
                    //     },
                    // ]}
                    // src="https://sundaythekingplays.xyz/hls/PpzJ2Hd9zUsiTxXA0+FciL72dO18vbuqacVLUoYGZJAOSpLjOtwLb8jaCqzk6cgBxgw-8vh5PilcnF51X2fEsQ==/aW5kZXgtZjItdjEtYTEubTN1OA==.m3u8"
                    src="http://localhost:3001/public/videos/test/GT102.m3u8"
                >
                    <VideoPlayer />
                </VideoPlayerProvider>
            </div>
        </div>
    );
}
