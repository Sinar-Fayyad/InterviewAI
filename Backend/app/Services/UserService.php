<?php

namespace App\Services;
use App\Models\User;

class UserService
{
    static function getUser($id)
    {
        return User::find($id);
    }

    static function updateUser($data, $user)
    {
        $user->first_name = $data["first_name"]? $data["first_name"]:$user->first_name;
        $user->last_name = $data["last_name"]? $data["last_name"]:$user->last_name;
        $user->email = $data["email"]? $data["email"]:$user->email;
        $user->phone = $data["phone"]? $data["phone"]:$user->phone;
        $user->location = $data["location"]? $data["location"]:$user->location;
        $user->summary = $data["summary"]? $data["summary"]:$user->summary;

        $user->save();
        return $user;
    }

    static function changeTheme($user)
    {
        $user->theme = ($user->theme == "light" ? "dark" : "light");
        $user->save();
        return $user;
    }
}
