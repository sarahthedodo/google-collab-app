# Security Specification: Collaborative Sticky Notes

## 1. Data Invariants
- A note must have a non-empty `content`.
- A note must have a valid `color` (from a predefined list).
- Position `x` and `y` must be numbers within reasonable bounds.
- `authorId` must match the authenticated user's UID.
- `authorName` must match the user's display name.
- `createdAt` is immutable after creation.
- `updatedAt` must be updated to the server time on every write.

## 2. The "Dirty Dozen" Payloads (Denial Tests)
1. **Identity Theft**: Attempt to create a note with `authorId` of another user.
2. **Ghost Field**: Attempt to add `isAdmin: true` to a note document.
3. **Empty content**: Attempt to create a note with an empty string as content.
4. **Huge Payload**: Attempt to send a 1MB string in `content`.
5. **ID Poisoning**: Attempt to use `../../system` as a note ID.
6. **Immutable Override**: Attempt to change `createdAt` during an update.
7. **Role Escalation**: Attempt to change `authorId` during an update to take "ownership" of someone else's note.
8. **Position Poisoning**: Attempt to set `x: "infinity"` (string instead of number).
9. **Unverified Write**: Attempt to write as a user with an unverified email (if strict verification is enabled).
10. **State Skipping**: (N/A for this simple app, but applicable if notes had a "private" state).
11. **Malicious Color**: Attempt to set `color: "transparent; background: url(...);"` (XSS attempt via style).
12. **Orphaned Update**: Attempt to update a note that was just deleted by another user (handled by `existing()`).

## 3. Test Runner (Mock Tests)
- `NoteCreation_InvalidAuthor_Denied`
- `NoteUpdate_ModifyAuthor_Denied`
- `NoteUpdate_ModifyCreatedAt_Denied`
- `NoteCreation_MissingRequiredFields_Denied`
- `NoteUpdate_InvalidType_Denied`
