# CampusKart

A student-only marketplace to buy, sell and trade used books, electronics, notes and cycles.

Status: in development.
## Security and testing: what this does and does not show
The automated tests and the security checks done so far (permission tests on every write route, query-injection tests, dependency audit, secret search, cookie and header checks on the live site) catch common mistakes. They do not prove the app is secure, and there has been no independent security review. Known limits are listed in `docs/KNOWN_ISSUES.md`.