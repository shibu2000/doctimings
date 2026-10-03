import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MoreVertical } from 'lucide-react';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  isDestructive?: boolean;
}

export interface RowActionsProps {
  primaryActions?: {
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    title?: string;
  }[];
  menuItems?: ActionMenuItem[];
}

export const RowActions: React.FC<RowActionsProps> = ({
  primaryActions = [],
  menuItems = []
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const recalculatePlacement = useCallback(() => {
    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const estimatedHeight = menuRef.current?.offsetHeight || menuItems.length * 36 + 16;

    if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
      setPlacement('top');
    } else {
      setPlacement('bottom');
    }
  }, [menuItems.length]);

  const handleToggle = () => {
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
      const spaceBelow = viewportHeight - rect.bottom;
      const spaceAbove = rect.top;
      const estimatedHeight = menuItems.length * 36 + 16;

      if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
        setPlacement('top');
      } else {
        setPlacement('bottom');
      }
    }
    setIsOpen(prev => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    recalculatePlacement();

    const handleScrollOrResize = () => {
      recalculatePlacement();
    };

    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, recalculatePlacement]);

  return (
    <div className="flex items-center justify-end gap-1.5 shrink-0" ref={containerRef}>
      {primaryActions.map((action, idx) => (
        <button
          key={idx}
          type="button"
          onClick={action.onClick}
          title={action.title || action.label}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold transition-all duration-150 cursor-pointer shadow-2xs ${
            action.variant === 'primary'
              ? 'bg-teal-800 hover:bg-teal-900 text-white'
              : action.variant === 'secondary'
              ? 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200/80'
              : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 hover:border-slate-300'
          }`}
        >
          {action.icon && <span className="shrink-0">{action.icon}</span>}
          <span>{action.label}</span>
        </button>
      ))}

      {menuItems.length > 0 && (
        <div className="relative">
          <button
            ref={buttonRef}
            type="button"
            onClick={handleToggle}
            className="p-1.5 rounded-md text-slate-500 hover:text-slate-800 hover:bg-slate-100 border border-transparent hover:border-slate-200 transition-colors cursor-pointer"
            title="More actions"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>

          {isOpen && (
            <div
              ref={menuRef}
              className={`absolute right-0 ${
                placement === 'top'
                  ? 'bottom-full mb-1 origin-bottom animate-in fade-in slide-in-from-bottom-2 zoom-in-95'
                  : 'top-full mt-1 origin-top animate-in fade-in slide-in-from-top-2 zoom-in-95'
              } w-44 bg-white rounded-lg border border-slate-200 shadow-lg py-1 z-30 duration-100`}
            >
              {menuItems.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    item.onClick();
                  }}
                  className={`w-full px-3 py-1.5 text-xs text-left flex items-center gap-2 transition-colors cursor-pointer ${
                    item.isDestructive
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
