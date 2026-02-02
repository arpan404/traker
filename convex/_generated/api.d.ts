/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as comments from "../comments.js";
import type * as files from "../files.js";
import type * as invites from "../invites.js";
import type * as issueLabels from "../issueLabels.js";
import type * as issues from "../issues.js";
import type * as labels from "../labels.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_issueEvents from "../lib/issueEvents.js";
import type * as lib_roles from "../lib/roles.js";
import type * as lib_types from "../lib/types.js";
import type * as lib_validators from "../lib/validators.js";
import type * as members from "../members.js";
import type * as projects from "../projects.js";
import type * as teams from "../teams.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  comments: typeof comments;
  files: typeof files;
  invites: typeof invites;
  issueLabels: typeof issueLabels;
  issues: typeof issues;
  labels: typeof labels;
  "lib/auth": typeof lib_auth;
  "lib/issueEvents": typeof lib_issueEvents;
  "lib/roles": typeof lib_roles;
  "lib/types": typeof lib_types;
  "lib/validators": typeof lib_validators;
  members: typeof members;
  projects: typeof projects;
  teams: typeof teams;
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
