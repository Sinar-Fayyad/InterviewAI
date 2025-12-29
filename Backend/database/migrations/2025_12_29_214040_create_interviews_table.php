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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->integer('user_id')->unique();
            $table->string('job_title');
            $table->string('job_description');
            $table->string('company_name');
            $table->url('recording_url');
            $table->integer('duration_minutes');
            $table->text('questions');
            $table->text('feedback');
            $table->text('emotion_analysis');
            $table->integer('score');
            $table->text('transcript');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
