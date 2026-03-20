import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white font-poppins">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: March 20, 2026</p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            At Smartdini, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our contactless QR ordering system.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, such as when you create an account, place an order, or contact customer support. This may include:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Contact information (name, email address, phone number).</li>
            <li>Business information (cafe name, address, menu details).</li>
            <li>Payment information (processed securely through our payment partners).</li>
            <li>Usage data (how you interact with our platform).</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Provide, maintain, and improve our services.</li>
            <li>Process transactions and send related information.</li>
            <li>Send technical notices, updates, and security alerts.</li>
            <li>Respond to your comments and questions.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">3. Sharing of Information</h2>
          <p>
            We do not share your personal information with third parties except as described in this policy:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>With vendors and service providers who need access to such information to carry out work on our behalf.</li>
            <li>In response to a request for information if we believe disclosure is in accordance with any applicable law.</li>
            <li>If we believe your actions are inconsistent with our user agreements or policies.</li>
          </ul>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">4. Security</h2>
          <p>
            We use administrative, technical, and physical security measures to help protect your personal information. While we have taken reasonable steps to secure the personal information you provide to us, please be aware that despite our efforts, no security measures are perfect or impenetrable.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">5. Contact Us</h2>
          <p>
            If you have questions or comments about this Privacy Policy, please contact us at:
            <br />
            Email: <a href="mailto:privacy@smartdini.com" className="text-brand-red hover:underline">privacy@smartdini.com</a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
