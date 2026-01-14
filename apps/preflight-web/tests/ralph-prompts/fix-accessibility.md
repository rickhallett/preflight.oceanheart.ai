# Ralph Loop: Fix Accessibility Issues

You are running an iterative accessibility remediation loop for Preflight.

## Your Mission

Find and fix all accessibility issues until the app passes WCAG 2.1 AA compliance.

## Iteration Protocol

Each iteration:

1. **Run Accessibility Audit**
   ```bash
   cd apps/preflight-web
   bun run test:simulate landing  # Check landing page a11y
   ```

   Or run the full Playwright a11y tests:
   ```bash
   bunx playwright test -g "Accessibility" --reporter=list
   ```

2. **Check Axe Results** (if available)
   Review any axe-core violations in test output

3. **Manual Audit Checklist**
   For each page (/app, /app/profile, /app/settings, /login):
   - [ ] All images have descriptive alt text
   - [ ] Form inputs have associated labels
   - [ ] Buttons have accessible names
   - [ ] Color contrast >= 4.5:1 for text
   - [ ] Focus indicators visible on all interactive elements
   - [ ] Heading hierarchy is logical (h1 > h2 > h3)
   - [ ] Skip link to main content exists
   - [ ] ARIA attributes used correctly
   - [ ] Keyboard navigation works (Tab, Enter, Escape)

4. **Fix Issues Found**
   Common fixes:
   - Add `alt=""` for decorative images, descriptive alt for meaningful ones
   - Add `aria-label` to icon-only buttons
   - Wrap inputs with `<label>` or use `aria-labelledby`
   - Add `role` attributes where semantic HTML isn't possible
   - Ensure focus states use `outline` not just color change

5. **Update State**
   Update `tests/ralph-prompts/.ralph-a11y-state.json`:
   ```json
   {
     "iteration": <number>,
     "issuesFound": <count>,
     "issuesFixed": <count>,
     "remainingIssues": ["<description>", ...],
     "pagesAudited": ["/", "/login", "/app", ...]
   }
   ```

## Completion Criteria

Output completion promise when:
- Zero critical accessibility violations
- Zero serious accessibility violations
- All interactive elements keyboard accessible
- Screen reader tested (manual or via test)

```
<promise>ACCESSIBILITY COMPLETE</promise>
```

## Common Issue Patterns

### Images
```tsx
// Bad
<img src="/logo.png" />

// Good - decorative
<img src="/logo.png" alt="" />

// Good - meaningful
<img src="/user-avatar.png" alt="User profile picture" />
```

### Buttons
```tsx
// Bad
<button><Icon /></button>

// Good
<button aria-label="Close dialog"><Icon /></button>
```

### Form Inputs
```tsx
// Bad
<input type="email" placeholder="Email" />

// Good
<label>
  Email
  <input type="email" />
</label>

// Good - visually hidden label
<label htmlFor="email" className="sr-only">Email</label>
<input id="email" type="email" placeholder="Email" />
```

### Focus States
```css
/* Bad - removes focus indicator */
button:focus { outline: none; }

/* Good */
button:focus-visible {
  outline: 2px solid var(--focus-color);
  outline-offset: 2px;
}
```

Begin your accessibility audit iteration now.
