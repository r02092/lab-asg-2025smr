<?php

namespace App\Http\Controllers;

use App\Models\Orchard;
use App\Models\Tree;
use DB;
use Illuminate\Http\Request;

class RootController extends Controller
{
    public function new(Request $request)
    {
        $request->validate([
            'name' => 'string|between:1,255',
            'latin' => 'regex:/^[A-Z]$/',
            'digit' => 'integer|between:1,256',
            'coordinates' => [
                'regex:/^\[(\[-?(1[0-7]|[1-9])?\d(\.\d+)?,-?[1-8]?\d(\.\d+)?\],){3}\[-?(1[0-7]|[1-9])?\d(\.\d+)?,-?[1-8]?\d(\.\d+)?\]\]$/',
            ],
            'trees_data' => 'file|extensions:csv|mimetypes:text/csv',
        ]);
        $orchard_id = DB::table('information_schema.TABLES')
            ->select('AUTO_INCREMENT')
            ->where(
                'TABLE_SCHEMA',
                config(
                    'database.connections.' .
                        config('database.default') .
                        '.database',
                ),
            )
            ->where('TABLE_NAME', 'orchards')
            ->first()->AUTO_INCREMENT;
        $orchard = new Orchard();
        $orchard->name = $request->input('name');
        $orchard->latin_num = $request->input('latin');
        $orchard->digit_num = $request->input('digit');
        $coordinates = json_decode($request->input('coordinates'));
        $orchard->lng0 = $coordinates[0][0];
        $orchard->lat0 = $coordinates[0][1];
        $orchard->lng1 = $coordinates[1][0];
        $orchard->lat1 = $coordinates[1][1];
        $orchard->lng2 = $coordinates[2][0];
        $orchard->lat2 = $coordinates[2][1];
        $orchard->lng3 = $coordinates[3][0];
        $orchard->lat3 = $coordinates[3][1];
        $orchard->save();
        foreach (
            explode(
                "\n",
                str_replace(
                    ["\r\n", "\r"],
                    "\n",
                    file_get_contents(
                        $request->file('trees_data')->getRealPath(),
                    ),
                ),
            )
            as $i
        ) {
            $tree = new Tree();
            $tree->orchard_id = $orchard_id;
            $values = explode(',', $i);
            $tree->latin = $values[0];
            $tree->digit = $values[1];
            $tree->leaf_num = $values[2];
            $tree->leaf_area = $values[3];
            $tree->save();
        }
        return view('root');
    }
}
