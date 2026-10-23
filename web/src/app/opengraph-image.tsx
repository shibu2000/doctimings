import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { SERVED_TOWNS, SITE_NAME } from "@/lib/site";

export const alt = "DocTimings — doctor chamber timings in Paschim Medinipur";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), "src/app/icon.svg"), "base64");
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #0F766E 0%, #042F2E 100%)",
          color: "#FFFFFF",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <img src={`data:image/svg+xml;base64,${logo}`} width={104} height={104} alt="" />
          <div style={{ fontSize: 56, fontWeight: 700 }}>{SITE_NAME}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.1 }}>Which doctor sits today, where, and when</div>
          <div style={{ fontSize: 30, color: "#CCFBF1" }}>Chamber timings across Paschim Medinipur</div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {SERVED_TOWNS.map((town) => (
            <div
              key={town}
              style={{
                fontSize: 24,
                padding: "8px 18px",
                borderRadius: 999,
                background: "rgba(255,255,255,0.14)",
                color: "#FFFFFF",
              }}
            >
              {town}
            </div>
          ))}
        </div>
      </div>
    ),
    size
  );
}
