import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, Check, Search, X } from 'lucide-react';

export interface SelectOption {
  label: string;
  value: string | number;
  description?: string;
}

export interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  options?: SelectOption[];
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  id?: string;
  name?: string;
  children?: React.ReactNode;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  icon,
  options,
  value,
  defaultValue,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  className = '',
  id,
  name,
  children
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [placement, setPlacement] = useState<'bottom' | 'top'>('bottom');
  const [availableHeight, setAvailableHeight] = useState<number>(224);
  const [internalValue, setInternalValue] = useState<string | number>(
    defaultValue !== undefined ? defaultValue : ''
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  const parsedOptions: SelectOption[] = useMemo(() => {
    if (options && options.length > 0) {
      return options;
    }
    if (children) {
      const extracted: SelectOption[] = [];
      React.Children.forEach(children, child => {
        if (React.isValidElement(child)) {
          const p = child.props as { value?: string | number; children?: React.ReactNode };
          if (p && p.value !== undefined) {
            extracted.push({
              value: p.value,
              label: p.children ? String(p.children) : String(p.value)
            });
          }
        }
      });
      return extracted;
    }
    return [];
  }, [options, children]);

  const selectedOption = useMemo(() => {
    return parsedOptions.find(opt => String(opt.value) === String(currentValue));
  }, [parsedOptions, currentValue]);

  const filteredOptions = useMemo(() => {
    if (!searchQuery.trim()) return parsedOptions;
    const q = searchQuery.toLowerCase().trim();
    return parsedOptions.filter(
      opt =>
        opt.label.toLowerCase().includes(q) ||
        (opt.description && opt.description.toLowerCase().includes(q))
    );
  }, [parsedOptions, searchQuery]);

  const recalculatePlacement = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    const menuHeight = menuRef.current?.offsetHeight || 260;

    if (spaceBelow < menuHeight && spaceAbove > spaceBelow) {
      setPlacement('top');
      setAvailableHeight(Math.max(120, Math.min(224, spaceAbove - 60)));
    } else {
      setPlacement('bottom');
      setAvailableHeight(Math.max(120, Math.min(224, spaceBelow - 60)));
    }
  }, []);

  const handleToggle = () => {
    if (disabled) return;
    if (!isOpen) {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const viewportHeight = window.innerHeight || document.documentElement.clientHeight;
        const spaceBelow = viewportHeight - rect.bottom;
        const spaceAbove = rect.top;
        const estimatedHeight = 260;
        if (spaceBelow < estimatedHeight && spaceAbove > spaceBelow) {
          setPlacement('top');
          setAvailableHeight(Math.max(120, Math.min(224, spaceAbove - 60)));
        } else {
          setPlacement('bottom');
          setAvailableHeight(Math.max(120, Math.min(224, spaceBelow - 60)));
        }
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
        setHighlightedIndex(-1);
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
  }, [isOpen, recalculatePlacement, filteredOptions.length]);

  useEffect(() => {
    if (isOpen && parsedOptions.length > 6 && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, parsedOptions.length]);

  const handleSelect = (optValue: string | number) => {
    setInternalValue(optValue);
    setIsOpen(false);
    setSearchQuery('');
    setHighlightedIndex(-1);

    if (onChange) {
      const syntheticEvent = {
        target: {
          value: String(optValue),
          name: name || ''
        },
        currentTarget: {
          value: String(optValue),
          name: name || ''
        }
      } as React.ChangeEvent<HTMLSelectElement>;
      onChange(syntheticEvent);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (disabled) return;

    if (e.key === 'Escape') {
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
      return;
    }

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleToggle();
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev < filteredOptions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => (prev > 0 ? prev - 1 : filteredOptions.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
        handleSelect(filteredOptions[highlightedIndex].value);
      }
    } else if (e.key === 'Tab') {
      setIsOpen(false);
      setSearchQuery('');
      setHighlightedIndex(-1);
    }
  };

  return (
    <div ref={containerRef} className="w-full space-y-1 relative" onKeyDown={handleKeyDown}>
      {label && (
        <label
          htmlFor={selectId}
          className="block text-xs font-semibold text-slate-700"
          onClick={handleToggle}
        >
          {label} {required && <span className="text-teal-700">*</span>}
        </label>
      )}

      {name && <input type="hidden" name={name} value={currentValue} />}

      <div className="relative">
        <button
          ref={triggerRef}
          type="button"
          id={selectId}
          disabled={disabled}
          onClick={handleToggle}
          className={`w-full h-9 rounded-lg bg-white border text-xs text-left transition-all duration-150 flex items-center justify-between cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-700/20 focus:border-teal-700 disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed ${
            icon ? 'pl-9' : 'pl-3'
          } pr-3 ${
            error
              ? 'border-rose-400 focus:ring-rose-500/20 focus:border-rose-600'
              : isOpen
              ? 'border-teal-700 ring-2 ring-teal-700/20 shadow-xs'
              : 'border-slate-200 hover:border-slate-300'
          } ${className}`}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
        >
          {icon && (
            <div className="absolute left-3 text-slate-400 pointer-events-none flex items-center justify-center shrink-0">
              {icon}
            </div>
          )}

          <span
            className={`truncate flex-1 ${
              selectedOption ? 'text-slate-900 font-medium' : 'text-slate-400'
            }`}
          >
            {selectedOption ? selectedOption.label : placeholder}
          </span>

          <ChevronDown
            className={`w-3.5 h-3.5 shrink-0 ml-2 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-teal-700' : ''
            }`}
          />
        </button>

        {isOpen && (
          <div
            ref={menuRef}
            className={`absolute left-0 right-0 ${
              placement === 'top'
                ? 'bottom-full mb-1.5 origin-bottom animate-in fade-in slide-in-from-bottom-2 zoom-in-95'
                : 'top-full mt-1.5 origin-top animate-in fade-in slide-in-from-top-2 zoom-in-95'
            } bg-white rounded-xl shadow-xl border border-slate-200 py-1 z-50 duration-100 min-w-[180px]`}
            role="listbox"
          >
            {parsedOptions.length > 6 && (
              <div className="p-2 border-b border-slate-100">
                <div className="relative flex items-center">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={e => {
                      setSearchQuery(e.target.value);
                      setHighlightedIndex(0);
                    }}
                    placeholder="Search options..."
                    className="w-full h-7 pl-8 pr-7 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-teal-700 focus:bg-white text-slate-900 placeholder:text-slate-400"
                    onClick={e => e.stopPropagation()}
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={e => {
                        e.stopPropagation();
                        setSearchQuery('');
                      }}
                      className="absolute right-2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            )}

            <div
              className="overflow-y-auto py-1"
              style={{ maxHeight: `${availableHeight}px` }}
            >
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-3 text-center text-xs text-slate-400">
                  No matching options
                </div>
              ) : (
                filteredOptions.map((opt, idx) => {
                  const isSelected = String(opt.value) === String(currentValue);
                  const isHighlighted = idx === highlightedIndex;

                  return (
                    <button
                      type="button"
                      key={String(opt.value)}
                      onClick={e => {
                        e.stopPropagation();
                        handleSelect(opt.value);
                      }}
                      onMouseEnter={() => setHighlightedIndex(idx)}
                      className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-teal-50/80 text-teal-900 font-semibold'
                          : isHighlighted
                          ? 'bg-slate-50 text-slate-900'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                      role="option"
                      aria-selected={isSelected}
                    >
                      <div className="min-w-0 pr-2">
                        <div className="truncate">{opt.label}</div>
                        {opt.description && (
                          <div className="text-[10px] text-slate-400 truncate">
                            {opt.description}
                          </div>
                        )}
                      </div>

                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-teal-700 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>

      {error ? (
        <p className="text-[11px] text-rose-600 font-medium">{error}</p>
      ) : helperText ? (
        <p className="text-[11px] text-slate-500">{helperText}</p>
      ) : null}
    </div>
  );
};
