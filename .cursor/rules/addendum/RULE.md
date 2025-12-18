PROJECT RULES — ADDENDUM
Background System (Source-Based Architecture)

This addendum extends the existing Project Rules.
All previous rules remain valid and unchanged.

BACKGROUND DOMAIN DEFINITION

The Background system is a source-based subdomain, not a single feature.

Background logic MUST NOT be implemented in a single file.

Each background source MUST live in its own folder and be isolated from others.

REQUIRED BACKGROUND SOURCES

media-url (jpg, png, gif, mp4 via URL)

youtube (V1 behavior, placeholder preview)

pinterest (extract media from Pinterest URLs)

local-media (jpg, gif, mp4 stored locally)

SOURCE OWNERSHIP RULES

Each background source MUST own:

Its data model

Its validation logic

Its normalization logic

Its resolve logic (to render-ready background)

❌ No background source may rely on logic implemented by another source.
❌ No switch(background.type) or similar branching logic is allowed.

BACKGROUND RESOLVE PIPELINE (MANDATORY)

All background configurations MUST follow this pipeline:

Raw Background Config
        ↓
Normalize (source-specific)
        ↓
Validate (source-specific)
        ↓
Resolve → RenderBackgroundModel
        ↓
Render Engine


Resolution MUST happen before rendering.

The Render Engine MUST receive only resolved data.

RENDER ENGINE SEPARATION

The Render Engine MUST be source-agnostic.

The Render Engine MUST NOT know:

which background source is used

how media is fetched or extracted

whether media comes from URL, YouTube, Pinterest, or local storage

STORAGE RULES FOR BACKGROUNDS

Only local-media backgrounds may persist binary media data.

media-url, youtube, and pinterest backgrounds are ephemeral:

No resolved blobs may be stored

URLs are re-resolved when needed

Local media MUST be referenced by stable IDs and stored in IndexedDB.

UI / BACKGROUND SEPARATION

UI MUST NOT contain background resolution logic.

UI MAY:

select background source type

edit source-specific configuration fields

UI MUST NOT:

fetch media

parse YouTube or Pinterest URLs

extract or cache media assets

SCALABILITY & EXTENSIBILITY RULE

Adding a new background source MUST NOT require changes to:

the Render Engine

existing background source folders

Adding a new source is allowed only by:

creating a new source folder

registering it in the background registry

COMPATIBILITY RULE

All background behavior MUST remain compatible with V1 user-visible behavior.

YouTube placeholder behavior MUST remain unchanged.

Pinterest media extraction behavior MUST match V1.

FINAL ENFORCEMENT RULE

If any background-related implementation conflicts with this addendum:

STOP. DO NOT IMPLEMENT. ASK FOR CLARIFICATION.

alwaysApply: true
---
