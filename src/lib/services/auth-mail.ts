import { sendEmail } from "@/lib/services/mail";

type AuthEmailContext = {
  to: string;
  firstName: string;
  appUrl?: string | null;
};

function renderAuthShell(title: string, intro: string, details: string[], closing: string) {
  return `
    <div style="margin:0;padding:32px 0;background:#f5efe6;font-family:Arial,sans-serif;color:#151515;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e8dfd3;border-radius:24px;overflow:hidden;">
        <tr>
          <td style="padding:32px 32px 20px;background:#151515;color:#ffffff;">
            <div style="font-size:12px;letter-spacing:0.32em;text-transform:uppercase;color:rgba(255,255,255,0.6);">Authentication</div>
            <h1 style="margin:16px 0 0;font-size:34px;line-height:1.15;font-weight:700;">${title}</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px;">
            <p style="margin:0 0 18px;font-size:16px;line-height:1.75;">${intro}</p>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin:0 0 22px;border:1px solid #eee4d7;border-radius:20px;background:#fcfaf7;">
              <tr>
                <td style="padding:20px 22px;">
                  ${details
                    .map(
                      (detail) =>
                        `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#4d443b;">${detail}</p>`
                    )
                    .join("")}
                </td>
              </tr>
            </table>
            <p style="margin:0;font-size:15px;line-height:1.7;color:#4d443b;">${closing}</p>
          </td>
        </tr>
      </table>
    </div>
  `.trim();
}

function stripHtml(html: string) {
  return html.replace(/<[^>]+>/g, "").replace(/\n\s*\n/g, "\n\n");
}

export async function sendRegistrationConfirmationEmail({
  to,
  firstName,
  appUrl
}: AuthEmailContext) {
  const signInUrl = `${(appUrl ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/login`;
  const subject = "Your BESTSELLER Sample Sales account is ready";
  const html = renderAuthShell(
    "Account created",
    `Hello ${firstName}, your local BESTSELLER Sample Sales account has been created successfully.`,
    [
      `Email: <strong>${to}</strong>`,
      `You can sign in from the staff portal and complete your country and language preferences on first access.`,
      `Sign-in URL: <a href="${signInUrl}" style="color:#151515;">${signInUrl}</a>`
    ],
    "If you did not expect this account to be created, contact your administrator."
  );

  return sendEmail({
    to,
    subject,
    html,
    text: stripHtml(html)
  });
}

export async function sendAdminProvisionedAccountEmail({
  to,
  firstName,
  appUrl
}: AuthEmailContext) {
  const signInUrl = `${(appUrl ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/login`;
  const subject = "Your BESTSELLER Sample Sales account has been provisioned";
  const html = renderAuthShell(
    "Account provisioned",
    `Hello ${firstName}, an administrator has created your local BESTSELLER Sample Sales account.`,
    [
      `Email: <strong>${to}</strong>`,
      `Use the password shared with you separately, then sign in here: <a href="${signInUrl}" style="color:#151515;">${signInUrl}</a>`,
      "After sign-in, review your user preferences so tax, language, and receipt behavior match your selling context."
    ],
    "If this account should not have been created, contact your administrator immediately."
  );

  return sendEmail({
    to,
    subject,
    html,
    text: stripHtml(html)
  });
}

export async function sendInvitationEmail({
  to,
  firstName,
  appUrl,
  resetUrl
}: AuthEmailContext & { resetUrl: string }) {
  const signInUrl = `${(appUrl ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/login`;
  const subject = "Set up your BESTSELLER Sample Sales account";
  const html = renderAuthShell(
    "You're invited",
    `Hello ${firstName}, an administrator invited you to BESTSELLER Sample Sales.`,
    [
      `Account: <strong>${to}</strong>`,
      `Set your password using this secure link: <a href="${resetUrl}" style="color:#151515;">${resetUrl}</a>`,
      `After setup, sign in here: <a href="${signInUrl}" style="color:#151515;">${signInUrl}</a>`
    ],
    "This setup link expires in 60 minutes and can only be used once."
  );

  return sendEmail({
    to,
    subject,
    html,
    text: stripHtml(html)
  });
}

export async function sendPasswordResetNotificationEmail({
  to,
  firstName,
  appUrl
}: AuthEmailContext) {
  const signInUrl = `${(appUrl ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/login`;
  const subject = "Your BESTSELLER Sample Sales password was reset";
  const html = renderAuthShell(
    "Password reset",
    `Hello ${firstName}, the password for your local BESTSELLER Sample Sales account was reset.`,
    [
      `Account: <strong>${to}</strong>`,
      `If the reset was expected, sign in with the new password here: <a href="${signInUrl}" style="color:#151515;">${signInUrl}</a>`,
      "If you did not request or expect this change, contact your administrator immediately."
    ],
    "This message is a security notification only and does not include the password itself."
  );

  return sendEmail({
    to,
    subject,
    html,
    text: stripHtml(html)
  });
}

export async function sendPasswordResetLinkEmail({
  to,
  firstName,
  appUrl,
  resetUrl
}: AuthEmailContext & { resetUrl: string }) {
  const signInUrl = `${(appUrl ?? process.env.APP_URL ?? "http://localhost:3000").replace(/\/$/, "")}/login`;
  const subject = "Reset your BESTSELLER Sample Sales password";
  const html = renderAuthShell(
    "Password reset requested",
    `Hello ${firstName}, we received a request to reset the password for your local BESTSELLER Sample Sales account.`,
    [
      `Account: <strong>${to}</strong>`,
      `Reset your password using this secure link: <a href="${resetUrl}" style="color:#151515;">${resetUrl}</a>`,
      "This link expires in 60 minutes and can only be used once."
    ],
    `If you did not request a password reset, you can ignore this message and continue using your existing password from <a href="${signInUrl}" style="color:#151515;">${signInUrl}</a>.`
  );

  return sendEmail({
    to,
    subject,
    html,
    text: stripHtml(html)
  });
}
