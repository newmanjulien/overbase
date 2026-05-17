import BuildingIcon from "phosphor-svelte/lib/BuildingIcon";
import ChatTeardropIcon from "phosphor-svelte/lib/ChatTeardropIcon";
import CloudIcon from "phosphor-svelte/lib/CloudIcon";
import FolderSimpleIcon from "phosphor-svelte/lib/FolderSimpleIcon";
import FoldersIcon from "phosphor-svelte/lib/FoldersIcon";
import HardDriveIcon from "phosphor-svelte/lib/HardDriveIcon";
import KeyIcon from "phosphor-svelte/lib/KeyIcon";
import ListPlusIcon from "phosphor-svelte/lib/ListPlusIcon";
import UsersIcon from "phosphor-svelte/lib/UsersIcon";
import type {
  PhosphorIcon,
  PhosphorIconProps,
} from "$lib/components/icons/types";

export type RouteIconProps = PhosphorIconProps;
export type RouteIcon = PhosphorIcon;

export const APP_ROUTE_IDS = [
  "formats",
  "builders",
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
    icon: FolderSimpleIcon,
  },
  builders: {
    href: "/builders",
    navLabel: "Format builders",
    icon: ChatTeardropIcon,
    hideOnMobile: true,
  },
  "data-sources": {
    href: "/data-sources",
    navLabel: "Data sources",
    icon: HardDriveIcon,
  },
  "external-data": {
    href: "/external-data",
    navLabel: "External data",
    icon: CloudIcon,
  },
  team: {
    href: "/team",
    navLabel: "Team",
    icon: UsersIcon,
  },
  "team-formats": {
    href: "/team-formats",
    navLabel: "Team formats",
    icon: FoldersIcon,
  },
  "invite-partners": {
    href: "/invite-partners",
    navLabel: "Invite partners",
    icon: ListPlusIcon,
  },
  "manage-partners": {
    href: "/manage-partners",
    navLabel: "Manage partners",
    icon: BuildingIcon,
  },
  "data-access": {
    href: "/data-access",
    navLabel: "Data access",
    icon: KeyIcon,
  },
} as const satisfies Record<NavRouteId, AppRouteDefinition>;

export const APP_NAV_SECTION_DEFINITIONS = [
  {
    id: "formats",
    heading: "Opportunity formats",
    routeIds: ["builders", "formats"],
    desktopSectionClass: "pt-2",
  },
  {
    id: "main",
    heading: "Workspace",
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

export const DEFAULT_ROUTE_ID: NavRouteId = "builders";
export const DEFAULT_ROUTE_HREF: NavPath =
  APP_ROUTE_REGISTRY[DEFAULT_ROUTE_ID].href;
