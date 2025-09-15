<?php

use App\Http\Controllers\RootController;

Route::get('/', function () {
    return view('root');
});
Route::post('/', [RootController::class, 'post']);
