import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink, Linkedin, MessageCircle, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteUrl: string;
  title: string;
}

export default function PublishSuccessDialog({ open, onOpenChange, siteUrl, title }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(siteUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${t("website.shareMessage", "Découvrez mon profil public")} : ${siteUrl}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(siteUrl)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(siteUrl)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎉 {t("website.publishSuccess", "Site publié avec succès !")}
          </DialogTitle>
          <DialogDescription>
            {t("website.publishSuccessDesc", "Votre profil public est maintenant accessible. Partagez-le !")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Copy URL */}
          <div className="flex gap-2">
            <Input value={siteUrl} readOnly className="text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          {/* Share buttons */}
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.open(whatsappUrl, "_blank")}>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.open(linkedinUrl, "_blank")}>
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.open(siteUrl, "_blank")}>
              <ExternalLink className="h-4 w-4" />
              {t("website.viewSite")}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setShowQr(!showQr)}>
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>

          {/* QR Code */}
          {showQr && (
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-4">
              <img src={qrUrl} alt="QR Code" className="h-[200px] w-[200px] rounded-lg" />
              <p className="text-xs text-muted-foreground">{t("website.scanQr", "Scannez pour accéder au profil")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
