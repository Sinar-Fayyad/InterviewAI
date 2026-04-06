<?php

namespace App\Services;
use App\Models\User;

class UserService
{
    static function getUser($id)
    {
        $user = User::find($id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        return $user ->select('id', 'first_name', 'last_name', 'email', 'phone', 'location', 'summary', 'theme')
                     ->get();
    }

    static function updateUser($data, $id)
    {
        $user = User::find($id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        $user->first_name = $data["first_name"]? $data["first_name"]:$user->first_name;
        $user->last_name = $data["last_name"]? $data["last_name"]:$user->last_name;
        $user->email = $data["email"]? $data["email"]:$user->email;
        $user->phone = $data["phone"]? $data["phone"]:$user->phone;
        $user->location = $data["location"]? $data["location"]:$user->location;
        $user->summary = $data["summary"]? $data["summary"]:$user->summary;

        $user->save();
    }

    static function changeTheme($id)
    {
        $user = User::find($id);
        if (!$user) {
            throw new \Exception("User not found", 404);
        }

        $user->theme = ($user->theme == "light" ? "dark" : "light");
        $user->save();
    }
}
