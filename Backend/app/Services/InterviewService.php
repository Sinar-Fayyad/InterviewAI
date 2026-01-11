<?php

namespace App\Services;
use App\Models\Interview;

class InterviewService
{
    static function addInterview($interview, $data){
        $interview->user_id = $data["user_id"]? $data["user_id"]:$interview->user_id;
        $interview->interview_title = $data["interview_title"]? $data["interview_title"]:$interview->interview_title;
        $interview->company_name = $data["company_name"]? $data["company_name"]:$interview->company_name;
        $interview->job_title = $data["job_title"]? $data["job_title"]:$interview->job_title;
        $interview->video_path = $data["video_path"]? $data["video_path"]:$interview->video_path;
        $interview->feedback = $data["feedback"]? $data["feedback"]:$interview->feedback;
        $interview->transcript = $data["transcript"]? $data["transcript"]:$interview->transcript;
        $interview->question_count = $data["question_count"]? $data["question_count"]:$interview->question_count;
        $interview->context_summary = $data["context_summary"]? $data["context_summary"]:$interview->context_summary;
        $interview->status = $data["status"]? $data["status"]:$interview->status;
        $interview->save();
        return $interview;
    }

    static function getInterviews($user_id){
        return Interview::where('user_id', $user_id)->get();
    }

    static function getInterview($id){
        return Interview::find($id);
    }

    static function deleteInterview($id){
        $interview = Interview::find($id);
        if($interview){
            $interview->delete();
        }
        
        return $interview;
    }
}
