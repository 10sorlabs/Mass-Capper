# SOP — MiniMax H3 prompts for Instagram influencer videos

**Version:** 1.2  
**Date:** 25 September 2026  
**Language of this SOP:** English (procedure and prompt body)  
**Scope:** standardized I2VA prompts for short, girly Instagram/TikTok selfies of attractive adult women, starting from a single photo.

This does not replace the general MiniMax H3 prompting guide. The general guide remains authoritative for **mode, field names, order, alignment rule, shot notation, and sound fields**. This SOP explains how to apply those rules to one task: bringing a starting photo to life as a candid IG/TikTok selfie.

The four prompts in §16 are **style examples** (sentence structure, identity lock, hold, close mic, R&B pad). They are not an exhaustive list of beats. New beats are allowed as long as the tone stays girly and lightly seductive — not overtly sexy, and not a gag.

---

## 1. Goal

Turn each request into one ready-to-use H3 prompt that:

- uses the supplied photo as the **actual first frame**
- looks like a **candid vertical Instagram selfie**
- preserves the face, hair, outfit, and setting from the photo
- follows a short hold with **a girly posing beat** in which she shows herself off
- feels as if she is thinking: *I look so good in this video; everyone is going to love it*
- ends in the same place and outfit
- includes close-mic sound and a quiet R&B pad
- follows the sentence structure of the examples in §16

This SOP does not guarantee a perfect identity lock. It specifies the writing method.

---

## 2. Scope

**In scope**

- I2VA from a single starting photo
- car, bed, bedroom, mirror, dressing room, or any place where the photo is already a selfie
- girly and a little seductive: she poses because she knows she looks good
- tone: self-satisfied, playful, “look at me” — not pornographic or aggressively sexy
- posing beats beyond the four examples; see §9

**Out of scope**

- gags: a fall, splash, treadmill, ball hitting someone in the face, crowd reaction
- a crash or the implication of a crash
- walking away to a new location or changing outfits
- explicit bouncing, shaking, or jolting as the main event
- a full dance routine, montage, or cut
- inventing additional people
- on-screen TikTok UI or watermarks
- inventing dialogue
- language such as “slutty,” “pornstar,” “tits bounce,” or “filthy”

If the user asks for a gag or an explicit plot, that is a different task and this SOP does not apply.

**Difference from the Girl Content guide:** that file is more minimal (one staple move: hair *or* pout *or* peace sign; music `N/A`). This SOP covers a fuller influencer take: more girly beats, light flirtation, and a default R&B pad. It still does not call for a sexy plot.

---

## 3. Workflow

1. Examine the photo. Describe only what is visible.
2. Mode = **I2VA**.
3. Register = girly influencer, lightly seductive, not overtly sexy.
4. Assume a duration of **6 seconds** (state it outside the prompt).
5. Choose one beat that fits the existing pose (§9).
6. Write the alignment line and three fields in English, following the sentence structure in §15–16.
7. Optionally add a compact sound prompt.
8. Check the result against §13.
9. Deliver the prompt in a single code block. Put assumptions outside it.

Ask a question only if it changes the structure: Is this actually the starting frame? Should she speak? Does the user deliberately want something outside this SOP?

---

## 4. Official I2VA format

Use this exact first line, a blank line, then the three fields:

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] ...

overall_soundscape: ...

