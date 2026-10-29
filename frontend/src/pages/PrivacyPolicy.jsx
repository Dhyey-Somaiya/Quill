import React from "react";
import { Link } from "react-router-dom";

/* ── Last-updated date ── keep this updated when the policy changes */
const LAST_UPDATED = "October 2026";

export default function PrivacyPolicy() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <p className="kicker">Legal</p>
        <h1>Privacy Policy</h1>
        <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        <p className="legal-intro">
          This Privacy Policy describes how Quill (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or
          &ldquo;our&rdquo;) collects, uses, and shares information about you when you use
          our platform. Please read it carefully. If you have questions, contact
          us via the <Link to="/contact" className="inline-link">Contact page</Link>.
        </p>
      </div>

      <article className="legal-body">
        <section>
          <h2>1. Information we collect</h2>
          <h3>1.1 Information you provide directly</h3>
          <ul>
            <li><strong>Account registration:</strong> your name, email address, and password (stored as a bcrypt hash).</li>
            <li><strong>Profile information:</strong> optional bio or profile picture you add to your account.</li>
            <li><strong>Content:</strong> any posts, comments, or drafts you create on Quill.</li>
            <li><strong>Contact form:</strong> the name, email address, subject, and message you submit when you contact us.</li>
          </ul>

          <h3>1.2 Information collected automatically</h3>
          <ul>
            <li><strong>Usage data:</strong> pages visited, features used, and referring URLs, collected via server logs.</li>
            <li><strong>Authentication tokens:</strong> a signed JSON Web Token (JWT) stored in your browser&apos;s local storage to keep you logged in.</li>
          </ul>

          <h3>1.3 Information from third parties</h3>
          <ul>
            <li><strong>Google OAuth:</strong> if you sign in with Google, we receive your name and email address from Google. We do not receive your Google password. Your use of Google Sign-In is subject to <a href="https://policies.google.com/privacy" className="inline-link" target="_blank" rel="noopener noreferrer">Google&apos;s Privacy Policy</a>.</li>
          </ul>
        </section>

        <section>
          <h2>2. How we use your information</h2>
          <p>We use the information we collect to:</p>
          <ul>
            <li>Create and maintain your account.</li>
            <li>Authenticate your identity when you log in.</li>
            <li>Deliver the core publishing and reading features of the platform.</li>
            <li>Send transactional emails (email verification, password reset) via Resend.</li>
            <li>Respond to support and contact-form enquiries.</li>
            <li>Monitor platform health and diagnose technical problems.</li>
          </ul>
          <p>We do not use your data for advertising, and we do not sell your data to third parties.</p>
        </section>

        <section>
          <h2>3. How we share your information</h2>
          <p>We share your information only in the following limited circumstances:</p>
          <ul>
            <li><strong>Infrastructure providers:</strong> your data is stored on MongoDB Atlas and served via Render (backend) and Vercel (frontend). These providers process data on our behalf under their own data-processing agreements.</li>
            <li><strong>Transactional email:</strong> we use Resend to send verification and password-reset emails. Resend receives the recipient address and message content required to deliver those emails.</li>
            <li><strong>Legal obligations:</strong> we may disclose your information if required by law or to protect the rights, property, or safety of Quill, its users, or the public.</li>
          </ul>
          <p>Beyond the above, we do not share, rent, or sell your personal information.</p>
        </section>

        <section>
          <h2>4. Data retention</h2>
          <p>
            We retain your account information and content for as long as your account is active.
            If you delete your account, we will delete your personal information from our systems,
            subject to retention obligations required by law and the time needed for backup
            systems to cycle. Published posts may remain visible until they are removed from our
            servers.
          </p>
        </section>

        <section>
          <h2>5. Security</h2>
          <p>
            We take reasonable technical and organisational measures to protect your information,
            including encrypted connections (HTTPS), hashed passwords, and access-controlled
            infrastructure. No system is perfectly secure, however, and we cannot guarantee
            absolute security.
          </p>
        </section>

        <section>
          <h2>6. Your rights and choices</h2>
          <p>You may:</p>
          <ul>
            <li>Update your name and bio from your <Link to="/profile" className="inline-link">Profile</Link> page at any time.</li>
            <li>Delete any post or comment you have created.</li>
            <li>Request deletion of your account and associated data by <Link to="/contact" className="inline-link">contacting us</Link>.</li>
          </ul>
          <p>
            Depending on your jurisdiction, you may have additional rights (for example, under
            the GDPR or CCPA). Contact us if you wish to exercise any such rights.
          </p>
        </section>

        <section>
          <h2>7. Cookies and local storage</h2>
          <p>
            Quill stores your authentication token in <strong>browser local storage</strong> —
            not in cookies — so no cookie-consent banner is required for that purpose.
            We do not currently use any third-party analytics or advertising cookies.
          </p>
        </section>

        <section>
          <h2>8. Children</h2>
          <p>
            Quill is not directed at children under 13. We do not knowingly collect personal
            information from children under 13. If you believe we have done so inadvertently,
            please contact us and we will delete the information promptly.
          </p>
        </section>

        <section>
          <h2>9. Changes to this policy</h2>
          <p>
            We may update this Privacy Policy from time to time. When we do, we will revise the
            &ldquo;Last updated&rdquo; date at the top of this page. Continued use of Quill after
            a change constitutes acceptance of the updated policy.
          </p>
        </section>

        <section>
          <h2>10. Contact</h2>
          <p>
            If you have questions or concerns about this Privacy Policy, please use our{" "}
            <Link to="/contact" className="inline-link">Contact page</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}

