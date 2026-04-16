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
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('job_title');
            $table->string('company_name');
            $table->string('location');
            $table->string('salary_range');
            $table->string('job_url');
            $table->string('job_description');
            $table->string('contact_name');
            $table->string('contact_email');
            $table->date('applied_at');
            $table->text('notes');
            $table->enum('status', ['saved', 'applied', 'interviewing', 'offered', 'rejected'])->default('applied');
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
