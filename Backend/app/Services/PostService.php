<?php

namespace App\Services;
use App\Models\Post;

class PostService
{
    static function addPost($data){

        $post = new Post;
        $post->user_id = $data["user_id"];
        $post->title = $data["title"];
        $post->body = $data["body"];
        $post->media = $data["media"];
        $post->scheduled_at = $data["scheduled_at"];   
        $post->save();
        return $post;
    }

    static function updatePost($id, $data){
        $post = Post::find($id);
        $post->title = $data["title"]?$data["title"]:$post->title;
        $post->body = $data["body"]?$data["body"]:$post->body;
        $post->media = $data["media"]?$data["media"]:$post->media;
        $post->scheduled_at = $data["scheduled_at"]?$data["scheduled_at"]:$post->scheduled_at;   

        $post->save();
        return $post;
    }

    static function getPosts($user_id){
        return Post::where( 'user_id' , $user_id)->get();
    }

    static function getPost($id){
        return Post::find($id);
    }

    static function deletePost($id){

        $post = Post::find($id);
        $post->delete();
        return $post;
    }
}
