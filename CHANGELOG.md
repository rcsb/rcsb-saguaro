# RCSB Saguaro Changelog

[Semantic Versioning](https://semver.org/)

## [3.0.8] - 2024-03-06
### Dependency update
- Multiple dependencies have been updated

## [3.0.7] - 2023-12-07
### Bug fix
- Axis update length bug fixed

## [3.0.6] - 2023-12-07
### Bug fix
- Axis track zoom/move bug fixed

## [3.0.5] - 2023-11-30
### Bug fix
- Track mouseleave tooltip bug fixed

## [3.0.4] - 2023-11-29
### Bug fix
- Track mouseleave tooltip bug fixed

## [3.0.3] - 2023-11-21
### Improvement
- `RcsbFvTooltipInterface.showTooltipDescription` optional field
- Custom tooltip example added

## [3.0.2] - 2023-11-21
### Bug fix
- `BoardDataState.rowConfigData` change bug fixed

## [3.0.1] - 2023-11-21
### Improvements
- Boxicons are imported as svg and transformed to react components

## [3.0.0] - 2023-11-02
### Breaking changes
- Types are not anymore exposed from `build/src`
- All module classes and types are accessible from `lib/`
  - Modules format is `ESNext`
  - `lib/commonjs` exposes all modules in `CommonJS` format
- The interface `RcsbFvTrackDataElementInterface` has been simplified, and it only includes visualization fields
- `RcsbFvTrackDataElementInterface.value` does not accept string anymore. String values should be encoded into
`RcsbFvTrackDataElementInterface.label`
  - **Important!** Sequence tracks (`RcsbFvDisplayTypes.SEQUENCE`) should encode the sequence string in `RcsbFvTrackDataElementInterface.label`
- All interface attributes `xxxCalBack` renamed to `xxxCallback`
 

### Improvements
- Exposed new interface `RcsbFvTooltipInterface` included in `RcsbFvBoardConfigInterface` and `RcsbFvRowExtendedConfigInterface`
to generate tooltips
- Event callback setters for `RcsbTrackInterface` and `RcsbDisplayInterface` migrated to rxjs subjects
- `RcsbAreaDisplay` hover and leave callbacks are defined as `RcsbTrackInterface.trackSubject` subscriptions
- `RcsbBoard` mouse events callback are defined as subscriptions of `boardSubject`
- Composite tracks subscribe all event action of their inner tracks
- `RcsbFastSequenceDisplay` line visualization react to mousemove and click events

### Code refactoring
- Removed `RcsbFvRowConfigInterface.innerTrackId` and replaced by `RcsbFvRowConfigInterface.trackId`
- Sass @import changed to @use
- Styles sheets `scss` refactoring
- react-icons replaced by boxicons

### Dependency update
- Multiple dependencies have been updated
- audit fix

## [2.5.13] - 2023-07-10
### Code refactoring
- Deprecated `JSX.Element` changed to `ReactNode`
- Improved definition of `RcsbFvUI` buttons
### Dependency update
- audit fix

## [2.5.12] - 2023-07-10
### Bug fix
- `IntersectionObserver` callback threshold bug fixed 

## [2.5.11] - 2023-05-05
### Bug fix
- `trackVisibility: false` board-ready state bug fixed

## [2.5.10] - 2023-04-27
### Bug fix
- `trackVisibility` configuration had no effect on tracks 

## [2.5.9] - 2023-03-15
### Minor config
- Tooltip z-index reduced to 2000
### Dependency update
- audit fix

## [2.5.8] - 2023-01-20
### Minor bug fix
- Removed log output

## [2.5.7] - 2023-01-20
### Bug fix
- Safari sequence misalignment bug fixed

## [2.5.6] - 2023-01-09
### Dependency update
- Auditing vulnerabilities

## [2.5.5] - 2022-11-28
### Bug fix
- Wrong attribute name `innerTrackId` from `TrackVisibilityInterface` renamed to `trackId`

## [2.5.4] - 2022-11-23
### Bug fix
- Row status is cleared when board data is updated

## [2.5.3] - 2022-11-21
### Bug fix
- Selection/Track Rendering bug fixed

## [2.5.2] - 2022-11-21
### Improvement
- `RcsbFvRowConfigInterface` exposes a generic metadata attribute

### Bug fix
- Duplicated `trackId` in different panels bug fixed

## [2.5.1] - 2022-11-18
### Bug fix
- Change track visibility bug fixed

## [2.5.0] - 2022-11-18
### Code refactor
- All board config/data update events use `EventType.UPDATE_BOARD_CONFIG` type
- Class `RcsbFvStateManager` handles zoom/move and selection events

## [2.4.0] - 2022-11-16
### Improvement
- New class `BoardDataState` to handle the state of the board tracks data. It encodes the logic of changing or updating
the board tracks data

### Code refactor
- `RcsbFvContextManagerType` (replaces `RcsbFvContextManagerInterface`) is a refactored type that defines RcsbFvContextManager 
events unambiguously 

## [2.3.1] - 2022-11-15
### Improvement
- API method `moveTrack` converted to async

## [2.3.0] - 2022-11-15
### Improvement
- Exposed a new API method `moveTrack` to move tracks

## [2.2.17] - 2022-11-08
### Dependency update
- Auditing vulnerabilities

## [2.2.16] - 2022-10-17
### Improvement
- Multiple compatible monospace fonts for the fast sequence display

## [2.2.15] - 2022-09-13
### Improvement
- Exposing external row mark props

## [2.2.14] - 2022-09-13
### Improvement
- Improved external row title integration

## [2.2.13] - 2022-09-13
### Bug fix
- Row title bug fix
 
## [2.2.12] - 2022-09-13
### Improvement
- External row title is rendered in `RcsbFvRowTitle`

## [2.2.11] - 2022-09-12
### Improvement
- Exposed external row title additional properties

## [2.2.10] - 2022-09-12
### Improvement
- Exposed row title external component `RowTitleComponentType`
 
## [2.2.9] - 2022-09-06
### Minor bug fix
- Removed console output

## [2.2.8] - 2022-09-06
### Bug fix
- Fast sequence display includes description tooltip
- Multi-area display includes all points that intersect with the current domain

## [2.2.7] - 2022-09-01
### Improvement
- Path/Line display optimization

## [2.2.6] - 2022-08-26
### Minor improvement
- External row mark component property `isGlowing` not exposed

## [2.2.5] - 2022-08-26
### Minor improvement
- External row mark component new property `isGlowing` is true when row glow is visible (false otherwise)

## [2.2.4] - 2022-08-26
### Bug fix
- One more external row mark component bug fix

## [2.2.3] - 2022-08-26
### Bug fix
- External row mark component bug fix

## [2.2.2] - 2022-08-24
### Improvements
- Exposed configuration for the row mark icon (track pointing triangle). External callbacks events (hover and click) or full component definition

## [2.2.1] - 2022-08-23
### Bug fix
- Hover tooltip for area and sequences display bug fixed

## [2.2.0] - 2022-08-22
### Improvements
- Improved how elements are rendered/updated in `RcsbLineDisplay` and `RcsbAreaDisplay`
- Removed all D3 `transition` calls
- Migration from `popper.js` to `floating-ui.js`. It improves rendering of popups 
- Changed `window` scroll events for `IntersectionObserver`. It improves display performance while scrolling pages
- New display `RcsbFastSequenceDisplay` renders sequences using a single `text` element

## [2.1.7] - 2022-08-10
### Improvements
- `RcsbFv.reset` can be used to reset `Selection` and `xScale` objects. It clears the current selection and x-domain interval
This is useful to avoid preserving selected regions or the domain range when the viewer is update with new configuration

## [2.1.6] - 2022-08-03
### Bug fix
- Area mousemove callback bug fixed

## [2.1.5] - 2022-08-03
### Dependency update
- d3 v7.6.1

## [2.1.4] - 2022-08-01
### Dependency update
- Multiple dependencies have been updated

## [2.1.3] - 2022-07-27
### Bug fixes
- `RcsbFvBoard` resolves the ready-state promise when the component is updated and row configuration is empty
 
## [2.1.2] - 2022-06-14
### Bug fixes
- `onFvRenderStartsCallback` call was removed from `RcsbFvTable` component
- `RcsbFvBoard` resolves the ready-state promise when board row configuration is empty

## [2.1.1] - 2022-06-13
### Dependency update
- Multiple dependencies have been updated

## [2.1.0] - 2022-05-19
### Code refactoring
- `RcsbScaleFactory` provides objects (`RcsbScaleInterface`) to extend the d3 scale class
- `RcsbFvBoard` component responsibilities have been divided in different components 
  - `RcsbFvTable` component renders the board tracks
  - `BoardGlow` component renders the board glow effect
  - `BoardProgress` component render the loaded trak status
  - `RowGlow` component render single row glow effect
- `RcsbFvRowTrackInterface.renderSchedule` controls how the track is rendered `sync` or `async`

## [2.0.6] - 2022-04-04
### Bug fixes
- `mousemoveCallBack` minor bug fixed

## [2.0.5] - 2022-04-11
### Improvements
- `elementEnterCallBack` method is triggerd for area and line display when the mouse moves through the curve

## [2.0.4] - 2022-04-07
### Dependency update
- Auditing vulnerabilities

## [2.0.3] - 2022-04-07
### Bug fixes
- Glow div elements are defined before the main board to avoid inconsistent height overflow. This bug was affecting Firefox browser

## [2.0.2] - 2022-03-02
### Improvements
- Exposed a new method `getDomain` in class `RcsbFv` to get the current domain

## [2.0.1] - 2022-02-15
### Dependency update
- typedoc v0.22.11

## [2.0.0] - 2022-02-15
### New methods and minor code refactor
- `RcsbFv` exposes a new getter method `getSelection` to retrieve the current selected region inf the feature viewer
- `selection` and `xScale` attributes have been moved from `RcsbFvBoard` class to the root `RcsbFv` and are passed to `RcsbFvBoard` as React properties
### Dependency update
- Multiple dependencies have been updated
### Breaking changes
- `RcsbFvBoardConfigInterface` interface attribute function `selectionChangeCallBack` accepts as input `Array<RcsbFvTrackDataElementInterface>`
instead of `Array<SelectionInterface>`

## [1.11.1] - 2021-10-13
### Performance improvement
- Fixed selection array growing bug when adding custom regions 
- Changed `setTimeout` calls to 'rxjs' `asyncScheduler`

## [1.11.0] - 2021-10-08
### New track display
- `RcsbFvDisplayTypes.MULTI_AREA ("multi-area")` displays multiple "additive" areas () with multiple colors using the `RcsbFvDisplayTypes.AREA` display under the hood.
This display config requires `displayColor` to be defined as a `RcsbFvColorGradient` object where `colors` is an array of hex and `thresholds` and empty array (length 0).
Track elements `RcsbFvTrackDataElementInterface.values` is a new property that stores multidimensional data (array of numbers). The display configuration requires that
`RcsbFvTrackDataElementInterface.values` are comprised between 0 and 1 and sorted in ascending order. Its number of elements must match with the number of defined colors   
- css important comments to force keeping empty rules

## [1.10.2] - 2021-09-27
### Improvements
- Expand title for non-fit prefixed rows 

## [1.10.1] - 2021-09-16
### Bug correction
- Render callback empty row config bug fixed

## [1.10.0] - 2021-09-16
### Configuration improvement
- Added configuration callback when rendering starts

## [1.9.2] - 2021-08-19
### Bug correction
- Fixed alpha channel when threshold value is 0 

## [1.9.1] - 2021-08-16
### Minor css modification
- Added `!important` to UI menu `box-sizing` 

## [1.9.0] - 2021-08-11
### New track display
- `RcsbFvDisplayTypes.BLOCK_AREA ("block-area")` displays track data as block shapes and alpha-gradient colors using the `RcsbFvDisplayTypes.AREA` display under the hood. 
Display alpha-gradient color must define track `displayColor` as a `RcsbFvColorGradient` object where `colors` is a single hex and `thresholds` 
an array of sorted (- to +) numbers in (0,1) that define the alpha level bins. Track elements `RcsbFvTrackDataElementInterface.value` are used to select the alpha 
level of the track position  
 
## [1.8.4] - 2021-07-16
### Minor bug correction
- Clearing RcsbFvTrack if RcsbFvRowTrack is unmounted

## [1.8.3] - 2021-06-30
### Minor data display
- Mouse hover track element tooltip value tag changed from "val" to "value"

## [1.8.2] - 2021-06-21
### Minor data display
- Min prefixWidth when fitTitleWidth is used

## [1.8.1] - 2021-06-14
### Code Refactoring
- Minor code refactoring  

## [1.8.0] - 2021-05-31
### Improvements
- Attribute <b>disableMenu</b> hides the UI menu

## [1.7.4] - 2021-05-31
### Bug correction
- Attribute <b>includeTooltip</b> bug fixed

## [1.7.3] - 2021-05-11
### Minor
- Removed debugging print

## [1.7.2] - 2021-05-11
### Bug correction
- Large track zoom bug fixed
- Multiple panels bored glowing effect bug fixed  

## [1.7.1] - 2021-05-07
### Bug correction
- Line/Area popup bug fixed

## [1.7.0] - 2021-05-06
### General
- Improved Area visualization

## [1.6.0] - 2021-04-27
### General
- Callback event methods defined on the element tracks include the event object as a second argument
- Board <b>init</b> and all data update methods return a promise where <b>resolve</b> is called after rendering all tracks
- RcsbFv defines promise-like methods <b>then</b> and <b>catch</b>. Method <b>resolve</b> is called after rendering all tracks

## [1.5.1] - 2021-04-21
### Row glow effect
-  Relative row position glow bug fixed
    
## [1.5.0] - 2021-04-21
### General
- Mouse hover row glow 
    - RcsbFvBoardConfigInterface.hideRowGlow (default false)

## [1.4.1] - 2021-04-19
### General
- Bug fix: Unhidden tracks due row title hover mark 

## [1.4.0] - 2021-04-19
### General
- Configurable board borders

## [1.3.0] - 2021-04-15
### General
- Removed board row borders
- Row hover title marker 
- Improved row dimension calculation and propagation
 
### Main RcsbFv class
- New method to add selected regions: <b>addSelection</b>

## [1.2.1] - 2021-03-30
### Line/Area Display
- Track callback method call if defined

## [1.2.0] - 2021-03-19
### Line/Area Display
- Click callback method added to svg path elements
### Core Display
- Added getter method getElementClickCallBack

## [1.1.0] - 2021-03-19
### General
- Initial release