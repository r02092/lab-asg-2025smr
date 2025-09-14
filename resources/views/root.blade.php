<!doctype html>
<html lang="{{str_replace('_', '-', app()->getLocale())}}">
	<head>
		<meta charset="utf-8">
		<title>樹木情報可視化ツール</title>
		@vite(['resources/css/app.css', 'resources/ts/app.ts'])
	</head>
	<body>
		<div id="menu">
			<div><h1>樹木情報可視化ツール</h1></div>
			<ul>
				@for ($i = 0; $i < 3; $i++)
					<li>園地</li>
				@endfor
				<li id="new">
					新規作成
					<form method="POST" enctype="multipart/form-data">
						<ol>
							<li>
								<label>
									園地の名前を入力してください
									<input name="name" maxlength="85" placeholder="園地名" required>
								</label>
							</li>
							<li>
								園地の樹木の番号の範囲を入力してください<br>
								A1〜
								<div class="latin_digit">
									<div>
										<select name="latin">
											@foreach(range('A', 'Z') as $i)
												<option value="{{$i}}">{{$i}}</option>
											@endforeach
										</select>
										<input type="number" name="digit" min="1" max="255" value="1" required>
									</div>
								</div>
							</li>
							<li>
								右の地図上で園地の四隅を<br>
								クリックしてください
								<input type="hidden" name="coordinates">
							</li>
							<li>
								樹木のデータを<br>
								アップロードしてください
								<input type="file" name="trees_data" accept=".csv,text/csv" required>
							</li>
							<li>
								以下のボタンを押してください
								<button type="submit" disabled>作成</button>
							</li>
						</ol>
					</form>
				</li>
			</ul>
		</div>
		<div id="map"></div>
	</body>
</html>
