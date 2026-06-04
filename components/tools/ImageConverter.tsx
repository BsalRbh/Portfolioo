"use client";
import { useCallback, useEffect, useRef, useState } from "react";

type OutFormat = "image/jpeg" | "image/png" | "image/webp";

const FORMATS: { value: OutFormat; label: string; ext: string }[] = [
  { value: "image/webp", label: "WebP", ext: "webp" },
  { value: "image/jpeg", label: "JPEG", ext: "jpg" },
  { value: "image/png", label: "PNG", ext: "png" },
];

type Status = "pending" | "converting" | "done" | "error";

type Item = {
  id: number;
  file: File;
  name: string;
  status: Status;
  srcUrl: string;
  inSize: number;
  inDims: { w: number; h: number } | null;
  outUrl: string | null;
  outName: string | null;
  outSize: number | null;
  outDims: { w: number; h: number } | null;
  error: string | null;
};

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
}

function baseName(name: string): string {
  const dot = name.lastIndexOf(".");
  return dot > 0 ? name.slice(0, dot) : name;
}

function extFor(format: OutFormat): string {
  return FORMATS.find((f) => f.value === format)!.ext;
}

// (resize removed — images are re-encoded at their native dimensions)

// Load a File into an HTMLImageElement via an object URL.
function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("could not decode image"));
    img.src = url;
  });
}

