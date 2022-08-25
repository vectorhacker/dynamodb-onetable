/*
    Model.d.ts -- Hand crafted type definitions for Model

    Supports dynamic definition of types based on the Schema.js
*/
import { Expression } from './Expression'

/*
    Possible types for a schema field "type" property
 */
export type OneType =
    ArrayConstructor |
    BooleanConstructor |
    DateConstructor |
    NumberConstructor |
    ObjectConstructor |
    StringConstructor |
    SetConstructor |
    ArrayBufferConstructor |
    string;

/*
    Schema.indexes signature
 */
export type OneIndexSchema = {
    hash?: string,
    sort?: string,
    description?: string,
    project?: string | readonly string[],
    follow?: boolean,
    type?: string,
};

/*
    Schema.models.Model.Field signature
 */
export type OneField = {
    crypt?: boolean,
    default?: string | number | boolean | object,
    enum?: readonly string[],
    filter?: boolean,
    generate?: string | boolean,
    hidden?: boolean,
    map?: string,
    nulls?: boolean,
    reference?: string,
    required?: boolean,
    type: OneType,
    unique?: boolean,
    validate?: RegExp | string | boolean,
    value?: boolean | string,
    schema?: OneModelSchema,
    ttl?: boolean,
    items?: OneField

    //  DEPRECATE 2.3
    uuid?: boolean | string,
}

/*
    Schema.models signature
 */
export type OneModelSchema = {
    [key: string]: OneField
};

/*
    Schema signature
 */
export type OneSchema = {
    name?: string,
    version: string,
    format?: string,
    params?: OneSchemaParams,
    models: {
        [key: string]: OneModelSchema
    },
    indexes: {
        [key: string]: OneIndexSchema
    },
    queries?: {},
};

export type OneSchemaParams = {
    createdField?: string,          //  Name of "created" timestamp attribute. Default to 'created'.
    hidden?: boolean,               //  Hide key attributes in Javascript properties. Default false.
    isoDates?: boolean,             //  Set to true to store dates as Javascript ISO Date strings. Default false.
    nulls?: boolean,                //  Store nulls in database attributes. Default false.
    timestamps?: boolean | string,  //  Make "created" and "updated" timestamps. Set to true, 'create' or 'update'. Default true.
    typeField?: string,             //  Name of model type attribute. Default "_type".
    updatedField?: string,          //  Name of "updated" timestamp attribute. Default 'updated'.
}

/*
    Schema Models with field properties that contain field signatures (above) including "type" and "required".
 */
export type OneTypedModel = Record<string, OneField>;

/*
    Entity field signature generated from the schema
    MOB - rename EntityFieldType
    MOB - null here should not be permitted except for non-required properties
    T['enum'] extends readonly EntityFieldFromType<T>[] ? T['enum'][number] : (EntityFieldFromType<T> | null);
 */
export type EntityField<T extends OneField> =
    T['enum'] extends readonly EntityFieldFromType<T>[] ? T['enum'][number] : (EntityFieldFromType<T> | null);

type EntityFieldFromType<T extends OneField> =
      T['type'] extends (ArrayConstructor | 'array') ? ArrayItemType<T>[]
    : T['type'] extends (BooleanConstructor | 'boolean') ? boolean
    : T['type'] extends (NumberConstructor | 'number') ? number
    : T['type'] extends (ObjectConstructor | 'object') ? Entity<T["schema"]>
    : T['type'] extends (DateConstructor | 'date') ? Date
    : T['type'] extends (ArrayBufferConstructor) ? ArrayBuffer
    : T['type'] extends (StringConstructor | 'string') ? string
    : T['type'] extends (SetConstructor | 'set') ? Set<any>
    : T['type'] extends 'typed-array' ? EntityFieldFromType<T["items"]>[]
    : never;

type ArrayItemType<T extends OneField> =
    T extends {items: OneField} ? EntityFieldFromType<T["items"]> : any
