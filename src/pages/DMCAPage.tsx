import { Layout } from "@/components/Layout";
import { SEO } from "@/components/SEO";
import { Breadcrumb } from "@/components/Breadcrumb";

export default function DMCAPage() {
  const breadcrumbItems = [
    { label: "Beranda", href: "/" },
    { label: "DMCA", isCurrentPage: true }
  ];

  return (
    <Layout>
      <SEO 
        title="DMCA Policy - Film Dong"
        description="Kebijakan Hak Cipta DMCA Film Dong. Pelajari tentang kepatuhan hak cipta kami dan cara mengajukan permintaan penghapusan."
        canonical="/dmca"
      />
      
      <div className="container mx-auto px-4 py-8">
        <Breadcrumb items={breadcrumbItems} />
        
        <article className="max-w-3xl mx-auto prose prose-invert">
          <h1 className="text-3xl font-bold mb-6">DMCA Policy</h1>
          
          <section className="space-y-4 text-muted-foreground">
            <p>
              NontonFilm respects the intellectual property rights of others and expects its users to do the same. 
              In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously 
              to claims of copyright infringement that are reported to us.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">No Hosting of Content</h2>
            <p>
              NontonFilm does not host any video content on its servers. All videos displayed on this website are 
              hosted by third-party services and are embedded using publicly available embed codes. We do not upload, 
              store, or distribute any copyrighted material.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Third-Party Content</h2>
            <p>
              All content available through this website is provided by third-party sources. NontonFilm acts solely 
              as a search engine that indexes content available on the internet. We have no control over the content 
              hosted on external servers and cannot be held responsible for any copyright infringement that may occur 
              on those platforms.
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">DMCA Takedown Request</h2>
            <p>
              If you believe that your copyrighted work has been copied in a way that constitutes copyright 
              infringement and is accessible through our website, please notify us. We will investigate and take 
              appropriate action, which may include removing the link to the infringing content.
            </p>
            
            <p>To file a DMCA takedown notice, please provide the following information:</p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A physical or electronic signature of the copyright owner or authorized representative</li>
              <li>Identification of the copyrighted work claimed to have been infringed</li>
              <li>Identification of the material that is claimed to be infringing, including the URL</li>
              <li>Your contact information (address, telephone number, and email address)</li>
              <li>A statement that you have a good faith belief that the use is not authorized</li>
              <li>A statement that the information in the notification is accurate, under penalty of perjury</li>
            </ul>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Contact</h2>
            <p>
              For DMCA takedown requests or any copyright-related inquiries, please contact us at:
            </p>
            <p className="font-medium text-primary">
              <a href="mailto:adv.bioskopmovie21@gmail.com" className="hover:underline">
                adv.bioskopmovie21@gmail.com
              </a>
            </p>

            <h2 className="text-xl font-semibold text-foreground mt-8 mb-4">Disclaimer</h2>
            <p>
              NontonFilm is not responsible for the accuracy, compliance, copyright, legality, decency, or any 
              other aspect of the content of other linked sites. If you have any legal issues, please contact the 
              appropriate media file owners or host sites directly.
            </p>
          </section>
        </article>
      </div>
    </Layout>
  );
}
