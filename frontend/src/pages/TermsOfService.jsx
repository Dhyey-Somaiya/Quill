import React from "react";
import { Link } from "react-router-dom";

/* ── Last-updated date ── keep this updated when the terms change */
const LAST_UPDATED = "October 2026";

export default function TermsOfService() {
  return (
    <div className="legal-page">
      <div className="legal-header">
        <p className="kicker">Legal</p>
        <h1>Terms of Service</h1>
        <p className="legal-meta">Last updated: {LAST_UPDATED}</p>
        <p className="legal-intro">
          By using Quill you agree to these Terms of Service. If you do not
          agree, please do not use the platform. Questions? Reach us via the{" "}
          <Link to="/contact" className="inline-link">Contact page</Link>.
        </p>
      </div>

      <article className="legal-body">
        <section>
          <h2>1. Acceptance of terms</h2>
          <p>
            These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of the
            Quill publishing platform (&ldquo;Quill&rdquo;, &ldquo;the Service&rdquo;). By
            creating an account or using the Service, you agree to be bound by these Terms.
          </p>
        </section>

        <section>
          <h2>2. Eligibility</h2>
          <p>
            You must be at least 13 years of age to use Quill. By using the Service you
            represent that you meet this requirement. If you are under 18, you represent that
            a parent or guardian has reviewed and agreed to these Terms on your behalf.
          </p>
        </section>

        <section>
          <h2>3. Your account</h2>
          <p>
            You are responsible for keeping your account credentials secure and for all
            activity that occurs under your account. Notify us immediately if you suspect
            unauthorised access. We reserve the right to terminate accounts that violate
            these Terms.
          </p>
        </section>

        <section>
          <h2>4. Your content</h2>
          <h3>4.1 Ownership</h3>
          <p>
            You retain ownership of any content you publish on Quill (posts, comments,
            profile information). By publishing content you grant Quill a non-exclusive,
            worldwide, royalty-free licence to display, store, and transmit that content
            solely for the purpose of operating the Service.
          </p>

          <h3>4.2 Prohibited content</h3>
          <p>You agree not to post content that:</p>
          <ul>
            <li>infringes any third-party intellectual property, privacy, or other rights;</li>
            <li>is defamatory, harassing, threatening, or abusive toward any individual or group;</li>
            <li>contains spam, malware, phishing links, or deceptive information;</li>
            <li>depicts or promotes illegal activity;</li>
            <li>is sexually explicit involving minors; or</li>
            <li>violates any applicable law or regulation.</li>
          </ul>

          <h3>4.3 Content removal</h3>
          <p>
            We reserve the right to remove or hide content that violates these Terms or that
            we otherwise deem harmful to the community, without prior notice.
          </p>
        </section>

        <section>
          <h2>5. Acceptable use</h2>
          <p>You agree not to:</p>
          <ul>
            <li>use automated tools to scrape, crawl, or harvest data from Quill without permission;</li>
            <li>attempt to circumvent authentication, access controls, or rate limits;</li>
            <li>use the Service to send unsolicited commercial messages;</li>
            <li>impersonate another person or entity; or</li>
            <li>interfere with or disrupt the integrity or performance of the Service.</li>
          </ul>
        </section>

        <section>
          <h2>6. Intellectual property</h2>
          <p>
            The Quill name, logo, design, and platform software are the intellectual property
            of Quill. Nothing in these Terms grants you a right to use our trademarks or
            branding without our prior written consent.
          </p>
        </section>

        <section>
          <h2>7. Third-party services</h2>
          <p>
            Quill integrates with third-party services including Google OAuth and Resend.
            Your use of those services is subject to their respective terms and privacy
            policies. We are not responsible for the practices of third-party services.
          </p>
        </section>

        <section>
          <h2>8. Disclaimers</h2>
          <p>
            Quill is provided &ldquo;as is&rdquo; and &ldquo;as available&rdquo; without
            warranties of any kind, express or implied. We do not warrant that the Service
            will be uninterrupted, error-free, or free of harmful components. User-generated
            content on Quill represents the views of individual authors, not of Quill.
          </p>
        </section>

        <section>
          <h2>9. Limitation of liability</h2>
          <p>
            To the fullest extent permitted by applicable law, Quill shall not be liable for
            any indirect, incidental, special, consequential, or punitive damages arising from
            your use of or inability to use the Service. Our total liability to you for any
            claim shall not exceed the amount you paid us, if any, in the twelve months
            preceding the claim.
          </p>
        </section>

        <section>
          <h2>10. Termination</h2>
          <p>
            You may stop using Quill at any time. We may suspend or terminate your access if
            you violate these Terms. Upon termination, your right to use the Service ceases
            immediately.
          </p>
        </section>

        <section>
          <h2>11. Changes to these terms</h2>
          <p>
            We may revise these Terms from time to time. We will update the &ldquo;Last
            updated&rdquo; date at the top of this page. Continued use of Quill after any
            changes constitutes your acceptance of the revised Terms.
          </p>
        </section>

        <section>
          <h2>12. Contact</h2>
          <p>
            Questions about these Terms? Please use our{" "}
            <Link to="/contact" className="inline-link">Contact page</Link>.
          </p>
        </section>
      </article>
    </div>
  );
}

