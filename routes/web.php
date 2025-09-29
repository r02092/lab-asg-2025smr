<?php

use App\Http\Controllers\RootController;
use App\Http\Controllers\ApiController;

Route::get('/', [RootController::class, 'get']);
Route::post('/', [RootController::class, 'post']);
Route::get('/orchard/{orchard_id}', [ApiController::class, 'get']);
Route::delete('/orchard/{orchard_id}', [ApiController::class, 'delete']);
