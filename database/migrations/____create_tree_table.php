<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('tree', function (Blueprint $table) {
            $table->id();
            $table->foreignId('orchard_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('latin');
            $table->unsignedTinyInteger('digit');
            $table->unique(['orchard_id', 'latin', 'digit']);
            $table->unsignedInteger('leaf_num');
            $table->decimal('leaf_area', 17, 15);
        });
    }
    public function down(): void
    {
        Schema::dropIfExists('tree');
    }
};
