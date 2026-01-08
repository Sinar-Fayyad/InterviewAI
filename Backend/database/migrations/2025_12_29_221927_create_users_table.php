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
        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('last_name');
            $table->string('email')->unique();
            $table->string('password')->nullable();
            $table->string('phone')->nullable();
            $table->text('location')->nullable();
            $table->text('summary')->nullable();
            $table->string('theme')->default("dark")->nullable();

            // Google email
            $table->string('google_email')->nullable()->unique();
            
            // Unique IDs from providers
            $table->string('google_id')->nullable()->unique();
            $table->string('linkedin_id')->nullable()->unique();
    
            // Tokens for API access
            $table->text('google_token')->nullable();
            $table->text('linkedin_token')->nullable();
            $table->text('google_refresh_token')->nullable();
            $table->timestamp('linkedin_expires_at')->nullable(); 
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};
