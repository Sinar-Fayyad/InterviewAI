<?php

namespace App\Http\Controllers;

use App\Services\PostService;
use App\Http\Controllers\Controller; 
use App\Http\Requests\AddPostRequest;
use App\Http\Requests\UpdatePostRequest;

class PostController extends Controller
{
function addPost(AddPostRequest $request, $user_id){
        try {
            $post = PostService::addPost($request->validated(), $user_id);
            return $this->SuccessJSON($post);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

function updatePost(UpdatePostRequest $request, $id){
        try {
            $post = PostService::updatePost ($request->validated(), $id);
            return $this->SuccessJSON($post);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }

    function getPost($id){
        try {
            $post = PostService::getPost($id);
            return $this->SuccessJSON($post);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
    
    function getPosts($user_id){
        try {
            $posts = PostService::getPosts($user_id);
            return $this->SuccessJSON($posts);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }   

    function deletePost ($id){
        try {
            PostService::deletePost($id);
            return $this->SuccessJSON(["message" => "Post deleted successfully"]);
        } catch (\Exception $e) {
            return $this->ErrorJSON($e->getMessage(), $e->getCode());
        }
    }
}
