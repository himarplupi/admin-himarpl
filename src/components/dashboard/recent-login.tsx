import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { abbreviation } from "@/lib/utils";

export function RecentLogin({
  data,
}: {
  data: {
    name: string | null;
    image: string | null;
    id: string;
    email: string | null;
    lastLoginAt: Date | null;
  }[];
}) {
  return (
    <div className="w-full space-y-8">
      {data.map((user) => (
        <div key={user.id} className="flex items-center">
          <Avatar className="h-9 w-9">
            <AvatarImage src="/avatars/01.png" alt="Avatar" />
            <AvatarFallback>{abbreviation(user.name)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-sm font-medium text-muted-foreground md:hidden">
              {user.lastLoginAt?.toLocaleDateString("id-ID", {
                day: "2-digit",
                month: "long",
                weekday: "long",
                hour: "numeric",
                minute: "numeric",
                second: "numeric",
              })}
            </p>
          </div>
          <p className="ml-auto hidden pl-4 text-right text-sm font-medium text-muted-foreground md:block">
            {user.lastLoginAt?.toLocaleDateString("id-ID", {
              day: "2-digit",
              month: "long",
              weekday: "long",
              hour: "numeric",
              minute: "numeric",
              second: "numeric",
            })}
          </p>
        </div>
      ))}
    </div>
  );
}
