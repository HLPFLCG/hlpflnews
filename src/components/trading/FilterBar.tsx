'use client';

const CATEGORIES = [
  { id: 'all', label: 'ALL' },
  { id: 'markets', label: 'MARKETS', color: '#4fc3f7' },
  { id: 'macro', label: 'MACRO', color: '#e8a000' },
  { id: 'geo', label: 'GEO', color: '#e74c3c' },
  { id: 'fx', label: 'FX', color: '#1abc9c' },
  { id: 'commodities', label: 'COMMODITIES', color: '#f1c40f' },
  { id: 'alt', label: 'ALT', color: '#7f8c8d' },
  { id: 'flash', label: 'FLASH ★' },
  { id: 'calendar', label: 'CALENDAR' },
];

interface Props {
  activeFilter: string;
  onFilterChange: (filter: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export default function FilterBar({ activeFilter, onFilterChange, searchQuery, onSearchChange }: Props) {
  return (
    <div
      className="flex items-center justify-between px-3 gap-2"
      style={{
        height: '40px',
        background: 'var(--void-2)',
        borderBottom: '0.5px solid var(--gold-muted)',
        overflowX: 'auto',
        overflowY: 'hidden',
      }}
    >
      <div className="flex items-center gap-1.5 flex-shrink-0">
        {CATEGORIES.map((cat) => {
          const isActive = activeFilter === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => onFilterChange(cat.id)}
              className="flex items-center gap-1 px-2.5 py-1 font-display text-[10px] tracking-[0.12em] uppercase whitespace-nowrap transition-colors"
              style={{
                color: isActive ? 'var(--gold)' : 'var(--cream-3)',
                border: `1px solid ${isActive ? 'var(--gold)' : 'var(--void-4)'}`,
                background: isActive ? 'var(--gold-muted)' : 'transparent',
                borderRadius: '2px',
                cursor: 'pointer',
              }}
            >
              {cat.color && (
                <span
                  className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                  style={{ background: cat.color }}
                />
              )}
              {cat.label}
            </button>
          );
        })}
      </div>
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder="Search headlines..."
        className="font-mono text-[11px] px-2 py-1 flex-shrink-0"
        style={{
          width: '200px',
          background: 'var(--void-3)',
          border: '0.5px solid var(--void-4)',
          borderRadius: '2px',
          color: 'var(--cream)',
          outline: 'none',
        }}
        onFocus={(e) => (e.target.style.borderColor = 'var(--gold)')}
        onBlur={(e) => (e.target.style.borderColor = 'var(--void-4)')}
      />
    </div>
  );
}
