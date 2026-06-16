import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, FileText, TrendingUp, MessageSquare, Mail, Globe, Sparkles, AlertCircle, CheckCircle2, Clock } from "lucide-react";

type Customer = {
  id: string;
  name: string;
  company: string;
  email: string;
  country: string;
  source: "whatsapp" | "email" | "web_form" | "instagram";
  intent: "high" | "medium" | "low";
  status: "new" | "contacted" | "qualified" | "closed";
  lastContact: string;
  message: string;
};

type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  source: string;
  language: string;
  status: "pending_review" | "approved" | "rejected" | "published";
  createdAt: string;
};

type Stats = {
  totalCustomers: number;
  newCustomersToday: number;
  pendingBlogs: number;
  activeConversations: number;
  weeklyRevenue: number;
  conversionRate: number;
};

// Mock API endpoints — these will hit Hermes backend later
const API_BASE = "/api/admin";

async function fetchStats(): Promise<Stats> {
  const res = await fetch(`${API_BASE}/stats`).catch(() => null);
  if (!res || !res.ok) {
    return {
      totalCustomers: 247,
      newCustomersToday: 12,
      pendingBlogs: 3,
      activeConversations: 8,
      weeklyRevenue: 86400,
      conversionRate: 0.18,
    };
  }
  return res.json();
}

async function fetchCustomers(): Promise<Customer[]> {
  const res = await fetch(`${API_BASE}/customers`).catch(() => null);
  if (!res || !res.ok) {
    return [
      {
        id: "c1",
        name: "Anna Schmidt",
        company: "Berlin Cashmere GmbH",
        email: "anna@berlin-cashmere.de",
        country: "Germany",
        source: "whatsapp",
        intent: "high",
        status: "qualified",
        lastContact: "2026-06-15T10:32:00Z",
        message: "Need 500pcs cashmere scarves, EU delivery by Sept",
      },
      {
        id: "c2",
        name: "James Liu",
        company: "Pacific Knitwear",
        email: "j.liu@pacificknit.com",
        country: "USA",
        source: "email",
        intent: "medium",
        status: "contacted",
        lastContact: "2026-06-15T08:15:00Z",
        message: "Interested in low-MOQ cashmere sweater line",
      },
      {
        id: "c3",
        name: "Yuki Tanaka",
        company: "Tokyo Apparel Co",
        email: "yuki@tokyo-apparel.jp",
        country: "Japan",
        source: "web_form",
        intent: "low",
        status: "new",
        lastContact: "2026-06-15T07:00:00Z",
        message: "Just browsing, looking for samples",
      },
    ];
  }
  return res.json();
}

async function fetchPendingBlogs(): Promise<BlogPost[]> {
  const res = await fetch(`${API_BASE}/blogs/pending`).catch(() => null);
  if (!res || !res.ok) {
    return [
      {
        id: "b1",
        title: "2026 Cashmere Industry Trends: Sustainability and Traceability",
        excerpt: "Industry is shifting toward traceable supply chains. Consumers increasingly demand proof of origin...",
        source: "https://fashionista.com/cashmere-trends-2026",
        language: "en",
        status: "pending_review",
        createdAt: "2026-06-15T09:00:00Z",
      },
      {
        id: "b2",
        title: "How Inner Mongolia Cashmere Maintains Its Premium Quality",
        excerpt: "The harsh climate produces the longest, finest fibers. Local herders have refined their techniques over generations...",
        source: "https://textileworld.com/inner-mongolia-quality",
        language: "en",
        status: "pending_review",
        createdAt: "2026-06-15T08:30:00Z",
      },
      {
        id: "b3",
        title: "2026 羊绒行业趋势：可持续与可追溯",
        excerpt: "行业正向可追溯供应链转型。消费者越来越要求来源证明...",
        source: "Internal research",
        language: "zh",
        status: "pending_review",
        createdAt: "2026-06-15T08:00:00Z",
      },
    ];
  }
  return res.json();
}

