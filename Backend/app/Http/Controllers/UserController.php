<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    function ChangeTheme(Request $request, $id){
        $user = User::find($id);
        $user->theme = $request->theme;
        $user->save();
        return $this->responseJSON($user);
    }  
}
