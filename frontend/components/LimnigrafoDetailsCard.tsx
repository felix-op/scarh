"use client";

import {
  BotonEstadoLimnigrafo,
  type EstadoLimnigrafo,
} from "./BotonEstadoLimnigrafo";

type InfoItem = {
  label: string;
  value: string;
};

type LimnigrafoDetailsCardProps = {
  title?: string;
  identification: InfoItem[];
  measurements: InfoItem[];
  extraData: InfoItem[];
  description: string;
  status: EstadoLimnigrafo;
  statusLabel?: string;
};

function InfoColumn({ items }: { items: InfoItem[] }) {
  return (
    <div className="flex flex-1 flex-col items-center gap-4 py-4">
      {items.map((item) => (
        <div key={item.label} className="flex w-full flex-col items-center gap-2">
          <p className="text-center text-[20px] font-normal text-[#838383]">
            {item.label}
          </p>
          <p className="text-center text-[24px] font-semibold text-black">
            {item.value}
          </p>
          <div className="h-px w-full max-w-[360px] bg-[#D8D8D8]" />
        </div>
      ))}
    </div>
  );
}

export default function LimnigrafoDetailsCard({
  title = "Datos Limnigrafo",
  identification,
  measurements,
  extraData,
  description,
  status,
  statusLabel = "Estado",
}: LimnigrafoDetailsCardProps) {
  return (
    <section
      className="
        w-full
        max-w-[1317px]
        rounded-[40px]
        bg-white
        p-6
        text-black
        shadow-[9px_7px_16px_-1px_rgba(0,0,0,0.18)]
        font-outfit
      "
    >
      <header className="border-b border-[#D8D8D8] pb-6 text-center">
        <h2 className="text-[36px] font-bold">{title}</h2>
      </header>

      <div className="grid gap-4 border-b border-[#D8D8D8] py-8 lg:grid-cols-3">
        <InfoColumn items={identification} />
        <InfoColumn items={measurements} />

        <div className="flex flex-1 flex-col items-center gap-4 py-4">
          {extraData.map((item) => (
            <div
              key={item.label}
              className="flex w-full flex-col items-center gap-2"
            >
              <p className="text-center text-[20px] font-normal text-[#838383]">
                {item.label}
              </p>
              <p className="text-center text-[24px] font-semibold text-black">
                {item.value}
              </p>
              <div className="h-px w-full max-w-[360px] bg-[#D8D8D8]" />
            </div>
          ))}

          <div className="flex w-full flex-col items-center gap-3 pt-2">
            <p className="text-center text-[20px] font-normal text-[#838383]">
              {statusLabel}
            </p>
            <BotonEstadoLimnigrafo estado={status} />
          </div>
        </div>
      </div>

      <footer className="pt-6 text-center">
        <p className="text-[20px] font-normal text-[#838383]">Descripción</p>
        <p className="mt-2 text-[24px] font-semibold text-black">
          {description}
        </p>
      </footer>

    </section>
  );
}
