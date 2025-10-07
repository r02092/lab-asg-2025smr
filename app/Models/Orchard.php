<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Orchard extends Model
{
    protected $casts = [
        'id' => 'int',
        'name' => 'string',
        'latin_num' => 'int',
        'digit_num' => 'int',
        'lng0' => 'int',
        'lat0' => 'int',
        'lng1' => 'int',
        'lat1' => 'int',
        'lng2' => 'int',
        'lat2' => 'int',
        'lng3' => 'int',
        'lat3' => 'int',
    ];
    protected $guarded = ['id'];
    public $timestamps = false;
    public function tree()
    {
        return $this->hasMany('App\Models\Tree');
    }
    public function getLatinNumAttribute($value)
    {
        return chr($value + ord('A'));
    }
    public function getDigitNumAttribute($value)
    {
        return $value + 1;
    }
    public function getLng0Attribute($value)
    {
        return ($value * 360) / (2 ** 32 - 1) - 180;
    }
    public function getLat0Attribute($value)
    {
        return ($value * 180) / (2 ** 32 - 1) - 90;
    }
    public function getLng1Attribute($value)
    {
        return ($value * 360) / (2 ** 32 - 1) - 180;
    }
    public function getLat1Attribute($value)
    {
        return ($value * 180) / (2 ** 32 - 1) - 90;
    }
    public function getLng2Attribute($value)
    {
        return ($value * 360) / (2 ** 32 - 1) - 180;
    }
    public function getLat2Attribute($value)
    {
        return ($value * 180) / (2 ** 32 - 1) - 90;
    }
    public function getLng3Attribute($value)
    {
        return ($value * 360) / (2 ** 32 - 1) - 180;
    }
    public function getLat3Attribute($value)
    {
        return ($value * 180) / (2 ** 32 - 1) - 90;
    }
    public function setLatinNumAttribute($value)
    {
        $this->attributes['latin_num'] = ord($value) - ord('A');
    }
    public function setDigitNumAttribute($value)
    {
        $this->attributes['digit_num'] = $value - 1;
    }
    public function setLng0Attribute($value)
    {
        $this->attributes['lng0'] = (($value + 180) * (2 ** 32 - 1)) / 360;
    }
    public function setLat0Attribute($value)
    {
        $this->attributes['lat0'] = (($value + 90) * (2 ** 32 - 1)) / 180;
    }
    public function setLng1Attribute($value)
    {
        $this->attributes['lng1'] = (($value + 180) * (2 ** 32 - 1)) / 360;
    }
    public function setLat1Attribute($value)
    {
        $this->attributes['lat1'] = (($value + 90) * (2 ** 32 - 1)) / 180;
    }
    public function setLng2Attribute($value)
    {
        $this->attributes['lng2'] = (($value + 180) * (2 ** 32 - 1)) / 360;
    }
    public function setLat2Attribute($value)
    {
        $this->attributes['lat2'] = (($value + 90) * (2 ** 32 - 1)) / 180;
    }
    public function setLng3Attribute($value)
    {
        $this->attributes['lng3'] = (($value + 180) * (2 ** 32 - 1)) / 360;
    }
    public function setLat3Attribute($value)
    {
        $this->attributes['lat3'] = (($value + 90) * (2 ** 32 - 1)) / 180;
    }
}
