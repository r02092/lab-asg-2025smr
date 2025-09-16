import {icon} from "@fortawesome/fontawesome-svg-core";
import {faMapLocationDot} from "@fortawesome/free-solid-svg-icons/faMapLocationDot";
import {faCirclePlus} from "@fortawesome/free-solid-svg-icons/faCirclePlus";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {useGsiTerrainSource} from "maplibre-gl-gsi-terrain";
for (let i = 0; i < 2; i++) {
	const iconElem = icon([faMapLocationDot, faCirclePlus][i]).node[0];
	iconElem.setAttribute("xmlns", "http://www.w3.org/2000/svg");
	iconElem.setAttribute("width", "1.1rem");
	iconElem.setAttribute("height", "1rem");
	document.head.appendChild(document.createElement("style")).innerText =
		"#menu>ul>li" +
		["", ":last-child"][i] +
		"{list-style:url('data:image/svg+xml;charset=utf-8," +
		iconElem.outerHTML +
		"') inside}";
}
const map = new maplibregl.Map({
	container: "map",
	style: {
		version: 8,
		glyphs: "https://maps.gsi.go.jp/xyz/noto-jp/{fontstack}/{range}.pbf",
		sources: {
			seamlessphoto: {
				type: "raster",
				tiles: [
					"https://cyberjapandata.gsi.go.jp/xyz/seamlessphoto/{z}/{x}/{y}.jpg",
				],
				tileSize: 256,
				attribution:
					"<a href='https://maps.gsi.go.jp/development/ichiran.html' target='_blank'>地理院タイル</a>",
				minzoom: 2,
				maxzoom: 18,
			},
			terrain: useGsiTerrainSource(maplibregl.addProtocol, {
				tileUrl: "https://tiles.gsj.jp/tiles/elev/land/{z}/{y}/{x}.png",
				maxzoom: 19,
				attribution:
					"<a href='https://gbank.gsj.jp/seamless/elev/' target='_blank'>産業技術総合研究所シームレス標高タイル</a>",
			}),
		},
		layers: [
			{
				id: "seamlessphoto",
				type: "raster",
				source: "seamlessphoto",
			},
		],
		terrain: {
			source: "terrain",
			exaggeration: 1.2,
		},
	},
	center: [133.719998, 33.620661],
	zoom: 17,
});
map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.ScaleControl());
const newCoordinates: GeoJSON.Position[] = [];
map.on("click", e => {
	if (newCoordinates.length < 4) {
		newCoordinates.push([e.lngLat.lng, e.lngLat.lat]);
		drawNewOrchard(newCoordinates);
		if (newCoordinates.length > 3) {
			(<HTMLInputElement>document.getElementsByName("coordinates")[0]).value =
				JSON.stringify(newCoordinates);
			validate();
		}
	}
});
map.on("contextmenu", () => {
	newCoordinates.pop();
	drawNewOrchard(newCoordinates);
	validate();
});
for (const i of document.querySelectorAll("#menu > ul > li[data-id]")) {
	i.addEventListener("click", async e => {
		const id = (<HTMLLIElement>e.currentTarget).dataset.id;
		location.hash = "#" + id;
		const orchard = await (await fetch("/orchard/" + id)).json();
		const s012 =
			(orchard.lng0 - orchard.lng1) * (orchard.lat2 - orchard.lat1) -
			(orchard.lng2 - orchard.lng1) * (orchard.lat0 - orchard.lat1);
		const s023 =
			(orchard.lng0 - orchard.lng2) * (orchard.lat3 - orchard.lat2) -
			(orchard.lng3 - orchard.lng2) * (orchard.lat0 - orchard.lat2);
		const mapElem = document.getElementById("map");
		if (!mapElem) throw new Error("#mapがありません");
		map.flyTo({
			center: [
				((orchard.lng0 + orchard.lng1 + orchard.lng2) * s012 +
					(orchard.lng0 + orchard.lng2 + orchard.lng3) * s023) /
					((s012 + s023) * 3),
				((orchard.lat0 + orchard.lat1 + orchard.lat2) * s012 +
					(orchard.lat0 + orchard.lat2 + orchard.lat3) * s023) /
					((s012 + s023) * 3),
			],
			zoom:
				16 -
				Math.log2(
					(Math.max(
						Math.max(orchard.lng0, orchard.lng1, orchard.lng2, orchard.lng3) -
							Math.min(orchard.lng0, orchard.lng1, orchard.lng2, orchard.lng3),
						Math.max(orchard.lat0, orchard.lat1, orchard.lat2, orchard.lat3) -
							Math.min(orchard.lat0, orchard.lat1, orchard.lat2, orchard.lat3),
					) *
						100000) /
						Math.min(mapElem.clientWidth, mapElem.clientHeight),
				),
			bearing: 0,
			pitch: 0,
		});
		drawOrchard(2, [
			[orchard.lng0, orchard.lat0],
			[orchard.lng1, orchard.lat1],
			[orchard.lng2, orchard.lat2],
			[orchard.lng3, orchard.lat3],
		]);
	});
}
const inputElems = document.querySelectorAll(
	"#menu input:not([type='hidden'])",
);
for (const i of inputElems) i.addEventListener("change", validate);
for (const i of document.querySelectorAll(".latin_digit > div > *"))
	i.addEventListener("change", () => drawNewOrchard(newCoordinates));
