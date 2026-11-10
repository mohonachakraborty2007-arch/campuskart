import { ImageResponse } from "next/og";

export const alt = "CampusKart: buy, sell and trade on campus";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: "100%",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    padding: 90,
                    background:
                        "radial-gradient(circle at 85% 15%, rgba(124,92,255,0.55), transparent 45%), radial-gradient(circle at 10% 95%, rgba(34,211,238,0.35), transparent 40%), #0a0a10",
                    color: "#f4f5fa",
                }}
            >
                <div style={{ display: "flex", fontSize: 92, fontWeight: 800 }}>
                    CampusKart
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: 24,
                        fontSize: 44,
                        color: "#9aa0b4",
                    }}
                >
                    Buy, sell and trade on campus.
                </div>
                <div
                    style={{
                        display: "flex",
                        marginTop: 48,
                        fontSize: 30,
                        color: "#22d3ee",
                    }}
                >
                    Student-only marketplace · books, cycles, electronics, notes
                </div>
            </div>
        ),
        size
    );
}