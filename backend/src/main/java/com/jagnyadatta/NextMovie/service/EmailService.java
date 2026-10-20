package com.jagnyadatta.NextMovie.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import java.io.UnsupportedEncodingException;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@nextmovie.com}")
    private String fromEmail;

    @Value("${app.mail.from-name:NextMovie Security}")
    private String fromName;

    @Value("${app.otp.expiry-minutes:5}")
    private int otpExpiryMinutes;

    /**
     * Sends an interactive, cinema-themed HTML email containing the verification OTP.
     *
     * @param toEmail       recipient email
     * @param recipientName recipient name or default greeting
     * @param otp           the 6-digit OTP code
     */
    public void sendOtpEmail(String toEmail, String recipientName, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(toEmail);
            helper.setSubject("🎬 " + otp + " is your NextMovie Verification Code");

            String htmlBody = buildInteractiveOtpHtml(recipientName, otp);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("OTP verification email sent successfully to {}", toEmail);
        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("Failed to compose or send OTP email to {}: {}", toEmail, e.getMessage(), e);
            throw new IllegalStateException("Failed to send verification email. Please check email configuration.", e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to {}: {}", toEmail, e.getMessage(), e);
            throw new IllegalStateException("Email delivery service temporarily unavailable: " + e.getMessage(), e);
        }
    }

    /**
     * Generates a responsive, cinema-themed interactive HTML email template.
     */
    public String buildInteractiveOtpHtml(String recipientName, String otp) {
        String displayName = (recipientName != null && !recipientName.trim().isEmpty())
                ? recipientName.trim()
                : "Movie Enthusiast";

        // Extract individual digits for interactive box display
        char[] digits = otp != null && otp.length() == 6 ? otp.toCharArray() : "000000".toCharArray();

        StringBuilder digitBoxes = new StringBuilder();
        for (char digit : digits) {
            digitBoxes.append("<td align=\"center\" valign=\"middle\" style=\"width: 44px; height: 54px; background: linear-gradient(135deg, #182235 0%, #111827 100%); border: 1.5px solid #e50914; border-radius: 10px; font-family: 'Courier New', Courier, monospace; font-size: 26px; font-weight: 800; color: #ffffff; text-shadow: 0 0 10px rgba(229, 9, 20, 0.5); box-shadow: inset 0 1px 1px rgba(255,255,255,0.1), 0 4px 10px rgba(0,0,0,0.4); margin: 0 4px;\">")
                    .append(digit)
                    .append("</td>");
        }

        return "<!DOCTYPE html>"
                + "<html lang=\"en\">"
                + "<head>"
                + "<meta charset=\"UTF-8\">"
                + "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">"
                + "<meta name=\"color-scheme\" content=\"dark only\">"
                + "<title>NextMovie - Verification Code</title>"
                + "<style>"
                + "  body { margin: 0; padding: 0; background-color: #070a13; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }"
                + "  .email-container { max-width: 580px; margin: 30px auto; background-color: #0d1322; border-radius: 20px; overflow: hidden; border: 1px solid #1e293b; box-shadow: 0 20px 40px rgba(0,0,0,0.6); }"
                + "  .otp-tile:hover { transform: translateY(-2px); border-color: #ff3b4e !important; }"
                + "  @media only screen and (max-width: 600px) {"
                + "    .email-container { margin: 10px; border-radius: 16px; }"
                + "    .inner-padding { padding: 24px 18px !important; }"
                + "    .otp-digit-td { width: 36px !important; height: 46px !important; font-size: 22px !important; }"
                + "  }"
                + "</style>"
                + "</head>"
                + "<body style=\"margin: 0; padding: 20px 10px; background-color: #070a13; color: #e2e8f0;\">"
                + "<table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background-color: #070a13;\">"
                + "<tr>"
                + "<td align=\"center\">"
                + "  <div class=\"email-container\" style=\"max-width: 580px; width: 100%; background: #0d1322; border-radius: 20px; border: 1px solid #1e293b; text-align: left; overflow: hidden;\">"
                
                + "    <!-- Top Ambient Glow & Brand Header -->"
                + "    <table role=\"presentation\" width=\"100%\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" style=\"background: linear-gradient(180deg, rgba(229,9,20,0.18) 0%, rgba(13,19,34,0) 100%);\">"
                + "      <tr>"
                + "        <td style=\"padding: 32px 32px 16px 32px; text-align: center;\">"
                + "          <table role=\"presentation\" cellspacing=\"0\" cellpadding=\"0\" border=\"0\" align=\"center\">"
                + "            <tr>"
                + "              <td style=\"vertical-align: middle;\">"
                + "                <div style=\"width: 44px; height: 44px; line-height: 44px; border-radius: 12px; background: linear-gradient(135deg, #e50914 0%, #ff4b55 100%); text-align: center; font-size: 22px; box-shadow: 0 4px 14px rgba(229,9,20,0.4); display: inline-block;\">"
                + "                  🎬"
                + "                </div>"
                + "              </td>"
                + "              <td style=\"vertical-align: middle; padding-left: 12px;\">"
                + "                <span style=\"font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff;\">Next<span style=\"color: #e50914;\">Movie</span></span>"
                + "              </td>"
                + "            </tr>"
                + "          </table>"
                + "          <div style=\"font-size: 11px; font-weight: 700; color: #94a3b8; letter-spacing: 2px; text-transform: uppercase; margin-top: 8px;\">"
                + "            Premier Cinema & Ticketing Platform"
                + "          </div>"
                + "        </td>"
                + "      </tr>"
                + "    </table>"

                + "    <!-- Main Content Area -->"
                + "    <div class=\"inner-padding\" style=\"padding: 10px 36px 36px 36px;\">"
                + "      <!-- Security Badge -->"
                + "      <div style=\"display: inline-block; padding: 6px 14px; border-radius: 9999px; background-color: rgba(229,9,20,0.12); border: 1px solid rgba(229,9,20,0.3); color: #ff5c67; font-size: 11px; font-weight: 700; letter-spacing: 0.5px; margin-bottom: 16px;\">"
                + "        🛡️ SIGNUP VERIFICATION CODE"
                + "      </div>"

                + "      <h1 style=\"margin: 0 0 10px 0; font-size: 22px; font-weight: 800; color: #ffffff; letter-spacing: -0.3px;\">"
                + "        Verify Your Email Address"
                + "      </h1>"

                + "      <p style=\"margin: 0 0 20px 0; font-size: 14px; line-height: 1.6; color: #94a3b8;\">"
                + "        Hello <strong style=\"color: #f1f5f9;\">" + displayName + "</strong>,<br>"
                + "        Welcome to <strong>NextMovie</strong>! You are just one quick step away from booking premier cinema seats and experiencing the best shows. Please use the verification code below to confirm your registration:"
                + "      </p>"

                + "      <!-- Interactive OTP Digit Presentation Card -->"
                + "      <div style=\"background: #090e1a; border: 1px solid #1e293b; border-radius: 16px; padding: 24px 16px; text-align: center; margin: 24px 0;\">"
                + "        <div style=\"font-size: 11px; font-weight: 700; color: #64748b; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 16px;\">"
                + "          Your 6-Digit One-Time Password"
                + "        </div>"
                
                + "        <!-- Digit Boxes Table -->"
                + "        <table role=\"presentation\" cellspacing=\"6\" cellpadding=\"0\" border=\"0\" align=\"center\" style=\"margin: 0 auto;\">"
                + "          <tr>"
                +              digitBoxes.toString()
                + "          </tr>"
                + "        </table>"

                + "        <!-- Copy-friendly Text Display -->"
                + "        <div style=\"margin-top: 18px;\">"
                + "          <span style=\"display: inline-block; font-size: 13px; color: #94a3b8; background-color: #131c2e; padding: 6px 14px; border-radius: 8px; border: 1px dashed #334155; font-family: monospace;\">"
                + "            Plain Code: <strong style=\"color: #ffffff; letter-spacing: 3px;\">" + otp + "</strong>"
                + "          </span>"
                + "        </div>"

                + "        <!-- Expiry Indicator -->"
                + "        <div style=\"margin-top: 16px; display: inline-flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: #fbbf24;\">"
                + "          ⏱️ <span>Expires in <strong>" + otpExpiryMinutes + " minutes</strong></span>"
                + "        </div>"
                + "      </div>"

                + "      <!-- Security Callout Box -->"
                + "      <div style=\"background: rgba(30, 41, 59, 0.4); border-left: 3px solid #e50914; border-radius: 8px; padding: 14px 16px; margin: 24px 0;\">"
                + "        <div style=\"font-size: 12px; font-weight: 700; color: #f87171; margin-bottom: 4px;\">"
                + "          🔒 Security Checklist"
                + "        </div>"
                + "        <p style=\"margin: 0; font-size: 12px; line-height: 1.5; color: #94a3b8;\">"
                + "          • Never share your OTP with anyone. NextMovie staff will never ask for your code.<br>"
                + "          • If you did not attempt to sign up for NextMovie, please ignore this email; no account will be activated without this OTP."
                + "        </p>"
                + "      </div>"

                + "      <p style=\"margin: 20px 0 0 0; font-size: 13px; color: #64748b; line-height: 1.5;\">"
                + "        Best regards,<br>"
                + "        <strong style=\"color: #cbd5e1;\">The NextMovie Team</strong>"
                + "      </p>"
                + "    </div>"

                + "    <!-- Footer -->"
                + "    <div style=\"background: #080c16; border-top: 1px solid #1e293b; padding: 20px 32px; text-align: center;\">"
                + "      <p style=\"margin: 0 0 8px 0; font-size: 11px; color: #475569;\">"
                + "        © 2026 NextMovie Entertainment Inc. • All rights reserved."
                + "      </p>"
                + "      <p style=\"margin: 0; font-size: 11px; color: #334155;\">"
                + "        This is an automated security transmission. Please do not reply directly to this email."
                + "      </p>"
                + "    </div>"

                + "  </div>"
                + "</td>"
                + "</tr>"
                + "</table>"
                + "</body>"
                + "</html>";
    }
}
