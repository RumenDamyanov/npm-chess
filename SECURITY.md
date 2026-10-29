# Security Policy

## Reporting a Vulnerability

The npm-chess team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**security@rumenx.com**

### What to Include

Please include the following information in your report:

- **Description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up questions

### Response Timeline

- **Initial response**: Within 48 hours
- **Status update**: Within 7 days
- **Fix timeline**: Depends on severity (see below)

### Severity Levels

- **Critical**: Fix within 24-48 hours
- **High**: Fix within 7 days
- **Medium**: Fix within 30 days
- **Low**: Fix in next regular release

## Supported Versions

We provide security updates for the following versions:

| Version | Node.js                      | Supported                                                          |
| ------- | ---------------------------- | ------------------------------------------------------------------ |
| 1.1.x   | 22.23.4+, 24.22.1+, 26.12.1+ | :white_check_mark:                                                 |
| 1.0.x   | 18+                          | :x: Node.js 18 and 20 are end of life and have no Node2Shell patch |

Node2Shell
([CVE-2026-111497](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases))
is an out-of-bounds write in the Brotli decoder bundled with Node.js. It is in
the runtime, not in this library. There is no package workaround. A process is
exposed when it decompresses Brotli data it does not control, including
`fetch()` responses and compressed request bodies. Run **Node.js 22.23.4+**,
**24.22.1+**, or **26.12.1+**. Node.js 20 and older will not receive a fix. See
the
[Node.js security release](https://nodejs.org/en/blog/vulnerability/october-2026-security-releases).

## Security Best Practices

When using npm-chess:

1. **Keep dependencies updated**: Run `npm audit` regularly
2. **Validate user input**: Always validate moves and game states
3. **Rate limiting**: Implement rate limiting for API endpoints
4. **Authentication**: Use proper authentication for API access
5. **Environment variables**: Store sensitive data in environment variables
6. **HTTPS only**: Use HTTPS for API communication in production

## Known Security Considerations

### AI Move Generation

- AI move generation can be CPU-intensive
- Implement timeouts to prevent DoS attacks
- Consider rate limiting AI requests

### Game State Validation

- Always validate game states before processing
- Sanitize FEN/PGN input from untrusted sources
- Validate move legality server-side

### API Security

- Implement authentication for sensitive endpoints
- Use rate limiting to prevent abuse
- Validate all input parameters
- Sanitize error messages (no stack traces in production)

## Dependencies

We regularly monitor and update dependencies to address security vulnerabilities:

- **Automated**: Dependabot alerts and updates
- **Manual**: Monthly dependency review
- **Audit**: Run `npm audit` in CI/CD pipeline

## Security Updates

Security updates will be:

- Released as patch versions (e.g., 1.0.1)
- Documented in CHANGELOG.md
- Announced via GitHub releases
- Published to npm immediately

## Acknowledgments

We will acknowledge security researchers who responsibly disclose vulnerabilities:

- Listed in CHANGELOG.md
- Credit in release notes
- Public acknowledgment (with permission)

## Contact

For security concerns:

- **Email**: security@rumenx.com
- **General contact**: contact@rumenx.com
- **GitHub**: https://github.com/RumenDamyanov/npm-chess/issues

---

Thank you for helping keep npm-chess secure! 🔒
