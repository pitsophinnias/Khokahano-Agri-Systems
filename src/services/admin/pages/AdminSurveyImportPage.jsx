// ---------------------------------------------------------------------------
// AdminSurveyImportPage.jsx
// Admin tool to import survey responses from CSV / TSV / plain text exports.
// Covers: Google Forms CSV, Google Sheets export, WhatsApp poll text exports.
//
// Flow: Upload → Auto-detect columns → Map columns → Preview rows → Submit
// Route: /admin/surveys/import  (AdminRoute protected)
// Module: src/services/admin/pages/AdminSurveyImportPage.jsx
// ---------------------------------------------------------------------------

import { useState, useCallback, useRef } from "react";
import { useNavigate }                   from "react-router-dom";
import { THEME }                         from "../../marketplace/constants/theme.js";
import { importSurveys }                 from "../../marketplace/api/marketplace.api.js";

const C = THEME.colors;
const F = THEME.fonts;

// ── Survey fields the backend expects ────────────────────────
// Each entry: { key, label, type, required }
const SURVEY_FIELDS = [
  { key: "farmerPhone",            label: "Farmer phone number", type: "string",  required: true  },
  { key: "farmerName",             label: "Farmer name",         type: "string",  required: false },
  { key: "poultryTypes",           label: "Poultry types",       type: "array",   required: false },
  { key: "totalBirds",             label: "Total birds",         type: "number",  required: false },
  { key: "housingSystem",          label: "Housing system",      type: "string",  required: false },
  { key: "feedingMethod",          label: "Feeding method",      type: "string",  required: false },
  { key: "feedBrand",              label: "Feed brand",          type: "string",  required: false },
  { key: "vaccinationPractice",    label: "Vaccination",         type: "string",  required: false },
  { key: "vaccinesUsed",           label: "Vaccines used",       type: "array",   required: false },
  { key: "diseaseChallenges",      label: "Disease challenges",  type: "array",   required: false },
  { key: "mortalityRatePercent",   label: "Mortality rate (%)",  type: "number",  required: false },
  { key: "marketAccessChallenges", label: "Market challenges",   type: "string",  required: false },
  { key: "packagingMethod",        label: "Packaging / selling", type: "array",   required: false },
];

// ── CSV parser (no external library) ─────────────────────────
function parseCSV(text) {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return { headers: [], rows: [] };

  // Detect delimiter: comma or tab
  const firstLine = lines[0];
  const delimiter = firstLine.includes("\t") ? "\t" : ",";

  function splitLine(line) {
    const result = [];
    let current  = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        inQuotes = !inQuotes;
      } else if (ch === delimiter && !inQuotes) {
        result.push(current.trim());
        current = "";
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  }

  const headers = splitLine(lines[0]);
  const rows    = lines.slice(1)
    .filter((l) => l.trim())
    .map((line) => {
      const vals = splitLine(line);
      const row  = {};
      headers.forEach((h, i) => { row[h] = vals[i] ?? ""; });
      return row;
    });

  return { headers, rows };
}

// Auto-guess which CSV column maps to which survey field
function autoMap(headers) {
  const mapping = {};
  const lower   = headers.map((h) => h.toLowerCase());

  const hints = {
    farmerPhone:            ["phone", "contact", "number", "cell", "mobile"],
    farmerName:             ["name", "farmer", "respondent"],
    poultryTypes:           ["poultry", "type", "birds", "raise", "rear"],
    totalBirds:             ["total bird", "flock size", "how many", "number of bird"],
    housingSystem:          ["housing", "house", "system", "structure"],
    feedingMethod:          ["feed method", "feeding", "how do you feed"],
    feedBrand:              ["feed brand", "brand", "feed name"],
    vaccinationPractice:    ["vaccin", "immunis", "immuniz"],
    vaccinesUsed:           ["vaccine used", "which vaccine", "vaccines"],
    diseaseChallenges:      ["disease", "challenge", "health problem", "sickness"],
    mortalityRatePercent:   ["mortality", "death rate", "loss", "died"],
    marketAccessChallenges: ["market challenge", "market access", "selling challenge", "problem selling"],
    packagingMethod:        ["packag", "selling method", "how do you sell", "sell"],
  };

  Object.entries(hints).forEach(([field, keywords]) => {
    const matchIdx = lower.findIndex((h) =>
      keywords.some((kw) => h.includes(kw))
    );
    if (matchIdx !== -1) mapping[field] = headers[matchIdx];
  });

  return mapping;
}

