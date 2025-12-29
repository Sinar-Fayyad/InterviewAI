<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::group(["prefix" => "v0.1"], function(){
    Route::post("/login", [AuthController::class , "login"]);
    Route::post("/register", [AuthController::class , "register"]);

    Route::middleware('jwt.auth')->group(function() {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::post("/updateUser/{id}", [UserController::class, "updateUser"]);
        Route::get("/user/{id}", [UserController::class , "getUser"]);

    });
});