function drawOrchard(type: number, coordinates: GeoJSON.Position[]) {
	if (coordinates.length > type) {
		const shape: GeoJSON.GeoJSON = <
			GeoJSON.MultiPoint | GeoJSON.MultiLineString | GeoJSON.Polygon
		>{
			type: ["MultiPoint", "LineString", "Polygon"][type],
			coordinates: [
				coordinates,
				coordinates.length < 4
					? coordinates
					: coordinates.concat([coordinates[0]]),
				[coordinates],
			][type],
		};
		const text: GeoJSON.FeatureCollection = {
			type: "FeatureCollection",
			features: [],
		};
		if (!type)
			text.features = coordinates.map((c, i) => ({
				type: "Feature",
				properties: {
					desc:
						[
							"A",
							(<HTMLSelectElement>document.getElementsByName("latin")[0]).value,
						][(i / 2) | 0] +
						[
							1,
							(<HTMLInputElement>document.getElementsByName("digit")[0]).value,
						][i % 2 ^ (i / 2)] +
						"付近",
				},
				geometry: {type: "Point", coordinates: c},
			}));
		if (map.getLayer("layer_shape_" + String(type))) {
			(<maplibregl.GeoJSONSource>(
				map.getSource("source_shape_" + String(type))
			)).setData(shape);
			map.setLayoutProperty(
				"layer_shape_" + String(type),
				"visibility",
				"visible",
			);
			if (!type) {
				(<maplibregl.GeoJSONSource>map.getSource("source_text")).setData(text);
				map.setLayoutProperty("layer_text", "visibility", "visible");
			}
		} else {
			map.addSource("source_shape_" + String(type), {
				type: "geojson",
				data: shape,
			});
			map.addLayer(<
				| maplibregl.CircleLayerSpecification
				| maplibregl.LineLayerSpecification
				| maplibregl.FillLayerSpecification
			>{
				id: "layer_shape_" + String(type),
				type: <"circle" | "line" | "fill">["circle", "line", "fill"][type],
				source: "source_shape_" + String(type),
				layout: {},
				paint: [
					{
						"circle-color": "#000",
						"circle-radius": 10,
					},
					{
						"line-color": "#00507C",
						"line-width": 2,
					},
					{
						"fill-color": "#00A0F8",
						"fill-opacity": 0.4,
					},
				][type],
			});
			if (type) {
				if (map.getLayer("layer_shape_" + String(type - 1)))
					map.moveLayer(
						"layer_shape_" + String(type),
						"layer_shape_" + String(type - 1),
					);
			} else {
				map.addSource("source_text", {
					type: "geojson",
					data: text,
				});
				map.addLayer({
					id: "layer_text",
					type: "symbol",
					source: "source_text",
					layout: {
						"text-field": ["get", "desc"],
						"text-font": ["NotoSansCJKjp-Regular"],
					},
					paint: {
						"text-color": "#fff",
						"text-halo-color": "#000",
						"text-halo-width": 1,
					},
				});
			}
		}
	} else {
		map.setLayoutProperty("layer_shape_" + String(type), "visibility", "none");
		if (!type) map.setLayoutProperty("layer_text", "visibility", "none");
	}
}
function drawNewOrchard(coordinates: GeoJSON.Position[]) {
	for (let i = 0; i < 3; i++) drawOrchard(i, coordinates);
}
function validate() {
	(<HTMLButtonElement>document.querySelector("#menu button")).disabled =
		![...inputElems].every(e => (<HTMLInputElement>e).checkValidity()) ||
		newCoordinates.length < 4;
}