non_diegetic_music: ...
```

- Write the prompt body in **English**.
- Do not include JSON, a title, a checklist, or placeholders in the finished prompt.
- Use one `[Shot 1]`, no opening timestamp, and no cut.
- Other modes (T2VA, FL2VA, L2VA, full-reference) are covered by the general H3 guide.

---

## 5. Intake (internal; do not send to H3)

```text
Starting frame examined: yes
Mode: I2VA
Duration: 6s
Register: girly / lightly seductive influencer
Camera: she holds the phone / holds it above herself
Remains in the photo's location: yes
Dialogue: none
Must preserve: face, hair, outfit, hand position, setting, crop
Allowed change: only the chosen posing beat
```

---

## 6. Defaults

| Item | Default |
| --- | --- |
| Format | vertical Instagram smartphone video |
| Look | candid, ordinary phone color, no beauty filter |
| Camera | she holds the phone herself / above herself |
| Movement | slight handheld selfie drift, no zoom or cut |
| Shots | one `[Shot 1]` |
| Opening | hold the opening look for a beat |
| Action | one girly posing beat from §9 that fits the photo |
| Ending | same hair, garment, place; eyes on the lens |
| Dialogue | none |
| Music | `Low sparse R&B pad, no vocals, quieter than her breath.` |
| Duration | 6 seconds in the H3 UI |

Override these only when the user explicitly requests it (no music, a locked line of dialogue, a different duration).

---

## 7. Anatomy of the description

Use two paragraphs after `[Shot 1]`. Do not add subheadings.

### Paragraph 1 — Setup

1. `Candid vertical Instagram selfie in {place}, {lighting}, ordinary phone color, no beauty filter.`
2. `The shot begins from <Picture 1>, preserving {visible identity, outfit, hand/prop, setting, framing}.`
3. `She holds the phone herself.` or `She holds the phone above herself.`
4. `Slight handheld selfie drift, no zoom or cut.`

### Paragraph 2 — Beat

1. `She holds the opening look for a beat…`
2. One continuous posing beat (a cluster of 1–3 girly micro-gestures is fine if it remains one moment).
3. `Same {hair}, {garment}, and {place} through the ending.`
4. Use a negative sentence only if the setting suggests an unwanted plot. The car example says `No crash, no cutaway.` — include that kind of guardrail only when needed, not as standard gag language.

Avoid an extra shot, a new room, an outfit change, “cinematic,” an orbiting camera, beauty lighting, or a second plot.

---

## 8. What to lock from the photo

Name details the model might otherwise discard:

- face, gaze, lips, freckles, piercing
- hair length, color, and how it falls
- garment, color, and cut
- nails, ring, necklace, glasses
- a hand already on her chin or lip, or the arm holding the phone
- crop and angle
- distinctive setting details: leather seat, pillow, closet, mirror rug, ceiling beam

For a mirror shot, lock both the face looking into the lens **and** what the mirror shows.

Continue from the pose in the photo. If her hand is already near her mouth, do not reset it to her lap.

---

## 9. Beats

The four examples in §16 demonstrate the **tone**, not the only allowed moves.  
Test: Would she do this in a TikTok because she thinks she looks great? If yes, it fits. Does it look like a sexy skit or a joke? If yes, it does not fit.

Write the beat as a physical action. Avoid “she looks hot.” Describe her hair, mouth, posture, gaze, or a small adjustment to her appearance.

**Hair**

- tuck a strand behind her ear or move it away from her mouth
- let her hair slide over one shoulder
- give the length a small flip, not a dance-style hair whip
- play with a strand while keeping her eyes on the lens

**Face / mouth**

- hold the opening look as if checking the preview screen
- give a small private smile, half-smile, or knowing look
- lightly purse or part her lips so they catch the light
- gently bite her lower lip
- look at the camera through her lashes
- raise one eyebrow
- briefly look at her reflection or out the window, then look back, pleased

**Hands / small adjustments**

- trail her nails along her jaw, lip, or necklace
- adjust a top strap, collar, or hoodie zipper a fraction
- lower or push up her glasses a few millimeters
- make a peace sign by her cheek or chin, only if that hand is free and is not holding the phone
- give the lens a brief wave
- leave her hand under her chin if it is already there in the photo

**Body / showing the outfit**

- tilt her head against the seat, pillow, or shoulder
- lean slightly toward the lens, then settle back
- shift her weight onto one hip; in a mirror, show a little more of the outfit from behind
- bring one shoulder slightly forward so the top sits better
- turn slightly in place if she is already standing — do not walk away

**Ending**

- hold still and look into the lens, as if keeping the take because it turned out well

Combine 1–3 micro-gestures into **one** moment (nails + head tilt + smile is fine).  
Do not build a choreography. No bouncing, walking away, talking skit, or gag.

If unsure: hold → one small hair or appearance adjustment → satisfied smile → hold.

---

## 10. Sound

```text
overall_soundscape: Quiet {place} under a close phone mic. {one fabric or nail sound}, her slow breath.

