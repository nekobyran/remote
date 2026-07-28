# NKBR root portal

`https://nkbr.cc/` is the unified entry point for NKBR projects, release pages, and notes.

## Architecture

- Source: this directory
- Staged assets: `.stage/`
- Runtime: Cloudflare Worker + Static Assets binding
- Custom domain: `nkbr.cc`
- No remote GitHub raw-file origin
- Strict same-origin CSP, HSTS, `nosniff`, and HTML `no-transform`

## Commands

```powershell
pwsh -NoProfile -File .\Deploy-NkbrRoot.ps1 -Action Validate
pwsh -NoProfile -File .\Deploy-NkbrRoot.ps1 -Action DryRun
pwsh -NoProfile -File .\Deploy-NkbrRoot.ps1 -Action Deploy
pwsh -NoProfile -File .\Deploy-NkbrRoot.ps1 -Action Status
```

The portal links to eleven independent project domains. It does not proxy downloads or invent release availability.
