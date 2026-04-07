<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\PostController;
use App\Http\Controllers\SkillController;
use App\Http\Controllers\EmailController;
use App\Http\Controllers\CareerController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ResearchController;
use App\Http\Controllers\LinkedinController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\SocialiteController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\InterviewAIController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\QuestionsListController;


Route::group(["prefix" => "v0.1"], function(){
    Route::post("/login", [AuthController::class , "login"]);
    Route::post("/register", [AuthController::class , "register"]);

    Route::middleware('jwt.auth')->group(function() {

        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/auth/{provider}/redirect/{user_id}', [SocialiteController::class, "redirect"]);
        Route::get('/auth/{provider}/callback', [SocialiteController::class, "callback"]); 

        // Profile Routes
        Route::get('/profile/{user_id}', [ProfileController::class, 'getProfile']);
        Route::post('/save_profile/{user_id}', [ProfileController::class, 'saveProfile']);

        // User Routes
        Route::post('/update_user/{user_id}', [UserController::class, 'updateUser']);
        Route::post('/change_theme/{id}', [UserController::class, 'changeTheme']);

        // Education Routes
        Route::post('/add_education/{user_id}', [EducationController::class, 'addEducation']);
        Route::post('/update_education/{id}', [EducationController::class, 'updateEducation']);
        Route::post('/delete_education/{id}', [EducationController::class, 'deleteEducation']);

        // Experience Routes
        Route::post('/add_experience/{user_id}', [ExperienceController::class, 'addExperience']);
        Route::post('/update_experience/{id}', [ExperienceController::class, 'updateExperience']);
        Route::post('/delete_experience/{id}', [ExperienceController::class, 'deleteExperience']);

        // Ceritification Routes
        Route::post('/add_certification/{user_id}', [CertificationController::class, 'addCertification']);
        Route::post('/update_certification/{id}', [CertificationController::class, 'updateCertification']);
        Route::post('/delete_certification/{id}', [CertificationController::class, 'deleteCertification']);

        // Skills Routes
        Route::post('/add_skill/{user_id}', [SkillController::class, 'addSkill']);
        Route::post('/update_skill/{id}', [SkillController::class, 'updateSkill']);
        Route::post('/delete_skill/{id}', [SkillController::class, 'deleteSkill']);

        //Dashboard Routes
        Route::get('/analysis_feedback/{user_id}', [DashboardController::class, 'analysisFeedback']); // AI call

        // Research Routes
        Route::post('/research', [ResearchController::class, 'Research']); // AI call

        // InterviewAI Routes
        Route::post('/start_interview/{user_id}', [InterviewAIController::class, 'startInterview']); // AI call 
        Route::post('/submit_answer/{id}', [InterviewAIController::class, 'submitAnswer']); // AI call 
        Route::post('/generate_feedback/{id}', [InterviewAIController::class, 'generateFeedback']); // AI call
        Route::post('/end_interview', [InterviewAIController::class, 'endInterview']);  

        // Interview Routes
        Route::get('/get_interviews/{user_id}', [InterviewController::class, 'getInterviews']);
        Route::get('/get_interview/{id}', [InterviewController::class, 'getInterview']);
        Route::post('/delete_interview/{id}', [InterviewController::class, 'deleteInterview']);

        // Questions List Routes
        Route::post('/add_questions_list/{user_id}', [QuestionsListController::class, 'addQuestionsList']); // AI call 
        Route::get('/get_questions_lists/{user_id}', [QuestionsListController::class, 'getQuestionsLists']);
        Route::get('/get_questions_list/{id}', [QuestionsListController::class, 'getQuestionsList']);
        Route::post('/delete_questions_list/{id}', [QuestionsListController::class, 'deleteQuestionsList']);

        // Applications Routes
        Route::post('/add_application', [ApplicationController::class, 'addApplication']);
        Route::post('/update_application/{id}', [ApplicationController::class, 'updateApplication']);
        Route::get('/get_applications/{user_id}', [ApplicationController::class, 'getApplications']);
        Route::get('/get_application/{id}', [ApplicationController::class, 'getApplication']);
        Route::post('/delete_application/{id}', [ApplicationController::class, 'deleteApplication']);

        // Posts Routes
        Route::post('/add_post', [PostController::class, 'addPost']);
        Route::post('/update_post/{id}', [PostController::class, 'updatePost']);
        Route::get('/get_posts/{user_id}', [PostController::class, 'getPosts']);
        Route::get('/get_post/{id}', [PostController::class, 'getPost']);
        Route::post('/delete_post/{id}', [PostController::class, 'deletePost']);

        // Chatbot Routes
        Route::get('/initChatMemory', [ChatbotController::class, 'initializeMemory']); // AI call
        Route::post('/sendChat', [ChatbotController::class, 'sendMessage']); // AI call

        // Email Routes
        Route::post('generate_email/{user_id?}', [EmailController::class, 'generateEmail']); // AI call
        Route::post('reply_to_email', [EmailController:: class, 'replyToEmail']); // AI call
        Route::post('send_email/{user_id}', [EmailController::class, 'sendEmail']); 
        Route::get('get_job_emails/{user_id}', [EmailController::class, 'getJobEmails']); 
        Route::post('disconnect_google/{user_id}', [EmailController::class, 'disconnectGoogle']);

        // Linkedin Routes
        Route::get('get_linkedin_messages/{user_id}', [LinkedinController::class, 'getMessages']);
        Route::post('create_linkedin_post', [LinkedinController::class, 'createPost']); // AI call
        Route::get('linkedin_profile', [LinkedinController::class, 'createProfile']); // AI call
        Route::post('post_to_linkedin/{user_id}', [LinkedinController::class, 'postToLinkedin']);
        Route::post('schedule_post/{user_id}', [LinkedinController::class, 'schedulePost']); // AI call
        Route::get('check_linkedin_expiry/{user_id}', [LinkedinController::class, 'checkExpiry']);
        Route::post('disconnect_linkedin/{user_id}', [LinkedinController::class, 'disconnectLinkedin']);

        // Career Routes
        Route::get('resume_generation', [CareerController::class, 'resumeGeneration']); // AI call
        Route::post('resume_optimization', [CareerController::class, 'resumeOptimization']); // AI call
        Route::post('cover_letter_generation', [CareerController::class, 'coverLetterGeneration']); // AI call
        Route::post('cover_letter_optimization', [CareerController::class, 'coverLetterOptimization']); // AI call
    });
});