import * as React from "react";

const LogoGradient: React.FC<React.HTMLAttributes<HTMLDivElement>> = ({
  className = "",
  ...props
}) => {
  return (
    <div
      className={`relative size-full ${className}`}
      data-name="logo"
      {...props}
    >
      <div
        className="absolute bottom-[14.581%] left-[2.456%] right-[2.795%] top-[14.548%]"
        style={{
          WebkitMaskImage: `url("data:image/svg+xml,%3Csvg preserveAspectRatio='none' width='100%25' height='100%25' overflow='visible' style='display:block' viewBox='0 0 1070 583' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cg id='clip0_10323_690'%3E%3Cpath id='Vector' d='M1070 0H0v583h1070V0Z' fill='black'/%3E%3C/g%3E%3C/svg%3E")`,
          WebkitMaskRepeat: "no-repeat",
          WebkitMaskSize: "1070px 583px",
          WebkitMaskPosition: "-26.258px -84.813px",
        }}
      >
        <svg
          className="block size-full"
          viewBox="0 0 1015 414"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <g>
            <path
              d="M82.6352 413.177H0V0h82.6352v82.635h82.636v82.636H82.6352v247.906Zm165.271 0H165.271V165.271h82.635v247.906Zm145.438 0H310.709V82.635h165.271v82.636h-82.636v247.906Zm165.271 0H475.98V165.271h82.635v247.906Zm145.439 0V330.542H621.418V165.271h82.636v165.271h82.636V165.271h-82.636V82.635h82.636V0h82.636v413.177H704.054Zm310.716 0H932.127V0h82.643v413.177Z"
              fill="url(#paint0_linear)"
            />
          </g>
          <defs>
            <linearGradient
              id="paint0_linear"
              x1="-138.536"
              y1="109.516"
              x2="1081.13"
              y2="179.042"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="#FC7236" />
              <stop offset="0.215" stopColor="#FC4936" />
              <stop offset="0.438" stopColor="#FC3636" />
              <stop offset="0.508" stopColor="#FC4936" />
              <stop offset="0.803" stopColor="#FC7236" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  );
};

export default LogoGradient;
