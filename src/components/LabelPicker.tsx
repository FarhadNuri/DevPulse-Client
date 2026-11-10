import { useState, useEffect, useRef } from "react";
import { labels as labelsApi } from "../api";
import type { Label } from "../types";

interface LabelPickerProps {
  orgId: number;
  currentLabels: Label[] | undefined;
  canEdit: boolean;
  onLabelsChange: (labelIds: number[]) => Promise<void> | void;
}

export default function LabelPicker({
  orgId,
  currentLabels = [],
  canEdit,
  onLabelsChange,
}: LabelPickerProps) {
  const [open, setOpen] = useState(false);
  const [allLabels, setAllLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!orgId || !canEdit) return;
    let mounted = true;
    setLoading(true);

    labelsApi
      .list(orgId)
      .then((data) => {
        if (mounted) setAllLabels(data || []);
      })
      .catch(() => {})
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [orgId, canEdit]);

  const selectedIds = new Set(currentLabels.map((l) => l.id));

  function toggleLabel(id: number) {
    const updated = new Set(selectedIds);
    if (updated.has(id)) {
      updated.delete(id);
    } else {
      updated.add(id);
    }
    onLabelsChange(Array.from(updated));
  }

  return (
    <div className="relative inline-block" ref={containerRef}>
      <div className="flex items-center gap-1.5 flex-wrap">
        {currentLabels.map((lbl) => (
          <span
            key={lbl.id}
            style={{
              backgroundColor: `${lbl.color}20`,
              color: lbl.color,
              borderColor: `${lbl.color}40`,
            }}
            className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition"
          >
            <span>{lbl.name}</span>
            {canEdit && (
              <button
                type="button"
                onClick={() => toggleLabel(lbl.id)}
                className="hover:opacity-75 text-[11px] font-bold cursor-pointer"
                title="Remove label"
              >
                ×
              </button>
            )}
          </span>
        ))}

        {canEdit && (
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="text-xs px-2 py-0.5 rounded-full border border-dashed border-border hover:border-accent text-text-muted hover:text-accent transition cursor-pointer flex items-center gap-1"
          >
            <span>+</span>
            <span>Label</span>
          </button>
        )}
      </div>

      {open && canEdit && (
        <div className="absolute left-0 mt-1.5 w-56 bg-bg-secondary border border-border rounded-lg shadow-xl z-50 py-1 max-h-60 overflow-y-auto">
          <div className="px-3 py-1.5 text-[11px] font-semibold uppercase text-text-muted tracking-wider border-b border-border/50">
            Apply Labels
          </div>

          {loading ? (
            <div className="p-3 text-xs text-text-muted text-center">Loading labels...</div>
          ) : allLabels.length === 0 ? (
            <div className="p-3 text-xs text-text-muted text-center italic">
              No organization labels defined
            </div>
          ) : (
            allLabels.map((lbl) => {
              const isSelected = selectedIds.has(lbl.id);
              return (
                <button
                  key={lbl.id}
                  type="button"
                  onClick={() => toggleLabel(lbl.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs transition text-left hover:bg-bg-tertiary cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: lbl.color }}
                    />
                    <span className="text-text-primary truncate">{lbl.name}</span>
                  </div>
                  {isSelected && <span className="text-accent font-bold">✓</span>}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

