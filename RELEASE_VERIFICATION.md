# Production Release Verification

On 14 August 2026, the Redtent Vercel production root was verified after the Vite static-output and Express API routing repair.

| Check | Result |
|---|---|
| GitHub production branch | `main` contains the current Redtent release checkpoint. |
| GitHub development release branch | `manus/redtent-app` contains the same current checkpoint. |
| Vercel production deployment | Ready for commit `cfc955a`. |
| Public root | `https://red-tent-omega.vercel.app` renders the Redtent sign-in screen and no longer returns the raw server bundle. |

The verified production root shows the Redtent identity, the wellbeing introduction, the **Begin with Redtent** sign-in action, and the established general-wellness safety language.
