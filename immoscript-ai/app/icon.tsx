import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

/**
 * Même bâtiment (toit + façade) que components/brand/LogoMark.tsx, mais construit avec des <div>
 * plutôt qu'un <svg> — next/og (Satori) rend les formes CSS (bordures, flex) de façon fiable, pas
 * les <svg> arbitraires avec dégradés.
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E3FBFF, #7FD9EC)",
          borderRadius: 7,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
          <div
            style={{
              width: 0,
              height: 0,
              borderLeft: "8px solid transparent",
              borderRight: "8px solid transparent",
              borderBottom: "7px solid white",
            }}
          />
          <div
            style={{
              width: 14,
              height: 10,
              background: "white",
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "center",
            }}
          >
            <div style={{ width: 4, height: 5, background: "#7FD9EC" }} />
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
