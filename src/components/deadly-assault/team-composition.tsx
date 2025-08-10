import { Avatar } from "@/components/ui/avatar";
import Image from "next/image";
import type { DeadlyAssaultRun } from "@/types/deadly-assault";

export function TeamComposition({ floor }: { floor: DeadlyAssaultRun }) {
  return (
    <div>
      <h4 className="font-medium mb-2">Team Composition</h4>
      <div className="flex flex-wrap gap-4">
        {floor.avatar_list.map((avatar) => (
          <div key={avatar.id} className="flex items-center space-x-2">
            <Avatar>
              <Image 
                src={avatar.role_square_url} 
                alt={`Character ${avatar.id}`}
                width={40}
                height={40}
                unoptimized
              />
            </Avatar>
            <div>
              <p className="text-sm font-medium">ID: {avatar.id}</p>
              <p className="text-xs text-muted-foreground">Lv.{avatar.level} • {avatar.rarity}</p>
            </div>
          </div>
        ))}
      </div>
      {floor.buddy && (
        <div className="mt-2">
          <p className="text-sm text-muted-foreground">Buddy</p>
          <div className="flex items-center space-x-2 mt-1">
            <Avatar>
              <Image 
                src={floor.buddy.bangboo_rectangle_url} 
                alt={`Buddy ${floor.buddy.id}`}
                width={40}
                height={40}
                unoptimized
              />
            </Avatar>
            <div>
              <p className="text-sm font-medium">ID: {floor.buddy.id}</p>
              <p className="text-xs text-muted-foreground">Lv.{floor.buddy.level} • {floor.buddy.rarity}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
