import * as React from "react";

const maskSvg = `
<svg width="756" height="1080" viewBox="0 0 756 1080" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M274.222 1065H64.4449V16.1121H274.222V225.89H484V435.667H274.222V1065ZM693.778 1065H484V435.667H693.778V1065Z" fill="black"/>
</svg>
`;

const encodedMask = encodeURIComponent(maskSvg);

const LogoSmall: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      className={`relative size-full ${className}`}
      data-name="logo-with-mask"
      {...props}
    >
      <div
        className="absolute inset-0"
        style={{
          WebkitMaskImage: `url("data:image/svg+xml,${encodedMask}")`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "contain",
          WebkitMaskPosition: "center",
          maskImage: `url("data:image/svg+xml,${encodedMask}")`,
          maskRepeat: "no-repeat",
          maskSize: "contain",
          maskPosition: "center",
        }}
      >
        <svg
          className="block size-full"
          viewBox="0 0 756 1080"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="94.5394"
              y1="383.804"
              x2="787.701"
              y2="397.659"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FC7236" />
              <stop offset="0.215165" stopColor="#FC4936" />
              <stop offset="0.438504" stopColor="#FC3636" />
              <stop offset="0.508013" stopColor="#FC4936" />
              <stop offset="0.80291" stopColor="#FC7236" />
            </linearGradient>
          </defs>
          <rect width="756" height="1080" fill="url(#paint0_linear)" />
        </svg>
      </div>
    </div>
  );
};

export default LogoSmall;