non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.
```

Setting-specific ambience from the examples:

- car: quiet car cabin; soft leather; distant bird or traffic through the glass
- bedroom / bed / mirror: quiet bedroom room tone; pillow fabric, hair, cotton

Do not repeat dialogue. No crash sound effects.  
Use `overall_soundscape: N/A` only when total silence is requested.

Optional separate sound prompt with the same mix, shortened:

```text
Close {place} selfie mic. {room}, {one small body sound}, slow breath. Soft R&B pad, no vocals.
```

---

## 11. Dialogue and on-screen text

- Do not invent a line of dialogue.
- Only a line explicitly supplied by the user goes in `<d>[Language] …</d>`.
- For 6 seconds, use no more than roughly 12 words.
- Put original text on signs in `"..."`.

Default clips do not have `(S1)`.

---

## 12. Length

Aim for the length of the examples in §16: approximately **1,200–1,800 characters**.  
If there is a hard limit, keep the alignment line, the preservation list, and the beat; remove atmospheric wording.

---

## 13. Validation

- [ ] Exact I2VA alignment line, followed by a blank line
- [ ] Three fields in the official order
- [ ] Style immediately after `[Shot 1]`: candid vertical Instagram + no beauty filter
- [ ] Preservation list matches the photo
- [ ] Explicitly states who holds the camera
- [ ] One shot, no zoom or cut
- [ ] Hold → girly posing beat → same outfit/place
- [ ] Tone is “I look so good,” without a sexy plot or gag
- [ ] No invented dialogue
- [ ] Soundscape = close phone mic + small fabric sound + breath
- [ ] Music = low sparse R&B pad, no vocals
- [ ] Prompt matches the tone and sentence structure in §16
- [ ] Duration assumption is outside the prompt

---

## 14. Delivery format

```text
Girly IG selfie, I2VA, lightly seductive, not overtly sexy. 6 seconds.

[prompt in one code block]

[optional sound prompt]

Set H3 to 6 seconds.
```

Do not mention the SOP, gags, or guarantees in the prompt itself.

---

## 15. Master template

Replace every `{placeholder}` before delivery.

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Candid vertical Instagram selfie in {place}, {lighting}, ordinary phone color, no beauty filter. The shot begins from <Picture 1>, preserving {face/hair/features}, {outfit}, {hands/props}, {setting}, and {framing}. She holds the phone herself. Slight handheld selfie drift, no zoom or cut.
She holds the opening look for a beat, eyes on the lens. Then {one girly posing beat from §9}. She ends still in the same spot. Same {hair}, {garment}, and {place} through the ending.

overall_soundscape: Quiet {place} under a close phone mic. {one fabric/nail sound}, her slow breath.

non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.
```

When the phone is above her (lying down): `She holds the phone above herself.`  
Say someone else is filming only if the photo clearly shows that.

---

## 16. Style examples

These show the sentence structure and level of detail. Reuse the language for preserving details, the hold, close mic, and R&B pad. Do **not** copy only these four beats — choose from §9 to suit **this** photo.

### 16.1 Passenger-seat selfie

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Candid vertical Instagram passenger-seat selfie in a parked or slow car in daylight, ordinary phone color, no beauty filter. The shot begins from <Picture 1>, preserving her face close to the lens, freckles, glossy lips, long blonde hair across the black leather seat, white-tipped nails, hand under her chin, sage-green top, and the sliver of trees in the window behind her. She holds the phone herself. Slight handheld selfie drift, no zoom or cut.
She holds the opening look for a beat, eyes on the lens, unhurried. Then she drags her nails slowly along her jaw, tilts her head on the seat, and lets her mouth open just enough to catch the light on her lips. She glances toward the window and back again, a small private smile, as if the camera is the only other person in the car. Same hair, top, and seat through the ending. No crash, no cutaway.

