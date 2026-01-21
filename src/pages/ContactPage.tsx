import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";
import { Mail } from "lucide-react";

export default function ContactPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "Contact", isCurrentPage: true }
  ];

  return (
    <Layout>
      <SEO 
        title="Hubungi Kami - Film Dong"
        description="Hubungi Film Dong untuk pertanyaan bisnis, kemitraan, dan peluang iklan. Email kami untuk kolaborasi."
        canonical="/contact"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <article className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-3xl font-bold mb-6">Contact Us</h1>
          
          <section className="space-y-6 text-muted-foreground">
            <p>
              Thank you for your interest in NontonFilm. We welcome inquiries regarding business partnerships, 
              advertising opportunities, and collaborations.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Business Inquiries</h2>
            <p>
              For advertising, sponsorship, or business partnership opportunities, please reach out to us. 
              We are open to discussing various forms of collaboration that align with our platform's vision.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">How to Reach Us</h2>
            <div className="flex items-center gap-3 p-4 bg-card rounded-lg border border-border">
              <Mail className="w-6 h-6 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">Email</p>
                <a 
                  href="mailto:adv.bioskopmovie21@gmail.com" 
                  className="text-primary hover:underline font-medium"
                >
                  adv.bioskopmovie21@gmail.com
                </a>
              </div>
            </div>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Response Time</h2>
            <p>
              We strive to respond to all inquiries within 2-3 business days. Please ensure your email includes 
              relevant details about your proposal or inquiry to help us provide a more accurate response.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Note</h2>
            <p>
              Please note that we do not provide technical support for video playback issues, as all content 
              is hosted by third-party providers. For DMCA-related inquiries, please visit our{" "}
              <a href="/dmca" className="text-primary hover:underline">DMCA Policy</a> page.
            </p>
          </section>
        </article>
      </div>
    </Layout>
  );
}
