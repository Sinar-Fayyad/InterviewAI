<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Application extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'job_title',
        'company_name',
        'location',
        'salary_range',
        'job_url',
        'job_description',
        'status',
        'applied_at',
        'notes',
        'contact_name',
        'contact_email',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
