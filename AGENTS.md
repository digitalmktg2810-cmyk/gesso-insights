<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## App architecture
- Keep public CSV fetching and refresh configuration in `src/lib/ads/data.ts`, and parsing/aggregation/formatting in `src/lib/ads/metrics.ts`, so calculations remain independently testable.
- Prime the CSV query with the index loader and subscribe with TanStack Query; preserve the last successful data when background refresh fails.
- Keep the three dashboard views on the index route with URL-backed tab state, because this is a single-screen application.
- Provide home-screen installation through a manifest and icons only; do not add a service worker without an explicit offline requirement.
- Infer the campaign week from the earliest CSV record, using Monday–Sunday calendar weeks in São Paulo and limiting the display to eight weeks, because the CSV has no campaign-start setting.
