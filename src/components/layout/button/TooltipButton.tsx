import { Button } from "@/components/ui/button";
import { Span } from "next/dist/trace";
import React, { useState, useRef, useEffect, forwardRef } from "react";

type TooltipButtonProps = {
  children?: React.ReactNode;
  tooltipText: string;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  icon?: React.ReactNode;
  iconLabel?: string;
};

const TooltipButton = forwardRef<HTMLButtonElement, TooltipButtonProps>(
  ({ children, tooltipText, onClick, icon, iconLabel }, ref) => {
    const [isTooltipVisible, setIsTooltipVisible] = useState(false);

    const handleMouseEnter = () => setIsTooltipVisible(true);
    const handleMouseLeave = () => setIsTooltipVisible(false);

    return (
      <Button
        ref={ref}
        type="button"
        variant={"outline"}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="flex items-center gap-2 p-4 rounded-md bg-gray-200 hover:bg-gray-300 text-black dark:text-white text-sm relative"
      >
        {icon && (
          <span className="flex items-center tracking-wide">
            {icon} {iconLabel ? <span className="ml-1.5">{iconLabel}v</span> : ""}
          </span>
        )}
        {children}
        {isTooltipVisible && (
          <span className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-20 bg-white border text-black py-2 px-3 rounded-lg text-xs font-semibold opacity-100 transition-opacity duration-200 shadow-xl whitespace-nowrap">
            {tooltipText}
          </span>
        )}
      </Button>
    );
  }
);

TooltipButton.displayName = "TooltipButton";
export default TooltipButton;
