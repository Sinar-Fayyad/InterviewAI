<?php

namespace App\Services;

use App\Models\User;
use App\Models\Interview;
use Illuminate\Support\Facades\Storage;

class InterviewService
{
    static function addInterview($data, $user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        $interview = new Interview;
        $interview->user_id = $user_id;
        $interview->company_name = $data["company_name"];
        $interview->job_title = $data["job_title"];
        $interview->transcript = $data["transcript"];
        $interview->question_count = $data["question_count"];
        $interview->context_summary = $data["context_summary"];

        $interview->save();
        return $interview;
    }

    static function updateInterview($data, $id)
    {
        $interview = Interview::find($id);
        if (!$interview) {
            throw new \Exception("Interview not found", 404);
        }

        if (array_key_exists('interview_title', $data))
            $interview->interview_title = $data["interview_title"] ?: $interview->interview_title;

        if (array_key_exists('video_path', $data))
            $interview->video_path = $data["video_path"] ?: $interview->video_path;

        if (array_key_exists('feedback', $data))
            $interview->feedback = $data["feedback"] ?: $interview->feedback;

        if (array_key_exists('transcript', $data))
            $interview->transcript = $data["transcript"] ?: $interview->transcript;

        if (array_key_exists('question_count', $data))
            $interview->question_count = $data["question_count"] ?: $interview->question_count;

        $interview->save();
        return $interview;
    }

    static function getInterviews($user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        return Interview::where('user_id', $user_id)
            ->select('id', 'interview_title', 'company_name', 'job_title', 'created_at', 'feedback')
            ->get()
            ->toArray();
    }

    static function getInterview($id)
    {
        $interview = Interview::find($id);

        if (!$interview) {
            throw new \Exception("Interview not found", 404);
        }

        if (!$interview->video_path) {
            throw new \Exception("Interview video not found", 404);
        }

        $interview->video_url = Storage::url($interview->video_path);
        return $interview;
    }

    static function deleteInterview($id)
    {
        $interview = Interview::find($id);
        if (!$interview) {
            throw new \Exception("Interview not found", 404);
        }
        if ($interview->video_path) {
            Storage::delete($interview->video_path);
        }
        $interview->delete();
        return $interview;
    }
}
