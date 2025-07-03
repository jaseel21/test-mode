import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image"; // Add this import

const AnimatedEntry = () => {
  const router = useRouter();
  const widthAnim = useMotionValue(0);
  const opacityAnim = useMotionValue(1);
  const [showAnimatedText, setShowAnimatedText] = useState(true);
  const [show, setShow] = useState(true);
  const rotation = useMotionValue(0);

  const strokeWidth = 4;
  const radius = 24;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    // Animation for width and opacity
    let show = true;
    let count = 0;

    const interval = setInterval(() => {
      if (count >= 2) {
        clearInterval(interval);
        setShow(false);
        return;
      }

      if (show) {
        setShowAnimatedText(true);
        animate(widthAnim, 110, { duration: 0.8 });
        animate(opacityAnim, 1, { duration: 0.3 });
      } else {
        animate(widthAnim, 0, {
          duration: 0.6,
          onComplete: () => setShowAnimatedText(false),
        });
        animate(opacityAnim, 0, { duration: 0.3 });
        count++;
      }

      show = !show;
    }, 2000);

    // Rotation animation
    animate(rotation, 360, {
      duration: 3,
      ease: "linear",
      repeat: Infinity,
    });

    return () => clearInterval(interval);
  }, [widthAnim, opacityAnim, rotation]);

  return (
    <div className="pt-4 pl-4 flex items-center">
      <motion.div
        style={{
          padding: "1px",
          borderRadius: "999px",
          position: "relative",
        }}
      >
        {/* Rotating SVG Circle with Gradient Stroke */}
        <motion.div
          style={{
            position: "absolute",
            top: "-9px",
            left: "-10px",
            zIndex: -1,
            width: "62px",
            height: "62px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            opacity: show ? 0 : 1,
            rotate: rotation,
          }}
        >
          <svg width="60" height="60">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#fff" stopOpacity="1" />
                <stop offset="100%" stopColor="#5E2CA2" stopOpacity="0" />
              </linearGradient>
            </defs>
            <circle
              cx="30"
              cy="30"
              r={radius}
              stroke="url(#grad)"
              strokeWidth={strokeWidth}
              strokeDasharray={`${circumference * 0.75} ${circumference * 0.25}`}
              fill="none"
            />
          </svg>
        </motion.div>

        {/* Main Button */}
        <button onClick={() => router.push("/app-about")}>
          <div
            className="bg-white flex items-center justify-center rounded-full whitespace-nowrap"
            style={{ height: "auto" }}
          >
            <div className="p-2.5 py-3">
              {/* Replaced img with Next.js Image */}
              <Image
                src="/AICMasjid.svg"
                width={20} // Approximate width based on w-5 (1.25rem = 20px)
                height={20} // Assuming square icon; adjust if needed
                alt=""
                className="w-5" // Keep class for consistency, though width prop overrides it
              />
            </div>
            <motion.div
              style={{
                width: showAnimatedText ? widthAnim : 0,
                opacity: opacityAnim,
                overflow: "hidden",
                marginRight: showAnimatedText ? "6px" : "0px",
              }}
              className="flex items-center"
            >
              <span className="text-black text-sm font-semibold block truncate">Islamic Centre</span>
            </motion.div>
          </div>
        </button>
      </motion.div>
    </div>
  );
};

export default AnimatedEntry;