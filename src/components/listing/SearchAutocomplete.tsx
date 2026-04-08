import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Map, Navigation } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useAutocomplete } from '@/hooks/useSearch';
import type { AutocompleteSuggestion } from '@/api/search';

const SUGGESTION_ICONS: Record<AutocompleteSuggestion['type'], React.ReactNode> = {
  city: <Navigation className="w-4 h-4 text-muted-foreground" />,
  district: <Map className="w-4 h-4 text-muted-foreground" />,
  address: <MapPin className="w-4 h-4 text-muted-foreground" />,
};

interface SearchAutocompleteProps {
  placeholder?: string;
  className?: string;
  size?: 'default' | 'lg';
}

export const SearchAutocomplete: React.FC<SearchAutocompleteProps> = ({
  placeholder = 'Город, район или адрес...',
  className,
  size = 'default',
}) => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLDivElement>(null);

  // Debounce 300ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(timer);
  }, [query]);

  const { data: suggestions = [] } = useAutocomplete(debouncedQuery);

  // Закрыть при клике вне
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSelect = (suggestion: AutocompleteSuggestion) => {
    setQuery(suggestion.value);
    setOpen(false);
    navigate(`/listings?city=${encodeURIComponent(suggestion.value)}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      navigate(`/listings?city=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <form onSubmit={handleSubmit}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4 pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setOpen(true);
            }}
            onFocus={() => suggestions.length > 0 && setOpen(true)}
            placeholder={placeholder}
            className={cn(
              'pl-9 pr-4',
              size === 'lg' && 'h-12 text-base rounded-xl',
            )}
          />
        </div>
      </form>

      {/* Выпадающий список */}
      {open && suggestions.length > 0 && (
        <ul className="absolute z-50 top-full mt-1 w-full bg-white border border-gray-100 rounded-xl shadow-lg overflow-hidden">
          {suggestions.map((s, i) => (
            <li key={i}>
              <button
                type="button"
                onMouseDown={() => handleSelect(s)}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-accent transition-colors text-left"
              >
                {SUGGESTION_ICONS[s.type]}
                <span className="truncate">{s.value}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
