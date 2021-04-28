# RCSB Saguaro App Changelog

[Semantic Versioning](https://semver.org/)

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