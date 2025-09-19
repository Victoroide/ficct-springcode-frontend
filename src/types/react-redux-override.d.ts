declare module 'react-redux' {
  export function Provider(props: { store: any; children: React.ReactNode }): React.ReactElement;
  
  export function useDispatch(): any;
  export function useSelector<TState = any, TSelected = any>(selector: (state: TState) => TSelected): TSelected;
  export type TypedUseSelectorHook<T> = (selector: (state: T) => any) => any;
}

declare module '@reduxjs/toolkit' {
  export interface ActionCreatorWithPayload<P = any, T extends string = string> {
    (): { type: T; payload?: any };
    (payload: P): { type: T; payload: P };
  }
  
  export interface Builder {
    query<T = any, A = any>(...args: any[]): any;
    mutation<T = any, A = any>(...args: any[]): any;
  }
  
  export type AnyAction = { type: string; [key: string]: any };
}

declare module '@reduxjs/toolkit/query/react' {
  export function createApi(options: any): any;
  export function fetchBaseQuery(options: any): any;
}

declare module '@reduxjs/toolkit/query' {
  export type BaseQueryFn = any;
  export type FetchArgs = any;
  export type FetchBaseQueryError = any;
}

declare module './store' {
  export const store: {
    getState: () => any;
    dispatch: any;
  };
}
