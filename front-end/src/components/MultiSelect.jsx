import { useState, useRef, useEffect } from 'react';
import { ChevronDown, X, Check } from 'lucide-react';

export default function MultiSelect({ options, value = [], onChange, placeholder = 'Select...' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  const isSelected = (optionValue) => value.includes(optionValue);

  const toggle = (optionValue) => {
    if (isSelected(optionValue)) {
      onChange(value.filter(v => v !== optionValue));
    } else {
      onChange([...value, optionValue]);
    }
  };

  const clearAll = () => {
    onChange([]);
  };

  const getDisplayText = () => {
    if (value.length === 0) return placeholder;
    if (value.length === 1) {
      const selected = options.find(o => o.value === value[0]);
      return selected ? selected.label : placeholder;
    }
    return `${value.length} selected`;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full px-4 py-2 rounded-lg font-medium transition-all
          flex items-center justify-between
          ${value.length > 0
            ? 'bg-copilot-accent-blue text-white shadow-lg'
            : 'bg-copilot-bg-secondary text-copilot-text-secondary border border-copilot-border-default hover:border-copilot-accent-blue'
          }
        `}
      >
        <span>
          {getDisplayText()}
        </span>
        <ChevronDown size={16} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-2 bg-copilot-bg-secondary border border-copilot-border-default rounded-lg shadow-lg max-h-80 flex flex-col">
          {/* Search Input */}
          <div className="p-3 border-b border-copilot-border-default">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full px-3 py-2 pr-8 rounded-md bg-copilot-bg-tertiary border border-copilot-border-default text-copilot-text-primary placeholder:text-copilot-text-tertiary focus:border-copilot-accent-blue focus:ring-1 focus:ring-copilot-accent-blue"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-copilot-text-tertiary hover:text-copilot-text-secondary"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* Clear All Button */}
          {value.length > 0 && (
            <div className="px-3 py-2 border-b border-copilot-border-default">
              <button
                type="button"
                onClick={clearAll}
                className="text-sm text-copilot-accent-blue hover:text-copilot-accent-blue/80"
              >
                Clear all ({value.length})
              </button>
            </div>
          )}

          {/* Options List */}
          <ul className="overflow-y-auto flex-1">
            {filteredOptions.length === 0 ? (
              <li className="px-4 py-3 text-sm text-copilot-text-tertiary">
                No results found
              </li>
            ) : (
              filteredOptions.map((option) => (
                <li
                  key={option.value}
                  onClick={() => toggle(option.value)}
                  className={`
                    px-4 py-2.5 cursor-pointer flex items-center justify-between
                    hover:bg-copilot-bg-tertiary transition-colors
                    ${isSelected(option.value) ? 'bg-copilot-bg-tertiary/50' : ''}
                  `}
                >
                  <span className="text-sm text-copilot-text-primary">
                    {option.label}
                  </span>
                  {isSelected(option.value) && (
                    <Check size={16} className="text-copilot-accent-blue" />
                  )}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
