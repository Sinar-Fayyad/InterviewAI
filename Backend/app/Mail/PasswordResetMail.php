<?php

namespace App\Mail;

use Illuminate\Mail\Mailable;

class PasswordResetMail extends Mailable
{
    public string $resetUrl;

    public function __construct(string $resetUrl)
    {
        $this->resetUrl = $resetUrl;
    }

    public function build()
    {
        return $this->subject('Reset Your Password - InterviewAI')
                    ->html($this->getHtml());
    }

    private function getHtml(): string
    {
        $url = $this->resetUrl;
        return '
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0; padding:0; background-color:#0f172a; font-family: Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f172a; padding: 40px 20px;">
        <tr>
            <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color:#1e293b; border-radius:16px; overflow:hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.4);">
                    
                    <!-- Header -->
                    <tr>
                        <td align="center" style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px 30px;">
                            <h1 style="margin:0; color:#ffffff; font-size:28px; letter-spacing:1px;">InterviewAI</h1>
                            <p style="margin:8px 0 0; color:#e0e7ff; font-size:14px;">Your AI-powered interview coach</p>
                        </td>
                    </tr>

                    <!-- Body -->
                    <tr>
                        <td style="padding: 40px 40px 20px;">
                            <h2 style="color:#f1f5f9; font-size:22px; margin:0 0 12px;">Password Reset Request</h2>
                            <p style="color:#94a3b8; font-size:15px; line-height:1.7; margin:0 0 24px;">
                                Hey there! We received a request to reset your password for your InterviewAI account.
                                Click the button below and we\'ll get you back on track in no time.
                            </p>

                            <!-- Button -->
                            <table width="100%" cellpadding="0" cellspacing="0">
                                <tr>
                                    <td align="center" style="padding: 10px 0 30px;">
                                        <a href="' . $url . '" 
                                           style="background: linear-gradient(135deg, #6366f1, #8b5cf6);
                                                  color: #ffffff;
                                                  text-decoration: none;
                                                  padding: 14px 36px;
                                                  border-radius: 8px;
                                                  font-size: 16px;
                                                  font-weight: bold;
                                                  display: inline-block;
                                                  letter-spacing: 0.5px;">
                                            🔐 Reset My Password
                                        </a>
                                    </td>
                                </tr>
                            </table>

                            <p style="color:#64748b; font-size:13px; line-height:1.6; margin:0 0 8px;">
                                ⚠️ This link will expire in <strong style="color:#94a3b8;">60 minutes</strong>.
                            </p>
                            <p style="color:#64748b; font-size:13px; line-height:1.6; margin:0;">
                                If you didn\'t request a password reset, you can safely ignore this email — your account is still secure.
                            </p>
                        </td>
                    </tr>

                    <!-- Divider -->
                    <tr>
                        <td style="padding: 0 40px;">
                            <hr style="border:none; border-top:1px solid #334155; margin:0;">
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td align="center" style="padding: 24px 40px;">
                            <p style="color:#475569; font-size:12px; margin:0;">
                                © 2025 InterviewAI · Built with ❤️ for your success
                            </p>
                        </td>
                    </tr>

                </table>
            </td>
        </tr>
    </table>
</body>
</html>
        ';
    }
}

?>