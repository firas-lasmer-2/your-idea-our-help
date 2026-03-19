import ShareDialog from "@/components/ShareDialog";
import { useTranslation } from "react-i18next";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  siteUrl: string;
  title: string;
}

export default function PublishSuccessDialog({ open, onOpenChange, siteUrl, title }: Props) {
  const { t } = useTranslation();

  return (
    <ShareDialog
      open={open}
      onOpenChange={onOpenChange}
      url={siteUrl}
      title={t("website.publishSuccess", "Site publié avec succès !")}
      description={t("website.publishSuccessDesc", "Votre profil public est maintenant accessible. Partagez-le !")}
      shareMessage={t("website.shareMessage", "Découvrez mon profil public")}
    />
  );
}
