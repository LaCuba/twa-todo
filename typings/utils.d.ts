declare type ValueOf<T> = T extends object ? T[keyof T] : unknown
declare type Nullable<T> = T | null
