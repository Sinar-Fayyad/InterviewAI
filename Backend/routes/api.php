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
use App\Http\Controllers\ContentController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ResearchController;
use App\Http\Controllers\LinkedinController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\SocialiteController;
use App\Http\Controllers\EducationController;
use App\Http\Controllers\ExperienceController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\CertificationController;
use App\Http\Controllers\QuestionsListController;

Route::group(["prefix" => "v0.1"], function(){
    Route::post("/login", [AuthController::class , "login"]);
    Route::post("/register", [AuthController::class , "register"]);

    Route::middleware('jwt.auth')->group(function() {

        Route::get('/logout', [AuthController::class, 'logout']);
        Route::get('/auth/{provider}/redirect', [SocialiteController::class, "redirect"]);
        Route::get('/auth/{provider}/callback', [SocialiteController::class, "callback"]);

        // Profile Routes
        Route::get('/profile/{user_id}', [ProfileController::class, 'getProfile']);
        Route::post('/save_profile/{user_id}', [ProfileController::class, 'saveProfile']);

        // User Routes
        Route::post('/update_user/{id}', [UserController::class, 'updateUser']);
        Route::get('/change_theme/{id}', [UserController::class, 'changeTheme']);

        // Education Routes
        Route::post('/add_education', [EducationController::class, 'addEducation']);
        Route::post('/update_education/{id}', [EducationController::class, 'updateEducation']);
        Route::get('/get_educations/{user_id}', [EducationController::class, 'getEducations']);
        Route::post('/delete_education/{id}', [EducationController::class, 'deleteEducation']);

        // Experience Routes
        Route::post('/add_experience', [ExperienceController::class, 'addExperience']);
        Route::post('/update_experience/{id}', [ExperienceController::class, 'updateExperience']);
        Route::get('/get_experiences/{user_id}', [ExperienceController::class, 'getExperiences']);
        Route::post('/delete_experience/{id}', [ExperienceController::class, 'deleteExperience']);

        // Ceritification Routes
        Route::post('/add_certification', [CertificationController::class, 'addCertification']);
        Route::post('/update_certification/{id}', [CertificationController::class, 'updateCertification']);
        Route::get('/get_certifications/{user_id}', [CertificationController::class, 'getCertifications']);
        Route::post('/delete_certification/{id}', [CertificationController::class, 'deleteCertification']);

        // Skills Routes
        Route::post('/add_skill', [SkillController::class, 'addSkill']);
        Route::post('/update_skill/{id}', [SkillController::class, 'updateSkill']);
        Route::get('/get_skills/{user_id}', [SkillController::class, 'getSkills']);
        Route::post('/delete_skill/{id}', [SkillController::class, 'deleteSkill']);

        // Research Routes
        Route::post('/research', [ResearchController::class, 'Research']);

        // Interview Routes
        Route::post('/add_interview', [InterviewController::class, 'addInterview']);
        Route::get('/get_interviews/{user_id}', [InterviewController::class, 'getInterviews']);
        Route::get('/get_interview/{id}', [InterviewController::class, 'getInterview']);
        Route::post('/delete_interview/{id}', [InterviewController::class, 'deleteInterview']);

        // Questions List Routes
        Route::post('/add_questions_list', [QuestionsListController::class, 'addQuestionsList']);
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
        Route::get('/initChatMemory', [ChatbotController::class, 'initializeMemory']);
        Route::post('/sendChat', [ChatbotController::class, 'sendMessage']);

        // Email Routes
        Route::post('generate_email/{user_id?}', [EmailController::class, 'generateEmail']);
        Route::post('reply_to_email', [EmailController:: class, 'replyToEmail']);
        Route::post('send_email/{user_id}', [EmailController::class, 'sendEmail']);
        Route::get('get_job_emails/{user_id}', [EmailController::class, 'getJobEmails']);
        Route::post('disconnect_google/{user_id}', [EmailController::class, 'disconnectGoogle']);

        // Linkedin Routes
        Route::get('get_linkedin_messages/{user_id}', [LinkedinController::class, 'getMessages']);
        Route::post('create_linkedin_post', [LinkedinController::class, 'createPost']);
        Route::get('linkedin_profile', [LinkedinController::class, 'createProfile']);
        Route::post('post_to_linkedin/{user_id}', [LinkedinController::class, 'postToLinkedin']);
        Route::post('schedule_post/{user_id}', [LinkedinController::class, 'schedulePost']);
        Route::get('check_linkedin_expiry/{user_id}', [LinkedinController::class, 'checkExpiry']);
        Route::post('disconnect_linkedin/{user_id}', [LinkedinController::class, 'disconnectLinkedin']);

        // Content Routes 
        Route::post('/questions_generation', [ContentController::class, 'generate']);

        // Career Routes
        Route::get('resume_generation', [CareerController::class, 'resumeGeneration']);
        Route::post('resume_optimization', [CareerController::class, 'resumeOptimization']);
        Route::post('cover_letter_generation', [CareerController::class, 'coverLetterGeneration']);
        Route::post('cover_letter_optimization', [CareerController::class, 'coverLetterOptimization']);
    });
});