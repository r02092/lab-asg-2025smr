import {icon} from "@fortawesome/fontawesome-svg-core";
import {faMapLocationDot} from "@fortawesome/free-solid-svg-icons/faMapLocationDot";
import {faCirclePlus} from "@fortawesome/free-solid-svg-icons/faCirclePlus";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {useGsiTerrainSource} from "maplibre-gl-gsi-terrain";
type Tree = {
	id: number;
	orchard_id: number;
	latin: string;
	digit: number;
	leaf_num: number;
	leaf_area: number;
};
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
let data:
	| {
			orchard: {
				id: number;
				name: string;
				latin_num: string;
				digit_num: number;
				lng0: number;
				lat0: number;
				lng1: number;
				lat1: number;
				lng2: number;
				lat2: number;
				lng3: number;
				lat3: number;
				center: maplibregl.LngLatLike;
			};
			trees: Tree[];
	  }
	| undefined;
const isSelected = /^#\d+$/.test(location.hash);
if (isSelected) await loadOrchard(location.hash.slice(1));
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
	center: data ? data.orchard.center : [133.719998, 33.620661],
	zoom: 19,
});
map.addControl(new maplibregl.NavigationControl());
map.addControl(new maplibregl.ScaleControl());
let type = 0;
map.addControl(
	new (class implements maplibregl.IControl {
		onAdd() {
			const div = document.createElement("div");
			div.className =
				"maplibregl-ctrl maplibregl-ctrl-group maplibregl-ctrl-styles-expanded";
			div.style.display = "flex";
			for (const i of ["葉数", "平均葉面積", "合計葉面積"]) {
				const button = document.createElement("button");
				button.innerText = i;
				button.addEventListener("click", () => {
					for (const [key, j] of Object.entries(div.children)) {
						if (j === button) type = Number(key);
						(<HTMLElement>j).dataset.active = (j === button).toString();
					}
					paintTrees();
				});
				div.appendChild(button);
			}
			return div;
		}
		onRemove(): void {}
	})(),
	"top-left",
);
if (isSelected) map.on("load", viewOrchard);
const viewTrees: GeoJSON.FeatureCollection = {
	type: "FeatureCollection",
	features: [],
};
for (const i of document.querySelectorAll("#menu > ul > li")) {
	i.addEventListener("click", async () => {
		for (const j of document.querySelectorAll("#menu > ul > li"))
			j.className = j === i ? "selected" : "";
	});
}
for (const i of document.querySelectorAll("#menu > ul > li[data-id]"))
	i.addEventListener("click", viewOrchard);
document
	.querySelector("#menu > ul > li:last-child")
	?.addEventListener("click", () => changeMode(true));
const newInputElems = document.querySelectorAll(
	"#menu input:not([type='hidden'])",
);
for (const i of newInputElems) i.addEventListener("change", validate);
let newCoordinates: GeoJSON.Position[] = [];
for (const i of document.querySelectorAll(".latin_digit > div > *"))
	i.addEventListener("change", () => drawNewOrchard(newCoordinates));