/*
    Select the required properties from a model
*/
export type Required<T extends OneTypedModel> = {
    -readonly [P in keyof T as T[P]['required'] extends true ? P : never]: EntityField<T[P]>
};

/*
    Select the optional properties from a model
*/
export type Optional<T extends OneTypedModel> = {
    -readonly [P in keyof T as T[P]['required'] extends true ? never : P]?: EntityField<T[P]>
};

/*
    Select properties with generated values
*/
export type Generated<T extends OneTypedModel> = {
    -readonly [P in keyof T as T[P]['generate'] extends (string | boolean) ? P : never]?: EntityField<T[P]>
};

/*
    Select properties with default values
*/
type DefinedValue = string | number | bigint | boolean | symbol | object
export type Defaulted<T extends OneTypedModel> = {
    -readonly [P in keyof T as T[P]['default'] extends DefinedValue ? P : never]: EntityField<T[P]>
};

/*
    Select value template properties
*/
export type ValueTemplates<T extends OneTypedModel> = {
    -readonly [P in keyof T as T[P]['value'] extends string ? P : never]: EntityField<T[P]>
};

/*
    Select timestamp properties
*/
export type TimestampValue<T extends OneTypedModel> = {
    -readonly [P in keyof T as T[P]['timestamp'] extends true ? P : never]: EntityField<T[P]>
};

/*
    Merge the properties of two types given preference to A.
*/
type Merge<A extends any, B extends any> = {
    [P in keyof (A & B)]: P extends keyof A ? A[P] : (P extends keyof B ? B[P] : never)
};

/*
    Create entity type which includes required and optional types
    An entity type is not used by the user and is only required internally.

    type Entity<T extends OneTypedModel> = Merge<Required<T>, Optional<T>>

    Merge gives better intellisense, but breaks <infer X> used below.
    Can anyone provide a solution to get merge to work with <infer X>?
*/
type Entity<M extends OneTypedModel> = Required<M> & Optional<M>

/*
    Entity Parameters are partial Entities.
    MOB - rename ModelParameters. Rename <Entity> to <E>
 */
export type EntityParameters<Entity> = Partial<Entity>

/*
    Special case for find to allow query operators
*/
export type EntityParametersForFind<T> = Partial<{
    [K in keyof T]: T[K]
        | Begins<T, K>
        | BeginsWith<T, K>
        | Between<T, K>
        | LessThan<T, K>
        | LessThanOrEqual<T, K>
        | Equal<T, K>
        | NotEqual<T, K>
        | GreaterThanOrEqual<T, K>
        | GreaterThan<T, K>
}>

export type Begins<T, K extends keyof T> = { begins: T[K] }
export type BeginsWith<T, K extends keyof T> = { begins_with: T[K] }
export type Between<T, K extends keyof T> = { between: [T[K], T[K]] }
export type LessThan<T, K extends keyof T> = { '<': T[K] }
export type LessThanOrEqual<T, K extends keyof T> = { '<=': T[K] }
export type Equal<T, K extends keyof T> = { '=': T[K] }
export type NotEqual<T, K extends keyof T> = { '<>': T[K] }
export type GreaterThanOrEqual<T, K extends keyof T> = { '>=': T[K] }
export type GreaterThan<T, K extends keyof T> = { '>': T[K] }

/*
    Any entity. Essentially untyped.
 */
export type AnyEntity = {
    [key: string]: any
};

type ModelConstructorOptions = {
    fields?: OneModelSchema
    indexes?: {
        [key: string]: OneIndexSchema
    },
    timestamps?: boolean | string,
};

/*
    Possible params options for all APIs
 */
