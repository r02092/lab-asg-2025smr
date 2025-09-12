<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orchards', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->unsignedInteger('lng0');
            $table->unsignedInteger('lat0');
            $table->unsignedInteger('lng1');
            $table->unsignedInteger('lat1');
            $table->unsignedInteger('lng2');
            $table->unsignedInteger('lat2');
            $table->unsignedInteger('lng3');
            $table->unsignedInteger('lat3');
            $table->unsignedTinyInteger('latin_num');
            $table->unsignedTinyInteger('digit_num');
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('orchards');
    }
};
