<?php

use App\Http\Controllers\RootController;

Route::get('/', [RootController::class, 'get']);
Route::post('/', [RootController::class, 'post']);