overall_soundscape: Quiet car cabin under a close phone mic. Soft leather, a faint outside bird or distant traffic through the glass, her slow breath, a tiny nail tap on her skin.

non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.
```

### 16.2 Lying-down indoor selfie

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Candid vertical Instagram selfie of a woman lying back indoors in hard daylight, ordinary phone color, no beauty filter. The shot begins from <Picture 1>, preserving her face close to the lens, glossy lips, long blonde hair on the white pillow, French-tip nails, silver ring, brown knit sleeve, the textured white ceiling, and the sharp sun-shadow on the wall. She holds the phone above herself. Slight handheld selfie drift, no zoom or cut.
She holds the opening look for a beat, eyes on the camera, fingers resting against her mouth. Then she slowly drags her nails down her lower lip and chin, tilts her head on the pillow, and lets a small lazy smile show. Sunlight stays striped across her arm. She ends still lying there, same hair, sleeve, and pillow, staring into the lens as if she has nowhere else to be.

overall_soundscape: Quiet bedroom room tone under a close phone mic. Soft fabric on the pillow, a faint nail sound on her lip, her slow breath.

non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.
```

### 16.3 Seated bedroom selfie

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Candid vertical Instagram selfie in a bright bedroom, ordinary phone color, no beauty filter. The shot begins from <Picture 1>, preserving her face, long straight black hair, glossy lips, small necklace, black tank top, the visible cleavage, white wardrobe doors, rumpled white bed, wooden ceiling beam, and the slightly high selfie angle. She holds the phone herself. Slight handheld drift, no zoom or cut.
She holds the opening half-smile into the lens for a beat. Then she leans a little closer, lets her hair slide over one shoulder, and looks up through her lashes as if catching the camera in the act. She bites her lower lip once, soft, and settles back into the same seated pose on the bed. Same hair, tank, and room through the ending.

overall_soundscape: Quiet bedroom room tone under a close phone mic. Soft hair and fabric shift when she leans, one slow breath.

non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.
```

### 16.4 Mirror selfie

```text
For the target video, at 0.00 seconds into the target video, <Picture 1> (from [Shot 1]) is fully referenced.

integrated_multimodal_description: [Shot 1] Candid vertical Instagram mirror selfie in a sunlit bedroom, ordinary phone color, no beauty filter. The shot begins from <Picture 1>, preserving her face close to the lens, long straight blonde hair, blue eyes, nose ring, grey ribbed tank, grey sweatpants sitting on her hips, midriff, the open closet behind her, and the full-length mirror that shows her back and the phone in her raised hand. She holds the phone herself. Slight handheld selfie drift, no zoom or cut.
She holds the opening look for a beat. Then she shifts her weight onto one hip so the mirror shows the tank and pants from behind a little more clearly, glances over her shoulder toward her own reflection, and looks back into the front camera with a small closed-mouth smile. Sunlight stays on her arm and hair. Same outfit, hair, and room through the ending.

overall_soundscape: Quiet bedroom room tone under a close phone mic. Soft cotton shift when she changes hip, one slow breath.

non_diegetic_music: Low sparse R&B pad, no vocals, quieter than her breath.
```

---

## 17. Relationship to the other guides

| File | Use |
| --- | --- |
| General MiniMax H3 guide | syntax, other modes, speakers, full-reference |
| This SOP | girly influencer selfies from a starting photo; more beats; R&B pad |
| Girl Content guide | even more restrained posing; hair/pout/peace sign; music `N/A` |

In case of conflict: follow the official H3 syntax first, then the user's explicit request, then this SOP.  
This SOP takes precedence over the Girl Content guide when the user wants an **influencer selfie**: girly, lightly seductive, with an “everyone is going to love this” attitude.

---

## 18. Compact reminder

**The photo is frame zero. Candid IG. Hold. Girly posing because she thinks she looks great. Same hair and outfit. Close mic. Soft R&B. Not overtly sexy. No gag.**
