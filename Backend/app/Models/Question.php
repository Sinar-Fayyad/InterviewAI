<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Question extends Model
{
    use HasFactory;

    protected $fillable = [
        'questions_list_id',
        'question',
        'answer',
    ];

    public function questionsList()
    {
        return $this->belongsTo(QuestionsList::class);
    }
}
