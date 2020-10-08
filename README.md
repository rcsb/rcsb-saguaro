# rcsb-saguaro

RCSB Saguaro 1D Feature Viewer is an open-source TypeScript library used to display protein and genomic sequence annotations over the web.
The project is developed and maintained at [RCSB PDB](https://rcsb.org) and it is currently used to display protein features on its web site.
The package offers multiple types of data displays and a rich set of options to customize feature visualization.

<!---
<div id="pfvSelect" ></div>  
<div id="pfv" ></div>
<script type="text/javascript" src="https://cdn.jsdelivr.net/npm/@bioinsilico/rcsb-saguaro-app@0.7.0/build/dist/app.js"></script>
<script type="text/javascript">RcsbFvWebApp.buildInstanceSequenceFv("pfv", "pfvSelect","6M17");</script>
--->

### Node Module Instalation
`npm install @bioinsilico/rcsb-saguaro`

### CDN JavaScript
`<script src="https://cdn.jsdelivr.net/npm/@bioinsilico/rcsb-saguaro@0.7.0/dist/rcsb-saguaro.js" type="text/javascript"></script>`

### JavaScript Examples
* [Single Tracks](https://rcsb.github.io/rcsb-saguaro/examples/simple_tracks.html)
* [Composite Track](https://rcsb.github.io/rcsb-saguaro/examples/composite_track.html)
* [Dynamic Tracks](https://rcsb.github.io/rcsb-saguaro/examples/dynamic_track_loading.html)
* [Track Visibility](https://rcsb.github.io/rcsb-saguaro/examples/change_track_visibility.html)
* [Update Track Data](https://rcsb.github.io/rcsb-saguaro/examples/update_track_data.html)
* [Click Callback](https://rcsb.github.io/rcsb-saguaro/examples/click_callback.html)

The full collection of examples can be edit and modified at [CODEPEN](https://codepen.io/collection/njrBOR?grid_type=list)

### rcsb-saguaro-app
We also provide a library ([rcsb-saguaro-app](https://rcsb.github.io/rcsb-saguaro-app)) to build preconfigured 1D Protein Feature Views of RCSB PDB and UniProtKB annotations. 

### Library Documentation
TypeScript classes documentation can be found [here](https://rcsb.github.io/rcsb-saguaro/globals.html).

### Main Class and Interfaces
These are the most important elements if you are only interested in using RCSB Saguaro to visualise protein annotations

- [RcsbFv](https://rcsb.github.io/rcsb-saguaro/classes/rcsbfv.html): 
Main feature viewer class that can be used to create, configure and render a feature viewer object. It includes different methods to 
change viewer configuration, add new tracks, replace or update track data or change track visibility
- [RcsbFvBoardConfigInterface](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvboardconfiginterface.html):
Feature viewer configuration interface that defines the different properties to configure the feature viewer main panel 
including track title and annotation cells width, activate tooltips flag and annotation click and hovering callbacks
- [RcsbFvRowConfigInterface](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvrowconfiginterface.html): 
This interface can be used to set up the configuration for feature viewer tracks. It includes multiple properties that define how track features 
are displayed (color, shape, overlap flag) and also different track attributes (background color, track height, track title, track visibility)
- [RcsbFvTrackDataElementInterface](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvtrackdataelementinterface.html)
Interface that defines properties of an specific annotation object. It includes the location where the annotation will be displayed 
(begin, end) and additional properties to change the final representation and click-event behaviour 

 Board and Track Configuration
---
#### Board Configuration
Main feature viewer board object configuration defines the coordinate range, track and title width and axis display. 
The full set of attributes is defined in [RcsbFvBoardConfigInterface](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvboardconfiginterface.html)
interface.
```javascript
const boardConfig = {
    range: {
        min: 20,
        max: 110
    },
    trackWidth: 940,
    rowTitleWidth: 260,
    includeAxis: true
};
```
#### Track Configuration
Row configuration object defines format and content of feature viewer rows. The full set of board row configuration attributes is defined in [RcsbFvRowConfigInterface](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvrowconfiginterface.html).
                                                                             
Main Row Configuration properties are:
- **trackHeight**: Defines the board row height
- **trackColor**: Color in which row data will be displayed 
- **rowTitle**: Board track title, text displayed next to the board row
- **displayedType**: Enumerated value used to define how the data is displayed
  - Values: sequence, block, pin, line, area, bond, vline
- **trackData**: List of data displayed in the board row. The full set o data attributes are defined in [RcsbFvTrackDataElementInterface](https://rcsb.github.io/rcsb-saguaro/interfaces/rcsbfvtrackdataelementinterface.html). Most important data elements attributes are 
  - **begin**: Start position of the feature
  - **end**: End position of the feature (optional value)
  - **value**: Numerical or string value of the feature in this range (optional value)
  - **gaps**: List of empty regions in the feature
    - Attributes: begin, end
 
#### Track Configuration Examples
- Sequence Track

```javascript
const sequence = "MTEYKLVVVGAGGVGKSALTIQLIQNHFVDEYDPTIEDSYRKQVVIDGETCLLDILDTAGQ"+
                 "EEYSAMRDQYMRTGEGFLCVFAINNTKSFEDIHQYREQIKRVKDSDDVPMVLVGNKCDLAA"+
                 "RTVESRQAQDLARSYGIPYIETSAKTRQGVEDAFYTLVREIRQHKLRKLNPPDESGPGCMS"
```
```javascript
const sequenceTrack = {
    trackHeight: 20,
    trackColor: "#F9F9F9",
    displayType: "sequence",
    rowTitle: "SEQUENCE",
    trackData: [{
        begin: 1,
        value: sequence
    }]
}
```

- Block Track

```javascript
const blockTrack= {
    trackId: "blockTrack",
    trackHeight: 20,
    trackColor: "#F9F9F9",
    displayType: "block",
    displayColor: "#FF0000",
    rowTitle: "BLOCK",
    trackData: [{
        begin: 30,
        end: 60,
        gaps:[{
            begin:40,
            end:50
        }]
    },{
        begin: 80,
        end: 90,
        openEnd: true
    }]
}
```

See these examples online [here](https://rcsb.github.io/rcsb-saguaro/examples/board_track_configuration.html)

License
---

The MIT License

    Copyright (c) 2019 - now, RCSB PDB and contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.