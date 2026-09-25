# MiniMax H3 — Girl Content Prompting Guide

**Specialized handbook: start-frame selfie → short posing video**  
Version: 1.1 · I2VA niche edition · 24 September 2026  
Prompt language: English only

This is a niche specialization of the MiniMax H3 prompting guide. Official field names, section order, alignment sentences, shot notation, and sound fields are unchanged. The creative job is narrowed to one pipeline.

## Job of the prompt writer

The model receives **one input image**. That image is the **first frame** of the video, not a loose identity reference and not an end frame.

Workflow every time:

1. Read the start frame (face, hair, hands, outfit, room, light, crop).
2. Keep that exact opening state at `0.00s`.
3. Choose **one** small posing beat that could naturally happen after this still.
4. Write an **I2VA** prompt so the clip begins on that picture and stays in the same selfie.

Do not switch to T2VA, FL2VA, L2VA, or full-reference unless the user explicitly changes the asset setup. Default mode is always I2VA.

Write the prompt body in **English only**. Do not put Dutch (or any other language) in field names, descriptions, or invented speech. If the user later supplies a locked spoken line in another language, that line alone may keep its original words inside `<d>`. Default clips have **no speech**.

## Purpose and limits

Tasteful feminine self-cam: an adult woman already in a selfie, who barely moves. She poses for the camera. She may play with her hair a little, pout once, or lift a peace sign. She often tilts her head slightly. She does not perform a routine.

Not in scope:

- explicit sex, pornographic posing as the event, genital framing
- anyone who is or appears under 18
- busy choreography, dance, finger hearts, two-handed hearts, outfit spins, walking montages
- stacking hair + pout + peace sign in one clip
- invented extra people
- on-screen TikTok UI

A prompt clarifies the request. It does not guarantee exact identity lock or timing.

## Contents

1. Operating instructions
2. Mode (I2VA only)
3. Read the start frame
4. Choose one beat
5. Official I2VA format
6. Camera, continuity, constraints
7. Speech and sound (usually none)
8. Beat library
9. Template
10. Worked examples matched to typical start frames
11. Troubleshooting
12. Validation
13. Compact reminder

---

## 1. Operating instructions

### 1.1 Defaults

When the user does not override them:

- mode: I2VA
- one continuous `[Shot 1]`
- no dialogue
- `non_diegetic_music: N/A`
- slight handheld drift only, no zoom, no cut
- adult woman as seen in the photo
- one beat only
- end on a still hold looking at the lens
- duration assumption if unspecified: 6–8 seconds (state the assumption outside the prompt; duration is a workflow control)

### 1.2 Do not invent the photo

Describe only what is visible or clearly implied by the start frame: hair color and fall, eye color, makeup density, necklace, earrings, strap color, bedsheet, car seat, wall, sunlight direction, hand position.

If a hand is already at her chin or in her hair in the first frame, do not reset that hand to her lap. Continue from the occupied pose.

### 1.3 Deliverable

One finished prompt in one plain-text code block.

Outside the prompt, a short note is allowed: assumed duration, which beat was chosen, anything unseen.

No placeholders, no checklist, no commentary inside the H3 text.

---

## 2. Mode

Always begin with the official I2VA alignment line, then one blank line, then the three base fields in order:

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] ...

overall_soundscape: ...

non_diegetic_music: ...
```

`<Picture 1>` is the uploaded start frame.

Do not write `subject_definitions` or `retention_analysis` for this default pipeline.

---

## 3. Read the start frame

Before writing, lock these from the image:

| Look at | Why it matters |
| --- | --- |
| Crop and angle | close-up face, above-her on a bed, car interior, mirror, arm’s-length selfie |
| Head angle already in the still | if she is already tilted, keep it; do not snap her upright |
| Eyes | toward lens, cut to the side, half-lidded |
| Mouth | closed smile, pout, neutral, lips parted |
| Hair | part, length, over which shoulder, covering cheek or not |
| Hands | free, at chin, in hair, holding phone (usually out of frame on front cam) |
| Outfit edges | white strap, black tee, smocked tube, off-shoulder |
| Jewelry | hoop, thin chain, pendant |
| Light | hard sun patch, warm lamp, dim indoor, car window |
| Background | pillow, linen, car headrest, wood ceiling, bare wall |

The first sentences after `[Shot 1]` must say the shot begins from `<Picture 1>` and preserves those facts.

Then describe only what changes.

---

## 4. Choose one beat

A sensual selfie is mostly stillness. Pick **one** staple. Never all three.

**Staple A — hair:** one small contact. Tuck one strand, slide fingers down a section already near her face, or move hair off her mouth. No dramatic flip. No two-handed hair toss.

**Staple B — mouth:** one pout or a release from pout into a small closed smile. Do not chew, bite hard, or lick.

**Staple C — peace sign:** one hand rises into a small peace sign near the cheek or chin, then holds. Only if that hand is free in the start frame.

**Allowed modifier, not a second act:** a slight **head tilt** (ear toward shoulder). This is a roll/tilt of the head, not turning to look off-screen left or right. Tiny. Once.

Optional micro-ending: hold the new head angle and look at the lens. That is posing, not a new beat.

### How to pick from the still

- Hand already in hair → continue a small hair slide, or stop moving and pout.
- Hand already at chin → keep it there; add a tilt or a small pout. Do not also throw a peace sign with that hand.
- Both hands free / not shown → prefer tilt + tiny smile, or one hair touch if a hand can enter at the edge without wrecking the crop.
- Car / tight face crop → tilt or pout. Peace sign often breaks the frame; skip it.
- She already pouts in the still → do not pout again. Tilt or one hair move.

If unsure: **head tilt + hold**. It is the most native motion for this niche.

---

## 5. Official I2VA writing pattern

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical smartphone front-camera footage with natural skin texture. The shot begins from <Picture 1>, preserving {face, hair, makeup, visible outfit, jewelry, hand placement, background, light direction, and crop}. The camera stays in the opening position with slight handheld drift, no zoom, and no cut. {One beat, written as physical action}. {Optional slight head tilt if not already the beat}. She holds the ending pose and keeps her eyes on the lens. Face, hairstyle, outfit, and setting stay consistent.

overall_soundscape: Quiet {room / car} tone. {One small fabric or hair sound if the beat needs it}.

non_diegetic_music: N/A
```

