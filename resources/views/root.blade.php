<!doctype html>
<html lang="{{str_replace('_', '-', app()->getLocale())}}">
	<head>
		<meta charset="utf-8">
		<title>樹木情報確認ツール</title>
		@vite(['resources/css/app.css', 'resources/ts/app.ts'])
	</head>
	<body>
		<div id="menu">
			<div><h1>樹木情報確認ツール</h1></div>
			<ul>
				@for ($i = 0; $i < 3; $i++)
					<li>園地</li>
				@endfor
				<li>新規作成</li>
			</ul>
		</div>
		<div id="map"></div>
	</body>
</html>
