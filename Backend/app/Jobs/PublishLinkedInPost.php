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

    protected $post;

    public function __construct(Post $post)
    {
        $this->post = $post;
    }

    public function handle()
    {
        $user = $this->post->user;

        if (!$user || !$user->linkedin_token) {
            $this->post->update(['status' => 'failed', 'error' => 'Missing LinkedIn token']);
            return;
        }

        if ($user->linkedinexpired) {
            $this->post->update(['status' => 'failed', 'error' => 'LinkedIn token expired']);
            return;
        }

        $response = Http::withToken($user->linkedin_token)
            ->post('http://api.linkedin.com/v2/ugcPosts', [
                'author' => 'urn:li:person:' . $user->linkedin_id,
                'lifecycleState' => 'PUBLISHED',
                'specificContent' => [
                    'com.linkedin.ugc.ShareContent' => [
                        'shareCommentary' => [
                            'text' => $this->post->content
                        ],
                        'shareMediaCategory' => 'NONE'
                    ]
                ],
                'visibility' => [
                    'com.linkedin.ugc.MemberNetworkVisibility' => 'PUBLIC'
                ]
            ]);

        if ($response->json('code') !== 200) {
            $this->post->update(['status' => 'published', 'published_at' => now()]);
        } else {
            $this->post->update(['status' => 'failed', 'error' => $response->json('error')]);
        }
    }
}