# CampusSwap — Peer Skill-Swap & Micro-Tutoring Marketplace

A zero-cost campus peer learning platform where college students exchange 30-minute 1-on-1 micro-tutoring sessions using a **Time-Credit barter system** instead of money.

---

## Core Features

- **Time-Credit Barter & Escrow System:** New accounts start with 2 welcome credits. Booking a session locks 1 Time-Credit in PostgreSQL escrow (`book_slot_with_escrow`) and automatically transfers it to the mentor once the session finishes (`complete_session_release_credit`).
- **Mutual Skill Match Engine:** Automatically detects and highlights classmates who teach what you want to learn and want to learn what you teach.
- **Conflict-Free Slot Locking:** Atomic PL/pgSQL RPC functions with row-level locking prevent two students from double-booking the same availability window.
- **Embedded Live Classroom:** Built-in Jitsi Meet video rooms (`meet.jit.si`) with zero external downloads required.
- **AI-Powered Study Recaps:** Collaborative session scratchpad integrated with the **Google Gemini API** to turn rough session notes into structured key concepts and practice action items.
- **Verified Mentor Reputation:** Learners rate mentors after completed sessions (`submit_session_review`), dynamically updating average star ratings and unlocking a Verified Mentor badge after 3+ sessions taught.

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, React Router, Lucide Icons
- **Backend & Database:** Supabase (PostgreSQL, Authentication, Row-Level Security, Atomic PL/pgSQL RPCs)
- **Live Video & AI:** Jitsi Meet External API, Google Gemini Flash API

---

## Project Architecture

```text
campus-skillswap/
├── index.html                 # Entry HTML with Jitsi Meet External API script
├── src/
│   ├── components/
│   │   ├── BookingModal.jsx   # Slot picker & escrow confirmation modal
│   │   └── Navbar.jsx         # Navigation header & live Time-Credit wallet badge
│   ├── lib/
│   │   ├── gemini.js          # Google Gemini API integration for study recaps
│   │   └── supabase.js        # Supabase client initialization
│   ├── pages/
│   │   ├── AuthPage.jsx       # Campus sign-up & login (grants 2 welcome credits)
│   │   ├── BookingsPage.jsx   # Upcoming/completed sessions & 5-star review modal
│   │   ├── Marketplace.jsx    # Mentor discovery feed, search & Mutual Match filter
│   │   ├── MyProfile.jsx      # Teach/Learn skill manager, slot publisher & credit ledger
│   │   └── SessionRoom.jsx    # Live Jitsi video room, scratchpad & AI recap generator
│   └── App.jsx                # Protected routing & auth session listener
└── vite.config.js             # Vite + Tailwind CSS configuration