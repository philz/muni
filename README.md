h1. SF Muni Visualization

I set out to learn [D3|http://d3js.org/] and to answer the eternal Muni question, "Is the J/N train backed up in the tunnel?"
I'm still wondering about the N/J, but here we go.

h2. The Muni Data

[Nextbus's API|http://www.nextbus.com/xmlFeedDocs/NextBusXMLFeed.pdf] lets you grab data that looks like


	<?xml version="1.0" encoding="utf-8" ?> 
	<body copyright="All data copyright San Francisco Muni 2012.">
	<vehicle id="7133" routeTag="49" dirTag="49_OB2" lat="37.79248" lon="-122.42291" secsSinceReport="2" predictable="true" heading="170" speedKmHr="21.6"/>
	<vehicle id="8206" routeTag="10" dirTag="10_OB2" lat="37.76758" lon="-122.4029" secsSinceReport="38" predictable="true" heading="176" speedKmHr="21.6"/>
	...
	<lastTime time="1353265209245"/>
	</body>

Grabbing this was fairly straight-forward.

h2. The Map Data

The muni data just by itself implies a map of San Francisco (that is, unless
you got the coordinates reversed and upside down...), but it's nicer to plot a
map first.  Using OpenStreetView or Google Maps is cheating, so I grabbed
grabbed the arterial streets of San Francisco shapefile from
[data.sfgov.org|https://data.sfgov.org/Geography/Arterial-Streets-of-San-Francisco-Zipped-Shapefile/2ivi-ywmk].
I then downloaded [QGIS|http://www.qgis.org/] and related dependencies.
After some frustration, the magic step was exporting the layer via QGIS with
the "WGS 84" coordinate system: otherwise, the GeoJSON output wasn't in
lat/long coordinates, and the remapping was tricky.  There was also some
bad JSON ("nan") that had to be cleaned up manually.  In theory the following
out to have worked:

	ogr2ogr -f "GeoJSON" stclines_arterial.json stclines_arterial.shp stclines_arterial
