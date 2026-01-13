import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface CompactCardProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  children?: ReactNode;
  onClick?: () => void;
}

export function CompactCard({
  title,
  description,
  icon,
  className,
  children,
  onClick
}: CompactCardProps) {
  return (
    <div
      className={cn(
        "bg-zinc-900/50 backdrop-blur border border-zinc-800 rounded-md p-3 hover:bg-zinc-800/50 hover:border-zinc-700 transition-all duration-200 cursor-pointer group",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start space-x-2.5">
        {icon && (
          <div className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-medium text-zinc-100 truncate">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">
              {description}
            </p>
          )}
          {children}
        </div>
      </div>
    </div>
  );
}