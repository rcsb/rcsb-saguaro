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
`<script src="https://cdn.jsdelivr.net/npm/@bioinsilico/rcsb-saguaro@0.6.2/dist/rcsb-saguaro.js" type="text/javascript"></script>`

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


