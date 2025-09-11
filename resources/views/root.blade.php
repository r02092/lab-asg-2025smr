<!doctype html>
<html lang="{{str_replace('_', '-', app()->getLocale())}}">
	<head>
		<meta charset="utf-8">
		<title>航空写真</title>
		@vite(['resources/css/app.css', 'resources/ts/app.ts'])
	</head>
	<body>
		<div id="map"></div>
	</body>
</html>
