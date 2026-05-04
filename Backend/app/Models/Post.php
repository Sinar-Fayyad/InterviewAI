<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Post extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'body',
        //'media',
        'scheduled_at',
        'status',
        'published_at',
        'error',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