Style phrase belongs right after `[Shot 1]`, derived from the photo (sunlit bed still, dim indoor phone flash, parked-car daylight, etc.).

Keep the description short. This niche does not need 350–500 words. Name the opening lock, the single motion, the hold.

---

## 6. Camera, continuity, constraints

### Camera

Match the photo’s camera.

- Front-camera close-up: phone in her hand, lens near her face, slight drift.
- Lying on a bed shot from above: keep that high angle; do not stand her up.
- Car seat: keep headrest / seatbelt / window light if visible.
- Arm visible at frame edge: that arm is the phone arm; do not use it for a peace sign.

No push-in unless the user asks. No orbit. No cut.

### Continuity

- Do not change hair length, part, or color.
- Do not change clothes.
- Do not move her to another room.
- Do not add a second hand if only one is visible and the crop is tight.
- If sunlight stripes her cheek in the still, keep that direction.

### Constraints to include when useful

- one continuous take, no cut
- no extra people
- no on-screen text
- no beauty-filter plastic skin
- mouth closed except the specified pout

Do not paste a long generic negative list.

---

## 7. Speech and sound

Default: silence besides room tone. No `(S1)`, no `<d>`.

Do not invent greetings, flirty scripts, or Dutch lines.

Soundscape: one or two sentences. Bed sheet, hair brush, jacket, quiet cabin. No music unless asked.

```text
overall_soundscape: Quiet bedroom room tone and a faint hair rustle.

non_diegetic_music: N/A
```

---

## 8. Beat library (use one)

Write the motion in plain physical English.

**Hair**

- Her visible hand slides a strand back from her cheek and rests again near her collarbone.
- She pinches one front piece and tucks it behind her ear, then drops the hand.
- Fingers already in her hair comb downward once along the same section.

**Pout**

- She presses her lips into a small pout, holds it, then eases into a closed mouth.
- Her mouth, already soft, firms into a short pout and stays there.

**Peace sign**

- Her free hand rises into frame and holds a small peace sign beside her cheek. She keeps it still.

**Tilt (modifier or solo)**

- She tilts her head a few degrees toward her right shoulder, eyes still on the lens.
- She tilts her head toward her left shoulder and holds.

**Hold**

- She stops moving and holds the pose until the end.

Forbidden as defaults: finger heart, both-hands heart, hair whip, dance, blowing a kiss as a big gesture, covering the lens, standing up from a lying start frame, talking with hands.

---

## 9. Template

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical smartphone front-camera footage with natural skin texture and the same lighting as the opening still. The shot begins from <Picture 1>, preserving her face, eyes, brows, lips, hairstyle, visible clothing, jewelry, hand placement, background, and crop. The camera remains in the opening position with slight handheld drift, no zoom, and no cut. {ONE beat}. She holds the final pose with her eyes on the lens. Identity, outfit, and setting stay consistent. No extra people and no on-screen text.

overall_soundscape: {Quiet matching ambience. One small motion sound if needed.}

non_diegetic_music: N/A
```

---

## 10. Worked examples

These assume the uploaded still is `<Picture 1>`. Swap the preserved details to match the actual file.

### Example A — sunlit bed close-up, hand already near chin / hair

Use when the still is a tight face crop on linen, hard sun, white strap, fingers at the jaw.

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical smartphone footage with natural skin texture and hard sunlight. The shot begins from <Picture 1>, preserving her face, brown eyes, long light-brown hair across the pillow, white strap, thin necklace, the hand already at her jaw, the linen, the pale wall, and the sun patch on her cheek. The camera holds the same high close-up with only slight handheld drift, no zoom, and no cut. Her fingers slide a small section of hair back from her mouth and settle again at her jaw. She tilts her head a few degrees toward the pillow and holds a soft pout, eyes on the lens. Same outfit, hair length, and lighting throughout.

overall_soundscape: Quiet bedroom tone. Soft hair movement against her fingers.

non_diegetic_music: N/A
```

