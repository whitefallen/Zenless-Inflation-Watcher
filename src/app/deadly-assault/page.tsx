import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getLatestDeadlyAssaultData } from "@/lib/deadly-assault"
import { FloorDetailCard } from "@/components/deadly-assault/floor-detail-card"
import { TeamsOverview } from "@/components/deadly-assault/teams-overview"
import { percentile } from "@/lib/utils"

export default async function DeadlyAssaultPage() {
  const data = await getLatestDeadlyAssaultData();
  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col gap-8 container mx-auto py-12 px-4 max-w-5xl">
        <div className="flex flex-col gap-2 text-center pb-8">
          <h1 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Deadly Assault
          </h1>
          <p className="text-muted-foreground text-lg">
            View and analyze your Deadly Assault performance data.
          </p>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="mx-auto">
            <TabsList className="inline-flex h-11 items-center justify-center rounded-lg bg-muted/50 p-1">
              <TabsTrigger value="overview" className="min-w-[120px]">Overview</TabsTrigger>
              <TabsTrigger value="history" className="min-w-[120px]">History</TabsTrigger>
              <TabsTrigger value="teams" className="min-w-[120px]">Teams</TabsTrigger>
              <TabsTrigger value="floors" className="min-w-[120px]">Bosses</TabsTrigger>
            </TabsList>
          </div>
        <TabsContent value="overview" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 px-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-muted/30">
                <CardTitle className="text-base font-semibold text-purple-600">
                  Total Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.data.total_score || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Stars
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data?.data.total_star || 'N/A'}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Rank Percent
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.data.rank_percent ? percentile(data.data.rank_percent) : 'N/A'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Run Count
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {data?.data.list?.length || 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="history" className="mt-6">
          <Card className="max-w-2xl mx-auto hover:shadow-lg transition-shadow">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="text-xl text-purple-600">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span>Last Run:</span>
                  <span>{data?.metadata?.exportDate ? new Date(data.metadata.exportDate).toLocaleDateString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Best Score:</span>
                  <span>{data?.data.total_score || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span>UID:</span>
                  <span>{data?.metadata?.uid || 'N/A'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="teams" className="mt-6">
          <TeamsOverview floors={data?.data.list || []} />
        </TabsContent>
        <TabsContent value="floors" className="mt-6">
          <div className="space-y-8 max-w-4xl mx-auto">
            {data?.data.list.map((run, index) => (
              <FloorDetailCard key={index} floor={run} />
            )) || (
              <div className="text-center text-muted-foreground py-8">
                No run data available
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
      </div>
    </div>
  )
}
