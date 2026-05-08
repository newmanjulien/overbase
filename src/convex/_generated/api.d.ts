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
import type * as builderSessionAccess from "../builderSessionAccess.js";
import type * as builderSessionAppState from "../builderSessionAppState.js";
import type * as builderSessionCore from "../builderSessionCore.js";
import type * as builderSessionJobRuns from "../builderSessionJobRuns.js";
import type * as builderSessionJobs from "../builderSessionJobs.js";
import type * as builderSessionMaintenance from "../builderSessionMaintenance.js";
import type * as builderSessionOutputEvents from "../builderSessionOutputEvents.js";
import type * as builderSessions from "../builderSessions.js";
import type * as crons from "../crons.js";
import type * as health from "../health.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  builder: typeof builder;
  builderEmailValidators: typeof builderEmailValidators;
  builderSessionAccess: typeof builderSessionAccess;
  builderSessionAppState: typeof builderSessionAppState;
  builderSessionCore: typeof builderSessionCore;
  builderSessionJobRuns: typeof builderSessionJobRuns;
  builderSessionJobs: typeof builderSessionJobs;
  builderSessionMaintenance: typeof builderSessionMaintenance;
  builderSessionOutputEvents: typeof builderSessionOutputEvents;
  builderSessions: typeof builderSessions;
  crons: typeof crons;
  health: typeof health;
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
