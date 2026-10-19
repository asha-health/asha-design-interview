# Appointment flow prototype (starter)

The day schedule from the design system, with clickable appointments and invented check-in and check-out data.

```bash
python3 build.py            # writes index.html from src/ and the design system
python3 serve.py 18791 .    # http://127.0.0.1:18791/ ; picks save to answers.json (or just open index.html)
```

- `src/shell.html`: the page around the screen (top bar with the scenario menu and the panel switch).
- `src/proto-data.js`: the scenarios and `PROTO_DATA.visit(appt)`, everything known about one visit. Add questions to
  `PROTO_DATA.questions` when you turn this into an `asha-prototype` round.
- `src/proto-app.js`: draws the day, opens a panel on click. "Today's panel" is the library's current design (its
  Check in and Check out buttons open the library's current check-in and checkout blocks); "Your design" calls
  `yourFlyout()`, which is yours to replace.

`build.py` loads every design-system block, so anything in the library (`kit.js` helpers, `SCHED.*` from the schedule
block, `SHELL.*` from the shell block, any block via `BLOCKS.find((b) => b.id === "...")`) is available to your code,
plus `../kit-extras.js`: `DatePicker.open(anchor, { value, today, onPick })`, `parseClock("2pm")` and `clockLabel()`.
