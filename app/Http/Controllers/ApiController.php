<?php

namespace App\Http\Controllers;

use App\Models\Orchard;
use App\Models\Tree;
use Illuminate\Http\Request;

class ApiController extends Controller
{
    public function get($orchard_id)
    {
        return response()->json([
            'orchard' => Orchard::find($orchard_id),
            'trees' => Tree::where('orchard_id', $orchard_id)->get(),
        ]);
    }
}
