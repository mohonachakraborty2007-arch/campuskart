// Change this to your college's real email domain(s).
export const COLLEGE_DOMAINS = ["snuniv.ac.in"];

export function isCollegeEmail(email) {
    const value = String(email).trim().toLowerCase();
    const at = value.lastIndexOf("@");
    if (at < 1) return false;
    const domain = value.slice(at + 1);
    return COLLEGE_DOMAINS.some((d) => domain === d || domain.endsWith(`.${d}`));
}