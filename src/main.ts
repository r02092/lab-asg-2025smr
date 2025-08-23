import maplibregl from "maplibre-gl";
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
