<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Tree extends Model
{
    protected $casts = [
        'id' => 'int',
        'orchard_id' => 'int',
        'latin' => 'int',
        'digit' => 'int',
        'leaf_num' => 'int',
        'leaf_area' => 'real',
    ];
    protected $guarded = ['id'];
    public $timestamps = false;
    public function orchard()
    {
        return $this->belongsTo('App\Models\Orchard');
    }
    public function getLatinAttribute($value)
    {
        return chr($value + ord('A'));
    }
    public function getDigitAttribute($value)
    {
        return $value + 1;
    }
    public function setLatinAttribute($value)
    {
        $this->attributes['latin'] = ord($value) - ord('A');
    }
    public function setDigitAttribute($value)
    {
        $this->attributes['digit'] = $value - 1;
    }
}
