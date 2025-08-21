import styles from "./Terms.module.scss";

export default function Terms() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Terms & Conditions</h1>

      <div className={styles.content}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>1. Acceptance of Terms</h2>
          <p className={styles.body}>
            By accessing or using Routique, you agree to be bound by these Terms &amp; Conditions (the “Terms”).
            If you do not agree, do not use the service. We may update these Terms at any time by posting a new
            version on Routique. Your continued use after any update constitutes acceptance of the revised Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>2. Public Nature of Content</h2>
          <p className={styles.body}>
            Routique is a public platform. All content you post is public by default. This includes your username,
            display name, profile image, all routines you create, and all information contained in routines
            (e.g., images, notes, steps, products, and links). Do not post anything you wish to remain private.
            We have no obligation to keep user submissions confidential. 
          </p>
          <p className={styles.body}>
            Do not post personal or confidential information (yours or anyone else’s)—including full names, home addresses, phone numbers, email addresses, precise locations, government IDs, financial or medical information—or any content intended to identify, expose, or harm a person (“doxxing”); violations may result in removal and account termination.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>3. Eligibility & Accounts</h2>
          <p className={styles.body}>
            You must be at least 13 years old to use Routique. Content involving minors in exploitative, unsafe,
            sexualized, or otherwise inappropriate contexts is strictly prohibited. You are responsible for
            maintaining the confidentiality of your credentials and for all activity under your account. We may
            suspend or terminate accounts at our discretion for violations of these Terms. Users who are banned
            or removed are prohibited from re-registering or creating substitute accounts.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>4. User Content & Conduct</h2>
          <p className={styles.body}>
            You retain ownership of your submissions (routines, text, images, product links). By submitting content,
            you grant Routique a worldwide, non-exclusive, royalty-free license to host, display, distribute, and
            otherwise use your content in connection with operating, advertising, and improving the service. You represent and
            warrant that you have all rights necessary to post your content and that your content and use of the
            service will not violate any laws or rights of others.
          </p>
          <p className={styles.body}>
            You represent and warrant that you have all rights necessary to post your content and that your content
            and use of the service will not violate any laws or rights of others. The license you grant to Routique
            survives termination of your account to the extent necessary for operation of the service, compliance with
            law, dispute resolution, security and backup/archival purposes.
          </p>
          <p className={styles.body}>
            You may not upload or share content that is illegal; pornographic; sexually explicit; violent; hateful or
            harassing; defamatory; deceptive or fraudulent; infringes intellectual property rights; promotes self-harm
            or dangerous activities; contains others’ personal or confidential information; impersonates any person or
            entity; or otherwise violates these Terms. We may remove content and/or restrict accounts at our sole
            discretion. Absence of removal does not constitute endorsement by Routique.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>5. Intellectual Property (Platform)</h2>
          <p className={styles.body}>
            Routique’s software, design, branding, trademarks, and all related intellectual property are owned by
            Routique and protected by law. Except for your own content, all rights are reserved. You may not copy,
            reproduce, distribute, publicly display, create derivative works from, reverse engineer, decompile,
            disassemble, scrape, or otherwise attempt to extract source code or databases from Routique without our
            prior written consent. We welcome feedback; by submitting ideas or suggestions, you grant us a perpetual,
            irrevocable, royalty-free license to use them without restriction or attribution.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>6. Prohibited Uses</h2>
          <ul className={styles.list}>
            <li>Using the service for unlawful purposes or to violate others’ rights.</li>
            <li>Harassment, threats, doxxing, or incitement of violence.</li>
            <li>Impersonation or misrepresentation of affiliation, endorsement, or sponsorship.</li>
            <li>Uploading malware, scripts, automation, or attempting to disrupt, probe, or bypass security.</li>
            <li>Scraping, harvesting, or mining data (including via bots) without our written permission.</li>
            <li>Unauthorized advertising, multi-level marketing, or spam.</li>
          </ul>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>7. Third-Party Links & Products</h2>
          <p className={styles.body}>
            Links and product references may be posted by users. Routique does not control and is not responsible
            for third-party sites or products. Some links may be affiliate links. You are solely responsible for
            the links you post and for any sites or products you choose to access. By clicking third-party links,
            you accept all associated risks and release Routique from any liability arising from such interactions.
          </p>
          <p className={styles.body}>
            The appearance of brands, trademarks, or company names on Routique does not imply our endorsement,
            sponsorship, or affiliation. All trademarks belong to their respective owners. Users may not claim or
            suggest official affiliation with Routique when posting content or links.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>8. User Responsibility for Actions</h2>
          <p className={styles.body}>
            Content on Routique is user-generated and provided for informational purposes only. If you choose to
            follow, test, or implement any routine, product, or advice, you do so at your sole discretion and risk.
            Routique does not guarantee safety, effectiveness, suitability, or results. Use common sense and consult
            a qualified professional (e.g., dermatologist) where appropriate. You are solely responsible for outcomes
            resulting from your decisions and actions.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>9. Copyright & Takedowns</h2>
          <p className={styles.body}>
            Post only content you own or are authorized to use. If you believe content on Routique infringes your
            rights, contact <a href="mailto:routique.team@gmail.com">routique.team@gmail.com</a> with sufficient detail
            (identification of the work, the allegedly infringing material/URL, your contact info, and a statement of
            good-faith belief). We will review and may remove or restrict access to the material at our discretion.
            We may notify the user and, where appropriate, request a counter-notice.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>10. Reporting Violations</h2>
          <p className={styles.body}>
            To report content you believe violates these Terms or applicable law, email{" "}
            <a href="mailto:routique.team@gmail.com">routique.team@gmail.com</a>. While we encourage reports,
            Routique reserves the sole right to determine violations and the appropriate remedy, which may include
            removal of content, feature restrictions, or account termination.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>11. No Professional Advice</h2>
          <p className={styles.body}>
            Routique does not provide medical, cosmetic, dermatological, or professional advice. Content on the
            platform is not a substitute for professional judgment. Always seek the advice of qualified professionals
            with questions about your skin, health, allergies, or treatments.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>12. Disclaimer of Warranties</h2>
          <p className={styles.body}>
            Routique is provided on an “as is” and “as available” basis without warranties of any kind, whether
            express, implied, or statutory, including without limitation warranties of merchantability, fitness for a
            particular purpose, non-infringement, and accuracy. We do not warrant that the service will be uninterrupted,
            secure, error-free, or free of harmful components, or that content will be reliable or meet your expectations.
          </p>
        </section>

        <section className={styles.section}>
        <h2 className={styles.sectionTitle}>13. Limitation of Liability</h2>
        <p className={styles.body}>
            To the maximum extent permitted by law, Routique and its affiliates will not be liable for any indirect, incidental,
            special, consequential, exemplary, or punitive damages, or for any loss of profits, data, goodwill, or other intangible
            losses, arising out of or related to your use of or inability to use Routique or any content, even if advised of the
            possibility of such damages and even if a remedy fails of its essential purpose.
        </p>
        <p className={styles.body}>
            In no event will Routique’s total aggregate liability for all claims relating to the service exceed the greater of
            (a) the amounts you paid to Routique for the service in the twelve (12) months before the claim, or (b) one hundred
            Canadian dollars (CAD $100). Any claim must be brought within one (1) year of the event giving rise to it.
        </p>
        <p className={styles.body}>
            Some jurisdictions do not allow certain limitations; these apply only to the extent permitted by law. Nothing in these
            Terms excludes or limits liability that cannot be excluded or limited under applicable law.
        </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>14. User-Generated Content, Moderation & Assumption of Risk</h2>
          <p className={styles.body}>
            Routique hosts user-generated content. We do not pre-screen all content. We may use automated tools and
            limited human review to detect policy violations, but such systems are imperfect and may fail to identify or
            remove objectionable material. Absence of removal is not endorsement. You may encounter content that is
            inaccurate, offensive, infringing, or unsafe. You are solely responsible for your decision to view, click,
            follow links, purchase products, or implement routines. You assume all risks arising from user-generated content.
          </p>
          <p className={styles.body}>
            We reserve the right, but have no obligation, to monitor, moderate, edit, restrict access to, or remove any
            content at any time, and to suspend or terminate accounts, in our sole discretion, for any reason or no reason.
            We do not guarantee timely removal, uninterrupted availability, or error-free content.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>15. Termination & Suspension</h2>
          <p className={styles.body}>
              We may suspend or terminate your access to Routique at any time, with or without notice, if we believe you
              have violated these Terms or used the service in bad faith. Upon termination, your rights under these Terms
              will cease immediately, and we may delete or disable access to your content at our discretion. The following
              provisions survive termination: Sections 4-5, 7-13, 15-19, and 20 (and any other provisions which by their
              nature should reasonably survive).
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>16. Indemnification</h2>
          <p className={styles.body}>
            You agree to indemnify, defend, and hold harmless Routique and its affiliates, and their respective
            officers, directors, employees, and agents from and against any claims, liabilities, damages, losses, and
            expenses (including reasonable legal fees) arising out of or related to your content, your use of the
            service, or your violation of these Terms or applicable law.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>17. Changes to Service</h2>
          <p className={styles.body}>
            We may modify, suspend, or discontinue all or part of Routique at any time. Certain features may be released
            as beta, experimental, or limited-access and may change or be withdrawn without notice. We are not liable for
            any modification, suspension, or discontinuation of the service or any feature thereof.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>18. Severability; No Waiver; Assignment</h2>
          <p className={styles.body}>
            If any provision of these Terms is found unenforceable, the remaining provisions will remain in full force.
            Our failure to enforce any provision is not a waiver. You may not assign or transfer these Terms without our
            prior written consent. We may assign these Terms without restriction.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>19. Entire Agreement</h2>
          <p className={styles.body}>
            These Terms constitute the entire agreement between you and Routique regarding the service and supersede any
            prior or contemporaneous understandings. No informal representations or statements modify these Terms.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>20. Governing Law & Jurisdiction</h2>
          <p className={styles.body}>
            These Terms are governed by and construed in accordance with the laws of Ontario, Canada, without regard to
            conflict of law principles. You agree to the exclusive jurisdiction and venue of the courts located in
            Ontario for any dispute arising out of or relating to these Terms or the service.
          </p>
        </section>

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>21. Contact</h2>
          <p className={styles.body}>
            Questions or reports: <a href="mailto:routique.team@gmail.com">routique.team@gmail.com</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
