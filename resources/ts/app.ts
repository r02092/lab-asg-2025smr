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
				minzoom: 14,
				maxzoom: 18,
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
const coordinates: GeoJSON.Position[] = [];
map.on("click", e => {
	if (coordinates.length < 4) {
		const coordinate = [e.lngLat.lng, e.lngLat.lat];
		coordinates.push(coordinate);
		draw();
		if (coordinates.length > 3) {
			(<HTMLInputElement>document.getElementsByName("coordinates")[0]).value =
				JSON.stringify(coordinates);
			validate();
		}
	}
});
map.on("contextmenu", () => {
	coordinates.pop();
	draw();
	validate();
});
const inputElems = document.querySelectorAll(
	"#menu input:not([type='hidden'])",
);
for (const i of inputElems) i.addEventListener("change", validate);
for (const i of document.querySelectorAll(".latin_digit > div > *"))
	i.addEventListener("change", draw);
function draw() {
	for (let i = 0; i < 3; i++) {
		if (coordinates.length > i) {
			const shape: GeoJSON.GeoJSON = <
				GeoJSON.MultiPoint | GeoJSON.MultiLineString | GeoJSON.Polygon
			>{
				type: ["MultiPoint", "LineString", "Polygon"][i],
				coordinates: i < 2 ? coordinates : [coordinates],
			};
			const text: GeoJSON.FeatureCollection = {
				type: "FeatureCollection",
				features: [],
			};
			if (!i)
				text.features = coordinates.map((c, i) => ({
					type: "Feature",
					properties: {
						desc:
							[
								"A",
								(<HTMLSelectElement>document.getElementsByName("latin")[0])
									.value,
							][(i / 2) | 0] +
							[
								1,
								(<HTMLInputElement>document.getElementsByName("digit")[0])
									.value,
							][i % 2 ^ (i / 2)] +
							"付近",
					},
					geometry: {type: "Point", coordinates: c},
				}));
			if (map.getLayer("layer_shape_" + String(i))) {
				(<maplibregl.GeoJSONSource>(
					map.getSource("source_shape_" + String(i))
				)).setData(shape);
				map.setLayoutProperty(
					"layer_shape_" + String(i),
					"visibility",
					"visible",
				);
				if (!i) {
					(<maplibregl.GeoJSONSource>map.getSource("source_text")).setData(
						text,
					);
					map.setLayoutProperty("layer_text", "visibility", "visible");
				}
			} else {
				map.addSource("source_shape_" + String(i), {
					type: "geojson",
					data: shape,
				});
				map.addLayer(<
					| maplibregl.CircleLayerSpecification
					| maplibregl.LineLayerSpecification
					| maplibregl.FillLayerSpecification
				>{
					id: "layer_shape_" + String(i),
					type: <"circle" | "line" | "fill">["circle", "line", "fill"][i],
					source: "source_shape_" + String(i),
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
					][i],
				});
				if (i)
					map.moveLayer(
						"layer_shape_" + String(i),
						"layer_shape_" + String(i - 1),
					);
				else {
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
			map.setLayoutProperty("layer_shape_" + String(i), "visibility", "none");
			if (!i) map.setLayoutProperty("layer_text", "visibility", "none");
		}
	}
}
function validate() {
	(<HTMLButtonElement>document.querySelector("#menu button")).disabled =
		![...inputElems].every(e => (<HTMLInputElement>e).checkValidity()) ||
		coordinates.length < 4;
}
