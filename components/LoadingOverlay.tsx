import React from "react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import "./LoadingOverlay.css";

// Option A (public/): use this
const LOTTIE_SRC = "/lottie/loading.lottie";

// Option B (src/assets/): use this instead
// import loadingLottie from "../assets/lottie/loading.lottie?url";
// const LOTTIE_SRC = loadingLottie;

type Props = {
  isVisible?: boolean;
};

export default function LoadingOverlay({ isVisible = true }: Props) {
  if (!isVisible) return null;

  return (
    <div className="loadingOverlay">
      <div className="loadingLottieWrap">
        <DotLottieReact
          src={LOTTIE_SRC}
          autoplay
          loop
          style={{ width: 220, height: 220 }}
        />
      </div>
    </div>
  );
}
