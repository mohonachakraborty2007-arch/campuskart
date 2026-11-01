// Change this to your college's real email domain(s).
export const COLLEGE_DOMAINS = ["snuniv.ac.in"];

export function isCollegeEmail(email) {
    const value = String(email).trim().toLowerCase();
    const at = value.lastIndexOf("@");
    if (at < 1) return false;
    const domain = value.slice(at + 1);
    return COLLEGE_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}
// DEMO ONLY: the seller we pretend is logged in. Replaced by the real session.
export const DEMO_OWNER_ID = "s3";
// Change this to the email you want students to write to.
export const CONTACT_EMAIL = "hello@campuskart.example";