function changeMode(isNew: boolean) {
	drawNewOrchard([]);
	if (isNew) {
		map.setLayoutProperty("layer_trees", "visibility", "none");
		map.on("click", newLeftClick);
		map.on("contextmenu", newRightClick);
	} else {
		newCoordinates = [];
		map.off("click", newLeftClick);
		map.off("contextmenu", newRightClick);
	}
}
function newLeftClick(e: maplibregl.MapMouseEvent) {
	if (newCoordinates.length < 4) {
		newCoordinates.push([e.lngLat.lng, e.lngLat.lat]);
		drawNewOrchard(newCoordinates);
		if (newCoordinates.length > 3) {
			(<HTMLInputElement>document.getElementsByName("coordinates")[0]).value =
				JSON.stringify(newCoordinates);
			validate();
		}
	}
}
function newRightClick() {
	newCoordinates.pop();
	drawNewOrchard(newCoordinates);
	validate();
}
async function loadOrchard(id: string) {
	data = await (await fetch("/orchard/" + id)).json();
	if (!data) throw new Error("APIによるデータの取得に失敗しました");
	const s012 =
		(data.orchard.lng0 - data.orchard.lng1) *
			(data.orchard.lat2 - data.orchard.lat1) -
		(data.orchard.lng2 - data.orchard.lng1) *
			(data.orchard.lat0 - data.orchard.lat1);
	const s023 =
		(data.orchard.lng0 - data.orchard.lng2) *
			(data.orchard.lat3 - data.orchard.lat2) -
		(data.orchard.lng3 - data.orchard.lng2) *
			(data.orchard.lat0 - data.orchard.lat2);
	data.orchard.center = [
		((data.orchard.lng0 + data.orchard.lng1 + data.orchard.lng2) * s012 +
			(data.orchard.lng0 + data.orchard.lng2 + data.orchard.lng3) * s023) /
			((s012 + s023) * 3),
		((data.orchard.lat0 + data.orchard.lat1 + data.orchard.lat2) * s012 +
			(data.orchard.lat0 + data.orchard.lat2 + data.orchard.lat3) * s023) /
			((s012 + s023) * 3),
	];
}
async function viewOrchard(e: Event | maplibregl.MapLibreEvent) {
	changeMode(false);
	const id =
		e.type !== "load"
			? (<HTMLLIElement>(<Event>e).currentTarget).dataset.id
			: location.hash.slice(1);
	if (e.type !== "load") location.hash = "#" + id;
	else {
		const selectedElem = document.querySelector(
			'#menu > ul > li[data-id="' + id + '"]',
		);
		if (selectedElem) selectedElem.className = "selected";
	}
	if (!id) throw new Error("idがありません");
	if (!data || data.orchard.id !== Number(id)) await loadOrchard(id);
	if (!data) throw new Error("データの読み込みに失敗しました");
	const mapElem = document.getElementById("map");
	if (!mapElem) throw new Error("#mapがありません");
	map.flyTo({
		center: data.orchard.center,
		zoom: 19,
		bearing: 0,
		pitch: 0,
	});
	drawOrchard(2, [
		[data.orchard.lng0, data.orchard.lat0],
		[data.orchard.lng1, data.orchard.lat1],
		[data.orchard.lng2, data.orchard.lat2],
		[data.orchard.lng3, data.orchard.lat3],
	]);
	viewTrees.features = [];
	for (
		let i = "A".charCodeAt(0);
		i <= data.orchard.latin_num.charCodeAt(0);
		i++
	) {
		const riDivider =
			(data.orchard.latin_num.charCodeAt(0) - "A".charCodeAt(0) + 1) * 2;
		const rjDivider = data.orchard.digit_num * 2;
		for (let j = 1; j <= data.orchard.digit_num; j++) {
			const ri = ((i - "A".charCodeAt(0)) * 2 + 1) / riDivider;
			const rj = (j * 2 - 1) / rjDivider;
			viewTrees.features.push({
				type: "Feature",
				properties: <GeoJSON.GeoJsonProperties>(
					data.trees.find(
						(t: Tree) => t.latin === String.fromCharCode(i) && t.digit === j,
					)
				),
				geometry: {
					type: "Point",
					coordinates: [
						data.orchard.lng0 +
							(data.orchard.lng1 - data.orchard.lng0) * (1 - ri) * rj +
							(data.orchard.lng2 - data.orchard.lng0) * ri * rj +
							(data.orchard.lng3 - data.orchard.lng0) * ri * (1 - rj),
						data.orchard.lat0 +
							(data.orchard.lat1 - data.orchard.lat0) * (1 - ri) * rj +
							(data.orchard.lat2 - data.orchard.lat0) * ri * rj +
							(data.orchard.lat3 - data.orchard.lat0) * ri * (1 - rj),
					],
				},
			});
		}
	}
	if (map.getLayer("layer_trees")) {
		(<maplibregl.GeoJSONSource>map.getSource("source_trees")).setData(
			viewTrees,
		);
	} else {
		map.addSource("source_trees", {
			type: "geojson",
			data: viewTrees,
		});
		map.addLayer(<maplibregl.CircleLayerSpecification>{
			id: "layer_trees",
			type: "circle",
			source: "source_trees",
			layout: {},
			paint: {
				"circle-radius": 15,
			},
		});
	}
	paintTrees();
}
function paintTrees() {
	map.setLayoutProperty("layer_trees", "visibility", "visible");
	map.setPaintProperty("layer_trees", "circle-color", [
		"interpolate",
		["linear"],
		...[
			[
				["get", "leaf_num"],
				0,
				"#00F",
				5000,
				"#0FF",
				10000,
				"#0F0",
				15000,
				"#FF0",
				20000,
				"#F00",
			],
			[
				["get", "leaf_area"],
				0,
				"#00F",
				7.5,
				"#0FF",
				15,
				"#0F0",
				22.5,
				"#FF0",
				30,
				"#F00",
			],
			[
				["*", ["get", "leaf_num"], ["get", "leaf_area"]],
				0,
				"#00F",
				100000,
				"#0FF",
				200000,
				"#0F0",
				300000,
				"#FF0",
				400000,
				"#F00",
			],
		][type],
	]);
}
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
		if (map.getLayer("layer_orchard_" + String(type))) {
			(<maplibregl.GeoJSONSource>(
				map.getSource("source_orchard_" + String(type))
			)).setData(shape);
			map.setLayoutProperty(
				"layer_orchard_" + String(type),
				"visibility",
				"visible",
			);
			if (!type) {
				(<maplibregl.GeoJSONSource>map.getSource("source_text")).setData(text);
				map.setLayoutProperty("layer_text", "visibility", "visible");
			}
		} else {
			map.addSource("source_orchard_" + String(type), {
				type: "geojson",
				data: shape,
			});
			map.addLayer(<
				| maplibregl.CircleLayerSpecification
				| maplibregl.LineLayerSpecification
				| maplibregl.FillLayerSpecification
			>{
				id: "layer_orchard_" + String(type),
				type: <"circle" | "line" | "fill">["circle", "line", "fill"][type],
				source: "source_orchard_" + String(type),
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
				if (map.getLayer("layer_orchard_" + String(type - 1)))
					map.moveLayer(
						"layer_orchard_" + String(type),
						"layer_orchard_" + String(type - 1),
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
		map.setLayoutProperty(
			"layer_orchard_" + String(type),
			"visibility",
			"none",
		);
		if (!type) map.setLayoutProperty("layer_text", "visibility", "none");
	}
}
function drawNewOrchard(coordinates: GeoJSON.Position[]) {
	for (let i = 0; i < 3; i++) drawOrchard(i, coordinates);
}
function validate() {
	(<HTMLButtonElement>document.querySelector("#menu button")).disabled =
		![...newInputElems].every(e => (<HTMLInputElement>e).checkValidity()) ||
		newCoordinates.length < 4;
}
