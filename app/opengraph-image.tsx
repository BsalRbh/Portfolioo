import { ImageResponse } from "next/og";

// Social preview for the home page (LinkedIn, X, WhatsApp, Slack…).
// Kathmandu edition look: morning sky, a pagoda roofline, a brick street.
export const alt = "Bishal Rajbahak — Full-Stack Developer in Kathmandu, Nepal";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BRICK =
  "repeating-linear-gradient(0deg, #5b2516 0px, #5b2516 3px, transparent 3px, transparent 26px), repeating-linear-gradient(90deg, #5b2516 0px, #5b2516 3px, #a9492c 3px, #a9492c 70px)";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(180deg, #9fc2d8 0%, #d6e3e8 55%, #f2e7d6 100%)",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", flex: 1, padding: "64px 72px 0", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
            <div
              style={{
                display: "flex",
                alignSelf: "flex-start",
                padding: "8px 18px",
                background: "#f3ecda",
                border: "4px solid #b3261e",
                borderRadius: 6,
                color: "#1d3c72",
                fontSize: 26,
                fontWeight: 700,
              }}
            >
              Kathmandu, Nepal
            </div>
            <div style={{ display: "flex", marginTop: 28, fontSize: 96, fontWeight: 800, color: "#23150f", lineHeight: 1 }}>
              Bishal Rajbahak
            </div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 38, color: "#3a2a20", lineHeight: 1.3 }}>
              Full-stack developer — fast, reliable web apps with React, Next.js & Go.
            </div>
          </div>
          {/* pagoda roofline */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", width: 260 }}>
            <div style={{ display: "flex", width: 10, height: 40, background: "#d6a441", borderRadius: 5 }} />
            <div style={{ display: "flex", width: 120, height: 34, background: "#d6a441", borderRadius: "40px 40px 4px 4px" }} />
            <div style={{ display: "flex", width: 70, height: 36, background: "#a9492c" }} />
            <div style={{ display: "flex", width: 190, height: 34, background: "#2f1f18", borderRadius: "30px 30px 4px 4px" }} />
            <div style={{ display: "flex", width: 110, height: 40, background: "#a9492c" }} />
            <div style={{ display: "flex", width: 260, height: 36, background: "#2f1f18", borderRadius: "30px 30px 4px 4px" }} />
            <div style={{ display: "flex", width: 150, height: 60, background: "#a9492c" }} />
          </div>
        </div>
        <div style={{ display: "flex", height: 18, background: "#23150f" }} />
        <div
          style={{
            display: "flex",
            height: 92,
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0 72px",
            backgroundColor: "#a9492c",
            backgroundImage: BRICK,
            color: "#f3ecda",
            fontSize: 28,
            fontWeight: 700,
          }}
        >
          <span>bishalrajbahak.com.np</span>
          <span>React · Next.js · Go · PostgreSQL</span>
        </div>
      </div>
    ),
    size,
  );
}
