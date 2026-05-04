import { Database, UserPlus, Users, UsersRound, Workflow } from "lucide-svelte";

type NavIcon = typeof Workflow;

export const APP_ROUTE_IDS = [
  "builder",
  "data-sources",
  "team-members",
  "invite-partners",
  "manage-partners",
] as const;

export type NavRouteId = (typeof APP_ROUTE_IDS)[number];
export type NavPath = `/${NavRouteId}`;
export type NavSectionId = "main" | "ecosystem";

type NavSectionDefinition = {
  id: NavSectionId;
  heading: string;
  routeIds: readonly NavRouteId[];
  desktopSectionClass?: string;
  mobileSectionClass?: string;
  showCollapsedDivider?: boolean;
};

export type AppRouteDefinition = {
  href: NavPath;
  navLabel: string;
  icon: NavIcon;
};

export const APP_ROUTE_REGISTRY = {
  builder: {
    href: "/builder",
    navLabel: "Notification builder",
    icon: Workflow,
  },
  "data-sources": {
    href: "/data-sources",
    navLabel: "Data sources",
    icon: Database,
  },
  "team-members": {
    href: "/team-members",
    navLabel: "Team members",
    icon: Users,
  },
  "invite-partners": {
    href: "/invite-partners",
    navLabel: "Invite partners",
    icon: UserPlus,
  },
  "manage-partners": {
    href: "/manage-partners",
    navLabel: "Manage partners",
    icon: UsersRound,
  },
} as const satisfies Record<NavRouteId, AppRouteDefinition>;

export const APP_NAV_SECTION_DEFINITIONS = [
  {
    id: "main",
    heading: "My team",
    routeIds: ["builder", "data-sources", "team-members"],
    desktopSectionClass: "pt-2",
  },
  {
    id: "ecosystem",
    heading: "Ecosystem",
    routeIds: ["invite-partners", "manage-partners"],
    desktopSectionClass: "pt-6",
    mobileSectionClass: "pt-6",
    showCollapsedDivider: true,
  },
] as const satisfies readonly NavSectionDefinition[];

export const DEFAULT_ROUTE_ID: NavRouteId = "builder";
export const DEFAULT_ROUTE_HREF: NavPath =
  APP_ROUTE_REGISTRY[DEFAULT_ROUTE_ID].href;
