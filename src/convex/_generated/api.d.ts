/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as builder from "../builder.js";
import type * as builderEmailValidators from "../builderEmailValidators.js";
import type * as builderRuntime from "../builderRuntime.js";
import type * as builderSessionAccess from "../builderSessionAccess.js";
import type * as builderSessionAppState from "../builderSessionAppState.js";
import type * as builderSessionCore from "../builderSessionCore.js";
import type * as builderSessionJobRuns from "../builderSessionJobRuns.js";
import type * as builderSessionJobs from "../builderSessionJobs.js";
import type * as builderSessionMaintenance from "../builderSessionMaintenance.js";
import type * as builderSessionOutputEvents from "../builderSessionOutputEvents.js";
import type * as builderSessions from "../builderSessions.js";
import type * as crons from "../crons.js";
import type * as devSeed from "../devSeed.js";
import type * as formatRecipients from "../formatRecipients.js";
import type * as health from "../health.js";
import type * as opportunityFormatReadiness from "../opportunityFormatReadiness.js";
import type * as opportunityFormats from "../opportunityFormats.js";
import type * as teamMemberIdentity from "../teamMemberIdentity.js";
import type * as teamMembers from "../teamMembers.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  builder: typeof builder;
  builderEmailValidators: typeof builderEmailValidators;
  builderRuntime: typeof builderRuntime;
  builderSessionAccess: typeof builderSessionAccess;
  builderSessionAppState: typeof builderSessionAppState;
  builderSessionCore: typeof builderSessionCore;
  builderSessionJobRuns: typeof builderSessionJobRuns;
  builderSessionJobs: typeof builderSessionJobs;
  builderSessionMaintenance: typeof builderSessionMaintenance;
  builderSessionOutputEvents: typeof builderSessionOutputEvents;
  builderSessions: typeof builderSessions;
  crons: typeof crons;
  devSeed: typeof devSeed;
  formatRecipients: typeof formatRecipients;
  health: typeof health;
  opportunityFormatReadiness: typeof opportunityFormatReadiness;
  opportunityFormats: typeof opportunityFormats;
  teamMemberIdentity: typeof teamMemberIdentity;
  teamMembers: typeof teamMembers;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
