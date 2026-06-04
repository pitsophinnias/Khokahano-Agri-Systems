import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

const CAT_KEYS  = ["all","broilers","layers","indigenous","eggs","feed"];
const SORT_KEYS = ["default","price-asc","price-desc","rating"];

export default function FilterBar({ filters, setFilter, total, t }) {
  return (
    <>
      <style>{`
        .kh-filterbar {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 16px;
        }
        .kh-cats {
          display: flex;
          gap: 6px;
          overflow-x: auto;
          padding-bottom: 2px;
          scrollbar-width: none;
          /* Don't let it shrink the viewport */
          max-width: 100%;
        }
        .kh-cats::-webkit-scrollbar { display: none; }
        .kh-cat {
          padding: 6px 12px;
          border: 1px solid ${C.line};
          border-radius: 2px;
          background: ${C.white};
          color: ${C.inkMid};
          font-size: 12px;
          cursor: pointer;
          white-space: nowrap;
          font-family: ${F.body};
          font-weight: 400;
          flex-shrink: 0;
          transition: all 0.15s;
        }
        .kh-cat.active {
          background: ${C.ink};
          color: #fff;
          border-color: ${C.ink};
          font-weight: 500;
        }
        .kh-sort-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
        }
        .kh-sort-row select {
          padding: 6px 10px;
          border: 1px solid ${C.line};
          border-radius: 4px;
          font-size: 13px;
          font-family: ${F.body};
          background: ${C.white};
          color: ${C.ink};
        }
      `}</style>

      <div className="kh-filterbar">
        {/* Category pills — scrollable */}
        <div className="kh-cats">
          {CAT_KEYS.map((key) => (
            <button
              key={key}
              className={`kh-cat${filters.category === key ? " active" : ""}`}
              onClick={() => setFilter({ category: key })}
            >
              {t(`cat_${key}`)}
            </button>
          ))}
        </div>

        {/* Count + sort on same row */}
        <div className="kh-sort-row">
          <span style={{ fontSize: 12, color: C.inkLight }}>
            {total} {t("results")}
          </span>
          <select
            value={filters.sort}
            onChange={(e) => setFilter({ sort: e.target.value })}
          >
            {SORT_KEYS.map((key) => (
              <option key={key} value={key}>
                {t(`sort_${key.replace("-","_")}`)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}