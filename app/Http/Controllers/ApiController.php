<?php

namespace App\Http\Controllers;

use App\Models\Orchard;
use App\Models\Tree;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    public function get($orchard_id)
    {
        return response()->json(Orchard::find($orchard_id));
    }
}
