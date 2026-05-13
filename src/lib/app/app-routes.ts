import {
  Bell,
  ContactRound,
  Database,
  Globe2,
  Hammer,
  KeyRound,
  UserPlus,
  UsersRound,
  Workflow,
} from "lucide-svelte";

type NavIcon = typeof Workflow;

export const APP_ROUTE_IDS = [
  "formats",
  "builder",
  "data-sources",
  "external-data",
  "team",
  "invite-partners",
  "manage-partners",
  "data-access",
] as const;

export type NavRouteId = (typeof APP_ROUTE_IDS)[number];
export type NavPath = `/${NavRouteId}`;
export type NavSectionId = "formats" | "main" | "ecosystem";

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
  hideOnMobile?: boolean;
};

export const APP_ROUTE_REGISTRY = {
  "formats": {
    href: "/formats",
    navLabel: "My formats",
    icon: Bell,
  },
  builder: {
    href: "/builder",
    navLabel: "Format builder",
    icon: Hammer,
    hideOnMobile: true,
  },
  "data-sources": {
    href: "/data-sources",
    navLabel: "Data sources",
    icon: Database,
  },
  "external-data": {
    href: "/external-data",
    navLabel: "External data",
    icon: Globe2,
  },
  team: {
    href: "/team",
    navLabel: "Team",
    icon: ContactRound,
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
  "data-access": {
    href: "/data-access",
    navLabel: "Data access",
    icon: KeyRound,
  },
} as const satisfies Record<NavRouteId, AppRouteDefinition>;

export const APP_NAV_SECTION_DEFINITIONS = [
  {
    id: "formats",
    heading: "Formats",
    routeIds: ["builder", "formats"],
    desktopSectionClass: "pt-2",
  },
  {
    id: "main",
    heading: "My team",
    routeIds: ["data-sources", "external-data", "team"],
    desktopSectionClass: "pt-6",
    mobileSectionClass: "pt-6",
    showCollapsedDivider: true,
  },
  {
    id: "ecosystem",
    heading: "Ecosystem",
    routeIds: ["invite-partners", "manage-partners", "data-access"],
    desktopSectionClass: "pt-6",
    mobileSectionClass: "pt-6",
    showCollapsedDivider: true,
  },
] as const satisfies readonly NavSectionDefinition[];

export const DEFAULT_ROUTE_ID: NavRouteId = "builder";
export const DEFAULT_ROUTE_HREF: NavPath =
  APP_ROUTE_REGISTRY[DEFAULT_ROUTE_ID].href;
