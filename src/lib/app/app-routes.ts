import Building from "phosphor-svelte/lib/Building";
import ChatTeardrop from "phosphor-svelte/lib/ChatTeardrop";
import Cloud from "phosphor-svelte/lib/Cloud";
import FolderSimple from "phosphor-svelte/lib/FolderSimple";
import Folders from "phosphor-svelte/lib/Folders";
import HardDrive from "phosphor-svelte/lib/HardDrive";
import Key from "phosphor-svelte/lib/Key";
import ListPlus from "phosphor-svelte/lib/ListPlus";
import Users from "phosphor-svelte/lib/Users";
import type { PhosphorIcon, PhosphorIconProps } from "$lib/components/icons/types";

export type RouteIconProps = PhosphorIconProps;
export type RouteIcon = PhosphorIcon;

export const APP_ROUTE_IDS = [
  "formats",
  "builder",
  "data-sources",
  "external-data",
  "team",
  "team-formats",
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
  icon: RouteIcon;
  hideOnMobile?: boolean;
};

export const APP_ROUTE_REGISTRY = {
  formats: {
    href: "/formats",
    navLabel: "My formats",
    icon: FolderSimple,
  },
  builder: {
    href: "/builder",
    navLabel: "Format builder",
    icon: ChatTeardrop,
    hideOnMobile: true,
  },
  "data-sources": {
    href: "/data-sources",
    navLabel: "Data sources",
    icon: HardDrive,
  },
  "external-data": {
    href: "/external-data",
    navLabel: "External data",
    icon: Cloud,
  },
  team: {
    href: "/team",
    navLabel: "Team",
    icon: Users,
  },
  "team-formats": {
    href: "/team-formats",
    navLabel: "Team formats",
    icon: Folders,
  },
  "invite-partners": {
    href: "/invite-partners",
    navLabel: "Invite partners",
    icon: ListPlus,
  },
  "manage-partners": {
    href: "/manage-partners",
    navLabel: "Manage partners",
    icon: Building,
  },
  "data-access": {
    href: "/data-access",
    navLabel: "Data access",
    icon: Key,
  },
} as const satisfies Record<NavRouteId, AppRouteDefinition>;

export const APP_NAV_SECTION_DEFINITIONS = [
  {
    id: "formats",
    heading: "Opportunity formats",
    routeIds: ["builder", "formats"],
    desktopSectionClass: "pt-2",
  },
  {
    id: "main",
    heading: "My team",
    routeIds: ["data-sources", "external-data", "team", "team-formats"],
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
