<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\SkillsController;
use App\Http\Controllers\QuestionController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\SocialiteController;

Route::group(["prefix" => "v0.1"], function(){
    Route::post("/login", [AuthController::class , "login"]);
    Route::post("/register", [AuthController::class , "register"]);

    Route::get('/auth/{provider}/redirect', [SocialiteController::class, "redirect"]);
    Route::get('/auth/{provider}/callback', [SocialiteController::class, "callback"]);

    Route::middleware('jwt.auth')->group(function() {
        Route::post('/logout', [AuthController::class, 'logout']);

    });


});

