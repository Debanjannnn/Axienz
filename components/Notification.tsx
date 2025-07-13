"use client";

import { cn } from "@/lib/utils";
import { AnimatedList } from "@/components/magicui/animated-list";


interface Item {
  name: string;
  description: string;
  icon: string;
  color: string;
  time: string;
  status?: React.ReactNode;
}

let notifications = [
  {
    name: "Will Contract",
    description: "Active & Secure",
    time: "✓ Active",
    icon: "SC",
    color: "#1E86FF",
    status: <span className='text-green-400 text-xs'>Verified</span>,
  },
  {
    name: "Asset Distribution",
    description: "Automated",
    time: "Ready",
    icon: "AS",
    color: "#df500f",
    status: <span className='text-blue-400 text-xs'>Pending</span>,
  },
  {
    name: "Beneficiary Added",
    description: "New beneficiary assigned",
    time: "2m ago",
    icon: "BA",
    color: "#22c55e",
    status: <span className='text-green-400 text-xs'>New</span>,
  },
  {
    name: "Audit Passed",
    description: "Security audit successful",
    time: "3h ago",
    icon: "🛡️",
    color: "#2563eb",
    status: <span className='text-green-400 text-xs'>Passed</span>,
  },
];

notifications = Array.from({ length: 10 }, () => notifications).flat();

const Notification = ({ name, description, icon, color, time, status }: Item) => {
  return (
    <figure
      className={cn(
        "relative mx-auto min-h-fit w-full h-full cursor-pointer overflow-hidden rounded-3xl p-4",
        // glass theme styles
        "bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl transition-all duration-300 hover:bg-white/10"
      )}
    >
      <div className="flex flex-row items-center gap-3 h-full">
        <div
          className="flex size-10 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: color,
          }}
        >
          <span className="text-lg">{icon}</span>
        </div>
        <div className="flex flex-col overflow-hidden">
          <figcaption className="flex flex-row items-center whitespace-pre text-lg font-medium text-white ">
            <span className="text-sm sm:text-lg">{name}</span>
            <span className="mx-1">·</span>
            <span className="text-xs text-gray-300">{time}</span>
            {status && <span className="ml-2">{status}</span>}
          </figcaption>
          <p className="text-sm font-normal text-white/70">
            {description}
          </p>
        </div>
      </div>
    </figure>
  );
};

export default function AnimatedListDemo({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative flex h-[500px] w-full flex-col overflow-hidden p-2",
        className,
      )}
    >
      <AnimatedList>
        {notifications.map((item, idx) => (
          <Notification {...item} key={idx} />
        ))}
      </AnimatedList>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-background"></div>
    </div>
  );
}
