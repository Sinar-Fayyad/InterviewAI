<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Profile extends Model
{
    use HasFactory;

    public function user() {
        return $this->belongsTo(User::class);
    }

    protected function firstName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user->first_name,
        );
    }

    protected function lastName(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->user->last_name,
        );
    }
}
