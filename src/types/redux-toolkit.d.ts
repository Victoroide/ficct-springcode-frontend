/**
 * Type declarations for Redux Toolkit
 * Soluciona problemas de "Cannot find module"
 */

declare module '@reduxjs/toolkit' {
  export interface SerializedError {
    name?: string;
    message?: string;
    stack?: string;
    code?: string;
  }

  export interface BaseThunkAPI<S, E, D extends Dispatch = Dispatch, RejectedValue = unknown, RejectedMeta = unknown, FulfilledMeta = unknown> {
    dispatch: D;
    getState: () => S;
    extra: E;
    requestId: string;
    signal: AbortSignal;
    rejectWithValue: (value: RejectedValue, meta?: RejectedMeta) => RejectWithValue<RejectedValue, RejectedMeta>;
    fulfillWithValue: <ReturnedValue>(value: ReturnedValue, meta?: FulfilledMeta) => FulfilledAction<ReturnedValue, string, FulfilledMeta>;
  }

  export type PayloadAction<P = void, T extends string = string, M = never, E = never> = {
    payload: P;
    type: T;
  } & ([M] extends [never] ? {} : { meta: M }) & ([E] extends [never] ? {} : { error: E });

  export interface ActionCreatorWithPayload<P, T extends string = string> {
    type: T;
    (payload: P): PayloadAction<P, T>;
  }

  export function createSlice<State, CaseReducers extends SliceCaseReducers<State>, Name extends string = string>(options: CreateSliceOptions<State, CaseReducers, Name>): Slice<State, CaseReducers, Name>;

  export function configureStore<S = any, A extends Action = AnyAction, M extends Middlewares<S> = Middlewares<S>>(options: ConfigureStoreOptions<S, A, M>): EnhancedStore<S, A>;

  export type SliceCaseReducers<State> = {
    [K: string]: CaseReducer<State, any> | CaseReducerWithPrepare<State, any>;
  };

  export type CaseReducer<S = any, A extends Action = AnyAction> = (state: Draft<S>, action: A) => void | Draft<S>;

  export type CaseReducerWithPrepare<S, A extends PayloadAction> = {
    reducer: CaseReducer<S, A>;
    prepare: (...args: any[]) => { payload: A['payload'] } & Omit<A, 'payload' | 'type'>;
  };

  export interface CreateSliceOptions<State = any, CR extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string> {
    name: Name;
    initialState: State | (() => State);
    reducers: ValidateSliceCaseReducers<State, CR>;
    extraReducers?: any;
  }

  export type ValidateSliceCaseReducers<S, ACR extends SliceCaseReducers<S>> = {
    [T in keyof ACR]: ACR[T] extends {
      reducer: any;
    }
      ? {
          reducer: CaseReducer<S, any>;
          prepare: (...a: any[]) => { payload: any };
        }
      : CaseReducer<S, any>;
  };

  export interface Slice<State = any, CaseReducers extends SliceCaseReducers<State> = SliceCaseReducers<State>, Name extends string = string> {
    name: Name;
    reducer: Reducer<State>;
    actions: { [K in keyof CaseReducers]: PayloadActionCreator<any> };
    caseReducers: SliceCaseReducers<State>;
    getInitialState: () => State;
  }

  export type Reducer<S = any, A extends Action = AnyAction> = (state: S | undefined, action: A) => S;

  export type PayloadActionCreator<P = void, T extends string = string, PA extends PrepareAction<P> | void = void> = {
    type: T;
    match: (action: Action) => action is PayloadAction<P, T>;
  } & (PA extends PrepareAction<P>
    ? ActionCreatorWithPreparedPayload<Parameters<PA>, P, T, ReturnType<PA> extends { meta: infer M } ? M : never, ReturnType<PA> extends { error: infer E } ? E : never>
    : ActionCreatorWithPayload<P, T>);

  export type PrepareAction<P> = (payload: P) => { payload: P; meta?: any; error?: any };

  export type ActionCreatorWithPreparedPayload<Args extends unknown[], P, T extends string = string, M = never, E = never> = {
    type: T;
    match: (action: Action) => action is PayloadAction<P, T, M, E>;
  } & ((...args: Args) => PayloadAction<P, T, M, E>);

  export interface ConfigureStoreOptions<S = any, A extends Action = AnyAction, M extends Middlewares<S> = Middlewares<S>> {
    reducer: Reducer<S, A> | ReducersMapObject<S, A>;
    middleware?: ((getDefaultMiddleware: CurriedGetDefaultMiddleware<S>) => M) | M;
    devTools?: boolean | DevToolsOptions;
    preloadedState?: DeepPartial<S>;
    enhancers?: StoreEnhancer[] | StoreEnhancerStoreCreator[];
  }

  export type CurriedGetDefaultMiddleware<S> = (options?: GetDefaultMiddlewareOptions) => Middleware<{}, S>[];

  export interface GetDefaultMiddlewareOptions {
    thunk?: boolean | ThunkOptions;
    immutableCheck?: boolean | ImmutableStateInvariantMiddlewareOptions;
    serializableCheck?: boolean | SerializableStateInvariantMiddlewareOptions;
  }

  export interface ThunkOptions {
    extraArgument?: any;
  }

  export interface ImmutableStateInvariantMiddlewareOptions {
    ignoredPaths?: string[];
    warnAfter?: number;
    ignore?: string[];
  }

  export interface SerializableStateInvariantMiddlewareOptions {
    ignoredActions?: string[];
    ignoredActionPaths?: string[];
    ignoredPaths?: string[];
    warnAfter?: number;
  }

