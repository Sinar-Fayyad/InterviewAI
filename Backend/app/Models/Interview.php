<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Interview extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'interview_title',
        'video_path',
        'company_name',
        'job_title',
        'feedback',
        'transcript',

    ];

    public function application()
    {
        return $this->belongsTo(Application::class);
    }
}
