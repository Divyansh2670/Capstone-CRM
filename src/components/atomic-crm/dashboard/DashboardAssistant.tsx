import { formatDistanceToNow } from "date-fns";
import { Bot, Loader2, MessageCircle, Send, Sparkles, UserRound, X } from "lucide-react";
import { useMemo, useState } from "react";
import {
  useDataProvider,
  useGetIdentity,
  useNotify,
  useRefresh,
} from "ra-core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import { useConfigurationContext } from "../root/ConfigurationContext";
import type { Company, Contact, Deal, Task } from "../types";

type AssistantRole = "assistant" | "user";

type AssistantMessage = {
  id: string;
  role: AssistantRole;
  text: string;
  createdAt: string;
};

type Snapshot = {
  contacts: Contact[];
  companies: Company[];
  deals: Deal[];
  tasks: Task[];
  totals: {
    contacts: number;
    companies: number;
    deals: number;
    tasks: number;
    openTasks: number;
    doneTasks: number;
    overdueTasks: number;
  };
  dealsByStage: Array<{ stage: string; count: number }>;
};

const quickPrompts = [
  "How many deals are in each stage?",
  "Give me a CRM summary",
  "Add company Acme Labs",
  "Add contact John Doe email john@acme.com company Acme Labs",
];

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

const compactNumberFormatter = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumFractionDigits: 1,
});

