# rcsb-saguaro

RCSB Saguaro 1D Feature Viewer is an open-source TypeScript library used to display protein and genomic sequence annotations over the web.
The project is developed and maintained at <a href="https://rcsb.org">RCSB PDB</a> and it is currently used to display protein features on its web site.
The package offers multiple types of data displays and a rich set of options to customize feature visualization.

<!---->
<div id="pfvSelect" style="margin-top:50px" ></div>  
<div id="pfv" style="margin-top:50px" ></div>
<script src="http://pfv-dev.rcsb.org/saguaro/app.js"></script>
<script>
RcsbFvWebApp.RcsbFvBuilder.buildInstanceSequenceFv("pfv", "pfvSelect","6M17");  
</script>
<!---->

<h3>Node Module Instalation</h3>
<pre>
npm install @bioinsilico/rcsb-saguaro
</pre>
<h3>CDN JavaScript</h3>
<pre>
&lt;script src="https://cdn.jsdelivr.net/npm/@bioinsilico/rcsb-saguaro@0.2.4/dist/rcsb-saguaro.js" type="text/javascript">&lt;/script>
</pre>
<h3>JavaScript Examples</h3>
<a href="https://rcsb.github.io/rcsb-saguaro/examples/simple_tracks.html">Single Tracks</a>

<a href="https://rcsb.github.io/rcsb-saguaro/examples/composite_track.html">Composite Track</a>

<a href="https://codepen.io/collection/njrBOR?grid_type=list">CODEPEN collection</a>
<h3>Library Documentation</h3>
TypeScript classes documentation can be found <a href="https://rcsb.github.io/rcsb-saguaro">here</a>.



