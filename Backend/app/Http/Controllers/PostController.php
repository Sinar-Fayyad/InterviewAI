<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Post;
use App\Services\PostService;
use App\Http\Controllers\Controller;

class PostController extends Controller
{
    function addPost(Request $request){
        $post = new Post;
        $post = PostService::addPost($post, $request);
        return $this->responseJSON($post);
    }

    function updatePost(Request $request, $id){
        $post = PostService::updatePost($id, $request);
        return $this->responseJSON($post);
    }

    function getPost($id){
        $post = PostService::getPost($id);
        return $post?  $this->responseJSON($post):
                        $this ->responseJSON (null , "Not found", 404);
    }
    
    function getPosts($user_id){
        $posts = PostService::getPosts($user_id);
        return $posts?  $this->responseJSON($posts):
                        $this ->responseJSON (null , "Not found", 404);
    }   

    function deletePost ($id){
        $post = PostService::deletePost($id);
        return $this->responseJSON($post);
    }
}
