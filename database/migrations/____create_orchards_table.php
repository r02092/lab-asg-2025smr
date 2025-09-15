<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orchards', function (Blueprint $table) {
            $table->unsignedInteger('orchard_id')->primary();
            $table->string('name');
            $table->unsignedTinyInteger('latin_num');
            $table->unsignedTinyInteger('digit_num');
            $table->unsignedInteger('lng0');
            $table->unsignedInteger('lat0');
            $table->unsignedInteger('lng1');
            $table->unsignedInteger('lat1');
            $table->unsignedInteger('lng2');
            $table->unsignedInteger('lat2');
            $table->unsignedInteger('lng3');
            $table->unsignedInteger('lat3');
        });

        Schema::create('trees', function (Blueprint $table) {
            $table->unsignedInteger('tree_id')->primary();
            $table->unsignedInteger('orchard_id');
            $table->unsignedTinyInteger('latin');
            $table->unsignedTinyInteger('digit');
            $table->unique(['orchard_id', 'latin', 'digit']);
            $table
                ->foreign('orchard_id')
                ->on('orchards')
                ->references('orchard_id')
                ->cascadeOnDelete();
            $table->unsignedInteger('leaf_num');
            $table->decimal('leaf_area', 17, 15);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('trees');
        Schema::dropIfExists('orchards');
    }
};