export function ImageConverter() {
  const [items, setItems] = useState<Item[]>([]);
  const [format, setFormat] = useState<OutFormat>("image/webp");
  const [quality, setQuality] = useState(0.82);
  const [dragging, setDragging] = useState(false);

  const idRef = useRef(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  // Track every object URL we create so we can revoke them on unmount.
  const urlsRef = useRef<Set<string>>(new Set());

  const lossy = format !== "image/png";

  const trackUrl = useCallback((url: string) => {
    urlsRef.current.add(url);
    return url;
  }, []);

  const releaseUrl = useCallback((url: string | null) => {
    if (url && urlsRef.current.has(url)) {
      URL.revokeObjectURL(url);
      urlsRef.current.delete(url);
    }
  }, []);

  useEffect(() => {
    const urls = urlsRef.current;
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
      urls.clear();
    };
  }, []);

  const addFiles = useCallback(
    (fileList: FileList | File[]) => {
      const files = Array.from(fileList).filter((f) => f.type.startsWith("image/"));
      if (files.length === 0) return;
      const next: Item[] = files.map((file) => {
        const srcUrl = trackUrl(URL.createObjectURL(file));
        return {
          id: idRef.current++,
          file,
          name: file.name,
          status: "pending",
          srcUrl,
          inSize: file.size,
          inDims: null,
          outUrl: null,
          outName: null,
          outSize: null,
          outDims: null,
          error: null,
        };
      });
      setItems((prev) => [...prev, ...next]);
    },
    [trackUrl]
  );

  const convertItem = useCallback(
    async (item: Item) => {
      try {
        const img = await loadImage(item.srcUrl);
        const inDims = { w: img.naturalWidth, h: img.naturalHeight };
        const target = inDims;

        const canvas = document.createElement("canvas");
        canvas.width = target.w;
        canvas.height = target.h;
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("no canvas context");
        // JPEG has no alpha — fill white so transparency doesn't go black.
        if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, target.w, target.h);
        }
        ctx.drawImage(img, 0, 0, target.w, target.h);

        const blob: Blob = await new Promise((resolve, reject) => {
          canvas.toBlob(
            (b) => (b ? resolve(b) : reject(new Error("encoding failed"))),
            format,
            lossy ? quality : undefined
          );
        });

        const outUrl = trackUrl(URL.createObjectURL(blob));
        const outName = `${baseName(item.name)}.${extFor(format)}`;
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? {
                  ...it,
                  status: "done",
                  inDims,
                  outUrl,
                  outName,
                  outSize: blob.size,
                  outDims: target,
                  error: null,
                }
              : it
          )
        );
      } catch (e) {
        setItems((prev) =>
          prev.map((it) =>
            it.id === item.id
              ? { ...it, status: "error", error: (e as Error).message }
              : it
          )
        );
      }
    },
    [format, lossy, quality, trackUrl]
  );

  const convertAll = useCallback(async () => {
    // Snapshot current items, mark them converting, then process sequentially.
    const targets = items.filter((it) => it.status !== "converting");
    setItems((prev) =>
      prev.map((it) =>
        targets.some((t) => t.id === it.id)
          ? { ...it, status: "converting", outUrl: null, error: null }
          : it
      )
    );
    for (const it of targets) {
      releaseUrl(it.outUrl);
      await convertItem(it);
    }
  }, [items, convertItem, releaseUrl]);

  const removeItem = useCallback(
    (id: number) => {
      setItems((prev) => {
        const it = prev.find((x) => x.id === id);
        if (it) {
          releaseUrl(it.srcUrl);
          releaseUrl(it.outUrl);
        }
        return prev.filter((x) => x.id !== id);
      });
    },
    [releaseUrl]
  );

  const clearAll = useCallback(() => {
    setItems((prev) => {
      prev.forEach((it) => {
        releaseUrl(it.srcUrl);
        releaseUrl(it.outUrl);
      });
      return [];
    });
  }, [releaseUrl]);

  const downloadAll = useCallback(() => {
    items
      .filter((it) => it.outUrl && it.outName)
      .forEach((it) => {
        const a = document.createElement("a");
        a.href = it.outUrl!;
        a.download = it.outName!;
        document.body.appendChild(a);
        a.click();
        a.remove();
      });
  }, [items]);

  const doneCount = items.filter((it) => it.status === "done").length;

  return (
    <section className="ic-tool">
      <div
        className={"ic-drop" + (dragging ? " ic-drop--over" : "")}
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
        }}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          hidden
          onChange={(e) => {
            if (e.target.files) addFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <span className="ic-drop-icon">⤓</span>
        <span className="ic-drop-text">
          drop images here, or <em>click to browse</em>
        </span>
        <span className="ic-drop-sub">JPEG · PNG · WebP — processed locally</span>
      </div>

      <div className="ic-controls">
        <div className="ic-ctl">
          <label className="ic-ctl-label">Format</label>
          <div className="ic-segmented">
            {FORMATS.map((f) => (
              <button
                key={f.value}
                className={"ic-seg" + (format === f.value ? " active" : "")}
                onClick={() => setFormat(f.value)}
                type="button"
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className={"ic-ctl" + (lossy ? "" : " ic-ctl--off")}>
          <label className="ic-ctl-label">
            Quality <span className="ic-val">{Math.round(quality * 100)}%</span>
          </label>
          <input
            className="ic-range"
            type="range"
            min={0.1}
            max={1}
            step={0.01}
            value={quality}
            disabled={!lossy}
            onChange={(e) => setQuality(parseFloat(e.target.value))}
          />
        </div>
      </div>

      {items.length > 0 && (
        <>
          <div className="ic-actions">
            <button className="ic-btn ic-btn--primary" onClick={convertAll} type="button">
              Convert all ({items.length})
            </button>
            <button
              className="ic-btn"
              onClick={downloadAll}
              type="button"
              disabled={doneCount === 0}
            >
              Download all ({doneCount})
            </button>
            <button className="ic-btn ic-btn--ghost" onClick={clearAll} type="button">
              Clear
            </button>
          </div>

          <ul className="ic-list">
            {items.map((it) => {
              const delta =
                it.outSize != null && it.inSize > 0
                  ? Math.round((1 - it.outSize / it.inSize) * 100)
                  : null;
              return (
                <li key={it.id} className="ic-item">
                  <img className="ic-thumb" src={it.srcUrl} alt="" />
                  <div className="ic-info">
                    <div className="ic-name">{it.name}</div>
                    <div className="ic-stats">
                      <span>{formatBytes(it.inSize)}</span>
                      {it.status === "done" && it.outSize != null && (
                        <>
                          <span className="ic-arrow">→</span>
                          <span>{formatBytes(it.outSize)}</span>
                          {delta != null && (
                            <span className={delta >= 0 ? "ic-delta-good" : "ic-delta-bad"}>
                              {delta >= 0 ? "−" : "+"}
                              {Math.abs(delta)}%
                            </span>
                          )}
                          {it.outDims && (
                            <span className="ic-muted">
                              {it.outDims.w}×{it.outDims.h}
                            </span>
                          )}
                        </>
                      )}
                      {it.status === "converting" && (
                        <span className="ic-muted">converting…</span>
                      )}
                      {it.status === "error" && (
                        <span className="ic-err">{it.error}</span>
                      )}
                    </div>
                  </div>
                  <div className="ic-item-actions">
                    {it.status === "done" && it.outUrl && it.outName && (
                      <a className="ic-btn ic-btn--sm" href={it.outUrl} download={it.outName}>
                        download
                      </a>
                    )}
                    <button
                      className="ic-x-btn"
                      onClick={() => removeItem(it.id)}
                      type="button"
                      aria-label="Remove"
                    >
                      ✕
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </section>
  );
}