### Example B — parked-car selfie, small smile

Use when the still is a car interior, hoops, pendant, white smocked top.

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical front-camera footage inside a parked car, natural skin texture, warm daylight. The shot begins from <Picture 1>, preserving her face, brown eyes, long wavy brown hair, gold hoop earring, small pendant, white smocked top, headrest, and window light. The camera stays in the opening close-up with slight handheld drift, no zoom, and no cut. She holds the smile, then tilts her head a few degrees toward her right shoulder without turning away from the lens. She holds that tilt to the end. No peace sign, no extra hands, no speech.

overall_soundscape: Quiet car-cabin tone and faint distant street sound.

non_diegetic_music: N/A
```

### Example C — dim bed, dark hair, quilted pillow

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical phone close-up with dim indoor light and natural skin texture. The shot begins from <Picture 1>, preserving her face, dark eyes, long straight black hair over the quilted pillow, the pale top edge, and the tight crop. The camera stays put with slight handheld drift, no zoom, and no cut. She presses her lips into a small pout and holds it, then eases back toward a closed mouth. Her head tilts a few degrees toward the pillow. Hair fall, pillow, and lighting stay the same.

overall_soundscape: Quiet bedroom room tone.

non_diegetic_music: N/A
```

### Example D — warm indoor wall, finger already on chin, red lipstick

Hand is occupied. Do not add a peace sign.

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical indoor phone footage with warm lamp light and natural skin texture. The shot begins from <Picture 1>, preserving her face, dark eyes, long brown hair, red lipstick, white off-shoulder top, the finger already at her chin, the plain wall, and the metal fixture at frame left. The camera holds the opening medium close-up with slight handheld drift, no zoom, and no cut. Her fingertip stays at her chin. She tilts her head a few degrees toward her left shoulder and keeps her eyes on the lens. No extra gesture.

overall_soundscape: Quiet indoor room tone.

non_diegetic_music: N/A
```

### Example E — wood-ceiling selfie, dark shirt, phone arm in frame

The visible arm holds the phone. Beat = tilt only.

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical handheld selfie with natural skin texture and indoor light. The shot begins from <Picture 1>, preserving her face, winged liner, long dark hair, dark shirt, the raised phone arm at frame right, the wood ceiling, and the door trim. The camera stays at the same arm’s-length angle with slight handheld drift, no zoom, and no cut. She tilts her head a few degrees toward her left shoulder and holds the look into the lens. The phone arm does not change role. No peace sign.

overall_soundscape: Quiet indoor room tone and faint fabric shift.

non_diegetic_music: N/A
```

### Example F — low-light close-up, slight smile

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Live-action vertical phone close-up in low indoor light with natural skin texture. The shot begins from <Picture 1>, preserving her face, dark eyes, long dark hair, the black top, the pale wall, and the existing small smile. The camera holds the opening crop with slight handheld drift, no zoom, and no cut. She keeps the smile and tilts her head a few degrees toward her right shoulder, eyes on the lens, then holds. One motion only.

overall_soundscape: Quiet indoor room tone.

non_diegetic_music: N/A
```

---

## 11. Troubleshooting

| Problem | Fix |
| --- | --- |
| She stands up / changes room | Re-lock start pose and background from `<Picture 1>` |
| Too much acting | Delete every beat except one |
| Finger heart / dance / kiss-blow | Remove; replace with tilt or hold |
| Peace sign on the phone arm | That arm is busy; choose tilt or pout |
| Hand teleports | Continue from the hand already in the still |
| Stacked hair + pout + peace | Keep one staple |
| Head turns away | Rewrite as a small tilt toward a shoulder, eyes still on lens |
| Dutch or extra chatter | Delete speech; English description only |
| Plastic beauty look | Say natural skin texture; no filter smoothing |
| Unwanted cut | Only `[Shot 1]` |

---

## 12. Validation

- [ ] I2VA alignment line present, `<Picture 1>` is the start frame
- [ ] Opening state copied from the actual still
- [ ] Exactly one posing beat
- [ ] Head motion is a tilt, not a look-away
- [ ] Occupied hands stay occupied
- [ ] English only in the prompt body
- [ ] No speech unless the user locked a line
- [ ] `non_diegetic_music: N/A`
- [ ] No cut, no extra people, no on-screen text
- [ ] Adult woman; not explicit porn

---

## 13. Compact reminder

**The photo is frame zero. She almost does not move. Pick one: hair, pout, or peace sign. A small head tilt is enough. Hold. English. I2VA.**