// ── Sub-components ────────────────────────────────────────────

function TopBar({ onBack }) {
  return (
    <div style={{
      background: C.green, padding: "0 16px", height: 52,
      display: "flex", alignItems: "center", gap: 10,
      position: "sticky", top: 0, zIndex: 100,
    }}>
      <button onClick={onBack} style={{
        background: "rgba(255,255,255,0.12)", border: "none",
        color: "#fff", width: 32, height: 32, borderRadius: 4,
        cursor: "pointer", fontSize: 16,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>←</button>
      <img src="/assets/logo.png" alt="Khokahano" style={{ width: 28, height: 28, borderRadius: "50%", objectFit: "cover" }} onError={(e) => { e.target.style.display = "none"; }} />
      <div style={{ fontFamily: F.display, fontSize: 16, color: "#fff" }}>
        Import survey responses
      </div>
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: C.white,
      borderTop:    `1px solid ${C.line}`,
      borderRight:  `1px solid ${C.line}`,
      borderBottom: `1px solid ${C.line}`,
      borderLeft:   `1px solid ${C.line}`,
      borderRadius: 6, padding: 20, marginBottom: 16,
      ...style,
    }}>
      {children}
    </div>
  );
}

function StepLabel({ n, label, active, done }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{
        width: 24, height: 24, borderRadius: "50%", flexShrink: 0,
        background: done ? C.green : active ? C.green : C.line,
        color: done || active ? "#fff" : C.inkLight,
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 700, fontFamily: F.body,
      }}>
        {done ? "✓" : n}
      </div>
      <span style={{
        fontSize: 13, fontFamily: F.body,
        color: active ? C.ink : done ? C.inkMid : C.inkLight,
        fontWeight: active ? 600 : 400,
      }}>
        {label}
      </span>
    </div>
  );
}

// ── Step 1: Upload ────────────────────────────────────────────

function UploadStep({ onParsed }) {
  const [dragging, setDragging] = useState(false);
  const [error,    setError]    = useState(null);
  const inputRef               = useRef(null);

  const handle = useCallback((file) => {
    if (!file) return;
    const name = file.name.toLowerCase();
    if (!name.endsWith(".csv") && !name.endsWith(".tsv") && !name.endsWith(".txt")) {
      setError("Please upload a CSV, TSV, or TXT file.");
      return;
    }
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      const { headers, rows } = parseCSV(e.target.result);
      if (headers.length === 0 || rows.length === 0) {
        setError("The file appears empty or couldn't be parsed. Check that it has a header row.");
        return;
      }
      onParsed({ headers, rows, fileName: file.name });
    };
    reader.readAsText(file);
  }, [onParsed]);

  return (
    <Card>
      <div style={{ fontFamily: F.display, fontSize: 17, color: C.ink, marginBottom: 6 }}>
        Upload your file
      </div>
      <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.6, marginBottom: 20 }}>
        Accepted formats: CSV, TSV, or TXT with a header row. Exports from Google Forms,
        Google Sheets, and WhatsApp poll summaries all work as long as they have column headers.
      </p>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); handle(e.dataTransfer.files[0]); }}
        onClick={() => inputRef.current?.click()}
        style={{
          borderTop:    `2px dashed ${dragging ? C.green : C.line}`,
          borderRight:  `2px dashed ${dragging ? C.green : C.line}`,
          borderBottom: `2px dashed ${dragging ? C.green : C.line}`,
          borderLeft:   `2px dashed ${dragging ? C.green : C.line}`,
          borderRadius: 8,
          background: dragging ? "rgba(28,74,28,0.04)" : C.bg,
          padding: "40px 20px", textAlign: "center", cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 10 }}>📂</div>
        <div style={{ fontSize: 14, color: C.inkMid, fontFamily: F.body }}>
          Drag and drop your file here, or <span style={{ color: C.green, fontWeight: 500 }}>click to browse</span>
        </div>
        <div style={{ fontSize: 12, color: C.inkLight, marginTop: 6, fontFamily: F.body }}>
          CSV · TSV · TXT
        </div>
        <input
          ref={inputRef} type="file" accept=".csv,.tsv,.txt"
          style={{ display: "none" }}
          onChange={(e) => handle(e.target.files[0])}
        />
      </div>

      {error && (
        <div style={{
          marginTop: 12, padding: "10px 14px",
          background: "rgba(163,45,45,0.08)",
          borderTop:    `1px solid rgba(163,45,45,0.2)`,
          borderRight:  `1px solid rgba(163,45,45,0.2)`,
          borderBottom: `1px solid rgba(163,45,45,0.2)`,
          borderLeft:   `3px solid #a32d2d`,
          borderRadius: 4, fontSize: 13, color: "#a32d2d", fontFamily: F.body,
        }}>
          {error}
        </div>
      )}
    </Card>
  );
}

