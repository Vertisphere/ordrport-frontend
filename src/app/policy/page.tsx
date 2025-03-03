import { Shell } from "@/components/shells/shell"

export default function PrivacyPolicyPage() {
  return (
    <Shell variant="sidebar">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <section className="prose dark:prose-invert max-w-none">
          <h2>1. Information We Collect</h2>
          <p>
            We collect information that you provide directly to us, including but not limited to:
          </p>
          <ul>
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Payment information</li>
            <li>Usage data and preferences</li>
          </ul>

          <h2>2. How We Use Your Information</h2>
          <p>
            We use the information we collect to:
          </p>
          <ul>
            <li>Provide, maintain, and improve our services</li>
            <li>Process your transactions</li>
            <li>Send you technical notices and support messages</li>
            <li>Communicate with you about products, services, and events</li>
          </ul>

          <h2>3. Information Sharing</h2>
          <p>
            We do not sell or rent your personal information to third parties. We may share your 
            information with trusted service providers who assist us in operating our services, 
            conducting our business, or serving our users.
          </p>

          <h2>4. Data Security</h2>
          <p>
            We implement appropriate technical and organizational measures to maintain the security of 
            your personal information, but remember that no method of transmission over the Internet is 
            100% secure.
          </p>

          <h2>5. Your Rights</h2>
          <p>
            You have the right to:
          </p>
          <ul>
            <li>Access your personal information</li>
            <li>Correct inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Object to our processing of your data</li>
          </ul>

          <h2>6. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            privacy@example.com
          </p>
        </section>
      </div>
    </Shell>
  )
} 