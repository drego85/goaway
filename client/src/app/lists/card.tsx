import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ListEntry } from "@/pages/blacklist";
import { CardDetails } from "./details";
import { ClockIcon, ShieldSlashIcon } from "@phosphor-icons/react";

export function ListCard(
  listEntry: ListEntry & { onDelete: (name: string) => void }
) {
  const formattedDate = new Date(listEntry.lastUpdated * 1000).toLocaleString(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }
  );

  return (
    <Card className="w-full p-6 bg-[#111111] text-white rounded-2xl relative shadow-lg hover:shadow-xl transition-all duration-300 border border-zinc-800">
      <div
        className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
          listEntry.active ? "bg-green-500" : "bg-red-500"
        } shadow-glow`}
      />

      <div className="flex flex-col gap-4">
        <div className="w-full">
          <h2 className="text-center text-xl font-bold mb-1">
            {listEntry.name}
          </h2>
          <Separator className="bg-zinc-700 opacity-50" />
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center bg-zinc-900 rounded-full px-3 py-1 text-sm">
            <ShieldSlashIcon className="mr-1" size={14} />
            <span>{listEntry.blockedCount}</span>
          </div>

          <div className="flex items-center text-zinc-500 text-sm">
            <ClockIcon className="mr-1" size={14} />
            <span>{formattedDate}</span>
          </div>
        </div>

        <CardDetails {...listEntry} onDelete={listEntry.onDelete} />
      </div>
    </Card>
  );
}
