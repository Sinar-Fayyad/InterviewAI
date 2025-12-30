<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('phone')->nullable();
            $table->text('location')->nullable();
            $table->text('summary')->nullable();
            $table->text('education')->nullable();
            $table->text('experience')->nullable();
            $table->text('certifications')->nullable();
            $table->text('skills')->nullable();
            $table->text('languages')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('profiles');
    }
};
