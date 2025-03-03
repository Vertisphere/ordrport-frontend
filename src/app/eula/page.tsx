import { Shell } from "@/components/shells/shell"

export default function EULAPage() {
  return (
    <Shell variant="sidebar">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-bold mb-6">End User License Agreement</h1>
        
        <section className="prose dark:prose-invert max-w-none">
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing and using this application, you accept and agree to be bound by the terms and 
            provision of this agreement.
          </p>

          <h2>2. Use License</h2>
          <p>
            Permission is granted to temporarily download one copy of the application for personal, 
            non-commercial transitory viewing only.
          </p>

          <h2>3. Disclaimer</h2>
          <p>
            The materials on this application are provided on an &apos;as is&apos; basis. We make no warranties, 
            expressed or implied, and hereby disclaim and negate all other warranties including, without 
            limitation, implied warranties or conditions of merchantability, fitness for a particular 
            purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h2>4. Limitations</h2>
          <p>
            In no event shall we or our suppliers be liable for any damages (including, without 
            limitation, damages for loss of data or profit, or due to business interruption) arising 
            out of the use or inability to use the materials on our application.
          </p>

          <h2>5. Revisions</h2>
          <p>
            We may revise these terms of service for our application at any time without notice. By 
            using this application you are agreeing to be bound by the then current version of these 
            terms of service.
          </p>
        </section>
      </div>
    </Shell>
  )
} 