# Pawvo V2 · Multi-page concept website

Five-page, responsive, **front-end only** prototype for personalized AI talking-pet video gifts.

## Pages

- `index.html` — longer visual storytelling, demo format previews, social/gift story, FAQ and CTA.
- `examples.html` — searchable-by-category concept gallery (filters are functional).
- `how-it-works.html` — an illustrated, three-step process and photo tips.
- `gifts.html` — gift occasions and ideas.
- `create.html` — functional client-side concept builder: photo preview, scene selection, scripts, duration, voice style, concept summary.

## Local preview

Open `index.html` in a browser or serve the folder with `python3 -m http.server 8080`.

For hosting, deploy this directory as a static site. `index.html` is the root document; all pages work as `.html` links.

## Important launch notes

This is a **product concept**. There is no AI model endpoint, video rendering, checkout, order system, user account, or email delivery. The visible storyboards are **not** footage or fabricated customer testimonials. Suggested price tiers are illustrative. No pet photos are uploaded to any server; previews use browser object URLs only. Images used as photo illustrations are hosted by Unsplash and should be replaced with properly cleared branded assets and genuine AI-generated sample videos before launch. Check license and usage rights when shipping to customers.

## Future integration points

1. Add real `.webm` / `.mp4` demonstration reels to the example gallery.
2. Create a secure backend for image upload and temporary object storage.
3. Build an order model and integrate Stripe Checkout.
4. Generate script/audio and video with provider APIs, via an asynchronous queue.
5. Add privacy policy, retention policy, refund policy, legal business details and delivery notifications.
6. Add structured analytics after privacy/cookie requirements are handled.

## Design

Self-contained HTML, CSS and vanilla JS. No build step required. Google Fonts and Unsplash images require internet access.
