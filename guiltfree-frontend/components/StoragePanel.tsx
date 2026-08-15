"use client";

import { useRef, useState } from "react";
import { api, ApiError, ScannedReceiptResponse } from "../lib/api";
<<<<<<< HEAD
import { useApp } from "../lib/app-context";

export default function StoragePanel() {
  const { pantry, addPantryItem, addPantryItems, removePantryItem, clearPantry } =
    useApp();

  const fileRef = useRef<HTMLInputElement>(null);
  const [newItem, setNewItem] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<ScannedReceiptResponse | null>(
    null,
  );

  function addManual() {
    if (!newItem.trim()) return;
    addPantryItem(newItem);
=======
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
>>>>>>> upstream/main
    setNewItem("");
  }

  async function scan() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
<<<<<<< HEAD
      setError("Please choose a receipt or fridge photo first (PNG/JPEG/WebP, max 10 MB).");
      return;
    }
    setLoading(true);
    setError(null);
    setScanResult(null);
    try {
      const res = await api.scanReceipt(file);
      addPantryItems(res.items);
      setScanResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
=======
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
>>>>>>> upstream/main
    }
  }

  return (
    <div className="card">
<<<<<<< HEAD
      <h2>Storage — Pantry &amp; Fridge</h2>
      <p className="subtitle">
        Ingredients and spices currently in stock. Scan a receipt or fridge
        photo to auto-extract items straight into storage.
      </p>

      <div className="storage-grid">
        <div>
          <h3 style={{ marginTop: 0 }}>Available items ({pantry.length})</h3>
          {pantry.length === 0 ? (
            <div className="info">Storage is empty. Add items or scan an image.</div>
          ) : (
            <div className="chips">
              {pantry.map((item) => (
                <span className="chip removable" key={item}>
                  {item}
                  <button
                    className="chip-x"
                    onClick={() => removePantryItem(item)}
                    title={`Remove ${item}`}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="actions" style={{ marginTop: 16 }}>
            <button className="btn btn-secondary" onClick={clearPantry}>
              Clear all
            </button>
          </div>
        </div>

        <div>
          <h3 style={{ marginTop: 0 }}>Add manually</h3>
          <div className="chat-input">
            <input
              value={newItem}
              onChange={(e) => setNewItem(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") addManual();
              }}
              placeholder="e.g. Spinach, Chicken Breast, Soy Sauce"
              aria-label="New ingredient"
            />
            <button className="btn btn-secondary" onClick={addManual}>
=======
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
>>>>>>> upstream/main
              Add
            </button>
          </div>
        </div>
      </div>

<<<<<<< HEAD
      <div className="scan-area">
        <h3>Scan receipt / fridge photo</h3>
        <div className="file-field">
          <input
            id="storage-file"
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
        <div className="actions" style={{ marginTop: 12 }}>
          <button className="btn" onClick={scan} disabled={loading}>
            {loading ? <span className="spinner" /> : "Scan &amp; add to storage"}
          </button>
        </div>
=======
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
>>>>>>> upstream/main
      </div>

      {error && <div className="error">{error}</div>}

<<<<<<< HEAD
      {scanResult && (
        <>
          <div className="success">
            Extracted {scanResult.item_count} item(s) and added them to
            storage.
          </div>
          {scanResult.items.length > 0 && (
            <div className="chips">
              {scanResult.items.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          )}
          {scanResult.raw_text_preview && (
            <details style={{ marginTop: 12 }}>
              <summary>Raw OCR preview</summary>
              <div className="mono">{scanResult.raw_text_preview}</div>
            </details>
          )}
        </>
=======
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
>>>>>>> upstream/main
      )}
    </div>
  );
}
