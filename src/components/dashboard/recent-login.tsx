import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { abbreviation, momentId } from "@/lib/utils";

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
            <AvatarImage
              className="scale-125 object-cover object-center"
              src={user.image ?? "/undefined"}
              alt="Avatar"
            />
            <AvatarFallback>{abbreviation(user.name)}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs font-medium text-muted-foreground md:hidden">
              {momentId(user.lastLoginAt).fromNow()}
            </p>
          </div>
          <p className="ml-auto hidden pl-4 text-right text-xs font-medium text-muted-foreground md:block">
            {momentId(user.lastLoginAt).fromNow()}
          </p>
        </div>
      ))}
    </div>
  );
}
