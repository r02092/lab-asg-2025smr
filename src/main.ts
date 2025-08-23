import maplibregl from "maplibre-gl";
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
	},
	center: [133.719998, 33.620661],
	zoom: 17,
});
map.addControl(new maplibregl.NavigationControl());