function StatCard({ icon: Icon, label, value, sub }: { icon: any; label: string; value: string | number; sub?: string }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function IntentBadge({ intent }: { intent: Customer["intent"] }) {
  const map = {
    high: { label: "高意向", variant: "default" as const, className: "bg-green-100 text-green-800" },
    medium: { label: "中等", variant: "secondary" as const, className: "bg-yellow-100 text-yellow-800" },
    low: { label: "低", variant: "outline" as const, className: "bg-gray-100 text-gray-600" },
  };
  const cfg = map[intent];
  return <Badge className={cfg.className}>{cfg.label}</Badge>;
}

function StatusBadge({ status }: { status: Customer["status"] }) {
  const map = {
    new: { label: "新", icon: Sparkles },
    contacted: { label: "已联系", icon: MessageSquare },
    qualified: { label: "已筛选", icon: CheckCircle2 },
    closed: { label: "已成交", icon: CheckCircle2 },
  };
  const cfg = map[status];
  const Icon = cfg.icon;
  return (
    <Badge variant="outline" className="gap-1">
      <Icon className="h-3 w-3" />
      {cfg.label}
    </Badge>
  );
}

function SourceBadge({ source }: { source: Customer["source"] }) {
  const map = {
    whatsapp: { label: "WhatsApp", icon: MessageSquare, color: "text-green-600" },
    email: { label: "邮件", icon: Mail, color: "text-blue-600" },
    web_form: { label: "网站", icon: Globe, color: "text-purple-600" },
    instagram: { label: "Instagram", icon: Globe, color: "text-pink-600" },
  };
  const cfg = map[source];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs ${cfg.color}`}>
      <Icon className="h-3 w-3" />
      {cfg.label}
    </span>
  );
}

export default function Admin() {
  const [search, setSearch] = useState("");

  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: fetchStats });
  const { data: customers = [] } = useQuery({ queryKey: ["admin-customers"], queryFn: fetchCustomers });
  const { data: blogs = [] } = useQuery({ queryKey: ["admin-blogs"], queryFn: fetchPendingBlogs });

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.company.toLowerCase().includes(search.toLowerCase()) ||
      c.country.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-semibold">管理控制台</h1>
            <Badge variant="outline" className="ml-2">Hermes 智能体</Badge>
          </div>
          <a href="/" className="text-sm text-muted-foreground hover:underline">
            返回网站 →
          </a>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <StatCard icon={Users} label="客户总数" value={stats?.totalCustomers ?? "—"} sub={`今日 +${stats?.newCustomersToday ?? 0}`} />
          <StatCard icon={FileText} label="待审博客" value={stats?.pendingBlogs ?? "—"} sub="AI 自动生成" />
          <StatCard icon={MessageSquare} label="活跃对话" value={stats?.activeConversations ?? "—"} sub="WhatsApp + 邮件" />
          <StatCard icon={TrendingUp} label="本周询盘" value={stats?.weeklyRevenue ?? "—"} />
          <StatCard icon={CheckCircle2} label="转化率" value={`${((stats?.conversionRate ?? 0) * 100).toFixed(1)}%`} />
          <StatCard icon={Clock} label="智能体状态" value="运行中" sub="5 个智能体在线" />
        </div>

        {/* Main tabs */}
        <Tabs defaultValue="customers" className="space-y-4">
          <TabsList>
            <TabsTrigger value="customers">客户</TabsTrigger>
            <TabsTrigger value="blogs">博客审核</TabsTrigger>
            <TabsTrigger value="agents">智能体</TabsTrigger>
            <TabsTrigger value="settings">设置</TabsTrigger>
          </TabsList>

          {/* Customers tab */}
          <TabsContent value="customers" className="space-y-4">
            <div className="flex items-center gap-2">
              <Input
                placeholder="搜索客户姓名、公司、国家..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="max-w-sm"
              />
              <Button>导出 CSV</Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>客户列表</CardTitle>
                <CardDescription>智能体自动从 WhatsApp / 邮件 / 网站表单聚合</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredCustomers.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-start justify-between gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-medium">{c.name}</span>
                          <span className="text-sm text-muted-foreground">·</span>
                          <span className="text-sm">{c.company}</span>
                          <SourceBadge source={c.source} />
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{c.message}</p>
                        <div className="text-xs text-muted-foreground mt-1">
                          {c.email} · {c.country} · {new Date(c.lastContact).toLocaleString("zh-CN")}
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2 shrink-0">
                        <IntentBadge intent={c.intent} />
                        <StatusBadge status={c.status} />
                        <Button size="sm" variant="outline">查看</Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blogs tab */}
          <TabsContent value="blogs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>博客审核队列</CardTitle>
                <CardDescription>
                  AI 内容智能体自动抓取、改写、翻译。审核通过后自动发布。
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {blogs.map((b) => (
                    <div key={b.id} className="p-4 border rounded-lg space-y-2">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold">{b.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{b.excerpt}</p>
                          <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                            <Badge variant="outline" className="text-xs">{b.language.toUpperCase()}</Badge>
                            <span>来源：{b.source}</span>
                            <span>·</span>
                            <span>{new Date(b.createdAt).toLocaleString("zh-CN")}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button size="sm" variant="outline">预览</Button>
                          <Button size="sm" variant="outline">拒绝</Button>
                          <Button size="sm">通过</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Agents tab */}
          <TabsContent value="agents" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { name: "内容智能体", desc: "博客自动编辑、产品描述", status: "运行", icon: FileText, color: "bg-blue-100 text-blue-800" },
                { name: "客户智能体", desc: "智能沟通、自动筛选", status: "运行", icon: Users, color: "bg-green-100 text-green-800" },
                { name: "数据智能体", desc: "产品聚合、价格监控", status: "运行", icon: TrendingUp, color: "bg-purple-100 text-purple-800" },
                { name: "社交智能体", desc: "Instagram / Facebook 同步", status: "未启用", icon: Globe, color: "bg-gray-100 text-gray-600" },
                { name: "运营智能体", desc: "报告、告警、A/B 测试", status: "运行", icon: Sparkles, color: "bg-amber-100 text-amber-800" },
              ].map((agent) => (
                <Card key={agent.name}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <agent.icon className="h-8 w-8 text-muted-foreground" />
                      <Badge className={agent.color}>{agent.status}</Badge>
                    </div>
                    <CardTitle className="text-base">{agent.name}</CardTitle>
                    <CardDescription>{agent.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button variant="outline" size="sm" className="w-full">配置</Button>
                  </CardContent>
                </Card>
              ))}
              <Card className="border-dashed flex items-center justify-center min-h-[180px]">
                <Button variant="ghost">+ 添加智能体</Button>
              </Card>
            </div>
          </TabsContent>

          {/* Settings tab */}
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>系统设置</CardTitle>
                <CardDescription>Hermes 后端、数据库、第三方集成</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">Hermes 后端 API</div>
                    <div className="text-sm text-muted-foreground">未配置</div>
                  </div>
                  <Button variant="outline">配置</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">飞书通知</div>
                    <div className="text-sm text-muted-foreground">已接入</div>
                  </div>
                  <Button variant="outline">配置</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">WhatsApp Business</div>
                    <div className="text-sm text-muted-foreground">未配置</div>
                  </div>
                  <Button variant="outline">配置</Button>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">数据库 (Drizzle + MySQL)</div>
                    <div className="text-sm text-muted-foreground">未连接</div>
                  </div>
                  <Button variant="outline">配置</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Hermes connection notice */}
        <div className="mt-8 p-4 border border-dashed rounded-lg bg-muted/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <h4 className="font-medium">Hermes 后端未连接</h4>
              <p className="text-sm text-muted-foreground mt-1">
                当前显示的是 mock 数据。运行 Hermes 服务后，所有数据将自动从真实的智能体工作流同步。
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                启动命令：<code className="bg-background px-2 py-1 rounded">hermes gateway run</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}