<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\SocialiteController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\ApplicationsController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\QuestionsListController;

Route::group(["prefix" => "v0.1"], function(){
    Route::post("/login", [AuthController::class , "login"]);
    Route::post("/register", [AuthController::class , "register"]);

    Route::get('/auth/{provider}/redirect', [SocialiteController::class, "redirect"]);
    Route::get('/auth/{provider}/callback', [SocialiteController::class, "callback"]);

    Route::middleware('jwt.auth')->group(function() {
        Route::post('/logout', [AuthController::class, 'logout']);

        // User Routes
        Route::get('/user/{id}', [UserController::class, 'getUser']);
        Route::post('/user/update', [UserController::class, 'updateUser']);
        Route::post('/user/change_theme', [UserController::class, 'changeTheme']);

        // Education Routes
        Route::post('/addEducation', [EducationController::class, 'addEducation']);
        Route::post('/update_education', [EducationController::class, 'updateEducation']);
        Route::get('/get_educations/{user_id}', [EducationController::class, 'getEducations']);
        Route::get('/get_education/{id}', [EducationController::class, 'getEducation']);
        Route::post('/delete_education', [EducationController::class, 'deleteEducation']);

        // Experience Routes
        Route::post('/add_experience', [ExperienceController::class, 'addExperience']);
        Route::post('/update_experience', [ExperienceController::class, 'updateExperience']);
        Route::get('/get_experiences/{user_id}', [ExperienceController::class, 'getExperiences']);
        Route::get('/get_experience/{id}', [ExperienceController::class, 'getExperience']);
        Route::post('/delete_experience', [ExperienceController::class, 'deleteExperience']);

        // Ceritification Routes
        Route::post('/add_certification', [CertificationController::class, 'addCertification']);
        Route::post('/update_certification', [CertificationController::class, 'updateCertification']);
        Route::get('/get_certifications/{user_id}', [CertificationController::class, 'getCertifications']);
        Route::get('/get_certification/{id}', [CertificationController::class, 'getCertification']);
        Route::post('/delete_certification', [CertificationController::class, 'deleteCertification']);

        // Skills Routes
        Route::post('/add_skill', [SkillController::class, 'addSkill']);
        Route::post('/update_skill', [SkillController::class, 'updateSkill']);
        Route::get('/get_skills/{user_id}', [SkillController::class, 'getSkills']);
        Route::get('/get_skill/{id}', [SkillController::class, 'getSkill']);
        Route::post('/delete_skill', [SkillController::class, 'deleteSkill']);

        // Interview Routes
        Route::post('/addinterview', [InterviewController::class, 'addInterview']);
        Route::get('/getinterviews/{user_id}', [InterviewController::class, 'getInterviews']);
        Route::get('/getinterview/{id}', [InterviewController::class, 'getInterview']);
        Route::post('/delete_interview', [InterviewController::class, 'deleteInterview']);

        // Questions List Routes
        Route::post('/add_questions_list', [QuestionsListController::class, 'addQuestionsList']);
        Route::get('/get_questions_lists/{user_id}', [QuestionsListController::class, 'getQuestionsLists']);
        Route::get('/get_questions_list/{id}', [QuestionsListController::class, 'getQuestionsList']);
        Route::post('/delete_questions_list', [QuestionsListController::class, 'deleteQuestionsList']);

        // Applications Routes
        Route::post('/add_application', [ApplicationsController::class, 'addApplication']);
        Route::post('/update_application', [ApplicationsController::class, 'updateApplication']);
        Route::get('/get_applications/{user_id}', [ApplicationsController::class, 'getApplications']);
        Route::get('/get_application/{id}', [ApplicationsController::class, 'getApplication']);
        Route::post('/delete_application', [ApplicationsController::class, 'deleteApplication']);

        // Posts Routes
        Route::post('/add_post', [PostController::class, 'addPost']);
        Route::post('/update_post', [PostController::class, 'updatePost']);
        Route::get('/get_posts/{user_id}', [PostController::class, 'getPosts']);
        Route::get('/get_post/{id}', [PostController::class, 'getPost']);
        Route::post('/delete_post', [PostController::class, 'deletePost']);
    });
});