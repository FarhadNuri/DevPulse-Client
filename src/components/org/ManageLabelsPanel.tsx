import { useState, useEffect, useCallback, type FormEvent } from "react";
import { labels as labelsApi } from "../../api";
import { useConfirm } from "../../hooks";
import type { Label } from "../../types";
import toast from "react-hot-toast";
import Modal from "../Modal";
import Spinner from "../Spinner";

const COLOR_PRESETS = [
  "#ef4444", // red
  "#f97316", // orange
  "#f59e0b", // amber
  "#10b981", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#8b5cf6", // purple
  "#ec4899", // pink
  "#6b7280", // gray
];

interface ManageLabelsPanelProps {
  orgId: number;
}

export default function ManageLabelsPanel({ orgId }: ManageLabelsPanelProps) {
  const confirm = useConfirm();
  const [labelsList, setLabelsList] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLabel, setEditingLabel] = useState<Label | null>(null);

  // Form state
  const [name, setName] = useState("");
  const [color, setColor] = useState("#3b82f6");
  const [submitting, setSubmitting] = useState(false);

  const fetchLabels = useCallback(async () => {
    try {
      setLoading(true);
      const data = await labelsApi.list(orgId);
      setLabelsList(data || []);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load labels");
    } finally {
      setLoading(false);
    }
  }, [orgId]);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  function handleOpenCreate() {
    setEditingLabel(null);
    setName("");
    setColor("#3b82f6");
    setModalOpen(true);
  }

  function handleOpenEdit(lbl: Label) {
    setEditingLabel(lbl);
    setName(lbl.name);
    setColor(lbl.color);
    setModalOpen(true);
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      toast.error("Label name is required");
      return;
    }

    setSubmitting(true);
    try {
      if (editingLabel) {
        await labelsApi.update(orgId, editingLabel.id, { name: trimmed, color });
        toast.success("Label updated successfully");
      } else {
        await labelsApi.create(orgId, { name: trimmed, color });
        toast.success("Label created successfully");
      }
      setModalOpen(false);
      await fetchLabels();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save label");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(labelId: number) {
    const ok = await confirm({
      title: "Delete Label",
      message: "Are you sure you want to delete this label? It will be removed from all issues across this organization.",
      confirmText: "Delete",
      variant: "danger",
    });
    if (!ok) {
      return;
    }
    try {
      await labelsApi.remove(orgId, labelId);
      toast.success("Label deleted");
      setLabelsList((prev) => prev.filter((l) => l.id !== labelId));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete label");
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-base font-semibold text-text-primary">Organization Labels</h2>
          <p className="text-xs text-text-muted mt-0.5">
            Create and manage tags to organize issues across all projects in this organization.
          </p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="bg-accent hover:bg-accent-hover text-white text-xs font-semibold px-3 py-2 rounded-md transition cursor-pointer flex items-center gap-1.5"
        >
          <span>+</span>
          <span>Create Label</span>
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      ) : labelsList.length === 0 ? (
        <div className="text-center py-12 bg-bg-secondary border border-border rounded-lg">
          <p className="text-text-muted text-sm mb-3">No labels defined for this organization yet.</p>
          <button
            onClick={handleOpenCreate}
            className="text-accent hover:text-accent-hover text-xs font-medium cursor-pointer"
          >
            Create your first label
          </button>
        </div>
      ) : (
        <div className="bg-bg-secondary border border-border rounded-lg overflow-hidden">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider bg-bg-tertiary/50">
                <th className="py-2.5 px-4">Label</th>
                <th className="py-2.5 px-4">Color</th>
                <th className="py-2.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {labelsList.map((lbl) => (
                <tr key={lbl.id} className="hover:bg-bg-tertiary/30 transition">
                  <td className="py-3 px-4">
                    <span
                      style={{
                        backgroundColor: `${lbl.color}20`,
                        color: lbl.color,
                        borderColor: `${lbl.color}40`,
                      }}
                      className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                    >
                      {lbl.name}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full border border-border"
                        style={{ backgroundColor: lbl.color }}
                      />
                      <span className="font-mono text-xs text-text-muted">{lbl.color}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right space-x-2">
                    <button
                      onClick={() => handleOpenEdit(lbl)}
                      className="text-xs text-accent hover:text-accent-hover font-medium cursor-pointer"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(lbl.id)}
                      className="text-xs text-red-400 hover:text-red-300 font-medium cursor-pointer"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingLabel ? "Edit Label" : "Create Organization Label"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-1">
              Label Name <span className="text-red-400">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={50}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Frontend, High Priority, Bug"
              className="w-full bg-bg-primary border border-border rounded-md px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-border-focus"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-secondary uppercase mb-2">
              Color
            </label>
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {COLOR_PRESETS.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setColor(preset)}
                  style={{ backgroundColor: preset }}
                  className={`w-6 h-6 rounded-full transition cursor-pointer border-2 ${
                    color.toLowerCase() === preset.toLowerCase()
                      ? "border-white scale-110 shadow"
                      : "border-transparent hover:scale-105"
                  }`}
                />
              ))}
            </div>

            <div className="flex items-center gap-2">
              <span
                className="w-8 h-8 rounded-md border border-border shrink-0"
                style={{ backgroundColor: color }}
              />
              <input
                type="text"
                required
                pattern="^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                placeholder="#3b82f6"
                className="w-32 font-mono uppercase bg-bg-primary border border-border rounded-md px-3 py-1.5 text-xs text-text-primary focus:outline-none focus:border-border-focus"
              />
              <div className="text-xs text-text-muted">Preview:</div>
              <span
                style={{
                  backgroundColor: `${color}20`,
                  color: color,
                  borderColor: `${color}40`,
                }}
                className="text-xs font-semibold px-2.5 py-0.5 rounded-full border truncate max-w-[120px]"
              >
                {name || "Label Preview"}
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-border/50">
            <button
              type="button"
              disabled={submitting}
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 text-sm text-text-muted hover:text-text-primary transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !name.trim()}
              className="bg-accent hover:bg-accent-hover text-white text-sm font-medium px-4 py-2 rounded-md transition disabled:opacity-50 cursor-pointer"
            >
              {submitting ? "Saving..." : editingLabel ? "Save Changes" : "Create Label"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

