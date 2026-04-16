
Goal: fix the broken app flow first so logged-in users can actually access features, then prepare the codebase for the 62 API integration pass without changing the UI/UX.

What I found
- The main login-loop bug is real and clear:
  - `src/components/auth/ProfileGuard.tsx` redirects to `/auth` immediately when `token` is falsy.
  - But `src/hooks/useAuth.tsx` restores `token` from `sessionStorage` asynchronously in `useEffect`.
  - Since many routes in `src/App.tsx` are wrapped directly with `ProfileGuard`, users can get redirected before auth hydration finishes.
- The same readiness problem also exists in:
  - `src/pages/Onboarding.tsx` using `if (!user) navigate("/auth")`
  - `src/pages/Profile.tsx` using `if (!userId) navigate("/auth")`
- There is also inconsistent route protection:
  - some pages use `ProtectedRoute`
  - some use `ProfileGuard`
  - some use both
  - some depend on `user` while others depend on `token`
- Several features still contain mock flows or placeholder behavior that should be cleaned before the 62-API replacement pass:
  - `Prepare.tsx`
  - `Dashboard.tsx`
  - `CVGenerator.tsx`
  - `CoverLetter.tsx`
  - `Inbox.tsx`
  - `LinkedInManager.tsx`
  - `LinkedInScheduledPosts.tsx`
  - `MainPageLinkedInBanner.tsx`

Implementation plan

1. Stabilize auth hydration and stop false redirects
- Update `useAuth.tsx` so auth restoration is treated as a first-class “ready/loading” phase.
- Add a small helper pattern like `isAuthenticated = !!token` and ensure `loading` only becomes false after session restoration is complete.
- Keep `sessionStorage` behavior exactly as requested:
  - refresh keeps login
  - closing the tab/app requires login again

2. Fix route guards so they wait before redirecting
- Refactor `ProtectedRoute.tsx` to:
  - show loader while auth is hydrating
  - redirect only after loading is false and there is no token
- Refactor `ProfileGuard.tsx` to:
  - first wait for auth loading
  - then check token
  - then check profile/onboarding status
  - avoid redirecting logged-in users during the hydration gap
- Remove duplicate or conflicting guard behavior where a page is already protected at the route level and inside the page itself.

3. Clean auth-dependent pages that currently redirect too early
- Update `Onboarding.tsx` and `Profile.tsx` so they do not navigate to `/auth` until auth loading is finished.
- Review other pages using `useAuth()` and make them consistent:
  - pages that only need login should rely on the shared route guard
  - pages that need profile completeness should rely on `ProfileGuard`
- Keep all screens and visual states the same.

4. Unify access flow across the app
- Standardize feature-entry logic in `App.tsx`:
  - use `ProtectedRoute` for “must be logged in”
  - use `ProfileGuard` only for “must be logged in and onboarding completed”
- Review `Navigation.tsx` “Get Started” behavior so it uses the stable auth state and doesn’t send authenticated users to login by mistake.

5. Remove obvious broken placeholders and preserve working UX
- Replace the most disruptive mock-only paths that currently affect app flow with safe axios-based calls where intent is already clear.
- For pages where the endpoint name is still uncertain, keep the UI exactly the same but isolate the placeholder logic so it’s easier to swap once your API document arrives.
- Priority pages after auth fix:
  - `Prepare.tsx`
  - `CVGenerator.tsx`
  - `CoverLetter.tsx`
  - `Inbox.tsx`
  - `LinkedInManager.tsx`
  - `LinkedInScheduledPosts.tsx`
  - `Dashboard.tsx`

6. Do a consistency pass on API integration readiness
- Audit all current axios calls and compare them to page intent.
- Keep the calls that are already structurally clear.
- Mark unclear endpoints/response shapes in a focused list instead of guessing.
- This means I will:
  - replace what is clearly mappable
  - set aside ambiguous APIs
  - ask you only about those unclear ones after finishing the clear integrations

7. Verification pass
- After implementation, verify these flows specifically:
  - login → home → protected feature
  - refresh on protected page
  - onboarding access
  - profile access
  - logout
  - resume optimize with pasted text
  - resume optimize with uploaded PDF text extraction
  - cover letter optimize with typed/uploaded text
- Goal: no unexpected jump to `/auth`, and no UI changes.

Technical notes
- Root cause is not backend auth itself; it is frontend guard timing.
- The safest fix is to make every guard and auth-dependent page wait for auth hydration before deciding whether to redirect.
- I will not guess unclear API contracts during the next phase; I’ll only wire the ones that are unmistakable from the current code and your docs.

Next phase after this fix
- Once this flow stabilization is implemented and checked, you can send the document of the 62 APIs.
- I’ll then replace the clear ones first, keep UI/UX unchanged, and return with a short list of only the unclear endpoints that need your clarification.
