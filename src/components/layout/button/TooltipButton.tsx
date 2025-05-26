import React, { useState, useRef, useEffect, forwardRef } from "react";

type TooltipButtonProps = {
  children?: React.ReactNode;
  tooltipText: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
};

const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({ children, tooltipText, onClick, icon }, ref) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const handleMouseEnter = () => setIsTooltipVisible(true);
    const handleMouseLeave = () => setIsTooltipVisible(false);

    return (
      <button
        ref={ref}
        type="button"
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-2 p-2 rounded-full bg-gray-200 hover:bg-gray-300 text-black text-sm relative"
      >
        {icon && <span className="flex items-center">{icon}</span>}
        {children}
        {isTooltipVisible && (
          <span className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-20 bg-white border text-black py-2 px-3 rounded-lg text-xs font-semibold opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap">
            {tooltipText}
          </span>
        )}
      </button>
    );
  }
);

TooltipButton.displayName = "TooltipButton";
export default TooltipButton;
