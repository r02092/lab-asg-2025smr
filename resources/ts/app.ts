import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import {useGsiTerrainSource} from "maplibre-gl-gsi-terrain";
const map = new maplibregl.Map({
	container: "map",
	style: {
		version: 8,
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
	const coordinate = [e.lngLat.lng, e.lngLat.lat];
	coordinates.push(coordinate);
	for (let i = 0; i < 3; i++) {
		if (coordinates.length > i) {
			const shape: GeoJSON.GeoJSON = <
				GeoJSON.MultiPoint | GeoJSON.MultiLineString | GeoJSON.Polygon
			>{
				type: ["MultiPoint", "LineString", "Polygon"][i],
				coordinates: i < 2 ? coordinates : [coordinates],
			};
			if (map.getLayer("layer_shape_" + String(i))) {
				(<maplibregl.GeoJSONSource>(
					map.getSource("source_shape_" + String(i))
				)).setData(shape);
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
			}
		}
	}
});
