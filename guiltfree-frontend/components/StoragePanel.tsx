"use client";

import { useRef, useState } from "react";
import { api, ApiError, ScannedReceiptResponse } from "../lib/api";
import { useStorage } from "../lib/StorageContext";

export default function StoragePanel() {
  const { items, addItems, addItem, removeItem } = useStorage();
  const fileRef = useRef<HTMLInputElement>(null);
  const [newItem, setNewItem] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanned, setScanned] = useState<ScannedReceiptResponse | null>(null);

  function handleAdd() {
    if (!newItem.trim()) return;
    addItem(newItem);
    setNewItem("");
  }

  async function scan() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError(
        "Please choose a receipt or fridge photo first (PNG, JPEG, or WebP, max 10 MB).",
      );
      return;
    }
    setScanning(true);
    setError(null);
    setScanned(null);
    try {
      const res = await api.scanReceipt(file);
      addItems(res.items);
      setScanned(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="card">
      <h2>Storage (Pantry &amp; Fridge)</h2>
      <p className="subtitle">
        Your available ingredients and seasonings. Recipes and post-workout
        advice are generated strictly from the items stored here. Scan a receipt
        or fridge photo to auto-fill your storage.
      </p>

      <div className="form-row">
        <div className="field" style={{ flexBasis: "100%" }}>
          <label htmlFor="storage-item">Add ingredient / seasoning</label>
          <div className="inline-add">
            <input
              id="storage-item"
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleAdd();
              }}
              placeholder="e.g. Olive oil, Chicken breast"
            />
            <button className="btn btn-secondary" onClick={handleAdd}>
              Add
            </button>
          </div>
        </div>
      </div>

      <h3 style={{ margin: "14px 0 8px" }}>Scan receipt / fridge photo</h3>
      <div className="file-field">
        <input
          type="file"
          ref={fileRef}
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => setFileName(e.target.files?.[0]?.name ?? "")}
        />
        {fileName && (
          <div className="info" style={{ marginTop: 8 }}>
            Selected: {fileName}
          </div>
        )}
      </div>
      <div className="actions">
        <button className="btn" onClick={scan} disabled={scanning}>
          {scanning ? <span className="spinner" /> : "Scan & add to storage"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {scanned && (
        <div className="success">
          Extracted {scanned.item_count} item(s) and added them to your storage.
        </div>
      )}

      <h3 style={{ margin: "20px 0 8px" }}>
        Available ingredients ({items.length})
      </h3>
      {items.length === 0 ? (
        <div className="info">Your storage is empty. Add items or scan a photo.</div>
      ) : (
        <div className="chips">
          {items.map((item) => (
            <span className="chip storage-chip" key={item}>
              {item}
              <button
                className="chip-remove"
                onClick={() => removeItem(item)}
                title={`Remove ${item}`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
