export type IkaFakerOptions = {
    [key: string]: String | ((x: any) => string)
};

export type IkaForm = {
    [key: string]: IkaFakerOptions;
};

/**
 * IkaConfig is the configuration for the ika 
 * project to determine which forms to generate tags
 * or inputs for
 */
export type IkaConfig = {
    faker: any,
    floatingButton: Boolean,
    forms: { string: IkaForm }
}

declare global {
    interface Window {
        ikaConfig: IkaConfig,
    }
}
