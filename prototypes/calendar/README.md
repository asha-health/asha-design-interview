# Calendar prototype (starter)

The design system's calendar, full screen, with a week of invented events you can click.

```bash
python3 build.py            # writes index.html from src/ and the design system
python3 serve.py 18791 .    # http://127.0.0.1:18791/ ; picks save to answers.json (or just open index.html)
```

- `src/shell.html`: the page around the calendar (the top bar).
- `src/proto-data.js`: the events. Add whatever your design needs, and add questions to `PROTO_DATA.questions` when
  you turn this into an `asha-prototype` round.
- `src/proto-app.js`: draws the calendar and opens a panel when you click an event. `yourPanel()` only lists the
  event's raw data; it's yours to replace.

`build.py` loads the design system's `kit.js`, so everything in the library (`Calendar`, `Sheet`, `Grid`, `psec`,
`button`, `actionsMenu` and the rest) is available to your code, plus `../kit-extras.js`:
`DatePicker.open(anchor, { value, today, onPick })`, `parseClock("2pm")` and `clockLabel()`.
