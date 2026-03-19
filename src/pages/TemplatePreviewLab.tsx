import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import {
  RESUME_TEMPLATE_IDS,
  WEBSITE_TEMPLATE_IDS,
  ResumePreview,
  WebsitePreview,
  getResumeFixture,
  getWebsiteFixture,
} from "@/lib/template-preview-fixtures";
import { normalizeResumeTemplateId, normalizeWebsiteTemplateId } from "@/lib/template-recommendations";

const TemplatePreviewLab = () => {
  const [searchParams] = useSearchParams();
  const kind = searchParams.get("kind") === "website" ? "website" : "resume";
  const rawTemplate = searchParams.get("template") || "";
  const mobile = searchParams.get("mobile") === "1";

  const content = useMemo(() => {
    if (kind === "website") {
      const template = normalizeWebsiteTemplateId(rawTemplate || WEBSITE_TEMPLATE_IDS[0], "profile");
      return { kind, template, ...getWebsiteFixture(template) };
    }
    const template = normalizeResumeTemplateId(rawTemplate || RESUME_TEMPLATE_IDS[0]);
    return { kind, template, ...getResumeFixture(template) };
  }, [kind, rawTemplate]);

  return (
    <div className="min-h-screen bg-slate-200 px-6 py-10">
      <div className="mx-auto mb-6 max-w-6xl rounded-2xl border border-slate-300 bg-white/80 px-5 py-4 shadow-sm backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">Template Preview Lab</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">
              {content.kind === "resume" ? "Resume" : "Website"} · {content.template}
            </h1>
          </div>
          <div className="text-sm text-slate-600">
            {content.kind === "website" ? (mobile ? "mobile" : "desktop") : "print preview"}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl">
        {content.kind === "resume" ? (
          <div data-visual-root className="mx-auto w-full max-w-[900px] overflow-hidden rounded-2xl border border-slate-300 bg-white p-6 shadow-xl">
            <ResumePreview data={content.data} customization={content.customization} template={content.template} />
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              data-visual-root
              className="overflow-hidden rounded-[28px] border border-slate-300 bg-white shadow-xl"
              style={{ width: mobile ? "390px" : "1280px", maxWidth: "100%" }}
            >
              <WebsitePreview sections={content.sections} globalSettings={content.globalSettings} title={content.title} template={content.template} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplatePreviewLab;
