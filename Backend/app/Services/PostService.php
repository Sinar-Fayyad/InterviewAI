<?php

namespace App\Services;
use App\Models\Post;
use App\Models\User;

class PostService
{
    static function addPost($data, $user_id)
    {
        if (!User::find($user_id)) {
            throw new \Exception("User not found", 404);
        }

        $post = new Post;
        $post->user_id = $data["user_id"];
        $post->title = $data["title"];
        $post->body = $data["body"];
        $post->media = $data["media"];
        $post->scheduled_at = $data["scheduled_at"];

        $post->save();
        return $post;
    }

    static function updatePost($data, $id)
    {
        $post = Post::find($id);
        if (!$post) {
            throw new \Exception("Post not found", 404);
        }

        $post->title = $data["title"] ? $data["title"] : $post->title;
        $post->body = $data["body"] ? $data["body"] : $post->body;
        $post->media = $data["media"] ? $data["media"] : $post->media;
        $post->scheduled_at = $data["scheduled_at"] ? $data["scheduled_at"] : $post->scheduled_at;

        $post->save();
        return $post;
    }

    static function getPosts($user_id)
    {
        $posts = Post::where('user_id', $user_id)->get();
        if (!$posts) {
            throw new \Exception("No posts found for this user", 404);
        }
        return $posts;
    }

    static function getPost($id)
    {
        $post = Post::find($id);
        if (!$post) {
            throw new \Exception("Post not found", 404);
        }
        return $post;
    }

    static function deletePost($id)
    {
        $post = Post::find($id);
        if (!$post) {
            throw new \Exception("Post not found", 404);
        }
        $post->delete();
        return true; 
    }
}
