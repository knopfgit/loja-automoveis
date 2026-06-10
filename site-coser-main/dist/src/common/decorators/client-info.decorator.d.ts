export interface ClientInfo {
    ip: string;
    ipHash: string;
    userAgent: string;
}
export declare const ClientInfoParam: (...dataOrPipes: unknown[]) => ParameterDecorator;
