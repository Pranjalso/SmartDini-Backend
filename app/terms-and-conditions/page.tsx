import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function TermsAndConditions() {
  return (
    <div className="min-h-screen bg-white font-poppins">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
        <p className="text-sm text-gray-500 mb-8">Last Updated: March 20, 2026</p>

        <section className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to Smartdini. These Terms and Conditions govern your use of our website and our contactless QR ordering system. By accessing or using our services, you agree to be bound by these terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">1. Use of Services</h2>
          <p>
            Smartdini provides a platform for cafes to manage their digital menus and for customers to place orders via QR codes. You agree to use the services only for lawful purposes and in accordance with these Terms.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">2. Account Registration</h2>
          <p>
            To access certain features of the services, you may be required to register for an account. You must provide accurate and complete information and keep your account information updated. You are responsible for maintaining the confidentiality of your account credentials.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">3. Fees and Payment</h2>
          <p>
            Certain services may be subject to fees. You agree to pay all fees associated with your use of the services. All payments are non-refundable unless otherwise stated in writing. We reserve the right to change our fees at any time upon notice to you.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">4. Intellectual Property</h2>
          <p>
            All content and materials available on Smartdini, including but not limited to text, graphics, logos, and software, are the property of Smartdini or its licensors and are protected by applicable intellectual property laws.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">5. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by law, Smartdini shall not be liable for any indirect, incidental, special, or consequential damages arising out of or in connection with your use of the services.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">6. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Smartdini operates, without regard to its conflict of law principles.
          </p>

          <h2 className="text-2xl font-semibold text-gray-900 mt-8">7. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            Email: <a href="mailto:support@smartdini.com" className="text-brand-red hover:underline">support@smartdini.com</a>
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
