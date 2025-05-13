
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { BookCopy, Users, BarChart3, Settings, Activity } from 'lucide-react'; // Added Activity

export default function AdminDashboardPage() {
  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
        <p className="text-muted-foreground">Welcome to the Parenting Pathways Admin Panel.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Program Management
            </CardTitle>
            <BookCopy className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Programs</div>
            <p className="text-xs text-muted-foreground mt-1">
              Create, edit, and manage educational programs.
            </p>
            <Button asChild className="mt-4 w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
              <Link href="/admin/programs">Manage Programs</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              User Management
            </CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Users</div>
            <p className="text-xs text-muted-foreground mt-1">
              View and manage user accounts.
            </p>
             <Button asChild className="mt-4 w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Analytics
            </CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Data & Analytics</div>
            <p className="text-xs text-muted-foreground mt-1">
              Track engagement and program effectiveness.
            </p>
            <Button asChild className="mt-4 w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/admin/analytics">View Analytics</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card className="shadow-lg hover:shadow-xl transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Program Progress
            </CardTitle>
            <Activity className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">User Progress</div>
            <p className="text-xs text-muted-foreground mt-1">
              Monitor user participation and completion.
            </p>
            <Button asChild className="mt-4 w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                <Link href="/admin/program-progress">Track Progress</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-xl transition-shadow opacity-50 cursor-not-allowed">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-primary">
              Content Builder
            </CardTitle>
            <Settings className="h-5 w-5 text-muted-foreground" /> {/* Using Settings as placeholder icon */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Content Tools</div>
            <p className="text-xs text-muted-foreground mt-1">
              Tools for creating videos, checklists, scenarios (Coming Soon).
            </p>
            <Button disabled className="mt-4 w-full sm:w-auto">Open Builder</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
