declare module '@reduxjs/toolkit' {
  export * from '@reduxjs/toolkit/dist/index';
  export interface AnyAction { type: string; [key: string]: any }
}

declare module '@reduxjs/toolkit/query/react' {
  const createApi: any;
  const fetchBaseQuery: any;
  export { createApi, fetchBaseQuery };
}

declare module '@reduxjs/toolkit/query' {
  export type BaseQueryFn<Args = any, Result = unknown, Error = unknown, Meta = unknown> = any;
  export type FetchArgs = any;
  export type FetchBaseQueryError = any;
  export type QueryDefinition<QueryArg, BaseQuery, ResultType, ReducerPath extends string> = any;
  export type MutationDefinition<QueryArg, BaseQuery, ResultType, ReducerPath extends string> = any;
}

interface ApiEndpointHooks {
  useLoginMutation: any;
  useVerify2FAMutation: any;
  useGetUserQuery: any;
  useRefreshTokenMutation: any;
  useLogoutMutation: any;
  useRevokeSessionsMutation: any;
  useRegisterMutation: any;
  useVerifyEmailMutation: any;
  useSetup2FAMutation: any;
}

declare module './store/api/authApi' {
  export const authApi: any & ApiEndpointHooks;
}

declare module './store/api/registrationApi' {
  export const registrationApi: any & ApiEndpointHooks;
}

declare module './store' {
  export const store: {
    getState: () => any;
    dispatch: any;
    [key: string]: any;
  };
}
