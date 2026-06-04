import { THEME } from "../constants/theme.js";

const C = THEME.colors;
const F = THEME.fonts;

export default function StatsStrip({ stats, t }) {
  const items = stats ? [
    { n: stats.totalFarmers,            l: t("farmers_stat") },
    { n: stats.totalDistricts,          l: t("districts_stat") },
    { n: `${stats.totalListings}+`,     l: t("listings_stat") },
    { n: stats.avgRating.toFixed(1),    l: t("rating_stat") },
  ] : [
    { n: "—", l: t("farmers_stat") },
    { n: "—", l: t("districts_stat") },
    { n: "—", l: t("listings_stat") },
    { n: "—", l: t("rating_stat") },
  ];

  return (
    <>
      <style>{`
        .kh-stats {
          background: ${C.green};
          display: grid;
          /* 4 equal columns always — shrinks gracefully */
          grid-template-columns: repeat(4, 1fr);
          overflow: hidden;
        }
        .kh-stat {
          text-align: center;
          padding: 10px 4px;
          border-right: 1px solid rgba(255,255,255,0.1);
        }
        .kh-stat:last-child { border-right: none; }
        .kh-stat-n {
          font-family: ${F.display};
          font-size: clamp(14px, 4vw, 20px);
          color: #fff;
          line-height: 1;
        }
        .kh-stat-l {
          font-size: clamp(8px, 2vw, 10px);
          color: rgba(255,255,255,0.55);
          text-transform: uppercase;
          letter-spacing: 0.06em;
          margin-top: 2px;
        }
      `}</style>
      <div className="kh-stats">
        {items.map((item, i) => (
          <div key={i} className="kh-stat">
            <div className="kh-stat-n">{item.n}</div>
            <div className="kh-stat-l">{item.l}</div>
          </div>
        ))}
      </div>
    </>
  );
}