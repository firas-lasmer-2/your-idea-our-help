import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import WebsitePreview from "@/components/website/WebsitePreview";
import { WebsiteGlobalSettings } from "@/types/website";
import { Helmet } from "react-helmet-async";
import { trackProductEvent } from "@/lib/product-events";

const PublicWebsite = () => {
  const { id } = useParams<{ id: string }>();
  const [site, setSite] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!id) { setNotFound(true); setLoading(false); return; }

    // Try slug first, then id
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    const query = (supabase as any)
      .from("websites")
      .select("title, published_data, global_settings, template, is_published, data")
      .eq("is_published", true);

    const finalQuery = isUuid
      ? query.eq("id", id)
      : query.eq("slug", id);

    finalQuery.single().then(({ data: s, error }: any) => {
      if (error || !s) {
        // If slug failed, try id as fallback
        if (!isUuid) {
          (supabase as any)
            .from("websites")
            .select("title, published_data, global_settings, template, is_published, data")
            .eq("is_published", true)
            .eq("id", id)
            .single()
            .then(({ data: s2, error: e2 }: any) => {
              if (e2 || !s2) setNotFound(true);
              else setSite(s2);
              setLoading(false);
            });
        } else {
          setNotFound(true);
          setLoading(false);
        }
      } else {
        setSite(s);
        setLoading(false);
      }
    });
  }, [id]);

  useEffect(() => {
    if (!site || notFound) return;
    void trackProductEvent("website_viewed", {
      data: {
        websiteSlugOrId: id,
        template: site.template,
      },
    });
  }, [site, id, notFound]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center text-center">
        <div>
          <h1 className="text-4xl font-bold text-foreground">404</h1>
          <p className="mt-2 text-muted-foreground">Site non trouvé ou non publié.</p>
        </div>
      </div>
    );
  }

  const siteData = site.published_data || site.data;
  const gs = site.global_settings as WebsiteGlobalSettings;

  return (
    <>
      <Helmet>
        <title>{site.title}</title>
        {gs?.metaDescription && <meta name="description" content={gs.metaDescription} />}
        <meta property="og:title" content={site.title} />
        {gs?.metaDescription && <meta property="og:description" content={gs.metaDescription} />}
        {gs?.ogImage && <meta property="og:image" content={gs.ogImage} />}
      </Helmet>
      <WebsitePreview
        sections={siteData.sections || []}
        globalSettings={gs}
        title={site.title}
        template={site.template}
        websiteId={id}
        isPublic
      />
    </>
  );
};

export default PublicWebsite;
