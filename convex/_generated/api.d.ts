/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as features_assets from "../features/assets.js";
import type * as features_connectors from "../features/connectors.js";
import type * as features_people from "../features/people.js";
import type * as features_questions_enrichment from "../features/questions/enrichment.js";
import type * as features_questions_mutations from "../features/questions/mutations.js";
import type * as features_questions_privacy from "../features/questions/privacy.js";
import type * as features_questions_queries from "../features/questions/queries.js";
import type * as features_templates from "../features/templates.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "features/assets": typeof features_assets;
  "features/connectors": typeof features_connectors;
  "features/people": typeof features_people;
  "features/questions/enrichment": typeof features_questions_enrichment;
  "features/questions/mutations": typeof features_questions_mutations;
  "features/questions/privacy": typeof features_questions_privacy;
  "features/questions/queries": typeof features_questions_queries;
  "features/templates": typeof features_templates;
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
