import * as React from 'react';
import { cn } from './GlassPanel';

interface SliderProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  valueDisplay?: string | number;
}

export const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({ className, label, valueDisplay, ...props }, ref) => {
    return (
      <div className="w-full space-y-2 select-none touch-none">
        {(label || valueDisplay) && (
            <div className="flex justify-between items-end px-1">
                {label && <span className="text-xs font-medium text-zinc-400 uppercase tracking-widest">{label}</span>}
                {valueDisplay && <span className="text-sm font-mono text-zinc-200">{valueDisplay}</span>}
            </div>
        )}
        <div className="relative w-full h-8 flex items-center">
            <input
                type="range"
                ref={ref}
                className={cn(
                    "w-full absolute z-20 opacity-0 cursor-pointer h-full",
                    className
                )}
                {...props}
            />
            {/* Custom Track */}
            <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden z-10">
                <div
                    className="h-full bg-blue-500 rounded-full transition-all duration-75 ease-out"
                    style={{
                        width: `${((Number(props.value) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100}%`
                    }}
                />
            </div>
            {/* Custom Thumb Visual (Optional, just for checking alignment) */}
            <div
                className="absolute h-6 w-6 bg-white rounded-full shadow-lg z-10 pointer-events-none transition-all duration-75 ease-out flex items-center justify-center"
                style={{
                    left: `calc(${((Number(props.value) - Number(props.min)) / (Number(props.max) - Number(props.min))) * 100}% - 12px)`
                }}
            >
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
            </div>
        </div>
      </div>
    );
  }
);
Slider.displayName = "Slider";
