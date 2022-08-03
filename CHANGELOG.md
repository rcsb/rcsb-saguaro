# RCSB Saguaro Changelog

[Semantic Versioning](https://semver.org/)

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
### Improvement
- `elementEnterCallBack` method is triggerd for area and line display when the mouse moves through the curve

## [2.0.4] - 2022-04-07
### Dependency update
- Auditing vulnerabilities

## [2.0.3] - 2022-04-07
### Bug fixes
- Glow div elements are defined before the main board to avoid inconsistent height overflow. This bug was affecting Firefox browser

## [2.0.2] - 2022-03-02
### Improvement
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
`RcsbFvTrackDataElementInterface.values` are comprised between 0 and 1 and sorted in ascending order. Its number of elements must match with the number of defined colors.   
- css important comments to force keeping empty rules

## [1.10.2] - 2021-09-27
### Improvement
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
### Improvement
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