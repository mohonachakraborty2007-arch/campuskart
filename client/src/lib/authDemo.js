import { COLLEGE_DOMAINS } from "@/lib/config";

// DEMO ONLY. Replaced by the real API call in the backend phase.
let failures = 0;

export async function loginRequest({ email, password }) {
  await new Promise((resolve) => setTimeout(resolve, 700));

  const domain = COLLEGE_DOMAINS[0];
  const e = email.trim().toLowerCase();

  if (failures >= 5) return { ok: false, code: "locked" };

  if (e === `demo@${domain}` && password === "demo1234") {
    failures = 0;
    return {
      ok: true,
      user: { name: "Kabir M.", email: e, role: "user" },
    };
  }
  if (e === `admin@${domain}` && password === "admin1234") {
    failures = 0;
    return {
      ok: true,
      user: { name: "Admin", email: e, role: "admin" },
    };
  }
  if (e === `new@${domain}`) return { ok: false, code: "unverified" };

  failures += 1;
  return { ok: false, code: "invalid" };
}