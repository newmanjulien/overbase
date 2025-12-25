/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as features_answers from "../features/answers.js";
import type * as features_assets from "../features/assets.js";
import type * as features_connectors from "../features/connectors.js";
import type * as features_people from "../features/people.js";
import type * as features_templates from "../features/templates.js";
import type * as shared_attachmentTypes from "../shared/attachmentTypes.js";
import type * as shared_constants from "../shared/constants.js";
import type * as shared_privacy from "../shared/privacy.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "features/answers": typeof features_answers;
  "features/assets": typeof features_assets;
  "features/connectors": typeof features_connectors;
  "features/people": typeof features_people;
  "features/templates": typeof features_templates;
  "shared/attachmentTypes": typeof shared_attachmentTypes;
  "shared/constants": typeof shared_constants;
  "shared/privacy": typeof shared_privacy;
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