// ── Step 2: Map columns ───────────────────────────────────────

function MappingStep({ headers, rows, mapping, onMappingChange, onNext, onBack }) {
  const requiredMapped = SURVEY_FIELDS
    .filter((f) => f.required)
    .every((f) => mapping[f.key]);

  return (
    <Card>
      <div style={{ fontFamily: F.display, fontSize: 17, color: C.ink, marginBottom: 6 }}>
        Match columns to survey fields
      </div>
      <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.6, marginBottom: 20 }}>
        We've tried to auto-match your columns. Check the mappings and adjust any that are wrong.
        Only <strong>Farmer phone number</strong> is required — the rest can be left as "Skip".
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
        {SURVEY_FIELDS.map((field) => (
          <div key={field.key} style={{
            display: "flex", alignItems: "center",
            gap: 12, flexWrap: "wrap",
          }}>
            <div style={{
              fontSize: 13, fontFamily: F.body,
              color: field.required ? C.ink : C.inkMid,
              fontWeight: field.required ? 500 : 400,
              minWidth: 180, flexShrink: 0,
            }}>
              {field.label}
              {field.required && <span style={{ color: "#a32d2d", marginLeft: 3 }}>*</span>}
            </div>
            <select
              value={mapping[field.key] ?? ""}
              onChange={(e) => onMappingChange(field.key, e.target.value || undefined)}
              style={{
                flex: 1, minWidth: 160, padding: "7px 10px",
                borderTop:    `1px solid ${C.line}`,
                borderRight:  `1px solid ${C.line}`,
                borderBottom: `1px solid ${C.line}`,
                borderLeft:   `1px solid ${C.line}`,
                borderRadius: 4,
                fontFamily: F.body, fontSize: 13, color: C.ink,
                background: C.white,
              }}
            >
              <option value="">— Skip this field —</option>
              {headers.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
            {mapping[field.key] && (
              <div style={{ fontSize: 12, color: C.inkLight, fontFamily: F.body }}>
                e.g. "{rows[0]?.[mapping[field.key]] ?? ""}"
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} style={{
          flex: 1, padding: 12,
          borderTop:    `1px solid ${C.line}`,
          borderRight:  `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          borderLeft:   `1px solid ${C.line}`,
          borderRadius: 4, background: "none",
          fontSize: 13, color: C.inkMid, cursor: "pointer", fontFamily: F.body,
        }}>
          Back
        </button>
        <button onClick={onNext} disabled={!requiredMapped} style={{
          flex: 2, padding: 12,
          background: requiredMapped ? C.green : C.inkLight,
          color: "#fff", border: "none", borderRadius: 4,
          fontSize: 14, fontWeight: 500,
          cursor: requiredMapped ? "pointer" : "default", fontFamily: F.body,
        }}>
          Preview {rows.length} rows →
        </button>
      </div>
    </Card>
  );
}

// ── Step 3: Preview & submit ──────────────────────────────────

function buildPayload(rows, mapping) {
  return rows.map((row) => {
    const entry = {};
    SURVEY_FIELDS.forEach(({ key, type }) => {
      const col = mapping[key];
      if (!col || !row[col]) return;
      const raw = row[col].trim();
      if (type === "number") {
        const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
        if (!isNaN(n)) entry[key] = n;
      } else if (type === "array") {
        // Split on comma, semicolon, or slash
        entry[key] = raw.split(/[,;/]/).map((v) => v.trim()).filter(Boolean);
      } else {
        entry[key] = raw;
      }
    });
    return entry;
  }).filter((e) => e.farmerPhone); // drop rows with no phone
}

function PreviewStep({ rows, mapping, fileName, onSubmit, onBack, submitting, result, submitError }) {
  const payload = buildPayload(rows, mapping);
  const skipped = rows.length - payload.length;

  return (
    <Card>
      <div style={{ fontFamily: F.display, fontSize: 17, color: C.ink, marginBottom: 6 }}>
        Preview
      </div>
      <p style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.6, marginBottom: 4 }}>
        <strong>{payload.length}</strong> rows ready to import from <em>{fileName}</em>.
        {skipped > 0 && ` ${skipped} row${skipped > 1 ? "s" : ""} skipped (no phone number).`}
      </p>

      {/* Preview table */}
      <div style={{ overflowX: "auto", marginBottom: 20 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12, fontFamily: F.body }}>
          <thead>
            <tr style={{ background: C.bg }}>
              {SURVEY_FIELDS.filter((f) => mapping[f.key]).map((f) => (
                <th key={f.key} style={{
                  padding: "7px 10px", textAlign: "left",
                  borderBottom: `1px solid ${C.line}`,
                  color: C.inkMid, fontWeight: 600, whiteSpace: "nowrap",
                }}>
                  {f.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payload.slice(0, 5).map((row, i) => (
              <tr key={i} style={{ borderBottom: `1px solid ${C.line}` }}>
                {SURVEY_FIELDS.filter((f) => mapping[f.key]).map((f) => (
                  <td key={f.key} style={{ padding: "7px 10px", color: C.ink, maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {Array.isArray(row[f.key]) ? row[f.key].join(", ") : row[f.key] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {payload.length > 5 && (
          <div style={{ fontSize: 12, color: C.inkLight, padding: "8px 10px" }}>
            … and {payload.length - 5} more rows
          </div>
        )}
      </div>

      {submitError && (
        <div style={{
          marginBottom: 14, padding: "10px 14px",
          background: "rgba(163,45,45,0.08)",
          borderTop:    `1px solid rgba(163,45,45,0.2)`,
          borderRight:  `1px solid rgba(163,45,45,0.2)`,
          borderBottom: `1px solid rgba(163,45,45,0.2)`,
          borderLeft:   `3px solid #a32d2d`,
          borderRadius: 4, fontSize: 13, color: "#a32d2d", fontFamily: F.body,
        }}>
          {submitError}
        </div>
      )}

      {result && (
        <div style={{
          marginBottom: 14, padding: "12px 16px",
          background: "rgba(28,74,28,0.06)",
          borderTop:    `1px solid rgba(28,74,28,0.2)`,
          borderRight:  `1px solid rgba(28,74,28,0.2)`,
          borderBottom: `1px solid rgba(28,74,28,0.2)`,
          borderLeft:   `3px solid ${C.green}`,
          borderRadius: 4, fontSize: 14, color: C.green, fontFamily: F.body,
        }}>
          ✓ {result.imported} records imported. {result.skipped > 0 ? `${result.skipped} skipped (farmer not found).` : ""}
        </div>
      )}

      <div style={{ display: "flex", gap: 10 }}>
        <button onClick={onBack} disabled={submitting || !!result} style={{
          flex: 1, padding: 12,
          borderTop:    `1px solid ${C.line}`,
          borderRight:  `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          borderLeft:   `1px solid ${C.line}`,
          borderRadius: 4, background: "none",
          fontSize: 13, color: C.inkMid,
          cursor: submitting || result ? "default" : "pointer", fontFamily: F.body,
        }}>
          Back
        </button>
        {!result && (
          <button onClick={() => onSubmit(payload)} disabled={submitting} style={{
            flex: 2, padding: 12,
            background: submitting ? C.inkLight : C.green,
            color: "#fff", border: "none", borderRadius: 4,
            fontSize: 14, fontWeight: 500,
            cursor: submitting ? "default" : "pointer", fontFamily: F.body,
          }}>
            {submitting ? "Importing…" : `Import ${payload.length} records`}
          </button>
        )}
      </div>
    </Card>
  );
}

// ── Main page ─────────────────────────────────────────────────

export default function AdminSurveyImportPage() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState(1); // 1 | 2 | 3
  const [parsed,      setParsed]      = useState(null);
  const [mapping,     setMapping]     = useState({});
  const [submitting,  setSubmitting]  = useState(false);
  const [result,      setResult]      = useState(null);
  const [submitError, setSubmitError] = useState(null);

  const handleParsed = useCallback(({ headers, rows, fileName }) => {
    const autoMapping = autoMap(headers);
    setParsed({ headers, rows, fileName });
    setMapping(autoMapping);
    setStep(2);
  }, []);

  const handleMappingChange = useCallback((field, value) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (value) next[field] = value;
      else delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(async (payload) => {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const res = await importSurveys(payload);
      setResult(res);
    } catch (err) {
      setSubmitError(err.message ?? "Import failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, []);

  const STEPS = ["Upload file", "Map columns", "Preview & import"];

  return (
    <div style={{ fontFamily: F.body, background: C.bg, minHeight: "100vh", color: C.ink, WebkitFontSmoothing: "antialiased" }}>
      <TopBar onBack={() => navigate("/admin")} />

      <div style={{ maxWidth: 760, margin: "0 auto", padding: "24px 16px 60px" }}>

        {/* Step indicators */}
        <div style={{
          display: "flex", gap: 20, marginBottom: 24,
          flexWrap: "wrap",
        }}>
          {STEPS.map((label, i) => (
            <StepLabel
              key={label}
              n={i + 1}
              label={label}
              active={step === i + 1}
              done={step > i + 1}
            />
          ))}
        </div>

        {step === 1 && <UploadStep onParsed={handleParsed} />}
        {step === 2 && parsed && (
          <MappingStep
            headers={parsed.headers}
            rows={parsed.rows}
            mapping={mapping}
            onMappingChange={handleMappingChange}
            onNext={() => setStep(3)}
            onBack={() => setStep(1)}
          />
        )}
        {step === 3 && parsed && (
          <PreviewStep
            rows={parsed.rows}
            mapping={mapping}
            fileName={parsed.fileName}
            onSubmit={handleSubmit}
            onBack={() => setStep(2)}
            submitting={submitting}
            result={result}
            submitError={submitError}
          />
        )}

        {/* Help notes */}
        <div style={{
          borderTop:    `1px solid ${C.line}`,
          borderRight:  `1px solid ${C.line}`,
          borderBottom: `1px solid ${C.line}`,
          borderLeft:   `1px solid ${C.line}`,
          borderRadius: 6, padding: "14px 16px",
          background: C.white,
        }}>
          <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: C.inkLight, marginBottom: 8 }}>
            Supported sources
          </div>
          <div style={{ fontSize: 13, color: C.inkMid, lineHeight: 1.8 }}>
            <strong>Google Forms:</strong> Responses → Download as CSV<br />
            <strong>Google Sheets:</strong> File → Download → CSV<br />
            <strong>WhatsApp polls:</strong> Export the poll summary as text, paste into a spreadsheet with headers, save as CSV<br />
            <strong>Any other source:</strong> As long as it has a header row and a phone number column, it will work
          </div>
        </div>
      </div>
    </div>
  );
}