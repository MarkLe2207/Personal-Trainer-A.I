"use client";

import { useRef, useState } from "react";
import { api, ApiError, ScannedReceiptResponse } from "../lib/api";

export default function ReceiptPanel() {
  const fileRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScannedReceiptResponse | null>(null);

  async function scan() {
    const file = fileRef.current?.files?.[0];
    if (!file) {
      setError("Please choose a receipt image first (PNG, JPEG, or WebP, max 10 MB).");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await api.scanReceipt(file);
      setResult(res);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>Receipt Scanner</h2>
      <p className="subtitle">
        Upload a grocery receipt image to OCR it into clean pantry items.
        Requires the Tesseract binary installed on the server.
      </p>

      <div className="file-field">
        <label htmlFor="receipt-file">Receipt image</label>
        <input
          id="receipt-file"
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
        <button className="btn" onClick={scan} disabled={loading}>
          {loading ? <span className="spinner" /> : "Scan receipt"}
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {result && (
        <>
          <div className="success">
            Parsed {result.item_count} item(s) from the receipt.
          </div>
          {result.items.length > 0 && (
            <div className="chips">
              {result.items.map((item) => (
                <span className="chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          )}
          <div className="mono">{result.raw_text_preview}</div>
        </>
      )}
    </div>
  );
}