  export interface DevToolsOptions {
    name?: string;
    actionCreators?: any[];
    latency?: number;
    maxAge?: number;
    trace?: boolean | (() => string);
    traceLimit?: number;
    autoPause?: boolean;
    shouldHotReload?: boolean;
    shouldCatchErrors?: boolean;
    features?: DevToolsFeatures;
    serialize?: boolean | SerializeOptions;
    actionSanitizer?: (action: any) => any;
    stateSanitizer?: (state: any) => any;
    actionsBlacklist?: string | string[];
    actionsWhitelist?: string | string[];
    predicate?: (state: any, action: any) => boolean;
    shouldRecordChanges?: boolean;
    pauseActionType?: string;
    autoPause?: boolean;
    shouldStartLocked?: boolean;
    disableMapSet?: boolean;
  }

  export interface DevToolsFeatures {
    pause?: boolean;
    lock?: boolean;
    persist?: boolean;
    export?: boolean | ExportFeatures;
    import?: boolean | ImportFeatures;
    jump?: boolean;
    skip?: boolean;
    reorder?: boolean;
    dispatch?: boolean;
    test?: boolean;
  }

  export interface ExportFeatures {
    download?: boolean;
    copy?: boolean;
    file?: boolean;
  }

  export interface ImportFeatures {
    file?: boolean;
  }

  export interface SerializeOptions {
    replacer?: (key: string, value: any) => any;
    reviver?: (key: string, value: any) => any;
    immutable?: any;
    refs?: any[];
  }

  export type ReducersMapObject<S = any, A extends Action = Action> = {
    [K in keyof S]: Reducer<S[K], A>;
  };

  export type Middlewares<S> = ReadonlyArray<Middleware<{}, S>>;

  export interface Middleware<DispatchExt = {}, S = any, D extends Dispatch = Dispatch> {
    (api: MiddlewareAPI<D, S>): (next: Dispatch<AnyAction>) => (action: any) => any;
  }

  export interface MiddlewareAPI<D extends Dispatch = Dispatch, S = any> {
    dispatch: D;
    getState(): S;
  }

  export type StoreEnhancer<Ext = {}, StateExt = {}> = (next: StoreEnhancerStoreCreator<Ext, StateExt>) => StoreEnhancerStoreCreator<Ext, StateExt>;

  export type StoreEnhancerStoreCreator<Ext = {}, StateExt = {}> = <S = any, A extends Action = AnyAction>(reducer: Reducer<S, A>, preloadedState?: DeepPartial<S>) => Store<S & StateExt, A> & Ext;

  export interface EnhancedStore<S = any, A extends Action = AnyAction, M extends Middlewares<S> = Middlewares<S>> extends Store<S, A> {
    dispatch: DispatchForMiddlewares<M> & Dispatch<A>;
  }

  export type DispatchForMiddlewares<M> = M extends ReadonlyArray<any>
    ? UnionToIntersection<
        {
          [P in keyof M]: M[P] extends Middleware<infer D, any> ? D : never;
        }[number]
      >
    : never;

  export type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
}

declare module '@reduxjs/toolkit/query/react' {
  import { EndpointDefinitions, Api, ApiContext } from '@reduxjs/toolkit/query';
  import { UseQuery, UseMutation } from '@reduxjs/toolkit/query';
  
  export function createApi<
    BaseQuery extends any,
    Definitions extends EndpointDefinitions,
    ReducerPath extends string = string,
    TagTypes extends string = never
  >(options: {
    baseQuery: BaseQuery;
    endpoints(builder: EndpointBuilder<BaseQuery, TagTypes>): Definitions;
    reducerPath?: ReducerPath;
    tagTypes?: readonly TagTypes[];
  }): Api<BaseQuery, Definitions, ReducerPath, TagTypes>;
  
  export function fetchBaseQuery(options: any): any;
  
  export interface EndpointBuilder<BaseQuery, TagTypes extends string> {
    query<ResultType, QueryArg>(definition: {
      query: (arg: QueryArg) => any;
    }): any;
    mutation<ResultType, QueryArg>(definition: {
      query: (arg: QueryArg) => any;
    }): any;
  }
  
  export type QueryDefinition<QueryArg, BaseQuery, ResultType, ReducerPath extends string> = any;
  export type MutationDefinition<QueryArg, BaseQuery, ResultType, ReducerPath extends string> = any;

  export interface ApiWithInjectedEndpoints<
    ReducerPath extends string = string,
    Definitions extends EndpointDefinitions = EndpointDefinitions
  > extends Api<any, Definitions, ReducerPath> {
    injectEndpoints(options: any): any;
  }
}

declare module '@reduxjs/toolkit/query' {
  export interface BaseQueryFn<Args = any, Result = unknown, Error = unknown, Meta = unknown> {
    (args: Args, api: any, extraOptions: any): any;
  }

  export type EndpointDefinitions = Record<string, any>;
  
  export interface Api<BaseQuery, Definitions extends EndpointDefinitions, ReducerPath extends string, TagTypes extends string = never> {
    reducerPath: ReducerPath;
    reducer: any;
    middleware: any;
    endpoints: any;
    injectEndpoints: any;
    enhanceEndpoints: any;
    util: any;
  }
  
  export interface ApiContext<ReducerPath extends string> {
    apiUid: string;
    reducerPath: ReducerPath;
  }
  
  export type FetchBaseQueryMeta = {
    request: Request;
    response?: Response;
  };
  
  export type FetchBaseQueryError = {
    status: number;
    data: unknown;
  };
  
  export type FetchArgs = string | { url: string; method?: string; body?: any; params?: any };

  export interface UseQuery<ResultType> {
    data?: ResultType;
    error?: any;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    refetch: () => void;
  }
  
  export interface UseMutation<ResultType> {
    data?: ResultType;
    error?: any;
    isLoading: boolean;
    isSuccess: boolean;
    isError: boolean;
    reset: () => void;
  }
}