export type OneParams = {
    add?: object,
    batch?: object,
    capacity?: string,
    consistent?: boolean,
    context?: object,
    count?: boolean,
    delete?: object,
    execute?: boolean,
    exists?: boolean | null,
    fields?: string[],
    follow?: boolean,
    hidden?: boolean,
    index?: string,
    limit?: number,
    log?: boolean,
    many?: boolean,
    maxPages?: number,
    next?: object,
    parse?: boolean,
    partial?: boolean,
    postFormat?: (model: AnyModel, cmd: {}) => {},
    prev?: object,
    push?: object,
    remove?: string[],
    reprocess?: boolean,
    return?: string | boolean,
    reverse?: boolean,
    segment?: number,
    segments?: number,
    select?: string,
    set?: object,
    stats?: object,
    substitutions?: object,
    throw?: boolean,
    transform?: (model: AnyModel, op: string, name: string, value: any, properties: OneProperties) => any,
    transaction?: object,
    type?: string,
    tunnel?: object,
    where?: string,
};

/*
    Properties for most APIs. Essentially untyped.
 */
export type OneProperties = {
    [key: string]: any
};

export class Paged<T> extends Array<T> {
    count?: number;
    next?: object;
    prev?: object;
}

export type AnyModel = {
    constructor(table: any, name: string, options?: ModelConstructorOptions): AnyModel;
    create(properties: OneProperties, params?: OneParams): Promise<AnyEntity>;
    find(properties?: OneProperties, params?: OneParams): Promise<Paged<AnyEntity>>;
    get(properties: OneProperties, params?: OneParams): Promise<AnyEntity | undefined>;
    load(properties: OneProperties, params?: OneParams): Promise<AnyEntity | undefined>;
    init(properties?: OneProperties, params?: OneParams): AnyEntity;
    remove(properties: OneProperties, params?: OneParams): Promise<AnyEntity | Array<AnyEntity> | undefined>;
    scan(properties?: OneProperties, params?: OneParams): Promise<Paged<AnyEntity>>;
    update(properties: OneProperties, params?: OneParams): Promise<AnyEntity>;
    upsert(properties: OneProperties, params?: OneParams): Promise<AnyEntity>;
};

type ExtractModel<M> = M extends Entity<infer X> ? X : never
type GetKeys<T> = T extends T ? keyof T: never;

export type OptionalOrNull<T extends OneTypedModel> = {
    -readonly [P in keyof T as T[P]['required'] extends true ? never : P]?: EntityField<T[P]> | null
};

/*
    Create the type for create properties.
    Allow, but not require: generated, defaulted and value templates
    Require all other required properties and allow all optional properties
*/
type EntityParametersForCreate<T extends OneTypedModel> =
    Omit<
        Omit<
            Omit<
                Omit<
                    Required<T>,
                    GetKeys<Defaulted<T>>
                >,
                GetKeys<Generated<T>>
            >, GetKeys<ValueTemplates<T>>
        >, GetKeys<TimestampValue<T>>
    > & Optional<T> & Partial<Generated<T>> & Partial<Defaulted<T>> & Partial<ValueTemplates<T>> & Partial<TimestampValue<T>>

/*
WORKS
type EntityParametersForCreate<M extends OneTypedModel> = Required<M> & Optional<M>
*/

type EntityParametersForUpdate<T extends OneTypedModel> = Merge<Required<T>, OptionalOrNull<T>>

export class Model<T> {
    constructor(table: any, name: string, options?: ModelConstructorOptions);

    create(properties: EntityParametersForCreate<ExtractModel<T>>, params?: OneParams): Promise<T>;

    find(properties?: EntityParametersForFind<T>, params?: OneParams): Promise<Paged<T>>;

    //  MOB - does it return undefined or null?
    get(properties: EntityParameters<T>, params?: OneParams): Promise<T | undefined>;
    //  MOB - does it return undefined or null?
    load(properties: EntityParameters<T>, params?: OneParams): Promise<T | undefined>;
    init(properties?: EntityParameters<T>, params?: OneParams): T;
    //  MOB - does it return undefined or null?
    remove(properties: EntityParameters<T>, params?: OneParams): Promise<T | Array<T> | undefined>;
    scan(properties?: EntityParameters<T>, params?: OneParams): Promise<Paged<T>>;
    update(properties: EntityParameters<T>, params?: OneParams): Promise<T>;
    upsert(properties: EntityParameters<T>, params?: OneParams): Promise<T>;
}
