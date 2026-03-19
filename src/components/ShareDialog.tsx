import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Copy, ExternalLink, Linkedin, MessageCircle, QrCode } from "lucide-react";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  url: string;
  title: string;
  description?: string;
  shareMessage?: string;
}

export default function ShareDialog({ open, onOpenChange, url, title, description, shareMessage }: Props) {
  const { t } = useTranslation();
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const message = shareMessage || t("share.defaultMessage", "Découvrez mon profil !");
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`${message} : ${url}`)}`;
  const linkedinUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(url)}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            🎉 {title}
          </DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Input value={url} readOnly className="text-sm" />
            <Button variant="outline" size="icon" onClick={handleCopy}>
              {copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" className="gap-2" onClick={() => window.open(whatsappUrl, "_blank")}>
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.open(linkedinUrl, "_blank")}>
              <Linkedin className="h-4 w-4" />
              LinkedIn
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => window.open(url, "_blank")}>
              <ExternalLink className="h-4 w-4" />
              {t("share.open", "Ouvrir")}
            </Button>
            <Button variant="outline" className="gap-2" onClick={() => setShowQr(!showQr)}>
              <QrCode className="h-4 w-4" />
              QR Code
            </Button>
          </div>

          {showQr && (
            <div className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-4">
              <img src={qrUrl} alt="QR Code" className="h-[200px] w-[200px] rounded-lg" />
              <p className="text-xs text-muted-foreground">{t("share.scanQr", "Scannez pour accéder")}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
