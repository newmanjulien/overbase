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
import type * as builderAdmin from "../builderAdmin.js";
import type * as builderContent from "../builderContent.js";
import type * as builderEmailValidators from "../builderEmailValidators.js";
import type * as chat from "../chat.js";
import type * as conversationCore from "../conversationCore.js";
import type * as crons from "../crons.js";
import type * as customEmailBuilder from "../customEmailBuilder.js";
import type * as customEmailCore from "../customEmailCore.js";
import type * as customEmailMaintenance from "../customEmailMaintenance.js";
import type * as customEmailOperations from "../customEmailOperations.js";
import type * as emailArtifact from "../emailArtifact.js";
import type * as health from "../health.js";
import type * as model from "../model.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  builder: typeof builder;
  builderAdmin: typeof builderAdmin;
  builderContent: typeof builderContent;
  builderEmailValidators: typeof builderEmailValidators;
  chat: typeof chat;
  conversationCore: typeof conversationCore;
  crons: typeof crons;
  customEmailBuilder: typeof customEmailBuilder;
  customEmailCore: typeof customEmailCore;
  customEmailMaintenance: typeof customEmailMaintenance;
  customEmailOperations: typeof customEmailOperations;
  emailArtifact: typeof emailArtifact;
  health: typeof health;
  model: typeof model;
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
