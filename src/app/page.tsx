import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

export default function Home() {
  return (
    <div className="flex flex-col gap-8 py-12 px-4 ">
      <div className="flex-1 space-y-4">
        <h2 className="text-3xl font-bold tracking-tight">Battle Records Overview</h2>
        <p className="text-muted-foreground">
          View and analyze your Zenless Zone Zero battle performance data.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 w-full">
        <Link href="/deadly-assault" className="w-full">
          <Card className="hover:bg-card transition-colors">
            <CardHeader>
              <CardTitle>Deadly Assault</CardTitle>
              <CardDescription>View your performance in Deadly Assault challenges</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Track scores, star ratings, and boss completions</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/shiyu-defense" className="w-full">
          <Card className="hover:bg-card transition-colors">
            <CardHeader>
              <CardTitle>Shiyu Defense</CardTitle>
              <CardDescription>View your Shiyu Defense progress and ratings</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Monitor floor completions, team compositions, and battle times</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/void-front" className="w-full">
          <Card className="hover:bg-card transition-colors">
            <CardHeader>
              <CardTitle>Void Front</CardTitle>
              <CardDescription>View your Void Front battle challenges and scores</CardDescription>
            </CardHeader>
            <CardContent>
              <p>Track challenge progress, team compositions, and boss battles</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
