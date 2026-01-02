<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class QuestionsList extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'company_name',
        'job_title',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function questions() 
    {
        return $this->hasMany(Question::class, 'questions_list_id');
    }
}
