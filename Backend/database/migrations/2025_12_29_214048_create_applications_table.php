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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained();
            $table->string('company_name');
            $table->string('job_link');
            $table->string('job_title');
            $table->string('job_description');
            $table->text('notes');
            $table->date('applied_at');
            $table->string('location');
            $table->string('contact_name');
            $table->string('contact_email');
            $table->integer('salary_range');
            $table->string('status')->default('applied');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
