# Submission Checklist

Use this before submitting, to make sure everything the assignment asks for
is actually in place.

## 1. GitHub repository
- [ ] Push this whole `chat-app/` folder as the repo root (so `backend/` and
      `frontend/` sit at the top level).
- [ ] Confirm `.env` is NOT committed (it's git-ignored); `.env.example` is.
- [ ] Repo is public, or the reviewer has been added as a collaborator.

## 2. Backend deployed (Render or Railway)
- [ ] Deployed with root directory `backend`.
- [ ] `CLIENT_ORIGIN` env var includes your GitHub Pages URL.
- [ ] Visit `https://<your-backend-url>/api/health` — should return
      `{"success":true,"status":"ok",...}`.
- [ ] Copy this URL — you'll share it as the "live API URL" and also need it
      for the frontend's `VITE_API_URL`.

## 3. Frontend deployed (GitHub Pages)
- [ ] `vite.config.js` `base` matches your repo name.
- [ ] Repo secret `VITE_API_URL` set to your backend URL from step 2.
- [ ] GitHub → Settings → Pages → Source = "GitHub Actions".
- [ ] Push to `main`, confirm the Action run succeeds, then open
      `https://<username>.github.io/<repo-name>/` and send a message.

## 4. Screen recording (in place of an APK)
- [ ] Record: login with a username → send a message → open a second tab
      with a different username → show the message arriving instantly →
      show the typing indicator → show online users updating → refresh the
      page and show history persists.
- [ ] Upload to Google Drive, set sharing to "Anyone with the link".

## 5. Final submission package
- [ ] GitHub repository link
- [ ] Live frontend link (GitHub Pages)
- [ ] Live backend/API link (Render/Railway `/api/health`)
- [ ] Google Drive link with the screen recording
- [ ] This README (already in the repo — link to it, no need to re-send)
