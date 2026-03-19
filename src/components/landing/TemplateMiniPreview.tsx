import { motion } from "framer-motion";

interface Props {
  template: "essentiel" | "horizon" | "signature";
  name: string;
  tag: string;
  description: string;
}

const EssentielLayout = () => (
  <div className="h-full w-full bg-white p-3 space-y-2 text-left">
    <div className="space-y-0.5">
      <div className="h-2.5 w-20 rounded-sm bg-gray-800" />
      <div className="h-1.5 w-28 rounded-sm bg-gray-400" />
    </div>
    <div className="h-px bg-gray-200" />
    <div className="space-y-1">
      <div className="h-1.5 w-12 rounded-sm bg-teal-600" />
      <div className="h-1 w-full rounded-sm bg-gray-200" />
      <div className="h-1 w-11/12 rounded-sm bg-gray-200" />
    </div>
    <div className="space-y-1">
      <div className="h-1.5 w-14 rounded-sm bg-teal-600" />
      <div className="h-1 w-full rounded-sm bg-gray-200" />
      <div className="h-1 w-9/12 rounded-sm bg-gray-200" />
    </div>
    <div className="space-y-1">
      <div className="h-1.5 w-16 rounded-sm bg-teal-600" />
      <div className="flex gap-1 flex-wrap">
        {[1,2,3,4].map(i => <div key={i} className="h-1.5 w-8 rounded-full bg-teal-100" />)}
      </div>
    </div>
  </div>
);

const HorizonLayout = () => (
  <div className="h-full w-full bg-white p-3 space-y-2 text-left">
    <div className="flex items-center gap-2">
      <div className="h-6 w-6 rounded-full bg-blue-500" />
      <div className="space-y-0.5">
        <div className="h-2 w-16 rounded-sm bg-gray-800" />
        <div className="h-1 w-20 rounded-sm bg-gray-400" />
      </div>
    </div>
    <div className="grid grid-cols-3 gap-1">
      {[1,2,3].map(i => <div key={i} className="h-5 rounded bg-blue-50 flex items-center justify-center"><div className="h-1 w-4 rounded-full bg-blue-400"/></div>)}
    </div>
    <div className="space-y-1">
      <div className="h-1.5 w-14 rounded-sm bg-blue-600 font-bold" />
      <div className="h-1 w-full rounded-sm bg-gray-100" />
      <div className="h-1 w-10/12 rounded-sm bg-gray-100" />
    </div>
    <div className="space-y-1">
      <div className="h-1.5 w-12 rounded-sm bg-blue-600" />
      <div className="h-1 w-full rounded-sm bg-gray-100" />
      <div className="h-1 w-8/12 rounded-sm bg-gray-100" />
    </div>
  </div>
);

const SignatureLayout = () => (
  <div className="h-full w-full bg-white flex text-left">
    <div className="w-1/3 bg-gray-800 p-2 space-y-2">
      <div className="h-6 w-6 rounded-full bg-orange-400 mx-auto" />
      <div className="h-1.5 w-full rounded-sm bg-gray-600" />
      <div className="h-1 w-full rounded-sm bg-gray-600" />
      <div className="space-y-0.5 mt-2">
        {[1,2,3].map(i => <div key={i} className="h-1 rounded-full bg-orange-400/60" style={{ width: `${90 - i * 15}%` }} />)}
      </div>
      <div className="space-y-0.5 mt-2">
        <div className="h-1 w-full rounded-sm bg-gray-600" />
        <div className="h-1 w-8/12 rounded-sm bg-gray-600" />
      </div>
    </div>
    <div className="flex-1 p-2 space-y-1.5">
      <div className="h-2.5 w-16 rounded-sm bg-gray-800" />
      <div className="h-1 w-full rounded-sm bg-gray-200" />
      <div className="h-1 w-11/12 rounded-sm bg-gray-200" />
      <div className="h-px bg-gray-100 my-1" />
      <div className="h-1.5 w-12 rounded-sm bg-orange-500" />
      <div className="h-1 w-full rounded-sm bg-gray-200" />
      <div className="h-1 w-9/12 rounded-sm bg-gray-200" />
      <div className="h-1.5 w-10 rounded-sm bg-orange-500 mt-1" />
      <div className="h-1 w-full rounded-sm bg-gray-200" />
    </div>
  </div>
);

const layouts = {
  essentiel: EssentielLayout,
  horizon: HorizonLayout,
  signature: SignatureLayout,
};

const TemplateMiniPreview = ({ template, name, tag, description }: Props) => {
  const Layout = layouts[template];

  return (
    <div className="group cursor-pointer">
      <div className="relative overflow-hidden rounded-xl border bg-muted/30 transition-all hover:shadow-xl hover:shadow-primary/5">
        <div className="aspect-[3/4] overflow-hidden">
          <div className="h-full w-full transform transition-transform duration-500 group-hover:scale-105">
            <Layout />
          </div>
        </div>
        {/* Hover overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-foreground/0 transition-all group-hover:bg-foreground/60">
          <span className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-primary-foreground opacity-0 transition-all group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0">
            Utiliser ce modèle
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">{name}</h3>
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{tag}</span>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">{description}</p>
    </div>
  );
};

export default TemplateMiniPreview;