export const DashboardAssistant = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const refresh = useRefresh();
  const { identity } = useGetIdentity();
  const { dealStages, dealCategories, contactGender } = useConfigurationContext();

  const [messages, setMessages] = useState<AssistantMessage[]>([
    {
      id: crypto.randomUUID(),
      role: "assistant",
      text: "I am your CRM assistant. I can answer questions from live CRM data and create contacts, companies, and deals when your instruction is clear.",
      createdAt: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isWorking, setIsWorking] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const canCreateRecords = useMemo(() => Boolean(identity?.id), [identity?.id]);

  const pushMessage = (role: AssistantRole, text: string) => {
    setMessages((current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        role,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  const fetchSnapshot = async (): Promise<Snapshot> => {
    const [contactsRes, companiesRes, dealsRes, tasksRes] = await Promise.all([
      dataProvider.getList<Contact>("contacts", {
        pagination: { page: 1, perPage: 500 },
        sort: { field: "last_seen", order: "DESC" },
        filter: {},
      }),
      dataProvider.getList<Company>("companies", {
        pagination: { page: 1, perPage: 500 },
        sort: { field: "name", order: "ASC" },
        filter: {},
      }),
      dataProvider.getList<Deal>("deals", {
        pagination: { page: 1, perPage: 500 },
        sort: { field: "updated_at", order: "DESC" },
        filter: {},
      }),
      dataProvider.getList<Task>("tasks", {
        pagination: { page: 1, perPage: 500 },
        sort: { field: "due_date", order: "ASC" },
        filter: {},
      }),
    ]);

    const now = new Date().toISOString();
    const openTasks = tasksRes.data.filter((task) => !task.done_date).length;
    const doneTasks = tasksRes.data.filter((task) => Boolean(task.done_date)).length;
    const overdueTasks = tasksRes.data.filter(
      (task) => !task.done_date && task.due_date < now,
    ).length;

    const stageLabelByValue = new Map(
      dealStages.map((stage) => [stage.value, stage.label]),
    );

    const stageCounts = dealsRes.data.reduce<Record<string, number>>((acc, deal) => {
      const key = deal.stage || "unknown";
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {});

    const dealsByStage = Object.entries(stageCounts)
      .map(([stage, count]) => ({
        stage: stageLabelByValue.get(stage) ?? stage,
        count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      contacts: contactsRes.data,
      companies: companiesRes.data,
      deals: dealsRes.data,
      tasks: tasksRes.data,
      totals: {
        contacts: contactsRes.total ?? contactsRes.data.length,
        companies: companiesRes.total ?? companiesRes.data.length,
        deals: dealsRes.total ?? dealsRes.data.length,
        tasks: tasksRes.total ?? tasksRes.data.length,
        openTasks,
        doneTasks,
        overdueTasks,
      },
      dealsByStage,
    };
  };

  const normalize = (value: string) => value.trim().toLowerCase();

  const findCompanyInMessage = (message: string, companies: Company[]) => {
    const normalizedMessage = normalize(message);
    return companies
      .filter((company) => normalizedMessage.includes(normalize(company.name)))
      .sort((a, b) => b.name.length - a.name.length)[0];
  };

  const answerFromSnapshot = (message: string, snapshot: Snapshot): string => {
    const normalizedMessage = normalize(message);

    if (
      normalizedMessage.includes("summary") ||
      normalizedMessage.includes("overview") ||
      normalizedMessage.includes("dashboard")
    ) {
      const topStages = snapshot.dealsByStage
        .slice(0, 3)
        .map((entry) => `${entry.stage}: ${entry.count}`)
        .join(", ");
      return [
        "Live CRM summary:",
        `- Contacts: ${compactNumberFormatter.format(snapshot.totals.contacts)}`,
        `- Companies: ${compactNumberFormatter.format(snapshot.totals.companies)}`,
        `- Deals: ${compactNumberFormatter.format(snapshot.totals.deals)}`,
        `- Tasks: ${compactNumberFormatter.format(snapshot.totals.tasks)} (${snapshot.totals.openTasks} open, ${snapshot.totals.doneTasks} done, ${snapshot.totals.overdueTasks} overdue)`,
        `- Top deal stages: ${topStages || "No deals yet"}`,
      ].join("\n");
    }

    if (
      normalizedMessage.includes("stage") ||
      normalizedMessage.includes("pipeline") ||
      normalizedMessage.includes("deals by stage")
    ) {
      if (!snapshot.dealsByStage.length) {
        return "There are currently no deals, so stage distribution is not available.";
      }
      return [
        "Deals by stage:",
        ...snapshot.dealsByStage.map((entry) => `- ${entry.stage}: ${entry.count}`),
      ].join("\n");
    }

    if (normalizedMessage.includes("total") || normalizedMessage.includes("how many")) {
      if (normalizedMessage.includes("contact")) {
        return `Total contacts: ${snapshot.totals.contacts}.`;
      }
      if (normalizedMessage.includes("company")) {
        return `Total companies: ${snapshot.totals.companies}.`;
      }
      if (normalizedMessage.includes("deal")) {
        return `Total deals: ${snapshot.totals.deals}.`;
      }
      if (normalizedMessage.includes("task")) {
        return `Total tasks: ${snapshot.totals.tasks}. Open: ${snapshot.totals.openTasks}, Done: ${snapshot.totals.doneTasks}, Overdue: ${snapshot.totals.overdueTasks}.`;
      }
    }

    if (normalizedMessage.includes("overdue") && normalizedMessage.includes("task")) {
      return `Overdue tasks: ${snapshot.totals.overdueTasks}.`;
    }

    if (normalizedMessage.includes("largest") || normalizedMessage.includes("biggest")) {
      const biggestDeal = snapshot.deals
        .filter((deal) => typeof deal.amount === "number")
        .sort((a, b) => (b.amount ?? 0) - (a.amount ?? 0))[0];
      if (!biggestDeal) {
        return "I cannot find any deal amount data yet.";
      }
      const company = snapshot.companies.find((item) => item.id === biggestDeal.company_id);
      return `Largest deal right now is \"${biggestDeal.name}\" at ${moneyFormatter.format(biggestDeal.amount ?? 0)}${company ? ` for ${company.name}` : ""}.`;
    }

    if (normalizedMessage.includes("company") && normalizedMessage.includes("deals")) {
      const targetCompany = findCompanyInMessage(message, snapshot.companies);
      if (targetCompany) {
        const companyDeals = snapshot.deals.filter(
          (deal) => String(deal.company_id) === String(targetCompany.id),
        );
        const totalAmount = companyDeals.reduce(
          (sum, deal) => sum + (deal.amount ?? 0),
          0,
        );
        return `${targetCompany.name} has ${companyDeals.length} deals with a total value of ${moneyFormatter.format(totalAmount)}.`;
      }
    }

    return "I cannot verify that from current CRM data without guessing. Ask me for totals, stage distribution, task status, top deals, or ask me to add a contact/company/deal with clear details.";
  };

  const extractNameAfterVerb = (message: string, noun: "contact" | "company" | "deal") => {
    const matcher = new RegExp(
      `(?:add|create)\\s+${noun}\\s+(.+?)(?:\\s+(?:with|for|at|email|company|amount|stage|category|website|phone|$))`,
      "i",
    );
    const match = message.match(matcher);
    return match?.[1]?.trim();
  };

  const createCompanyFromMessage = async (message: string) => {
    if (!canCreateRecords || !identity?.id) {
      return "I cannot create records because your user identity is not available in this session.";
    }

    const name = extractNameAfterVerb(message, "company") ??
      message.match(/company\s+(.+)$/i)?.[1]?.trim();

    if (!name) {
      return "To create a company safely, include a company name. Example: Add company Acme Labs.";
    }

    const websiteMatch = message.match(/website\s+([\w.-]+\.[a-z]{2,}(?:\/\S*)?)/i);
    const website = websiteMatch?.[1]
      ? `https://${websiteMatch[1].replace(/^https?:\/\//i, "")}`
      : undefined;

    const created = await dataProvider.create<Company>("companies", {
      data: {
        name,
        sales_id: identity.id,
        website,
      },
    });

    refresh();
    notify("Company created", { type: "info" });

    return `Company created: ${created.data.name} (id: ${created.data.id}).`;
  };

  const splitContactName = (fullName: string) => {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length < 2) {
      return null;
    }
    return {
      first_name: parts[0],
      last_name: parts.slice(1).join(" "),
    };
  };

  const createContactFromMessage = async (message: string, snapshot: Snapshot) => {
    if (!canCreateRecords || !identity?.id) {
      return "I cannot create records because your user identity is not available in this session.";
    }

    const email = message.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0];
    const explicitName = extractNameAfterVerb(message, "contact");
    const inferredName = explicitName ?? (email ? email.split("@")[0].replace(/[._-]/g, " ") : "");
    const splitName = splitContactName(inferredName);

    if (!splitName) {
      return "To create a contact safely, provide first and last name. Example: Add contact John Doe email john@acme.com.";
    }

    const matchedCompany = findCompanyInMessage(message, snapshot.companies);

    const created = await dataProvider.create<Contact>("contacts", {
      data: {
        ...splitName,
        sales_id: identity.id,
        company_id: matchedCompany?.id,
        email_jsonb: email ? [{ email, type: "Work" }] : [],
        phone_jsonb: [],
        tags: [],
        title: "",
        linkedin_url: null,
        first_seen: new Date().toISOString(),
        last_seen: new Date().toISOString(),
        has_newsletter: false,
        gender: contactGender[0]?.value ?? "nonbinary",
        status: "",
        background: "",
      },
    });

    refresh();
    notify("Contact created", { type: "info" });

    return `Contact created: ${created.data.first_name} ${created.data.last_name}${matchedCompany ? ` at ${matchedCompany.name}` : ""}.`;
  };

  const parseAmount = (message: string): number => {
    const amountMatch = message.match(/amount\s+([\d,]+(?:\.\d+)?)/i);
    if (!amountMatch) {
      return 0;
    }
    const parsed = Number(amountMatch[1].replaceAll(",", ""));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const parseStage = (message: string) => {
    const normalizedMessage = normalize(message);
    return dealStages.find(
      (stage) =>
        normalizedMessage.includes(normalize(stage.label)) ||
        normalizedMessage.includes(normalize(stage.value)),
    );
  };

  const createDealFromMessage = async (message: string, snapshot: Snapshot) => {
    if (!canCreateRecords || !identity?.id) {
      return "I cannot create records because your user identity is not available in this session.";
    }

    const name = extractNameAfterVerb(message, "deal");
    if (!name) {
      return "To create a deal safely, include a deal name. Example: Add deal Website Redesign for Acme Labs amount 25000 stage Opportunity.";
    }

    const targetCompany = findCompanyInMessage(message, snapshot.companies);
    if (!targetCompany) {
      return "I need an existing company name in your command to create a deal. Example: Add deal Website Redesign for Acme Labs amount 25000.";
    }

    const stage = parseStage(message)?.value ?? dealStages[0]?.value ?? "opportunity";
    const category =
      dealCategories.find((value) => normalize(message).includes(normalize(value))) ??
      dealCategories[0] ??
      "Other";

    const now = new Date().toISOString();
    const closingDateMatch = message.match(/(?:close|closing|date)\s+(\d{4}-\d{2}-\d{2})/i);

    const created = await dataProvider.create<Deal>("deals", {
      data: {
        name,
        company_id: targetCompany.id,
        contact_ids: [],
        category,
        stage,
        description: "Created by dashboard assistant",
        amount: parseAmount(message),
        created_at: now,
        updated_at: now,
        expected_closing_date: closingDateMatch?.[1] ?? now.split("T")[0],
        sales_id: identity.id,
        index: 0,
      },
    });

    refresh();
    notify("Deal created", { type: "info" });

    return `Deal created: ${created.data.name} for ${targetCompany.name} in stage ${stage}.`;
  };

  const handleAssistantRequest = async (message: string) => {
    const snapshot = await fetchSnapshot();
    const normalizedMessage = normalize(message);

    if (normalizedMessage.includes("add contact") || normalizedMessage.includes("create contact")) {
      return createContactFromMessage(message, snapshot);
    }

    if (normalizedMessage.includes("add company") || normalizedMessage.includes("create company")) {
      return createCompanyFromMessage(message);
    }

    if (normalizedMessage.includes("add deal") || normalizedMessage.includes("create deal")) {
      return createDealFromMessage(message, snapshot);
    }

    return answerFromSnapshot(message, snapshot);
  };

  const sendMessage = async (rawInput?: string) => {
    const message = (rawInput ?? input).trim();
    if (!message || isWorking) {
      return;
    }

    pushMessage("user", message);
    setInput("");
    setIsWorking(true);

    try {
      const response = await handleAssistantRequest(message);
      pushMessage("assistant", response);
    } catch (error) {
      const fallback =
        error instanceof Error
          ? `I could not complete that request safely: ${error.message}`
          : "I could not complete that request safely due to an unexpected error.";
      pushMessage("assistant", fallback);
    } finally {
      setIsWorking(false);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[1px]" onClick={() => setIsOpen(false)} />
      ) : null}

      {isOpen ? (
        <Card className="fixed right-4 bottom-22 z-50 w-[min(94vw,31rem)] h-[min(80vh,45rem)] border-border/80 bg-card/92 backdrop-blur-md shadow-[0_24px_48px_-26px_oklch(0.24_0.03_246/.55)]">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between gap-3 text-base">
              <span className="inline-flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Dashboard AI Assistant
              </span>
              <div className="inline-flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Live data only</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex h-[calc(100%-5.25rem)] flex-col gap-3">
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((prompt) => (
                <Button
                  key={prompt}
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => sendMessage(prompt)}
                  disabled={isWorking}
                >
                  {prompt}
                </Button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto rounded-xl border border-border/70 bg-background/80 p-3">
              <div className="space-y-3">
                {messages.map((message) => {
                  const isAssistant = message.role === "assistant";
                  return (
                    <div
                      key={message.id}
                      className={`flex gap-2 ${isAssistant ? "justify-start" : "justify-end"}`}
                    >
                      {isAssistant ? (
                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary/18 text-primary">
                          <Bot className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                      <div
                        className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-line ${
                          isAssistant
                            ? "bg-secondary/85 text-secondary-foreground"
                            : "bg-primary text-primary-foreground"
                        }`}
                      >
                        {message.text}
                        <div
                          className={`mt-1 text-[11px] ${
                            isAssistant
                              ? "text-secondary-foreground/70"
                              : "text-primary-foreground/75"
                          }`}
                        >
                          {formatDistanceToNow(new Date(message.createdAt), {
                            addSuffix: true,
                          })}
                        </div>
                      </div>
                      {!isAssistant ? (
                        <span className="mt-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                          <UserRound className="h-3.5 w-3.5" />
                        </span>
                      ) : null}
                    </div>
                  );
                })}

                {isWorking ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Reading live CRM data...
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about metrics or say: Add contact Jane Doe email jane@acme.com"
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    void sendMessage();
                  }
                }}
                disabled={isWorking}
              />
              <Button type="button" onClick={() => sendMessage()} disabled={isWorking}>
                {isWorking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Send
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : null}

      <Button
        type="button"
        size="icon"
        className="fixed right-0 bottom-8 z-50 h-13 w-13 translate-x-1/3 rounded-full border border-border/70 bg-card text-primary shadow-[0_16px_34px_-18px_oklch(0.24_0.03_246/.5)]"
        onClick={() => setIsOpen((open) => !open)}
        aria-label="Open AI assistant"
      >
        <MessageCircle className="h-5 w-5" />
      </Button>
    </>
  );
};
