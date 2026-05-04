<?php

namespace App\Jobs;

use App\Models\Post;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Http;

class PublishLinkedInPost implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    protected Post $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function handle(): void
    {
        $post = Post::find($this->post->id);

        if (!$post) {
            return;
        }

        try {
            LinkedinService::postToLinkedIn([
                'text' => $post->body,
               // 'media' => $post->media,
            ], $post->user_id);

            $post->update([
                'status' => 'published',
                'published_at' => now(),
                'error' => null,
            ]);
        } catch (\Throwable $e) {
            $post->update([
                'status' => 'failed',
                'error' => $e->getMessage(),
            ]);
        }
    }
}