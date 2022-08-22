# RCSB Saguaro known Bugs

### Border bottom bug
- Problem: when last track is hidden (track configuration selectDataInRangeFlag: true && hideEmptyTrackFlag: true) the bottom border will be not visible.
- Fix: two possible solutions
  - Create a 1D "fake" Row that renders border
  - Row state should include relative position (lastRow: boolean) and should be updated accordingly
